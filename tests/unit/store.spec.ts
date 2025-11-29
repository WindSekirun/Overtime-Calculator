import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useStore, storageKey, oldStorageKey } from '@/store/store';
import * as dateUtils from '@/util/date'; // Alias for the module
import { TimeTable, timeTables } from '@/model/timetable';
import { Overtime } from '@/model/overtime';
import { YearMonth } from '@/model/month';

describe('Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize data for current year', () => {
    const store = useStore();
    const data = store.getDataFromStorage();
    const currentYear = dateUtils.getYear(); // Use dateUtils.getYear()
    
    expect(data.some(d => d.year === currentYear)).toBe(true);
    expect(data.filter(d => d.year === currentYear).length).toBe(12);
  });

  it('should initialize data for next year if in timetable', () => {
    vi.spyOn(dateUtils, 'getYear').and.returnValue(2025); // Correct mocking
    const store = useStore();
    const data = store.getDataFromStorage();
    const nextYear = 2026;
    
    expect(data.some(d => d.year === nextYear)).toBe(true);
    expect(data.filter(d => d.year === nextYear).length).toBe(12);
  });

  it('should not initialize data for next year if not in timetable', () => {
    vi.spyOn(dateUtils, 'getYear').and.returnValue(2027); // Correct mocking
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
    const currentYear = getYear();
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
    const currentYear = getYear();
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

  it('should handle migration when old data exists and new data is empty', async () => {
    // Mock V2 data (hours based)
    const v2Data = [
      {
        year: 2023,
        month: 5,
        overtime: {
          basicPay: 2000000,
          nowWorkingTime: 160, // 160 hours
          vacationTime: 8, // 8 hours
          workOffTime: 4,
          overNightTime: 2
        }
      }
    ];
    localStorage.setItem(oldStorageKey, JSON.stringify(v2Data));
    localStorage.removeItem(storageKey); // Ensure V3 is empty

    const store = useStore();
    // Load current month, which triggers migration check
    store.load(getYear(), 1); 
    expect(store.needMigration).toBe(true);

    await store.doMigration();

    // Verify migration complete and flag reset
    expect(store.needMigration).toBe(false);

    // Check if V3 data is correctly migrated (minutes based)
    const v3Data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const migratedItem = v3Data.find((d: any) => d.year === 2023 && d.month === 5);
    expect(migratedItem.overtime.basicPay).toBe(2000000);
    expect(migratedItem.overtime.nowWorkingTime).toBe(160 * 60); // 160 hours * 60 minutes
    expect(migratedItem.overtime.vacationTime).toBe(8 * 60);     // 8 hours * 60 minutes
    expect(migratedItem.overtime.overNightTime).toBe(2 * 60);
    expect(migratedItem.overtime.workOffTime).toBe(4 * 60);
  });
});