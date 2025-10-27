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

  test('Hero/메인 섹션 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 실제 DOM 구조 기반: section:nth-of-type(2)가 메인 콘텐츠
    const hero = page.locator('section').nth(1); // 0-based, so 1 = 두 번째

    if (await hero.count() > 0) {
      pageInfo.hero.exists = true;
      console.log('✅ 메인 섹션 발견');

      // 제목 찾기 (h3 태그 사용)
      const h3Elements = hero.locator('h3');
      const h3Count = await h3Elements.count();

      if (h3Count > 0) {
        pageInfo.hero.title = (await h3Elements.first().textContent())?.trim();
        console.log('📝 메인 제목:', pageInfo.hero.title);

        if (h3Count > 1) {
          pageInfo.hero.subtitle = (await h3Elements.nth(1).textContent())?.trim();
          console.log('📝 부제목:', pageInfo.hero.subtitle);
        }
      }

      // 배경 이미지 확인
      const bgImage = hero.locator('img').first();
      if (await bgImage.count() > 0) {
        pageInfo.hero.backgroundImage = await bgImage.getAttribute('src') || undefined;
        console.log('🖼️  배경 이미지:', pageInfo.hero.backgroundImage);
      }

      // CTA 버튼 찾기 (Search, 지역별 버튼 등)
      const buttons = hero.locator('button');
      const buttonCount = await buttons.count();

      console.log(`🔘 발견된 버튼: ${buttonCount}개`);

      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        if (await button.isVisible()) {
          const text = (await button.textContent())?.trim() || '';
          const className = (await button.getAttribute('class')) || '';

          // 유의미한 버튼만 수집 (Close, × 등 제외)
          if (text && text.length < 50 && text !== '×' && text !== 'Close') {
            const isPrimary = className.includes('marketplace_main_search');
            pageInfo.hero.ctaButtons.push({
              text,
              href: '', // 버튼이므로 href 없음
              isPrimary,
            });
          }
        }
      }

      console.log(`🎯 주요 CTA 버튼: ${pageInfo.hero.ctaButtons.length}개`);
      pageInfo.hero.ctaButtons.forEach((btn, idx) => {
        console.log(`  ${idx + 1}. ${btn.text}${btn.isPrimary ? ' (Primary)' : ''}`);
      });
    } else {
      console.log('⚠️  메인 섹션을 찾을 수 없습니다.');
    }
  });

  test('콘텐츠 섹션 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 실제 구조: section이 2개만 존재
    const sections = page.locator('section');
    const sectionCount = await sections.count();

    console.log(`\n📦 전체 섹션 수: ${sectionCount}개`);

    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);

      if (await section.isVisible()) {
        // 섹션 제목 찾기
        const titleElement = section.locator('h2, h3, h4').first();
        const title =
          (await titleElement.count()) > 0
            ? (await titleElement.textContent())?.trim() || `섹션 ${i + 1}`
            : `섹션 ${i + 1}`;

        // 설명 텍스트 찾기
        const h6Element = section.locator('h6').first();
        const description =
          (await h6Element.count()) > 0 ? (await h6Element.textContent())?.trim() : undefined;

        // 이미지 확인
        const images = section.locator('img');
        const imageCount = await images.count();

        // 버튼 찾기
        const buttons = section.locator('button');
        const buttonList: Array<{ text: string; href: string }> = [];

        const buttonCount = await buttons.count();
        for (let j = 0; j < buttonCount; j++) {
          const button = buttons.nth(j);
          if (await button.isVisible()) {
            const text = (await button.textContent())?.trim() || '';
            // 유의미한 버튼만
            if (text && text.length < 50 && text !== '×' && text !== 'Close') {
              buttonList.push({ text, href: '' });
            }
          }
        }

        pageInfo.contentSections.push({
          title,
          description: description?.substring(0, 100),
          hasImage: imageCount > 0,
          imageCount,
          hasButton: buttonList.length > 0,
          buttons: buttonList,
        });

        console.log(`\n  📋 섹션 ${i + 1}: ${title}`);
        if (description) console.log(`     설명: ${description.substring(0, 50)}...`);
        console.log(`     이미지: ${imageCount}개`);
        console.log(`     버튼: ${buttonList.length}개`);
        if (buttonList.length > 0) {
          buttonList.slice(0, 3).forEach((btn) => {
            console.log(`       - ${btn.text}`);
          });
        }
      }
    }

    console.log(`\n✅ 총 ${pageInfo.contentSections.length}개 콘텐츠 섹션 분석 완료`);
  });

  test('주요 기능/특징 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 지역별 필터 버튼들을 주요 기능으로 분석
    const regionButtons = page.locator('button').filter({
      hasText: /America|Asia|Europe|Africa/,
    });
    const regionCount = await regionButtons.count();

    console.log(`\n🌍 지역별 필터 기능: ${regionCount}개`);

    for (let i = 0; i < regionCount; i++) {
      const button = regionButtons.nth(i);
      const text = (await button.textContent())?.trim();

      if (text) {
        pageInfo.features.push({
          title: text,
          description: '지역별 운임 정보 필터링',
          icon: undefined,
        });

        console.log(`  ${i + 1}. ${text}`);
      }
    }

    // Search 기능
    const searchButton = page.locator('button').filter({ hasText: 'Search' }).first();
    if ((await searchButton.count()) > 0) {
      pageInfo.features.push({
        title: 'Search',
        description: '운임 검색 기능',
        icon: undefined,
      });
      console.log(`  ${regionCount + 1}. Search (운임 검색)`);
    }

    // More View 버튼 (상세 정보 확인 기능)
    const moreViewButtons = page.locator('button').filter({ hasText: 'More View' });
    const moreViewCount = await moreViewButtons.count();

    if (moreViewCount > 0) {
      pageInfo.features.push({
        title: 'More View',
        description: `상세 정보 확인 (${moreViewCount}개 항목)`,
        icon: undefined,
      });
      console.log(`  ${regionCount + 2}. More View (${moreViewCount}개 항목)`);
    }

    console.log(`\n✅ 총 ${pageInfo.features.length}개 주요 기능 발견`);
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

    console.log('\n🎯 주요 CTA 버튼 수집:\n');

    // 1. Search 버튼 (Primary CTA)
    const searchButton = page.locator('button').filter({ hasText: 'Search' }).first();
    if ((await searchButton.count()) > 0 && (await searchButton.isVisible())) {
      pageInfo.callToActions.push({
        text: 'Search',
        href: '',
        location: 'MARKET PLACE (Hero)',
      });
      console.log('  ✅ Search (Primary)');
    }

    // 2. 지역별 필터 버튼들
    const regionButtons = page.locator('button').filter({
      hasText: /America|Asia|Europe|Africa/,
    });
    const regionCount = await regionButtons.count();

    for (let i = 0; i < regionCount; i++) {
      const button = regionButtons.nth(i);
      if (await button.isVisible()) {
        const text = (await button.textContent())?.trim() || '';
        pageInfo.callToActions.push({
          text,
          href: '',
          location: 'MARKET PLACE (Filters)',
        });
        console.log(`  ✅ ${text} (Filter)`);
      }
    }

    // 3. More View 버튼들
    const moreViewButtons = page.locator('button').filter({ hasText: 'More View' });
    const moreViewCount = await moreViewButtons.count();

    if (moreViewCount > 0) {
      // 대표로 하나만 추가
      pageInfo.callToActions.push({
        text: `More View (${moreViewCount}개)`,
        href: '',
        location: 'MARKET PLACE (Details)',
      });
      console.log(`  ✅ More View (${moreViewCount}개 항목)`);
    }

    // 4. 컨테이너 타입 선택 버튼
    const containerButton = page
      .locator('button')
      .filter({ hasText: 'Please select container type' })
      .first();
    if ((await containerButton.count()) > 0 && (await containerButton.isVisible())) {
      pageInfo.callToActions.push({
        text: 'Select Container Type',
        href: '',
        location: 'MARKET PLACE (Search Form)',
      });
      console.log('  ✅ Select Container Type (Form)');
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
