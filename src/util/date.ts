export function getYear() {
    return new Date().getFullYear();
}

export function formatYearMonth(year: number, month: number) {
    return `${year}${month.toString().padStart(2, '0')}`
}