export class Overtime {
    basicPay: number;
    nowWorkingTime: number;
    vacationTime: number;
    overNightTime: number;
    workOffTime: number;
    
    constructor(basicPay: number, nowWorkingTime: number, vacationTime: number, workOffTime: number) {
        this.basicPay = basicPay;
        this.nowWorkingTime = nowWorkingTime;
        this.vacationTime = vacationTime;
        this.overNightTime = 0;
        this.workOffTime = workOffTime;
    }
}