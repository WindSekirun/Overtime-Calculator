import { roundNumber } from "./number";

export function getYear() {
    return new Date().getFullYear();
}

export function formatYearMonth(year: number, month: number) {
    return `${year}${month.toString().padStart(2, '0')}`
}

export function getUnderLawTime(year: number, month: number, standard: number) {
    const lastDay = new Date(year, month, 0).getDate();
    return roundNumber((standard * lastDay) / 7);
}