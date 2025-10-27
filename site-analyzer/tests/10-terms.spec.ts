import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 약관 페이지 분석 테스트
 * - 개인정보 처리방침 (termPersonal)
 * - 이용약관 (termUse)
 */

interface TermsInfo {
  url: string;
  title: string;
  lastUpdated?: string;
  sections: {
    title: string;
    content: string;
  }[];
  hasTableOfContents: boolean;
  wordCount: number;
}

test.describe('약관 페이지 분석', () => {
  let privacyInfo: TermsInfo;
  let termsInfo: TermsInfo;

  test.beforeAll(() => {
    privacyInfo = {
      url: 'https://www.surff.kr/en/termPersonal',
      title: '',
      sections: [],
      hasTableOfContents: false,
      wordCount: 0,
    };

    termsInfo = {
      url: 'https://www.surff.kr/en/termUse',
      title: '',
      sections: [],
      hasTableOfContents: false,
      wordCount: 0,
    };
  });

  test.describe('개인정보 처리방침', () => {
    test('페이지 기본 정보 수집', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termPersonal');
      await page.waitForLoadState('networkidle');

      // 페이지 타이틀
      privacyInfo.title = await page.title();
      console.log(`📄 페이지 제목: ${privacyInfo.title}`);

      // 메인 제목 (h1 또는 h2)
      const mainHeading = await page.locator('h1, h2').first().textContent();
      console.log(`📌 메인 제목: ${mainHeading}`);

      expect(privacyInfo.title).toBeTruthy();
    });

    test('최종 업데이트 일자 확인', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termPersonal');
      await page.waitForLoadState('networkidle');

      // 일자 패턴 찾기
      const datePatterns = [
        /Last\s+Updated?:?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i,
        /Effective\s+Date:?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i,
        /(\d{4}\.\d{2}\.\d{2})/,
      ];

      const bodyText = await page.locator('body').textContent();

      for (const pattern of datePatterns) {
        const match = bodyText?.match(pattern);
        if (match) {
          privacyInfo.lastUpdated = match[0];
          console.log(`📅 최종 업데이트: ${privacyInfo.lastUpdated}`);
          break;
        }
      }

      if (!privacyInfo.lastUpdated) {
        console.log('ℹ️  업데이트 일자를 찾을 수 없습니다.');
      }
    });

    test('섹션 구조 분석', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termPersonal');
      await page.waitForLoadState('networkidle');

      // 제목 태그 수집
      const headings = await page.locator('h1, h2, h3, h4').all();

      console.log(`📋 발견된 섹션 제목: ${headings.length}개`);

      for (let i = 0; i < Math.min(headings.length, 10); i++) {
        const heading = headings[i];
        const title = await heading.textContent();
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());

        if (title) {
          console.log(`  ${i + 1}. <${tagName}> ${title.trim()}`);

          // 섹션 내용 (다음 제목까지의 텍스트 또는 다음 요소들)
          privacyInfo.sections.push({
            title: title.trim(),
            content: '', // 간단히 저장
          });
        }
      }
    });

    test('목차(ToC) 존재 여부', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termPersonal');
      await page.waitForLoadState('networkidle');

      // 목차를 나타낼 수 있는 요소 찾기
      const tocSelectors = [
        '[class*="toc"]',
        '[class*="table-of-contents"]',
        '[id*="toc"]',
        'nav[aria-label*="Table"]',
        'ol li a[href^="#"]',
      ];

      let found = false;
      for (const selector of tocSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          found = true;
          console.log(`✅ 목차 발견: ${selector} (${count}개)`);
          break;
        }
      }

      privacyInfo.hasTableOfContents = found;

      if (!found) {
        console.log('ℹ️  목차를 찾을 수 없습니다.');
      }
    });

    test('단어 수 계산', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termPersonal');
      await page.waitForLoadState('networkidle');

      // 메인 콘텐츠 영역의 텍스트 추출
      const mainContent = await page.locator('main, article, [role="main"]').first().textContent();

      if (mainContent) {
        const words = mainContent.trim().split(/\s+/);
        privacyInfo.wordCount = words.length;
        console.log(`📝 단어 수: ${privacyInfo.wordCount.toLocaleString()}개`);
      } else {
        console.log('ℹ️  메인 콘텐츠를 찾을 수 없습니다.');
      }
    });

    test('스크린샷 캡처', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termPersonal');
      await page.waitForLoadState('networkidle');

      const screenshotDir = path.join(process.cwd(), 'docs', 'site-analysis', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      // 전체 페이지 스크린샷
      await page.screenshot({
        path: path.join(screenshotDir, 'desktop-privacy-full.png'),
        fullPage: true,
      });

      console.log('📸 개인정보 처리방침 스크린샷 저장 완료');
    });
  });

  test.describe('이용약관', () => {
    test('페이지 기본 정보 수집', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termUse');
      await page.waitForLoadState('networkidle');

      // 페이지 타이틀
      termsInfo.title = await page.title();
      console.log(`📄 페이지 제목: ${termsInfo.title}`);

      // 메인 제목
      const mainHeading = await page.locator('h1, h2').first().textContent();
      console.log(`📌 메인 제목: ${mainHeading}`);

      expect(termsInfo.title).toBeTruthy();
    });

    test('최종 업데이트 일자 확인', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termUse');
      await page.waitForLoadState('networkidle');

      const datePatterns = [
        /Last\s+Updated?:?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i,
        /Effective\s+Date:?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i,
        /(\d{4}\.\d{2}\.\d{2})/,
      ];

      const bodyText = await page.locator('body').textContent();

      for (const pattern of datePatterns) {
        const match = bodyText?.match(pattern);
        if (match) {
          termsInfo.lastUpdated = match[0];
          console.log(`📅 최종 업데이트: ${termsInfo.lastUpdated}`);
          break;
        }
      }

      if (!termsInfo.lastUpdated) {
        console.log('ℹ️  업데이트 일자를 찾을 수 없습니다.');
      }
    });

    test('섹션 구조 분석', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termUse');
      await page.waitForLoadState('networkidle');

      const headings = await page.locator('h1, h2, h3, h4').all();

      console.log(`📋 발견된 섹션 제목: ${headings.length}개`);

      for (let i = 0; i < Math.min(headings.length, 10); i++) {
        const heading = headings[i];
        const title = await heading.textContent();
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());

        if (title) {
          console.log(`  ${i + 1}. <${tagName}> ${title.trim()}`);

          termsInfo.sections.push({
            title: title.trim(),
            content: '',
          });
        }
      }
    });

    test('목차(ToC) 존재 여부', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termUse');
      await page.waitForLoadState('networkidle');

      const tocSelectors = [
        '[class*="toc"]',
        '[class*="table-of-contents"]',
        '[id*="toc"]',
        'nav[aria-label*="Table"]',
        'ol li a[href^="#"]',
      ];

      let found = false;
      for (const selector of tocSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          found = true;
          console.log(`✅ 목차 발견: ${selector} (${count}개)`);
          break;
        }
      }

      termsInfo.hasTableOfContents = found;

      if (!found) {
        console.log('ℹ️  목차를 찾을 수 없습니다.');
      }
    });

    test('단어 수 계산', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termUse');
      await page.waitForLoadState('networkidle');

      const mainContent = await page.locator('main, article, [role="main"]').first().textContent();

      if (mainContent) {
        const words = mainContent.trim().split(/\s+/);
        termsInfo.wordCount = words.length;
        console.log(`📝 단어 수: ${termsInfo.wordCount.toLocaleString()}개`);
      } else {
        console.log('ℹ️  메인 콘텐츠를 찾을 수 없습니다.');
      }
    });

    test('스크린샷 캡처', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/termUse');
      await page.waitForLoadState('networkidle');

      const screenshotDir = path.join(process.cwd(), 'docs', 'site-analysis', 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      await page.screenshot({
        path: path.join(screenshotDir, 'desktop-terms-full.png'),
        fullPage: true,
      });

      console.log('📸 이용약관 스크린샷 저장 완료');
    });
  });

  test.afterAll(async () => {
    // 분석 결과 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // JSON 저장
    const termsData = {
      privacy: privacyInfo,
      terms: termsInfo,
      analyzedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(outputDir, 'terms-info.json'),
      JSON.stringify(termsData, null, 2),
      'utf-8'
    );

    console.log('\n✅ 약관 페이지 정보 저장 완료');
    console.log(`📁 저장 위치: ${path.join(outputDir, 'terms-info.json')}`);
    console.log('\n📊 분석 요약:');
    console.log(`\n개인정보 처리방침:`);
    console.log(`  - 제목: ${privacyInfo.title}`);
    console.log(`  - 섹션: ${privacyInfo.sections.length}개`);
    console.log(`  - 목차: ${privacyInfo.hasTableOfContents ? '있음' : '없음'}`);
    console.log(`  - 단어 수: ${privacyInfo.wordCount.toLocaleString()}개`);
    console.log(`\n이용약관:`);
    console.log(`  - 제목: ${termsInfo.title}`);
    console.log(`  - 섹션: ${termsInfo.sections.length}개`);
    console.log(`  - 목차: ${termsInfo.hasTableOfContents ? '있음' : '없음'}`);
    console.log(`  - 단어 수: ${termsInfo.wordCount.toLocaleString()}개`);
  });
});
