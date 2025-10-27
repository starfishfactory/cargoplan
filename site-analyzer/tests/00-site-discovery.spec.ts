import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 사이트 초기 탐색 테스트
 * www.surff.kr 사이트의 기본 정보를 수집하고 분석합니다.
 */

interface SiteInfo {
  url: string;
  timestamp: string;
  title: string;
  meta: {
    description?: string;
    keywords?: string;
    charset?: string;
    viewport?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  links: {
    internal: string[];
    external: string[];
  };
  images: {
    src: string;
    alt: string;
  }[];
  scripts: string[];
  stylesheets: string[];
}

test.describe('사이트 초기 탐색', () => {
  let siteInfo: SiteInfo;

  test.beforeAll(async () => {
    siteInfo = {
      url: 'https://www.surff.kr/',
      timestamp: new Date().toISOString(),
      title: '',
      meta: {},
      links: {
        internal: [],
        external: [],
      },
      images: [],
      scripts: [],
      stylesheets: [],
    };
  });

  test('메인 페이지 접속 및 기본 정보 수집', async ({ page }) => {
    // 페이지 접속
    await page.goto('https://www.surff.kr/');

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');

    // 타이틀 수집
    siteInfo.title = await page.title();
    console.log(`📄 페이지 타이틀: ${siteInfo.title}`);
    expect(siteInfo.title).toBeTruthy();

    // 메타 태그 수집
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    const keywords = await page.locator('meta[name="keywords"]').getAttribute('content');
    const charset = await page.locator('meta[charset]').getAttribute('charset');
    const viewport = await page.locator('meta[name="viewport"]').first().getAttribute('content');

    // Open Graph 태그
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

    siteInfo.meta = {
      description: description || undefined,
      keywords: keywords || undefined,
      charset: charset || undefined,
      viewport: viewport || undefined,
      ogTitle: ogTitle || undefined,
      ogDescription: ogDescription || undefined,
      ogImage: ogImage || undefined,
    };

    console.log('📝 메타 정보:', siteInfo.meta);
  });

  test('모든 링크 수집 및 분류', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 모든 링크 요소 찾기
    const links = await page.locator('a[href]').all();

    const baseUrl = 'https://www.surff.kr';
    const allLinks = new Set<string>();
    const internalLinks = new Set<string>();
    const externalLinks = new Set<string>();

    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('javascript:')) continue;

      let fullUrl: string;
      try {
        // 상대 경로를 절대 경로로 변환
        fullUrl = new URL(href, baseUrl).href;
      } catch {
        continue;
      }

      allLinks.add(fullUrl);

      // 내부/외부 링크 분류
      if (fullUrl.startsWith(baseUrl)) {
        internalLinks.add(fullUrl);
      } else {
        externalLinks.add(fullUrl);
      }
    }

    siteInfo.links.internal = Array.from(internalLinks).sort();
    siteInfo.links.external = Array.from(externalLinks).sort();

    console.log(`🔗 총 링크 수: ${allLinks.size}`);
    console.log(`🏠 내부 링크: ${internalLinks.size}개`);
    console.log(`🌐 외부 링크: ${externalLinks.size}개`);

    // 내부 링크 목록 출력
    console.log('\n📍 내부 페이지 목록:');
    siteInfo.links.internal.forEach((link, index) => {
      console.log(`  ${index + 1}. ${link}`);
    });
  });

  test('이미지 정보 수집', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();

    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');

      if (src) {
        siteInfo.images.push({
          src: src,
          alt: alt || '',
        });
      }
    }

    console.log(`🖼️  총 이미지 수: ${siteInfo.images.length}개`);

    // alt 텍스트 없는 이미지 확인
    const imagesWithoutAlt = siteInfo.images.filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      console.log(`⚠️  alt 텍스트 없는 이미지: ${imagesWithoutAlt.length}개`);
    }
  });

  test('스크립트 및 스타일시트 수집', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 스크립트 태그
    const scripts = await page.locator('script[src]').all();
    for (const script of scripts) {
      const src = await script.getAttribute('src');
      if (src) {
        siteInfo.scripts.push(src);
      }
    }

    // 스타일시트
    const stylesheets = await page.locator('link[rel="stylesheet"]').all();
    for (const stylesheet of stylesheets) {
      const href = await stylesheet.getAttribute('href');
      if (href) {
        siteInfo.stylesheets.push(href);
      }
    }

    console.log(`📜 스크립트 파일: ${siteInfo.scripts.length}개`);
    console.log(`🎨 스타일시트 파일: ${siteInfo.stylesheets.length}개`);
  });

  test('메인 페이지 스크린샷 캡처', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 스크린샷 디렉토리 생성
    const screenshotDir = path.join(process.cwd(), 'docs', 'site-analysis', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // 전체 페이지 스크린샷 (데스크톱)
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-home-full.png'),
      fullPage: true,
    });

    // 뷰포트 스크린샷 (Above the fold)
    await page.screenshot({
      path: path.join(screenshotDir, 'desktop-home-viewport.png'),
      fullPage: false,
    });

    console.log('📸 스크린샷 저장 완료');
  });

  test('모바일 뷰 스크린샷 캡처', async ({ page, context }) => {
    // 모바일 뷰포트 설정
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    const screenshotDir = path.join(process.cwd(), 'docs', 'site-analysis', 'screenshots');

    // 모바일 전체 페이지 스크린샷
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-home-full.png'),
      fullPage: true,
    });

    // 모바일 뷰포트 스크린샷
    await page.screenshot({
      path: path.join(screenshotDir, 'mobile-home-viewport.png'),
      fullPage: false,
    });

    console.log('📱 모바일 스크린샷 저장 완료');
  });

  test.afterAll(async () => {
    // 수집한 정보를 JSON 파일로 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'site-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(siteInfo, null, 2), 'utf-8');

    console.log('\n✅ 사이트 정보 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log('\n📊 수집 요약:');
    console.log(`  - 타이틀: ${siteInfo.title}`);
    console.log(`  - 내부 링크: ${siteInfo.links.internal.length}개`);
    console.log(`  - 외부 링크: ${siteInfo.links.external.length}개`);
    console.log(`  - 이미지: ${siteInfo.images.length}개`);
    console.log(`  - 스크립트: ${siteInfo.scripts.length}개`);
    console.log(`  - 스타일시트: ${siteInfo.stylesheets.length}개`);
  });
});
