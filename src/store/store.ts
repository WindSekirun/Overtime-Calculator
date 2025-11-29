import { YearMonth } from "@/model/month";
import { Overtime } from "@/model/overtime";
import { timeTables } from "@/model/timetable";
import { getUnderLawTime, getYear } from "@/util/date";
import { defineStore } from "pinia";

export const storageKey = "OVERTIME_CALCULATOR_DATA_V3";
export const oldStorageKey = "OVERTIME_CALCULATOR_DATA_2";

function getDataFromStorage(): YearMonth[] {
    const data: YearMonth[] = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const year = getYear();
    const needInitialize = !data.some(value => value.year == year);
    if (needInitialize) {
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(month => {
            data.push(new YearMonth(year, month, new Overtime(0, 0, 0, 0)));
        })
    }

    const nextYear = getYear() + 1;
    const needNextInitialize = !data.some(value => value.year == nextYear);
    const containsTimetable = timeTables.some(value => value.year == nextYear);
    if (needNextInitialize && containsTimetable) {
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(month => {
            data.push(new YearMonth(nextYear, month, new Overtime(0, 0, 0, 0)));
        })
    }
    return data;
}

function saveData(data: YearMonth[]) {
    localStorage.setItem(storageKey, JSON.stringify(data));
}

function modifyYearMonth(year: number, month: number, fn: (yearMonth: YearMonth) => void) {
    const data = getDataFromStorage();
    const overtime = data.find(value => value.year == year && value.month == month)
    if (overtime) {
        const index = data.indexOf(overtime);
        fn(overtime)
        data[index] = overtime;
    }
    saveData(data);
}

export const useStore = defineStore('store', {
    state: () => {
        return {
            year: 0,
            month: 0,
            basicPay: 0,
            nowWorkingTime: 0, // Minutes
            vacationTime: 0, // Minutes
            overNightTime: 0, // Minutes
            underLawTime: 0, // Minutes
            workingGuideTime: 0, // Minutes
            workOffTime: 0, // Minutes
            needMigration: false,
        }
    },

    actions: {
        load(year: number, month: number) {
            const oldData: YearMonth[] = JSON.parse(localStorage.getItem(oldStorageKey) || "[]");
            // Check if V3 data is empty but V2 exists to determine migration need
            const v3Data = JSON.parse(localStorage.getItem(storageKey) || "[]");
            this.needMigration = oldData.length > 0 && v3Data.length === 0;

            const data = getDataFromStorage();

            const overtime = data.find(value => value.year == year && value.month == month);
            const timetable = timeTables.find(value => value.year == year && value.month == month);
            this.month = month;
            this.year = year;
            this.underLawTime = Math.round(getUnderLawTime(year, month, 40) * 60);

            if (overtime && timetable) {
                this.basicPay = overtime.overtime.basicPay;
                this.nowWorkingTime = overtime.overtime.nowWorkingTime;
                this.vacationTime = overtime.overtime.vacationTime;
                this.overNightTime = overtime.overtime.overNightTime || 0;
                this.workingGuideTime = timetable.workingTime * 60;
                this.workOffTime = overtime.overtime.workOffTime || 0;
            } else {
                this.basicPay = 0;
                this.nowWorkingTime = 0;
                this.vacationTime = 0;
                this.overNightTime = 0;
                this.workingGuideTime = 0;
                this.workOffTime = 0;
            }
            saveData(data);
        },
        async doMigration() {
            const oldData: YearMonth[] = JSON.parse(localStorage.getItem(oldStorageKey) || "[]");
            const data = getDataFromStorage();
            
            // Migration: Convert hours to minutes
            oldData.forEach(oldItem => {
                // Find corresponding item in new data (initialized by getDataFromStorage) or create new if not exists (though getDataFromStorage handles initialization for current/next year)
                // But oldData might contain older years.
                // Simply adding them might duplicate if they are already initialized? 
                // getDataFromStorage initializes current and next year.
                // Ideally we merge.
                
                // For simplicity, we try to find existing entry in 'data', update it. If not found, add it.
                const existing = data.find(d => d.year === oldItem.year && d.month === oldItem.month);
                
                const newOvertime = new Overtime(
                    oldItem.overtime.basicPay,
                    Math.round(oldItem.overtime.nowWorkingTime * 60),
                    Math.round(oldItem.overtime.vacationTime * 60),
                    Math.round((oldItem.overtime.workOffTime || 0) * 60)
                );
                newOvertime.overNightTime = Math.round((oldItem.overtime.overNightTime || 0) * 60);

                if (existing) {
                    existing.overtime = newOvertime;
                } else {
                    data.push(new YearMonth(oldItem.year, oldItem.month, newOvertime));
                }
            });
            
            saveData(data);
            // localStorage.removeItem(oldStorageKey); // Optional: keep for safety or remove? 
            // User prompt didn't specify keeping, but usually good to keep for backup until confirmed. 
            // But to stop showing migration message, we should probably rename or set flag.
            // Since logic checks "oldData.length > 0 && v3Data.length === 0", once v3Data is populated, migration flag might turn false?
            // No, "oldData.length > 0" is always true if we don't delete.
            // "v3Data.length === 0" will be false after migration.
            // So migration message will disappear.
            
            this.needMigration = false;
            return true;
        },
        loadPreviousBasicPay() {
            const data: YearMonth[] = getDataFromStorage();
            let year = this.year;
            let month = this.month;
            if (month == 1) {
                year = year - 1;
                month = 12;
            } else {
                month = month - 1;
            }
            const yearMonth = data.find(value => value.year == year && value.month == month);
            if (yearMonth) {
                return yearMonth.overtime.basicPay;
            } else {
                return 0
            }
        },
        saveBasicPay(basicPay: number) {
            modifyYearMonth(this.year, this.month, (overtime) => {
                overtime.overtime.basicPay = basicPay;
            });
            this.basicPay = basicPay;
        },
        saveNowWorkingTime(workingTime: number) {
            modifyYearMonth(this.year, this.month, (overtime) => {
                overtime.overtime.nowWorkingTime = workingTime;
            });
            this.nowWorkingTime = workingTime;
        },
        saveVacationTime(vacationTime: number) {
            modifyYearMonth(this.year, this.month, (overtime) => {
                overtime.overtime.vacationTime = vacationTime;
            });
            this.vacationTime = vacationTime;
        },
        saveOverNightTime(overNightTime: number) {
            modifyYearMonth(this.year, this.month, (overtime) => {
                overtime.overtime.overNightTime = overNightTime;
            });
            this.overNightTime = overNightTime;
        },
        saveWorkOffTime(workOffTime: number) {
            modifyYearMonth(this.year, this.month, (overtime) => {
                overtime.overtime.workOffTime = workOffTime;
            });
            this.workOffTime = workOffTime;
        },
        getDataFromStorage() {
            return getDataFromStorage()
        },
        restoreData(data: YearMonth[]) {
            saveData(data);
        }
    }
})
