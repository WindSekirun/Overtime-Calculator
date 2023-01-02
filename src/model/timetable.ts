export class TimeTable {
    year: number;
    month: number;
    underLawTime: number;
    workingTime: number;

    constructor(year: number, month: number, underLawTime: number, workingTime: number) {
        this.year = year;
        this.month = month;
        this.underLawTime = underLawTime;
        this.workingTime = workingTime;
    }
}

export const timeTables: TimeTable[] = [
    {
        year: 2022,
        month: 1,
        underLawTime: 177.1,
        workingTime: 160
    },
    {
        year: 2022,
        month: 2,
        underLawTime: 160,
        workingTime: 144
    },
    {
        year: 2022,
        month: 3,
        underLawTime: 177.1,
        workingTime: 168
    },
    {
        year: 2022,
        month: 4,
        underLawTime: 171.4,
        workingTime: 168
    },
    {
        year: 2022,
        month: 5,
        underLawTime: 177.1,
        workingTime: 168
    },
    {
        year: 2022,
        month: 6,
        underLawTime: 171.4,
        workingTime: 160
    },
    {
        year: 2022,
        month: 7,
        underLawTime: 177.1,
        workingTime: 168
    },
    {
        year: 2022,
        month: 8,
        underLawTime: 177.1,
        workingTime: 176
    },
    {
        year: 2022,
        month: 9,
        underLawTime: 171.4,
        workingTime: 160
    },
    {
        year: 2022,
        month: 10,
        underLawTime: 177.1,
        workingTime: 152
    },
    {
        year: 2022,
        month: 11,
        underLawTime: 171.4,
        workingTime: 176
    },
    {
        year: 2022,
        month: 12,
        underLawTime: 177.1,
        workingTime: 176
    }
]