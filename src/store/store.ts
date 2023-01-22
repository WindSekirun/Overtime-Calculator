import { YearMonth } from "@/model/month";
import { Overtime } from "@/model/overtime";
import { timeTables } from "@/model/timetable";
import { getUnderLawTime, getYear } from "@/util/date";
import { defineStore } from "pinia";

export const storageKey = "OVERTIME_CALCULATOR_DATA_2"
export const oldStorageKey = "OVERTIME_CALCULATOR_DATA"

function getDataFromStorage(): YearMonth[] {
    let data: YearMonth[] = JSON.parse(localStorage.getItem(storageKey) || "[]");

    const year = getYear();
    const needInitialize = !data.some(value => value.year == year);
    if (needInitialize) {
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(month => {
            data.push(new YearMonth(year, month, new Overtime(0, 0, 0, 0)));
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
            nowWorkingTime: 0,
            vacationTime: 0,
            overNightTime: 0,
            underLawTime: 0,
            workingGuideTime: 0,
            workOffTime: 0,
            needMigration: false,
        }
    },

    actions: {
        load(year: number, month: number) {
            const oldData: YearMonth[] = JSON.parse(localStorage.getItem(oldStorageKey) || "[]");
            this.needMigration = oldData.some(value => value.overtime.basicPay != 0);

            const data = getDataFromStorage();

            const overtime = data.find(value => value.year == year && value.month == month);
            const timetable = timeTables.find(value => value.year == year && value.month == month);
            this.month = month;
            this.year = year;
            this.underLawTime = getUnderLawTime(year, month, 40);

            if (overtime && timetable) {
                this.basicPay = overtime.overtime.basicPay;
                this.nowWorkingTime = overtime.overtime.nowWorkingTime;
                this.vacationTime = overtime.overtime.vacationTime;
                this.overNightTime = overtime.overtime.overNightTime || 0;
                this.workingGuideTime = timetable.workingTime;
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
            oldData.forEach(value => {
                data.push(new YearMonth(2022, value.month, value.overtime));
            });
            saveData(data);
            localStorage.removeItem(oldStorageKey);
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
        },
        saveNowWorkingTime(workingTime: number) {
            modifyYearMonth(this.year, this.month, (overtime) => {
                overtime.overtime.nowWorkingTime = workingTime;
            });
        },
        saveVacationTime(vacationTime: number) {
            modifyYearMonth(this.year, this.month, (overtime) => {
                overtime.overtime.vacationTime = vacationTime;
            });
        },
        saveOverNightTime(overNightTime: number) {
            modifyYearMonth(this.year, this.month, (overtime) => {
                overtime.overtime.overNightTime = overNightTime;
            });
        },
        saveWorkOffTime(workOffTime: number) {
            modifyYearMonth(this.year, this.month, (overtime) => {
                overtime.overtime.workOffTime = workOffTime;
            });
        },
    }
})