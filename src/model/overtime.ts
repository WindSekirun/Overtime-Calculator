export class Overtime {
    basicPay: number;
    nowWorkingTime: number;
    vacationTime: number;
    overNightTime: number;
    
    constructor(basicPay: number, nowWorkingTime: number, vacationTime: number) {
        this.basicPay = basicPay;
        this.nowWorkingTime = nowWorkingTime;
        this.vacationTime = vacationTime;
        this.overNightTime = 0;
    }
}