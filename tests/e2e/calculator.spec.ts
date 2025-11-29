import { test, expect, Page } from '@playwright/test';

test.describe('Overtime Calculator E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  async function setBasicPay(page: Page, amount: string) {
    const settingsButton = page.getByText('통상임금 설정');
    // Check if settings are already open (if button text implies it, or check visibility)
    // Button toggles `showSetting`.
    // If settings sheet is not visible, click button.
    const sheet = page.locator('.v-sheet').filter({ hasText: '세전 통상임금' });
    if (!await sheet.isVisible()) {
      await settingsButton.click();
    }
    await page.locator('input[placeholder="금액 입력"]').fill(amount);
  }

  async function setTime(page: Page, label: string, hours: string, minutes: string = '0') {
    // Find the hour input by label
    const hourInput = page.getByLabel(label).first();
    await hourInput.fill(hours);
    
    // Find the minute input in the same container
    // Structure: div.d-flex.align-center > [hour input] [minute input]
    // We look for the parent div. 
    // Note: v-row also has .d-flex.align-center but usually has .justify-center too.
    // The TimeInput component root is just .d-flex.align-center.
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
    await setBasicPay(page, '2090000'); // 10,000 won/hr (approx)
    
    // Close settings to see results clearly
    await page.getByText('통상임금 설정').click();

    // Input Total Work: 200 hours (Likely overtime)
    await setTime(page, '근로', '200');

    // Verify calculation result is shown
    const amountText = page.locator('.text-h3.font-weight-bold');
    await expect(amountText).toBeVisible();
    const amount = await amountText.innerText();
    expect(amount).not.toBe('0');
    expect(amount).not.toContain('NaN');

    // Verify breakdown
    const breakdown = page.locator('p.body-1, p.text-caption'); // descriptionClass
    await expect(breakdown).toContainText('기본 근로시간');
    // Should have overtime text like "법내연장" or "기준근로 초과" depending on the month's standard
    // Since we don't know the exact month's standard in test easily, we just check for general "Overtime" indicators
    // or at least that the breakdown is populated.
  });

  test('should calculate night work', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click(); // Close

    // Total: 200h, Night: 10h
    await setTime(page, '근로', '200');
    await setTime(page, '야간', '10');

    // Verify breakdown contains Night Work
    const breakdown = page.locator('p'); // Generalized locator for the description
    await expect(breakdown).toContainText('야간근로');
    await expect(breakdown).toContainText('10시간 0분'); // 10 hours
  });

  test('should calculate holiday work', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click(); // Close

    // Total: 200h, Holiday: 10h
    await setTime(page, '근로', '200');
    await setTime(page, '휴일', '10');

    // Verify breakdown contains Holiday Work
    const breakdown = page.locator('p');
    await expect(breakdown).toContainText('휴일근로');
    // Since 10h > 8h, it might split into 8h and 2h or show both lines
    // The code pushes "휴일근로초과" (excess) and "휴일근로" (base 8h)
    await expect(breakdown).toContainText('휴일근로초과');
  });

  test('should calculate vacation time', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click(); // Close

    // Total: 160h (Standard-ish), Vacation: 8h
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
    
    // Check if settings button needs clicking?
    // Basic pay might be hidden if settings collapsed.
    await page.getByText('통상임금 설정').click();
    
    const input = page.locator('input[placeholder="금액 입력"]');
    await expect(input).toHaveValue(uniquePay);
  });

  test('should populate data in demo mode', async ({ page }) => {
    await page.getByText('통상임금 설정').click();
    await page.getByText('데모모드 설정').click();
    
    const input = page.locator('input[placeholder="금액 입력"]');
    // Demo mode sets 2156880
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
    await page.getByText('통상임금 설정').click(); // Close

    // Input a huge amount of hours, e.g., 400h
    await setTime(page, '근로', '400');

    // Check for error message
    // "52시간 제도에 따른 최대 시간을 초과하여 계산 불가"
    // The text might be split or formatted, let's look for part of it.
    const breakdown = page.locator('p');
    await expect(breakdown).toContainText('52시간 제도에 따른 최대 시간을 초과');
  });

  test('should show defect when under standard work time', async ({ page }) => {
    await setBasicPay(page, '2090000');
    await page.getByText('통상임금 설정').click(); // Close

    // Input very low hours, e.g., 10h
    await setTime(page, '근로', '10');

    // Check for "기준근로 부족"
    const breakdown = page.locator('p');
    await expect(breakdown).toContainText('기준근로시간을 넘지 않아서 계산 불가');
  });
});