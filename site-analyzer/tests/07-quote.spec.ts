import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Quote 페이지 상세 분석
 * /en/quote?pageNo=1 - 맞춤 견적 의뢰 페이지
 */

interface QuoteInfo {
  timestamp: string;
  url: string;
  title: string;
  description: string;
  mainHeading: string;
  subHeading: string;
  requestButton: {
    exists: boolean;
    text?: string;
  };
  quoteHistory: {
    count: number;
    items: Array<{
      pol: string;
      pod: string;
      status?: string;
    }>;
  };
  filters: Array<{
    text: string;
    type: string;
  }>;
  pagination: {
    exists: boolean;
    currentPage: number;
  };
  features: Array<{
    name: string;
    description: string;
  }>;
}

test.describe('Quote 페이지 분석', () => {
  let quoteInfo: QuoteInfo;

  test.beforeAll(async () => {
    quoteInfo = {
      timestamp: new Date().toISOString(),
      url: 'https://www.surff.kr/en/quote?pageNo=1',
      title: '',
      description: '',
      mainHeading: '',
      subHeading: '',
      requestButton: {
        exists: false,
      },
      quoteHistory: {
        count: 0,
        items: [],
      },
      filters: [],
      pagination: {
        exists: false,
        currentPage: 1,
      },
      features: [],
    };
  });

  test('페이지 기본 정보 수집', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    quoteInfo.title = await page.title();
    console.log('📄 페이지 제목:', quoteInfo.title);

    const metaDesc = page.locator('meta[name="description"]').first();
    if ((await metaDesc.count()) > 0) {
      quoteInfo.description = (await metaDesc.getAttribute('content')) || '';
      console.log('📝 설명:', quoteInfo.description);
    }

    // 메인 제목 (h2)
    const h2 = page.locator('h2').filter({ hasText: /Quote Request/ }).first();
    if ((await h2.count()) > 0) {
      quoteInfo.mainHeading = (await h2.textContent())?.trim() || '';
      console.log('📌 메인 제목:', quoteInfo.mainHeading);
    }

    // 서브 제목 (h3)
    const h3 = page.locator('h3').first();
    if ((await h3.count()) > 0) {
      quoteInfo.subHeading = (await h3.textContent())?.trim() || '';
      console.log('📌 서브 제목:', quoteInfo.subHeading);
    }
  });

  test('Request Quote 버튼 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    console.log('\n🔘 Request Quote 버튼:\n');

    const requestBtn = page.locator('button').filter({ hasText: /Request Quote/i }).first();

    if ((await requestBtn.count()) > 0) {
      quoteInfo.requestButton.exists = true;
      quoteInfo.requestButton.text = (await requestBtn.textContent())?.trim() || undefined;
      console.log(`✅ 발견: ${quoteInfo.requestButton.text}`);

      // 버튼이 보이는지 확인
      if (await requestBtn.isVisible()) {
        console.log('   상태: 보임 (클릭 가능)');
      }
    } else {
      console.log('❌ Request Quote 버튼을 찾을 수 없음');
    }
  });

  test('견적 요청 이력 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    console.log('\n📋 견적 요청 이력:\n');

    // h6 태그에 항구 코드가 있음 (KRPUS, SIKOP 등)
    const portCodes = page.locator('h6');
    const portCount = await portCodes.count();

    console.log(`🚢 발견된 항구 코드: ${portCount}개`);

    const codes: string[] = [];
    for (let i = 0; i < Math.min(portCount, 20); i++) {
      const code = (await portCodes.nth(i).textContent())?.trim();
      if (code && code.length >= 5 && code.length <= 6) {
        // 항구 코드는 보통 5-6자
        codes.push(code);
        console.log(`  ${i + 1}. ${code}`);
      }
    }

    // 항구 코드를 쌍으로 묶기 (POL → POD)
    for (let i = 0; i < codes.length; i += 2) {
      if (i + 1 < codes.length) {
        quoteInfo.quoteHistory.items.push({
          pol: codes[i],
          pod: codes[i + 1],
        });
      }
    }

    quoteInfo.quoteHistory.count = quoteInfo.quoteHistory.items.length;

    console.log(`\n✅ 견적 이력 항목: ${quoteInfo.quoteHistory.count}개`);
    console.log('   (POL → POD 쌍)');
    quoteInfo.quoteHistory.items.slice(0, 3).forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.pol} → ${item.pod}`);
    });
  });

  test('지역 필터 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    console.log('\n🌍 지역 필터:\n');

    // Quote 페이지의 지역 필터
    const regionButtons = page.locator('button').filter({
      hasText: /Americas|Europe|Asia|Africa/,
    });

    const regionCount = await regionButtons.count();

    for (let i = 0; i < regionCount; i++) {
      const button = regionButtons.nth(i);
      if (await button.isVisible()) {
        const text = (await button.textContent())?.trim() || '';
        quoteInfo.filters.push({
          text,
          type: 'region',
        });
        console.log(`  ${i + 1}. ${text}`);
      }
    }

    console.log(`\n✅ 총 ${quoteInfo.filters.length}개 지역 필터`);
  });

  test('페이지네이션 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    console.log('\n📄 페이지네이션:\n');

    // URL에서 현재 페이지 확인
    const url = page.url();
    const pageNoMatch = url.match(/pageNo=(\d+)/);
    if (pageNoMatch) {
      quoteInfo.pagination.currentPage = parseInt(pageNoMatch[1], 10);
      console.log(`현재 페이지: ${quoteInfo.pagination.currentPage}`);
    }

    // 페이지네이션 링크 찾기
    const pageLinks = page.locator('a[href*="pageNo="]');
    const linkCount = await pageLinks.count();

    if (linkCount > 0) {
      quoteInfo.pagination.exists = true;
      console.log(`✅ 페이지네이션 링크: ${linkCount}개`);

      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = pageLinks.nth(i);
        const href = await link.getAttribute('href');
        const text = (await link.textContent())?.trim();
        if (href) {
          console.log(`  ${i + 1}. ${text || 'Link'} → ${href}`);
        }
      }
    } else {
      console.log('ℹ️  페이지네이션 링크를 찾을 수 없음 (단일 페이지일 가능성)');
    }
  });

  test('주요 기능 요약', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    console.log('\n🎯 주요 기능:\n');

    // 기능 1: 맞춤 견적 요청
    if (quoteInfo.requestButton.exists) {
      quoteInfo.features.push({
        name: 'Request Custom Quote',
        description: 'Request Quote 버튼으로 맞춤 견적 의뢰',
      });
      console.log('  1. 맞춤 견적 요청 (Request Quote)');
    }

    // 기능 2: 견적 이력 확인
    if (quoteInfo.quoteHistory.count > 0) {
      quoteInfo.features.push({
        name: 'Quote History',
        description: `${quoteInfo.quoteHistory.count}개 견적 요청 이력 확인`,
      });
      console.log(`  2. 견적 이력 확인 (${quoteInfo.quoteHistory.count}개 항목)`);
    }

    // 기능 3: 지역별 필터
    if (quoteInfo.filters.length > 0) {
      quoteInfo.features.push({
        name: 'Regional Filters',
        description: `${quoteInfo.filters.length}개 지역별 필터링`,
      });
      console.log(`  3. 지역별 필터 (${quoteInfo.filters.length}개)`);
    }

    // 기능 4: 페이지네이션
    if (quoteInfo.pagination.exists) {
      quoteInfo.features.push({
        name: 'Pagination',
        description: '페이지별 견적 이력 탐색',
      });
      console.log('  4. 페이지네이션 (다중 페이지 지원)');
    }

    // 기능 5: 항구 코드 기반 이력
    quoteInfo.features.push({
      name: 'Port-based History',
      description: 'POL/POD 항구 코드로 이력 표시',
    });
    console.log('  5. 항구 코드 기반 이력 (POL → POD)');

    console.log(`\n✅ 총 ${quoteInfo.features.length}개 주요 기능`);
  });

  test.afterAll(async () => {
    // 수집한 정보를 JSON 파일로 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'quote-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(quoteInfo, null, 2), 'utf-8');

    console.log('\n✅ Quote 정보 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log('\n📊 분석 요약:');
    console.log(`  - 제목: ${quoteInfo.title}`);
    console.log(`  - Request 버튼: ${quoteInfo.requestButton.exists ? '있음' : '없음'}`);
    console.log(`  - 견적 이력: ${quoteInfo.quoteHistory.count}개`);
    console.log(`  - 지역 필터: ${quoteInfo.filters.length}개`);
    console.log(`  - 페이지네이션: ${quoteInfo.pagination.exists ? '있음' : '없음'}`);
    console.log(`  - 주요 기능: ${quoteInfo.features.length}개`);
  });
});
