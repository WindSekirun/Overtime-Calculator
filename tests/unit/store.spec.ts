import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStore, storageKey, oldStorageKey } from '@/store/store';
import * as dateUtils from '@/util/date'; // Alias for the module
import { TimeTable, timeTables } from '@/model/timetable'; // timeTables 추가
import { Overtime } from '@/model/overtime'; // Overtime 모델 추가
import { YearMonth } from '@/model/month'; // YearMonth 모델 추가

// Mock the entire '@/util/date' module
vi.mock('@/util/date', async (importOriginal) => {
  const actual = await importOriginal<typeof dateUtils>();
  return {
    ...actual,
    getYear: vi.fn(actual.getYear), // Spy on the actual getYear function by default
  };
});

describe('Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
    // Reset the mock before each test to prevent cross-test pollution
    (dateUtils.getYear as Vi.Mock).mockRestore();
  });

  it('should initialize data for current year', () => {
    const store = useStore();
    const data = store.getDataFromStorage();
    const currentYear = dateUtils.getYear(); // Use dateUtils.getYear()
    
    expect(data.some(d => d.year === currentYear)).toBe(true);
    expect(data.filter(d => d.year === currentYear).length).toBe(12);
  });

  it('should initialize data for next year if in timetable', () => {
    (dateUtils.getYear as Vi.Mock).mockReturnValue(2025); // Use mockReturnValue for the mocked function
    const store = useStore();
    const data = store.getDataFromStorage();
    const nextYear = 2026;
    
    expect(data.some(d => d.year === nextYear)).toBe(true);
    expect(data.filter(d => d.year === nextYear).length).toBe(12);
  });

  it('should not initialize data for next year if not in timetable', () => {
    (dateUtils.getYear as Vi.Mock).mockReturnValue(2027); // Use mockReturnValue for the mocked function
    const store = useStore();
    const data = store.getDataFromStorage();
    const nextYear = 2028;
    
    expect(data.some(d => d.year === nextYear)).toBe(false);
  });

  it('should load previous basic pay correctly', () => {
    const store = useStore();
    const currentYear = 2023; // Test with a specific year
    const currentMonth = 5;
    const prevMonth = 4;
    
    // Setup data in localStorage
    const data = [
      new YearMonth(currentYear, prevMonth, new Overtime(3000000, 0, 0, 0)),
    ];
    localStorage.setItem(storageKey, JSON.stringify(data));

    store.load(currentYear, currentMonth); // Loads 2023, 5
    const prevPay = store.loadPreviousBasicPay(); // Should get 2023, 4
    expect(prevPay).toBe(3000000);
  });

  it('should return 0 for previous basic pay if data not found', () => {
    const store = useStore();
    // No data in local storage for previous month
    store.load(2023, 5); // Load 2023, 5
    const prevPay = store.loadPreviousBasicPay(); // Will try to get 2023, 4
    expect(prevPay).toBe(0);
  });

  it('should handle year boundary for previous basic pay (Jan -> Prev Dec)', () => {
    const store = useStore();
    const data = [
      new YearMonth(2022, 12, new Overtime(2500000, 0, 0, 0)),
    ];
    localStorage.setItem(storageKey, JSON.stringify(data));

    store.load(2023, 1); // Load Jan 2023
    const prevPay = store.loadPreviousBasicPay(); // Should get Dec 2022
    expect(prevPay).toBe(2500000);
  });

  it('should save basic pay', () => {
    const store = useStore();
    const currentYear = dateUtils.getYear(); // Use mocked getYear from dateUtils
    const testMonth = 5; // Example month

    // Manually ensure the currentYear, testMonth data exists in localStorage
    const initialData = [];
    for (let m = 1; m <= 12; m++) {
        initialData.push(new YearMonth(currentYear, m, new Overtime(0,0,0,0)));
    }
    localStorage.setItem(storageKey, JSON.stringify(initialData));

    store.load(currentYear, testMonth);
    
    store.saveBasicPay(10000);
    expect(store.basicPay).toBe(10000);
    
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const item = data.find((d: any) => d.year === currentYear && d.month === testMonth);
    expect(item?.overtime?.basicPay).toBe(10000); // Use optional chaining for safety
  });

  it('should save working times', () => {
    const store = useStore();
    const currentYear = dateUtils.getYear(); // Use mocked getYear from dateUtils
    const testMonth = 5;

    const initialData = [];
    for (let m = 1; m <= 12; m++) {
        initialData.push(new YearMonth(currentYear, m, new Overtime(0,0,0,0)));
    }
    localStorage.setItem(storageKey, JSON.stringify(initialData));

    store.load(currentYear, testMonth);
    
    store.saveNowWorkingTime(100);
    expect(store.nowWorkingTime).toBe(100);
    
    store.saveVacationTime(20);
    expect(store.vacationTime).toBe(20);
    
    store.saveOverNightTime(30);
    expect(store.overNightTime).toBe(30);
    
    store.saveWorkOffTime(40);
    expect(store.workOffTime).toBe(40);

    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const item = data.find((d: any) => d.year === currentYear && d.month === testMonth);
    expect(item?.overtime?.nowWorkingTime).toBe(100);
    expect(item?.overtime?.vacationTime).toBe(20);
    expect(item?.overtime?.overNightTime).toBe(30);
    expect(item?.overtime?.workOffTime).toBe(40);
  });

  it('should restore data', () => {
    const store = useStore();
    const backupData = [
        new YearMonth(2099, 1, new Overtime(999, 0, 0, 0))
    ];
    store.restoreData(backupData as any);
    
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    expect(stored[0].year).toBe(2099);
    expect(stored[0].overtime.basicPay).toBe(999);
  });

  // Test for modifyYearMonth's else branch (when overtime not found)
  it('should not modify data if yearMonth not found in modifyYearMonth', () => {
    const store = useStore();
    // Use a year that getDataFromStorage will NOT initialize (not current, not next)
    // For example, if current year is 2025, 2023 would be an "uninitialized" year for modifyYearMonth
    (dateUtils.getYear as Vi.Mock).mockReturnValue(2025); // Set current year for getDataFromStorage
    const targetYear = 2023; // Year to attempt saving data for
    const targetMonth = 1;

    // Ensure localStorage is initially empty for this targetYear
    localStorage.clear();

    store.load(dateUtils.getYear(), 1); // Load current year, which populates localStorage for current and next year
    
    // Attempt to save data for targetYear (2023), which is not the current or next year
    store.saveBasicPay(500); // This will call modifyYearMonth for 2023,1

    const storedData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Expect that no entry for targetYear,targetMonth was created by modifyYearMonth
    expect(storedData.find((d: any) => d.year === targetYear && d.month === targetMonth)).toBeUndefined();
    // Also check that the initial data (currentYear and nextYear) is still there
    expect(storedData.find((d: any) => d.year === dateUtils.getYear() && d.month === 1)).toBeDefined();
  });

  // Test for load action's else branch (when overtime or timetable not found)
  it('should reset state if overtime or timetable not found in load', () => {
    // Clear localStorage to ensure overtime is not found
    localStorage.clear();
    
    // Mock getYear to a year not in timeTables (e.g., 2099) for timetable to be undefined
    (dateUtils.getYear as Vi.Mock).mockReturnValue(2099); 

    const store = useStore();
    store.load(2099, 1); // Load a year/month not in timeTables

    // Expect state to be reset to 0
    expect(store.basicPay).toBe(0);
    expect(store.nowWorkingTime).toBe(0);
    expect(store.vacationTime).toBe(0);
    expect(store.overNightTime).toBe(0);
    expect(store.workOffTime).toBe(0);
    expect(store.workingGuideTime).toBe(0);
  });
});