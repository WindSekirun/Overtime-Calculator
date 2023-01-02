import { YearMonth } from "@/model/month";
import { Overtime } from "@/model/overtime";
import { timeTables } from "@/model/timetable";
import { getYear } from "@/util/date";
import { defineStore } from "pinia";

export const storageKey = "OVERTIME_CALCULATOR_DATA_2"
export const oldStorageKey = "OVERTIME_CALCULATOR_DATA"

function getDataFromStorage(): YearMonth[] {
    let data: YearMonth[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
    
    const year = getYear();
    const needInitialize = !data.some(value => value.year == year);
    if (needInitialize) {
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(month => {
            data.push(new YearMonth(year, month, new Overtime(0, 0, 0)));
        })
    }
    return data;
}

function saveData(data: YearMonth[]) {
    localStorage.setItem(storageKey, JSON.stringify(data));
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

            console.log(`overtime: ${overtime}`)
            console.log(`needMigration: ${this.needMigration}`)
            console.log(`timetable: ${year}.${month} ${timetable}`)

            if (overtime && timetable) {
                this.basicPay = overtime.overtime.basicPay;
                this.nowWorkingTime = overtime.overtime.nowWorkingTime;
                this.vacationTime = overtime.overtime.vacationTime;
                this.overNightTime = overtime.overtime.overNightTime || 0;
                this.underLawTime = timetable.underLawTime;
                this.workingGuideTime = timetable.workingTime;
            } else {
                this.basicPay = 0;
                this.nowWorkingTime = 0;
                this.vacationTime = 0;
                this.overNightTime = 0;
                this.underLawTime = 0;
                this.workingGuideTime = 0;
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
        saveBasicPay(basicPay: number) {
            const data = getDataFromStorage();
            const overtime = data.find(value => value.year == this.year && value.month == this.month)
            console.log('overtime' + overtime);
            if (overtime) {
                const index = data.indexOf(overtime);
                overtime.overtime.basicPay = basicPay;
                data[index] = overtime;
            }
            saveData(data);
        },
        saveNowWorkingTime(workingTime: number) {
            const data = getDataFromStorage();
            const overtime = data.find(value => value.year == this.year && value.month == this.month)
            if (overtime) {
                const index = data.indexOf(overtime);
                overtime.overtime.nowWorkingTime = workingTime;
                data[index] = overtime;
            }
            saveData(data);
        },
        saveVacationTime(vacationTime: number) {
            const data = getDataFromStorage();
            const overtime = data.find(value => value.year == this.year && value.month == this.month)
            if (overtime) {
                const index = data.indexOf(overtime);
                overtime.overtime.vacationTime = vacationTime;
                data[index] = overtime;
            }
            saveData(data);
        },
        saveOverNightTime(overNightTime: number) {
            const data = getDataFromStorage();
            const overtime = data.find(value => value.year == this.year && value.month == this.month)
            if (overtime) {
                const index = data.indexOf(overtime);
                overtime.overtime.overNightTime = overNightTime;
                data[index] = overtime;
            }
            saveData(data);
        }
    }
})