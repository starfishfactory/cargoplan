import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 반응형 디자인 분석 테스트
 * 다양한 뷰포트에서 레이아웃 및 UX 검증
 */

interface ResponsiveInfo {
  viewport: {
    width: number;
    height: number;
  };
  deviceType: string;
  hasHorizontalScroll: boolean;
  hasOverflowIssues: boolean;
  mobileMenuVisible: boolean;
  desktopMenuVisible: boolean;
  imagesVisible: number;
  brokenLayout: string[];
}

interface ResponsiveAnalysis {
  analyzedAt: string;
  viewports: {
    desktop: ResponsiveInfo;
    tablet: ResponsiveInfo;
    mobile: ResponsiveInfo;
  };
  breakpoints: {
    detected: number[];
    responsive: boolean;
  };
}

test.describe('반응형 디자인 분석', () => {
  const analysis: ResponsiveAnalysis = {
    analyzedAt: new Date().toISOString(),
    viewports: {
      desktop: {} as ResponsiveInfo,
      tablet: {} as ResponsiveInfo,
      mobile: {} as ResponsiveInfo,
    },
    breakpoints: {
      detected: [],
      responsive: true,
    },
  };

  test.describe('데스크톱 뷰포트 (1920x1080)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('레이아웃 확인', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/marketplace');
      await page.waitForLoadState('networkidle');

      const viewportInfo: ResponsiveInfo = {
        viewport: { width: 1920, height: 1080 },
        deviceType: 'desktop',
        hasHorizontalScroll: false,
        hasOverflowIssues: false,
        mobileMenuVisible: false,
        desktopMenuVisible: true,
        imagesVisible: 0,
        brokenLayout: [],
      };

      // 가로 스크롤 확인
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      viewportInfo.hasHorizontalScroll = scrollWidth > clientWidth;

      console.log(`📏 Viewport: ${viewportInfo.viewport.width}x${viewportInfo.viewport.height}`);
      console.log(`📊 Scroll Width: ${scrollWidth}px, Client Width: ${clientWidth}px`);
      console.log(`${viewportInfo.hasHorizontalScroll ? '⚠️' : '✅'} 가로 스크롤: ${viewportInfo.hasHorizontalScroll ? '있음' : '없음'}`);

      // 데스크톱 메뉴 확인
      const desktopMenu = await page.locator('header nav').count();
      viewportInfo.desktopMenuVisible = desktopMenu > 0;
      console.log(`${viewportInfo.desktopMenuVisible ? '✅' : '⚠️'} 데스크톱 메뉴: ${viewportInfo.desktopMenuVisible ? '보임' : '숨김'}`);

      // 이미지 로드 확인
      const images = await page.locator('img').all();
      for (const img of images) {
        const isVisible = await img.isVisible();
        if (isVisible) {
          viewportInfo.imagesVisible++;
        }
      }
      console.log(`🖼️  보이는 이미지: ${viewportInfo.imagesVisible}개`);

      // 스크린샷
      const screenshotDir = path.join(process.cwd(), 'docs', 'site-analysis', 'screenshots', 'responsive');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      await page.screenshot({
        path: path.join(screenshotDir, 'desktop-1920.png'),
        fullPage: false,
      });

      analysis.viewports.desktop = viewportInfo;
    });

    test('주요 요소 위치 확인', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/marketplace');
      await page.waitForLoadState('networkidle');

      // 헤더 높이
      const header = page.locator('header').first();
      if (await header.count() > 0) {
        const headerBox = await header.boundingBox();
        console.log(`📐 헤더 높이: ${headerBox?.height}px`);
      }

      // 메인 콘텐츠 너비
      const main = page.locator('main, [role="main"]').first();
      if (await main.count() > 0) {
        const mainBox = await main.boundingBox();
        console.log(`📐 메인 콘텐츠 너비: ${mainBox?.width}px`);
      }
    });
  });

  test.describe('태블릿 뷰포트 (768x1024)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('레이아웃 확인', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/marketplace');
      await page.waitForLoadState('networkidle');

      const viewportInfo: ResponsiveInfo = {
        viewport: { width: 768, height: 1024 },
        deviceType: 'tablet',
        hasHorizontalScroll: false,
        hasOverflowIssues: false,
        mobileMenuVisible: false,
        desktopMenuVisible: false,
        imagesVisible: 0,
        brokenLayout: [],
      };

      // 가로 스크롤 확인
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      viewportInfo.hasHorizontalScroll = scrollWidth > clientWidth;

      console.log(`📏 Viewport: ${viewportInfo.viewport.width}x${viewportInfo.viewport.height}`);
      console.log(`${viewportInfo.hasHorizontalScroll ? '⚠️' : '✅'} 가로 스크롤: ${viewportInfo.hasHorizontalScroll ? '있음' : '없음'}`);

      // 이미지 로드 확인
      const images = await page.locator('img').all();
      for (const img of images) {
        const isVisible = await img.isVisible();
        if (isVisible) {
          viewportInfo.imagesVisible++;
        }
      }
      console.log(`🖼️  보이는 이미지: ${viewportInfo.imagesVisible}개`);

      // 스크린샷
      const screenshotDir = path.join(process.cwd(), 'docs', 'site-analysis', 'screenshots', 'responsive');
      await page.screenshot({
        path: path.join(screenshotDir, 'tablet-768.png'),
        fullPage: false,
      });

      analysis.viewports.tablet = viewportInfo;
    });
  });

  test.describe('모바일 뷰포트 (375x667)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('레이아웃 확인', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/marketplace');
      await page.waitForLoadState('networkidle');

      const viewportInfo: ResponsiveInfo = {
        viewport: { width: 375, height: 667 },
        deviceType: 'mobile',
        hasHorizontalScroll: false,
        hasOverflowIssues: false,
        mobileMenuVisible: false,
        desktopMenuVisible: false,
        imagesVisible: 0,
        brokenLayout: [],
      };

      // 가로 스크롤 확인
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      viewportInfo.hasHorizontalScroll = scrollWidth > clientWidth;

      console.log(`📏 Viewport: ${viewportInfo.viewport.width}x${viewportInfo.viewport.height}`);
      console.log(`${viewportInfo.hasHorizontalScroll ? '⚠️' : '✅'} 가로 스크롤: ${viewportInfo.hasHorizontalScroll ? '있음' : '없음'}`);

      // 햄버거 메뉴 확인
      const hamburgerSelectors = [
        'button[aria-label*="menu"]',
        '[class*="hamburger"]',
        '[class*="mobile-menu"]',
        'button svg',
      ];

      for (const selector of hamburgerSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          viewportInfo.mobileMenuVisible = true;
          console.log(`✅ 모바일 메뉴 버튼 발견: ${selector}`);
          break;
        }
      }

      if (!viewportInfo.mobileMenuVisible) {
        console.log('ℹ️  모바일 메뉴 버튼을 찾을 수 없습니다.');
      }

      // 이미지 로드 확인
      const images = await page.locator('img').all();
      for (const img of images) {
        const isVisible = await img.isVisible();
        if (isVisible) {
          viewportInfo.imagesVisible++;
        }
      }
      console.log(`🖼️  보이는 이미지: ${viewportInfo.imagesVisible}개`);

      // 터치 타겟 크기 확인
      const buttons = await page.locator('button, a').all();
      let smallTargets = 0;
      for (const button of buttons.slice(0, 10)) {
        const box = await button.boundingBox();
        if (box && (box.width < 44 || box.height < 44)) {
          smallTargets++;
        }
      }
      if (smallTargets > 0) {
        console.log(`⚠️  44x44px 미만 터치 타겟: ${smallTargets}개 (샘플 10개 중)`);
      }

      // 스크린샷
      const screenshotDir = path.join(process.cwd(), 'docs', 'site-analysis', 'screenshots', 'responsive');
      await page.screenshot({
        path: path.join(screenshotDir, 'mobile-375.png'),
        fullPage: false,
      });

      analysis.viewports.mobile = viewportInfo;
    });

    test('모바일 전용 기능 확인', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/marketplace');
      await page.waitForLoadState('networkidle');

      // 스와이프 가능한 요소
      const carousels = await page.locator('[class*="carousel"], [class*="slider"], [class*="swiper"]').count();
      console.log(`📱 스와이프 가능 요소: ${carousels}개`);

      // 터치 이벤트 지원
      const hasTouchSupport = await page.evaluate(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      });
      console.log(`👆 터치 이벤트 지원: ${hasTouchSupport ? '있음' : '없음'}`);
    });
  });

  test.describe('작은 모바일 뷰포트 (320x568)', () => {
    test.use({ viewport: { width: 320, height: 568 } });

    test('극소형 화면 대응 확인', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/marketplace');
      await page.waitForLoadState('networkidle');

      console.log(`📏 Viewport: 320x568 (iPhone SE)`);

      // 가로 스크롤 확인
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const hasScroll = scrollWidth > clientWidth;

      console.log(`${hasScroll ? '⚠️' : '✅'} 가로 스크롤: ${hasScroll ? '있음' : '없음'}`);

      // 텍스트 오버플로우 확인
      const textElements = await page.locator('h1, h2, h3, button, a').all();
      let overflowCount = 0;
      for (const el of textElements.slice(0, 10)) {
        const overflow = await el.evaluate((element) => {
          const style = window.getComputedStyle(element);
          return style.overflow === 'hidden' && element.scrollWidth > element.clientWidth;
        });
        if (overflow) overflowCount++;
      }

      if (overflowCount > 0) {
        console.log(`⚠️  텍스트 오버플로우: ${overflowCount}개 (샘플 10개 중)`);
      } else {
        console.log('✅ 텍스트 오버플로우 없음');
      }

      // 스크린샷
      const screenshotDir = path.join(process.cwd(), 'docs', 'site-analysis', 'screenshots', 'responsive');
      await page.screenshot({
        path: path.join(screenshotDir, 'mobile-320.png'),
        fullPage: false,
      });
    });
  });

  test.describe('브레이크포인트 탐지', () => {
    test('미디어 쿼리 분석', async ({ page }) => {
      await page.goto('https://www.surff.kr/en/marketplace');
      await page.waitForLoadState('networkidle');

      // 스타일시트에서 브레이크포인트 추출
      const breakpoints = await page.evaluate(() => {
        const sheets = Array.from(document.styleSheets);
        const bps = new Set<number>();

        sheets.forEach(sheet => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            rules.forEach(rule => {
              if (rule instanceof CSSMediaRule) {
                const matches = rule.media.mediaText.match(/(\d+)px/g);
                if (matches) {
                  matches.forEach(match => {
                    const px = parseInt(match);
                    if (px >= 320 && px <= 2560) {
                      bps.add(px);
                    }
                  });
                }
              }
            });
          } catch (e) {
            // CORS 이슈 등으로 접근 불가능한 스타일시트 무시
          }
        });

        return Array.from(bps).sort((a, b) => a - b);
      });

      analysis.breakpoints.detected = breakpoints;
      analysis.breakpoints.responsive = breakpoints.length > 0;

      console.log(`\n📐 감지된 브레이크포인트: ${breakpoints.length}개`);
      if (breakpoints.length > 0) {
        breakpoints.forEach(bp => {
          console.log(`  - ${bp}px`);
        });
      } else {
        console.log('ℹ️  브레이크포인트를 감지하지 못했습니다.');
      }
    });
  });

  test.afterAll(async () => {
    // 결과 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'responsive-info.json'),
      JSON.stringify(analysis, null, 2),
      'utf-8'
    );

    console.log('\n✅ 반응형 디자인 분석 완료');
    console.log(`📁 저장 위치: ${path.join(outputDir, 'responsive-info.json')}`);
    console.log('\n📊 분석 요약:');
    console.log(`\n데스크톱 (1920x1080):`);
    console.log(`  - 가로 스크롤: ${analysis.viewports.desktop.hasHorizontalScroll ? '있음' : '없음'}`);
    console.log(`  - 이미지: ${analysis.viewports.desktop.imagesVisible}개`);
    console.log(`\n태블릿 (768x1024):`);
    console.log(`  - 가로 스크롤: ${analysis.viewports.tablet.hasHorizontalScroll ? '있음' : '없음'}`);
    console.log(`  - 이미지: ${analysis.viewports.tablet.imagesVisible}개`);
    console.log(`\n모바일 (375x667):`);
    console.log(`  - 가로 스크롤: ${analysis.viewports.mobile.hasHorizontalScroll ? '있음' : '없음'}`);
    console.log(`  - 모바일 메뉴: ${analysis.viewports.mobile.mobileMenuVisible ? '있음' : '없음'}`);
    console.log(`  - 이미지: ${analysis.viewports.mobile.imagesVisible}개`);
    console.log(`\n브레이크포인트:`);
    console.log(`  - 감지됨: ${analysis.breakpoints.detected.length}개`);
    console.log(`  - 반응형: ${analysis.breakpoints.responsive ? '✅ 예' : '⚠️ 아니오'}`);
  });
});
