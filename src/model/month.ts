import { Overtime } from "./overtime";

export class Month {
    month: number;
    overtime: Overtime;

    constructor(month: number, overtime: Overtime) {
        this.month = month;
        this.overtime = overtime;
    }
}