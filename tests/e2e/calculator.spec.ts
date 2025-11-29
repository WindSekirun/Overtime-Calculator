import { test, expect } from './fixtures';
import { Page } from '@playwright/test';

test.describe('Overtime Calculator E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  async function setBasicPay(page: Page, amount: string) {
    const settingsButton = page.getByText('통상임금 설정');
    const sheet = page.locator('.v-sheet').filter({ hasText: '세전 통상임금' });
    if (!await sheet.isVisible()) {
      await settingsButton.click();
    }
    await page.locator('input[placeholder="금액 입력"]').fill(amount);
  }

  async function setTime(page: Page, label: string, hours: string, minutes: string = '0') {
    const hourInput = page.getByLabel(label).first();
    await hourInput.fill(hours);
    
    const container = page.locator('.d-flex.align-center:not(.justify-center)').filter({ has: hourInput });
    const minuteInput = container.getByLabel('분');
    await minuteInput.fill(minutes);
  }

  test('should load the home page and display title', async ({ page }) => {
    await expect(page).toHaveTitle(/Overtime Calculator/);
    await expect(page.getByText('OverTime Calculator')).toBeVisible();
  });

  test('should navigate between months', async ({ page }) => {
    const monthTitle = page.locator('.text-h5').nth(0);
    const initialText = await monthTitle.innerText();

    await page.locator('button .mdi-chevron-right').click();
    const nextText = await monthTitle.innerText();
    expect(nextText).not.toBe(initialText);

    await page.locator('button .mdi-chevron-left').click();
    await expect(monthTitle).toHaveText(initialText);
  });

  test('should calculate basic overtime correctly', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click();

    await setTime(page, '근로', '200');

    const amountText = page.locator('.text-h3.font-weight-bold');
    await expect(amountText).toBeVisible();
    const amount = await amountText.innerText();
    expect(amount).not.toBe('0');
    expect(amount).not.toContain('NaN');

    const breakdown = page.locator('p.body-1, p.text-caption');
    await expect(breakdown).toContainText('기본 근로시간');
  });

  test('should calculate night work', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click();

    await setTime(page, '근로', '200');
    await setTime(page, '야간', '10');

    const breakdown = page.locator('p');
    await expect(breakdown).toContainText('야간근로');
    await expect(breakdown).toContainText('10시간 0분');
  });

  test('should calculate holiday work', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click();

    await setTime(page, '근로', '200');
    await setTime(page, '휴일', '10');

    const breakdown = page.locator('p');
    await expect(breakdown).toContainText('휴일근로');
    await expect(breakdown).toContainText('휴일근로초과');
  });

  test('should calculate vacation time', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click();

    await setTime(page, '근로', '160');
    await setTime(page, '휴가', '8');

    const breakdown = page.locator('p');
    await expect(breakdown).toContainText('휴가시간');
    await expect(breakdown).toContainText('8시간 0분');
  });

  test('should persist basic pay across reloads', async ({ page }) => {
    const uniquePay = '1234560';
    await setBasicPay(page, uniquePay);
    
    await page.reload();
    
    const settingsButton = page.getByText('통상임금 설정');
    const sheet = page.locator('.v-sheet').filter({ hasText: '세전 통상임금' });
    if (!await sheet.isVisible()) {
      await settingsButton.click();
    }
    
    const input = page.locator('input[placeholder="금액 입력"]');
    await expect(input).toHaveValue(uniquePay);
  });

  test('should populate data in demo mode', async ({ page }) => {
    await page.getByText('통상임금 설정').click();
    await page.getByText('데모모드 설정').click();
    
    const input = page.locator('input[placeholder="금액 입력"]');
    await expect(input).toHaveValue('2156880');
  });

  test('should open and close dialogs', async ({ page }) => {
    await page.getByText('FAQ').click();
    await expect(page.getByText('자주 묻는 질문')).toBeVisible();
    await page.getByText('닫기').filter({ hasText: '닫기' }).last().click();
    
    await page.getByText('사용법').click();
    await expect(page.getByText('사용 방법')).toBeVisible();
    await page.getByText('닫기').filter({ hasText: '닫기' }).last().click();
  });

  test('should show error when exceeding 52-hour limit', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click();

    await setTime(page, '근로', '400');

    const breakdown = page.locator('p');
    await expect(breakdown).toContainText('52시간 제도에 따른 최대 시간을 초과');
  });

  test('should show defect when under standard work time', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click();

    await setTime(page, '근로', '10');

    const breakdown = page.locator('p');
    await expect(breakdown).toContainText('기준근로시간을 넘지 않아서 계산 불가');
  });

  // --- Tests for diffEmoji coverage ---
  test('should display "🔥🔥" emoji when guide time exceeds law time', async ({ page }) => {
    // Navigate to a month where workingGuideTime > underLawTime (e.g., 2025년 7월)
    // 2025 is current year so data exists.
    await page.goto('/#/202507');
    const diffEmojiElement = page.locator('ul li').filter({ hasText: '기준근로' }).locator('text=🔥🔥');
    await expect(diffEmojiElement).toBeVisible();
  });

  test('should display "🔥" emoji when guide time is close to law time', async ({ page }) => {
    // Navigate to a month where diffHours < 3.0 (e.g., 2025년 2월)
    await page.goto('/#/202502');
    const diffEmojiElement = page.locator('ul li').filter({ hasText: '기준근로' }).locator('text=🔥');
    await expect(diffEmojiElement).toBeVisible();
  });
});