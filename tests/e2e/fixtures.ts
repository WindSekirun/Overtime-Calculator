import { test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare global {
  interface Window {
    __coverage__: any;
  }
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await use(page);

    // 테스트 종료 후 커버리지 데이터 수집
    const coverage = await page.evaluate(() => window.__coverage__);
    
    if (coverage) {
      const coverageDir = path.resolve(__dirname, '../../.nyc_output');
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      // 각 테스트 실행마다 고유한 파일명으로 저장 (병렬 실행 지원)
      const uuid = crypto.randomUUID();
      fs.writeFileSync(
        path.join(coverageDir, `coverage-${uuid}.json`),
        JSON.stringify(coverage)
      );
    }
  },
});

export { expect } from '@playwright/test';
