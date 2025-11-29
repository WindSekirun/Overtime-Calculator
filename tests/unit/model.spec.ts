import { describe, it, expect } from 'vitest';
import { DescriptionBuilder, CalculatedResult } from '@/model/result';
import { timeTables } from '@/model/timetable';
import { frequencyQuestions } from '@/model/question';

describe('DescriptionBuilder', () => {
  it('should build description correctly for base time', () => {
    const builder = new DescriptionBuilder('Test Title', 120, 1); // 2 hours
    builder.base = true;
    const result = builder.build(10000); // Hourly wage
    
    // Expected: [ "⬤ <b>Test Title</b> <b>➜</b> <b>2시간 0분</b>", "120" ]
    expect(result[0]).toContain('Test Title');
    expect(result[0]).toContain('2시간 0분');
    expect(result[1]).toBe('120');
  });

  it('should build description correctly for multiplied time', () => {
    const builder = new DescriptionBuilder('Overtime', 60, 1.5); // 1 hour * 1.5
    // Effective minutes: 90
    // Wage: (90/60) * 10000 = 15000
    const result = builder.build(10000);
    
    expect(result[0]).toContain('Overtime');
    expect(result[0]).toContain('1.5x');
    expect(result[0]).toContain('1시간 30분'); // Effective time
    expect(result[0]).toContain('15,000원'); // Effective wage
  });

  it('should wrap error text in red font', () => {
    const builder = new DescriptionBuilder('Deficit', -60, 1);
    builder.error = true;
    const result = builder.build(10000);
    
    expect(result[0]).toContain('<font color="#F08080">');
    expect(result[0]).toContain('Deficit');
  });
});

describe('CalculatedResult', () => {
    it('should return error text if present', () => {
        const res = new CalculatedResult("0", 0, 0, [], 0, "Error occurred");
        expect(res.build()).toBe("Error occurred");
    });

    it('should build full description from builders', () => {
        const b1 = new DescriptionBuilder("Base", 60, 1);
        b1.base = true;
        const res = new CalculatedResult("10,000", 10000, 10000, [b1], 10000, "");
        
        const desc = res.build();
        expect(desc).toContain("Base");
        expect(desc).toContain("최종 계산금액");
        expect(desc).toContain("10,000");
    });
});

describe('Static Data', () => {
    it('should have timeTables defined', () => {
        expect(timeTables).toBeInstanceOf(Array);
        expect(timeTables.length).toBeGreaterThan(0);
    });

    it('should have frequencyQuestions defined', () => {
        expect(frequencyQuestions).toBeInstanceOf(Array);
        expect(frequencyQuestions.length).toBeGreaterThan(0);
    });
});