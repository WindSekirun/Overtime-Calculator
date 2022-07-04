export class TimeTable {
    month: number;
    underLawTime: number;
    workingTime: number;

    constructor(month: number, underLawTime: number, workingTime: number) {
        this.month = month;
        this.underLawTime = underLawTime;
        this.workingTime = workingTime;
    }
}

export const timeTables: TimeTable[] = [
    {
        month: 1,
        underLawTime: 177.1,
        workingTime: 160
    },
    {
        month: 2,
        underLawTime: 160,
        workingTime: 144
    },
    {
        month: 3,
        underLawTime: 177.1,
        workingTime: 168
    },
    {
        month: 4,
        underLawTime: 171.4,
        workingTime: 168
    },
    {
        month: 5,
        underLawTime: 177.1,
        workingTime: 168
    },
    {
        month: 6,
        underLawTime: 171.4,
        workingTime: 160
    },
    {
        month: 7,
        underLawTime: 177.1,
        workingTime: 168
    },
    {
        month: 8,
        underLawTime: 177.1,
        workingTime: 176
    },
    {
        month: 9,
        underLawTime: 171.4,
        workingTime: 160
    },
    {
        month: 10,
        underLawTime: 177.1,
        workingTime: 152
    },
    {
        month: 11,
        underLawTime: 171.4,
        workingTime: 176
    },
    {
        month: 12,
        underLawTime: 177.1,
        workingTime: 176
    }
]