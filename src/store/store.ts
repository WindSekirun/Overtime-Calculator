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
        }
    },

    actions: {
        load(year: number, month: number) {
            localStorage.removeItem(oldStorageKey)

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
