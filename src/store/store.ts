import { Month } from "@/model/month";
import { Overtime } from "@/model/overtime";
import { timeTables } from "@/model/timetable";
import { defineStore } from "pinia";

export const storageKey = "OVERTIME_CALCULATOR_DATA"

function getDataFromStorage(): Month[] {
    let data: Month[] = JSON.parse(localStorage.getItem(storageKey) || "[]");

    if (data.length == 0) {
        data = [];
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(month => {
            data.push(new Month(month, new Overtime(0, 0, 0)));
        })
    }
    return data;
}

function saveData(data: Month[]) {
    localStorage.setItem(storageKey, JSON.stringify(data));
}

export const useStore = defineStore('store', {
    state: () => {
        return {
            month: 0,
            basicPay: 0,
            nowWorkingTime: 0,
            vacationTime: 0,
            overNightTime: 0,
            underLawTime: 0,
            workingGuideTime: 0,
        }
    },

    actions: {
        load(month: number) {
            const data = getDataFromStorage();
            const overtime = data.find(value => value.month == month);
            const timetable = timeTables.find(value => value.month == month);
            this.month = month;

            if (overtime && timetable) {
                this.basicPay = overtime.overtime.basicPay;
                this.nowWorkingTime = overtime.overtime.nowWorkingTime;
                this.vacationTime = overtime.overtime.vacationTime;
                this.overNightTime = overtime.overtime.overNightTime || 0;
                this.underLawTime = timetable.underLawTime;
                this.workingGuideTime = timetable.workingTime;
            }
            saveData(data);
        },
        saveBasicPay(basicPay: number) {
            const data = getDataFromStorage();
            const overtime = data.find(value => value.month == this.month)
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
            const overtime = data.find(value => value.month == this.month)
            if (overtime) {
                const index = data.indexOf(overtime);
                overtime.overtime.nowWorkingTime = workingTime;
                data[index] = overtime;
            }
            saveData(data);
        },
        saveVacationTime(vacationTime: number) {
            const data = getDataFromStorage();
            const overtime = data.find(value => value.month == this.month)
            if (overtime) {
                const index = data.indexOf(overtime);
                overtime.overtime.vacationTime = vacationTime;
                data[index] = overtime;
            }
            saveData(data);
        },
        saveOverNightTime(overNightTime: number) {
            const data = getDataFromStorage();
            const overtime = data.find(value => value.month == this.month)
            if (overtime) {
                const index = data.indexOf(overtime);
                overtime.overtime.overNightTime = overNightTime;
                data[index] = overtime;
            }
            saveData(data);
        }
    }
})