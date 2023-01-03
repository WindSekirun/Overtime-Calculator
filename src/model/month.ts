import { Overtime } from "./overtime";

export class YearMonth {
    year: number;
    month: number;
    overtime: Overtime;

    constructor(year: number, month: number, overtime: Overtime) {
        this.year = year;
        this.month = month;
        this.overtime = overtime;
    }
}