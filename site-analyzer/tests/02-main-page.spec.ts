import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 메인 페이지 상세 분석 테스트
 * www.surff.kr 메인 페이지의 Hero, 콘텐츠, CTA 등을 분석합니다.
 */

interface MainPageInfo {
  timestamp: string;
  hero: {
    exists: boolean;
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    ctaButtons: Array<{
      text: string;
      href: string;
      isPrimary: boolean;
    }>;
  };
  contentSections: Array<{
    title: string;
    description?: string;
    hasImage: boolean;
    imageCount: number;
    hasButton: boolean;
    buttons: Array<{
      text: string;
      href: string;
    }>;
  }>;
  features: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  testimonials: {
    exists: boolean;
    count: number;
  };
  statistics: Array<{
    label: string;
    value: string;
  }>;
  callToActions: Array<{
    text: string;
    href: string;
    location: string;
  }>;
}

test.describe('메인 페이지 상세 분석', () => {
  let pageInfo: MainPageInfo;

  test.beforeAll(async () => {
    pageInfo = {
      timestamp: new Date().toISOString(),
      hero: {
        exists: false,
        ctaButtons: [],
      },
      contentSections: [],
      features: [],
      testimonials: {
        exists: false,
        count: 0,
      },
      statistics: [],
      callToActions: [],
    };
  });

  test('Hero 섹션 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // Hero 섹션 찾기 (일반적인 패턴)
    const heroSelectors = [
      'section.hero',
      '.hero',
      'section:first-of-type',
      '[class*="hero"]',
      '[class*="banner"]',
      'main > section:first-child',
    ];

    for (const selector of heroSelectors) {
      const hero = page.locator(selector).first();
      if (await hero.count() > 0) {
        pageInfo.hero.exists = true;

        // Hero 제목 찾기
        const titleSelectors = ['h1', 'h2', '.title', '[class*="title"]'];
        for (const titleSelector of titleSelectors) {
          const title = hero.locator(titleSelector).first();
          if (await title.count() > 0 && await title.isVisible()) {
            pageInfo.hero.title = (await title.textContent())?.trim();
            console.log('📝 Hero 제목:', pageInfo.hero.title);
            break;
          }
        }

        // Hero 부제목 찾기
        const subtitleSelectors = ['h2', 'h3', 'p', '.subtitle', '[class*="subtitle"]'];
        for (const subtitleSelector of subtitleSelectors) {
          const subtitle = hero.locator(subtitleSelector).first();
          if (
            await subtitle.count() > 0 &&
            await subtitle.isVisible() &&
            pageInfo.hero.title !== (await subtitle.textContent())?.trim()
          ) {
            pageInfo.hero.subtitle = (await subtitle.textContent())?.trim();
            console.log('📝 Hero 부제목:', pageInfo.hero.subtitle);
            break;
          }
        }

        // CTA 버튼 찾기
        const ctaButtons = hero.locator('a, button').filter({ hasText: /.+/ });
        const ctaCount = await ctaButtons.count();

        for (let i = 0; i < ctaCount; i++) {
          const button = ctaButtons.nth(i);
          if (await button.isVisible()) {
            const text = (await button.textContent())?.trim() || '';
            const href = (await button.getAttribute('href')) || '';

            // 버튼 텍스트가 있고, 너무 긴 텍스트가 아니면 (일반적인 CTA는 짧음)
            if (text && text.length < 50) {
              const isPrimary = (await button.getAttribute('class'))?.includes('primary') || false;
              pageInfo.hero.ctaButtons.push({ text, href, isPrimary });
            }
          }
        }

        console.log(`🔘 Hero CTA 버튼: ${pageInfo.hero.ctaButtons.length}개`);
        pageInfo.hero.ctaButtons.forEach((btn, idx) => {
          console.log(`  ${idx + 1}. ${btn.text} → ${btn.href}`);
        });

        break;
      }
    }

    if (!pageInfo.hero.exists) {
      console.log('⚠️  Hero 섹션을 찾을 수 없습니다.');
    }
  });

  test('콘텐츠 섹션 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 메인 콘텐츠 영역의 섹션들 찾기
    const mainSelectors = ['main section', 'main > div', '.section', '[class*="section"]'];

    for (const selector of mainSelectors) {
      const sections = page.locator(selector);
      const sectionCount = await sections.count();

      if (sectionCount > 0) {
        console.log(`\n📦 발견된 섹션 수: ${sectionCount}개 (${selector})`);

        for (let i = 0; i < Math.min(sectionCount, 10); i++) {
          // 최대 10개까지만
          const section = sections.nth(i);

          if (await section.isVisible()) {
            // 섹션 제목 찾기
            const titleElement = section.locator('h1, h2, h3, h4').first();
            const title = await titleElement.count() > 0
              ? (await titleElement.textContent())?.trim() || `섹션 ${i + 1}`
              : `섹션 ${i + 1}`;

            // 설명 텍스트 찾기
            const descElement = section.locator('p').first();
            const description = await descElement.count() > 0
              ? (await descElement.textContent())?.trim()
              : undefined;

            // 이미지 확인
            const images = section.locator('img');
            const imageCount = await images.count();

            // 버튼 찾기
            const buttons = section.locator('a, button').filter({ hasText: /.+/ });
            const buttonList: Array<{ text: string; href: string }> = [];

            const buttonCount = await buttons.count();
            for (let j = 0; j < Math.min(buttonCount, 5); j++) {
              const button = buttons.nth(j);
              if (await button.isVisible()) {
                const text = (await button.textContent())?.trim() || '';
                const href = (await button.getAttribute('href')) || '';
                if (text && text.length < 50) {
                  buttonList.push({ text, href });
                }
              }
            }

            pageInfo.contentSections.push({
              title,
              description: description?.substring(0, 100), // 첫 100자만
              hasImage: imageCount > 0,
              imageCount,
              hasButton: buttonList.length > 0,
              buttons: buttonList,
            });

            console.log(`\n  📋 ${title}`);
            if (description) console.log(`     설명: ${description.substring(0, 50)}...`);
            console.log(`     이미지: ${imageCount}개`);
            console.log(`     버튼: ${buttonList.length}개`);
          }
        }

        break;
      }
    }

    console.log(`\n✅ 총 ${pageInfo.contentSections.length}개 콘텐츠 섹션 분석 완료`);
  });

  test('주요 기능/특징 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // Feature 카드나 아이콘 섹션 찾기
    const featureSelectors = [
      '[class*="feature"]',
      '[class*="benefit"]',
      '[class*="service"]',
      '.card',
      '[class*="card"]',
    ];

    for (const selector of featureSelectors) {
      const features = page.locator(selector);
      const count = await features.count();

      if (count > 0 && count < 20) {
        // 너무 많으면 다른 요소일 가능성
        console.log(`\n🎯 발견된 기능 카드: ${count}개`);

        for (let i = 0; i < Math.min(count, 6); i++) {
          const feature = features.nth(i);

          if (await feature.isVisible()) {
            const title = await feature.locator('h3, h4, h5, strong, b').first().textContent();
            const description = await feature.locator('p, span').first().textContent();
            const icon = await feature.locator('img, svg, i').first().getAttribute('src');

            if (title) {
              pageInfo.features.push({
                title: title.trim(),
                description: description?.trim().substring(0, 100) || '',
                icon: icon || undefined,
              });

              console.log(`  ${i + 1}. ${title.trim()}`);
              if (description) {
                console.log(`     ${description.trim().substring(0, 50)}...`);
              }
            }
          }
        }

        break;
      }
    }

    if (pageInfo.features.length === 0) {
      console.log('ℹ️  주요 기능 카드를 찾을 수 없습니다.');
    }
  });

  test('통계/수치 정보 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 숫자가 있는 통계 섹션 찾기
    const statsSelectors = [
      '[class*="stat"]',
      '[class*="number"]',
      '[class*="counter"]',
      '[class*="metric"]',
    ];

    for (const selector of statsSelectors) {
      const stats = page.locator(selector);
      const count = await stats.count();

      if (count > 0 && count < 10) {
        console.log(`\n📊 발견된 통계 항목: ${count}개`);

        for (let i = 0; i < count; i++) {
          const stat = stats.nth(i);

          if (await stat.isVisible()) {
            const text = await stat.textContent();
            if (text) {
              const trimmed = text.trim();
              // 숫자가 포함된 통계만
              if (/\d/.test(trimmed)) {
                // 값과 라벨 분리 시도
                const match = trimmed.match(/(.+?)[\s:]+(.+)/);
                if (match) {
                  pageInfo.statistics.push({
                    label: match[2].trim(),
                    value: match[1].trim(),
                  });
                } else {
                  pageInfo.statistics.push({
                    label: '통계',
                    value: trimmed,
                  });
                }
                console.log(`  ${i + 1}. ${trimmed}`);
              }
            }
          }
        }

        break;
      }
    }

    if (pageInfo.statistics.length === 0) {
      console.log('ℹ️  통계 정보를 찾을 수 없습니다.');
    }
  });

  test('고객 후기/리뷰 확인', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 리뷰/후기 섹션 찾기
    const testimonialSelectors = [
      '[class*="testimonial"]',
      '[class*="review"]',
      '[class*="feedback"]',
      '[class*="customer"]',
    ];

    for (const selector of testimonialSelectors) {
      const testimonials = page.locator(selector);
      const count = await testimonials.count();

      if (count > 0) {
        pageInfo.testimonials.exists = true;
        pageInfo.testimonials.count = count;
        console.log(`💬 고객 후기 섹션 발견: ${count}개`);
        break;
      }
    }

    if (!pageInfo.testimonials.exists) {
      console.log('ℹ️  고객 후기를 찾을 수 없습니다.');
    }
  });

  test('모든 CTA 버튼 수집', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 페이지 전체의 주요 버튼 찾기
    const ctaKeywords = [
      'start',
      'get started',
      'sign up',
      'try',
      'request',
      'contact',
      'learn more',
      '시작',
      '문의',
      '요청',
      '신청',
      '가입',
      '더 알아보기',
    ];

    const buttons = page.locator('a, button').filter({ hasText: /.+/ });
    const count = await buttons.count();

    console.log(`\n🔘 전체 버튼/링크 수: ${count}개`);
    console.log('🎯 주요 CTA 버튼:');

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);

      if (await button.isVisible()) {
        const text = (await button.textContent())?.trim().toLowerCase() || '';
        const href = (await button.getAttribute('href')) || '';

        // CTA 키워드가 포함되어 있는지 확인
        const isCTA = ctaKeywords.some((keyword) => text.includes(keyword.toLowerCase()));

        if (isCTA && text.length < 50) {
          // 위치 정보 얻기 (섹션 추정)
          const parentSection = button.locator('xpath=ancestor::section[1]');
          const location =
            (await parentSection.count()) > 0
              ? await parentSection.locator('h1, h2, h3').first().textContent()
              : 'main';

          pageInfo.callToActions.push({
            text: text,
            href,
            location: location?.trim() || 'main',
          });

          console.log(`  • ${text} → ${href}`);
          console.log(`    위치: ${location?.trim() || 'main'}`);
        }
      }
    }

    console.log(`\n✅ 총 ${pageInfo.callToActions.length}개 CTA 버튼 발견`);
  });

  test.afterAll(async () => {
    // 수집한 정보를 JSON 파일로 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'main-page-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(pageInfo, null, 2), 'utf-8');

    console.log('\n✅ 메인 페이지 정보 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log('\n📊 분석 요약:');
    console.log(`  - Hero 섹션: ${pageInfo.hero.exists ? '있음' : '없음'}`);
    console.log(`  - Hero CTA 버튼: ${pageInfo.hero.ctaButtons.length}개`);
    console.log(`  - 콘텐츠 섹션: ${pageInfo.contentSections.length}개`);
    console.log(`  - 주요 기능: ${pageInfo.features.length}개`);
    console.log(`  - 통계 정보: ${pageInfo.statistics.length}개`);
    console.log(`  - 고객 후기: ${pageInfo.testimonials.exists ? `있음 (${pageInfo.testimonials.count}개)` : '없음'}`);
    console.log(`  - CTA 버튼: ${pageInfo.callToActions.length}개`);
  });
});
