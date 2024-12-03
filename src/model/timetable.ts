export class TimeTable {
  year: number;
  month: number;
  workingTime: number;

  constructor(year: number, month: number, workingTime: number) {
    this.year = year;
    this.month = month;
    this.workingTime = workingTime;
  }
}

export const timeTables: TimeTable[] = [
  { year: 2022, month: 1, workingTime: 160 },
  { year: 2022, month: 2, workingTime: 144 },
  { year: 2022, month: 3, workingTime: 168 },
  { year: 2022, month: 4, workingTime: 168 },
  { year: 2022, month: 5, workingTime: 168 },
  { year: 2022, month: 6, workingTime: 160 },
  { year: 2022, month: 7, workingTime: 168 },
  { year: 2022, month: 8, workingTime: 176 },
  { year: 2022, month: 9, workingTime: 160 },
  { year: 2022, month: 10, workingTime: 152 },
  { year: 2022, month: 11, workingTime: 176 },
  { year: 2022, month: 12, workingTime: 176 },
  { year: 2023, month: 1, workingTime: 160 },
  { year: 2023, month: 2, workingTime: 160 },
  { year: 2023, month: 3, workingTime: 176 },
  { year: 2023, month: 4, workingTime: 160 },
  { year: 2023, month: 5, workingTime: 168 },
  { year: 2023, month: 6, workingTime: 168 },
  { year: 2023, month: 7, workingTime: 168 },
  { year: 2023, month: 8, workingTime: 176 },
  { year: 2023, month: 9, workingTime: 152 },
  { year: 2023, month: 10, workingTime: 152 }, // 임시공휴일로 인해 소정근로시간 변경
  { year: 2023, month: 11, workingTime: 176 },
  { year: 2023, month: 12, workingTime: 160 },
  { year: 2024, month: 1, workingTime: 176 },
  { year: 2024, month: 2, workingTime: 152 },
  { year: 2024, month: 3, workingTime: 160 },
  { year: 2024, month: 4, workingTime: 168 },
  { year: 2024, month: 5, workingTime: 160 },
  { year: 2024, month: 6, workingTime: 152 },
  { year: 2024, month: 7, workingTime: 184 },
  { year: 2024, month: 8, workingTime: 168 },
  { year: 2024, month: 9, workingTime: 144 },
  { year: 2024, month: 10, workingTime: 160 }, // 국군의날 휴일
  { year: 2024, month: 11, workingTime: 168 },
  { year: 2024, month: 12, workingTime: 168 },
  { year: 2025, month: 1, workingTime: 152 },
  { year: 2025, month: 2, workingTime: 160 },
  { year: 2025, month: 3, workingTime: 160 },
  { year: 2025, month: 4, workingTime: 176 },
  { year: 2025, month: 5, workingTime: 152 },
  { year: 2025, month: 6, workingTime: 160 },
  { year: 2025, month: 7, workingTime: 184 },
  { year: 2025, month: 8, workingTime: 160 },
  { year: 2025, month: 9, workingTime: 176 },
  { year: 2025, month: 10, workingTime: 144 },
  { year: 2025, month: 11, workingTime: 160 },
  { year: 2025, month: 12, workingTime: 176 },
];
