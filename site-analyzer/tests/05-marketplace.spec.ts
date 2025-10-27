import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Marketplace 페이지 상세 분석
 * /en/marketplace 페이지의 기능과 UI를 분석합니다.
 */

interface MarketplaceInfo {
  timestamp: string;
  url: string;
  title: string;
  description: string;
  searchForm: {
    polInput: { exists: boolean; placeholder?: string };
    podInput: { exists: boolean; placeholder?: string };
    containerType: { exists: boolean; text?: string };
    searchButton: { exists: boolean; text?: string };
  };
  filters: Array<{
    text: string;
    type: string;
  }>;
  results: {
    displayType: string; // 'table' | 'cards' | 'list'
    count: number;
    hasPagination: boolean;
  };
  shippingCompanies: Array<{
    name: string;
    logo?: string;
  }>;
  features: Array<{
    name: string;
    description: string;
  }>;
}

test.describe('Marketplace 페이지 분석', () => {
  let marketplaceInfo: MarketplaceInfo;

  test.beforeAll(async () => {
    marketplaceInfo = {
      timestamp: new Date().toISOString(),
      url: 'https://www.surff.kr/en/marketplace',
      title: '',
      description: '',
      searchForm: {
        polInput: { exists: false },
        podInput: { exists: false },
        containerType: { exists: false },
        searchButton: { exists: false },
      },
      filters: [],
      results: {
        displayType: 'unknown',
        count: 0,
        hasPagination: false,
      },
      shippingCompanies: [],
      features: [],
    };
  });

  test('페이지 기본 정보 수집', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    marketplaceInfo.title = await page.title();
    console.log('📄 페이지 제목:', marketplaceInfo.title);

    const metaDesc = page.locator('meta[name="description"]').first();
    if ((await metaDesc.count()) > 0) {
      marketplaceInfo.description = (await metaDesc.getAttribute('content')) || '';
      console.log('📝 설명:', marketplaceInfo.description);
    }

    console.log('🔗 URL:', marketplaceInfo.url);
  });

  test('검색 폼 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    console.log('\n🔍 검색 폼 분석:\n');

    // POL (Port of Loading) 입력
    const polInput = page.locator('input').filter({ hasText: /POL/ }).or(
      page.locator('input[placeholder*="POL"]')
    ).first();

    if ((await polInput.count()) > 0) {
      marketplaceInfo.searchForm.polInput.exists = true;
      marketplaceInfo.searchForm.polInput.placeholder =
        (await polInput.getAttribute('placeholder')) || undefined;
      console.log('✅ POL 입력:', marketplaceInfo.searchForm.polInput.placeholder);
    }

    // POD (Port of Discharge) 입력
    const podInput = page.locator('input').filter({ hasText: /POD/ }).or(
      page.locator('input[placeholder*="POD"]')
    ).first();

    if ((await podInput.count()) > 0) {
      marketplaceInfo.searchForm.podInput.exists = true;
      marketplaceInfo.searchForm.podInput.placeholder =
        (await podInput.getAttribute('placeholder')) || undefined;
      console.log('✅ POD 입력:', marketplaceInfo.searchForm.podInput.placeholder);
    }

    // 컨테이너 타입 선택
    const containerBtn = page
      .locator('button')
      .filter({ hasText: /container type/i })
      .first();

    if ((await containerBtn.count()) > 0) {
      marketplaceInfo.searchForm.containerType.exists = true;
      marketplaceInfo.searchForm.containerType.text =
        (await containerBtn.textContent())?.trim() || undefined;
      console.log('✅ 컨테이너 타입:', marketplaceInfo.searchForm.containerType.text);
    }

    // Search 버튼
    const searchBtn = page.locator('button').filter({ hasText: /^Search$/i }).first();

    if ((await searchBtn.count()) > 0) {
      marketplaceInfo.searchForm.searchButton.exists = true;
      marketplaceInfo.searchForm.searchButton.text =
        (await searchBtn.textContent())?.trim() || undefined;
      console.log('✅ 검색 버튼:', marketplaceInfo.searchForm.searchButton.text);
    }

    console.log('\n📊 검색 폼 완성도:', Object.values(marketplaceInfo.searchForm).filter(f => f.exists).length, '/ 4');
  });

  test('지역 필터 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    console.log('\n🌍 지역 필터:\n');

    // 지역 필터 버튼들
    const regionButtons = page.locator('button').filter({
      hasText: /America|Asia|Europe|Africa/,
    });

    const regionCount = await regionButtons.count();

    for (let i = 0; i < regionCount; i++) {
      const button = regionButtons.nth(i);
      if (await button.isVisible()) {
        const text = (await button.textContent())?.trim() || '';
        marketplaceInfo.filters.push({
          text,
          type: 'region',
        });
        console.log(`  ${i + 1}. ${text}`);
      }
    }

    console.log(`\n✅ 총 ${marketplaceInfo.filters.length}개 지역 필터`);
  });

  test('운임 결과 표시 방식 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    console.log('\n📊 운임 결과 표시:\n');

    // More View 버튼들 (각 운임 항목을 나타냄)
    const moreViewButtons = page.locator('button').filter({ hasText: 'More View' });
    const resultCount = await moreViewButtons.count();

    if (resultCount > 0) {
      marketplaceInfo.results.displayType = 'cards';
      marketplaceInfo.results.count = resultCount;
      console.log(`✅ 카드 형태 표시`);
      console.log(`📦 운임 항목: ${resultCount}개`);
    }

    // 페이지네이션 확인
    const paginationSelectors = [
      'button:has-text("Next")',
      'button:has-text("Previous")',
      '[class*="pagination"]',
      'button[aria-label*="page"]',
    ];

    for (const selector of paginationSelectors) {
      const pagination = page.locator(selector).first();
      if ((await pagination.count()) > 0) {
        marketplaceInfo.results.hasPagination = true;
        console.log('✅ 페이지네이션 있음');
        break;
      }
    }

    if (!marketplaceInfo.results.hasPagination) {
      console.log('ℹ️  페이지네이션 없음 (또는 찾을 수 없음)');
    }
  });

  test('선사/포워더 로고 수집', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    console.log('\n🚢 선사/포워더 정보:\n');

    // 메인 섹션에서 이미지 찾기
    const mainSection = page.locator('section').nth(1);
    const images = mainSection.locator('img');
    const imageCount = await images.count();

    console.log(`📷 총 이미지: ${imageCount}개`);

    // Alt 텍스트로 선사 판별
    const companies = new Set<string>();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');

      if (alt && alt.includes('로고')) {
        const companyName = alt.replace('선사 로고', '').replace('로고', '').trim();
        if (companyName && !companies.has(companyName)) {
          companies.add(companyName);
          marketplaceInfo.shippingCompanies.push({
            name: companyName,
            logo: src || undefined,
          });
        }
      }
    }

    if (marketplaceInfo.shippingCompanies.length > 0) {
      console.log(`\n✅ 선사/포워더: ${marketplaceInfo.shippingCompanies.length}개`);
      marketplaceInfo.shippingCompanies.slice(0, 5).forEach((company, idx) => {
        console.log(`  ${idx + 1}. ${company.name}`);
      });
    } else {
      console.log('ℹ️  선사 로고를 명확히 식별할 수 없음 (일반 이미지들)');
    }
  });

  test('주요 기능 요약', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    console.log('\n🎯 주요 기능:\n');

    // 기능 1: 운임 검색
    marketplaceInfo.features.push({
      name: 'Freight Rate Search',
      description: '출발지(POL)와 도착지(POD)를 입력하여 운임 검색',
    });
    console.log('  1. 운임 검색 (POL/POD 기반)');

    // 기능 2: 컨테이너 타입 선택
    if (marketplaceInfo.searchForm.containerType.exists) {
      marketplaceInfo.features.push({
        name: 'Container Type Selection',
        description: '다양한 컨테이너 타입 선택 가능',
      });
      console.log('  2. 컨테이너 타입 선택');
    }

    // 기능 3: 지역별 필터
    if (marketplaceInfo.filters.length > 0) {
      marketplaceInfo.features.push({
        name: 'Regional Filters',
        description: `${marketplaceInfo.filters.length}개 지역별 필터링`,
      });
      console.log(`  3. 지역별 필터 (${marketplaceInfo.filters.length}개)`);
    }

    // 기능 4: 실시간 운임 비교
    if (marketplaceInfo.results.count > 0) {
      marketplaceInfo.features.push({
        name: 'Real-time Rate Comparison',
        description: `${marketplaceInfo.results.count}개 운임 정보 비교`,
      });
      console.log(`  4. 실시간 운임 비교 (${marketplaceInfo.results.count}개 항목)`);
    }

    // 기능 5: 상세 정보 확인
    marketplaceInfo.features.push({
      name: 'Detailed Information',
      description: 'More View 버튼으로 상세 정보 확인',
    });
    console.log('  5. 상세 정보 확인 (More View)');

    console.log(`\n✅ 총 ${marketplaceInfo.features.length}개 주요 기능`);
  });

  test.afterAll(async () => {
    // 수집한 정보를 JSON 파일로 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'marketplace-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(marketplaceInfo, null, 2), 'utf-8');

    console.log('\n✅ Marketplace 정보 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log('\n📊 분석 요약:');
    console.log(`  - 제목: ${marketplaceInfo.title}`);
    console.log(`  - 검색 폼: ${Object.values(marketplaceInfo.searchForm).filter(f => f.exists).length}/4 완성`);
    console.log(`  - 지역 필터: ${marketplaceInfo.filters.length}개`);
    console.log(`  - 운임 항목: ${marketplaceInfo.results.count}개`);
    console.log(`  - 선사/포워더: ${marketplaceInfo.shippingCompanies.length}개`);
    console.log(`  - 주요 기능: ${marketplaceInfo.features.length}개`);
  });
});
