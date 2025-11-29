import { describe, it, expect } from 'vitest';
import { getUnderLawTime, formatYearMonth, getYear } from '@/util/date';
import { roundNumber } from '@/util/number';

describe('Util Date', () => {
  it('should format year month correctly', () => {
    expect(formatYearMonth(2023, 5)).toBe('202305');
    expect(formatYearMonth(2023, 12)).toBe('202312');
    expect(formatYearMonth(2023, 1)).toBe('202301');
  });

  it('should get current year', () => {
    const now = new Date().getFullYear();
    expect(getYear()).toBe(now);
  });

  it('should calculate under law time', () => {
    // Example: 2023 Jan (31 days)
    // (40 * 31) / 7 = 177.14... -> 177.1
    expect(getUnderLawTime(2023, 1, 40)).toBe(177.1);
    
    // Example: 2023 Feb (28 days)
    // (40 * 28) / 7 = 160
    expect(getUnderLawTime(2023, 2, 40)).toBe(160);
  });
});

describe('Util Number', () => {
  it('should round number to 1 decimal place', () => {
    expect(roundNumber(123.456)).toBe(123.5);
    expect(roundNumber(123.44)).toBe(123.4);
    expect(roundNumber(100)).toBe(100);
  });
});
