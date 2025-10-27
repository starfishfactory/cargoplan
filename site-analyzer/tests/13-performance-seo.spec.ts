import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 성능 및 SEO 분석 테스트
 */

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  timeToInteractive?: number;
  resources: {
    total: number;
    scripts: number;
    stylesheets: number;
    images: number;
    fonts: number;
    other: number;
  };
  totalSize: number;
  requests: number;
}

interface SEOAnalysis {
  title: string;
  titleLength: number;
  description?: string;
  descriptionLength: number;
  keywords?: string;
  canonical?: string;
  hasRobotsMeta: boolean;
  hasViewportMeta: boolean;
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  };
  twitter: {
    card?: string;
    title?: string;
    description?: string;
  };
  structuredData: any[];
  headings: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
  };
  images: {
    total: number;
    withAlt: number;
    optimized: number;
  };
  links: {
    internal: number;
    external: number;
    broken?: number;
  };
}

interface AnalysisResult {
  analyzedAt: string;
  url: string;
  performance: PerformanceMetrics;
  seo: SEOAnalysis;
}

test.describe('성능 및 SEO 분석', () => {
  const result: AnalysisResult = {
    analyzedAt: new Date().toISOString(),
    url: 'https://www.surff.kr/en/marketplace',
    performance: {
      loadTime: 0,
      domContentLoaded: 0,
      resources: {
        total: 0,
        scripts: 0,
        stylesheets: 0,
        images: 0,
        fonts: 0,
        other: 0,
      },
      totalSize: 0,
      requests: 0,
    },
    seo: {
      title: '',
      titleLength: 0,
      descriptionLength: 0,
      hasRobotsMeta: false,
      hasViewportMeta: false,
      openGraph: {},
      twitter: {},
      structuredData: [],
      headings: {
        h1Count: 0,
        h2Count: 0,
        h3Count: 0,
      },
      images: {
        total: 0,
        withAlt: 0,
        optimized: 0,
      },
      links: {
        internal: 0,
        external: 0,
      },
    },
  };

  test.describe('성능 분석', () => {
    test('페이지 로딩 시간 측정', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      const endTime = Date.now();
      result.performance.loadTime = endTime - startTime;

      console.log(`⏱️  총 로딩 시간: ${result.performance.loadTime}ms`);

      // Performance API 사용
      const performanceData = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
        };
      });

      result.performance.domContentLoaded = performanceData.domContentLoaded;

      console.log(`📄 DOM Content Loaded: ${result.performance.domContentLoaded.toFixed(2)}ms`);
      console.log(`✅ Load Complete: ${performanceData.loadComplete.toFixed(2)}ms`);
    });

    test('리소스 분석', async ({ page }) => {
      const resources: any[] = [];

      page.on('response', response => {
        const url = response.url();
        const type = response.request().resourceType();
        resources.push({ url, type });
      });

      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      // 리소스 타입별 분류
      result.performance.resources.total = resources.length;
      result.performance.requests = resources.length;

      resources.forEach(res => {
        switch (res.type) {
          case 'script':
            result.performance.resources.scripts++;
            break;
          case 'stylesheet':
            result.performance.resources.stylesheets++;
            break;
          case 'image':
            result.performance.resources.images++;
            break;
          case 'font':
            result.performance.resources.fonts++;
            break;
          default:
            result.performance.resources.other++;
        }
      });

      console.log(`\n📦 리소스 분석:`);
      console.log(`  총 요청: ${result.performance.requests}개`);
      console.log(`  스크립트: ${result.performance.resources.scripts}개`);
      console.log(`  스타일시트: ${result.performance.resources.stylesheets}개`);
      console.log(`  이미지: ${result.performance.resources.images}개`);
      console.log(`  폰트: ${result.performance.resources.fonts}개`);
      console.log(`  기타: ${result.performance.resources.other}개`);
    });

    test('전체 페이지 크기 추정', async ({ page }) => {
      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      const resources = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        let totalSize = 0;
        entries.forEach(entry => {
          if ('transferSize' in entry) {
            totalSize += entry.transferSize || 0;
          }
        });
        return { totalSize, count: entries.length };
      });

      result.performance.totalSize = resources.totalSize;

      const sizeMB = (resources.totalSize / 1024 / 1024).toFixed(2);
      console.log(`\n💾 전송 크기: ${sizeMB} MB`);

      if (resources.totalSize > 3 * 1024 * 1024) {
        console.log('⚠️  페이지 크기가 3MB를 초과합니다. 최적화 권장');
      } else {
        console.log('✅ 페이지 크기 양호');
      }
    });
  });

  test.describe('SEO 분석', () => {
    test('메타 태그 분석', async ({ page }) => {
      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      // Title
      result.seo.title = await page.title();
      result.seo.titleLength = result.seo.title.length;

      console.log(`\n📄 Title: ${result.seo.title}`);
      console.log(`   길이: ${result.seo.titleLength}자`);

      if (result.seo.titleLength < 30 || result.seo.titleLength > 60) {
        console.log(`   ⚠️  권장 길이 30-60자 (현재: ${result.seo.titleLength}자)`);
      } else {
        console.log('   ✅ 길이 적정');
      }

      // Description
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      if (description) {
        result.seo.description = description;
        result.seo.descriptionLength = description.length;

        console.log(`\n📝 Description: ${description.substring(0, 100)}...`);
        console.log(`   길이: ${result.seo.descriptionLength}자`);

        if (result.seo.descriptionLength < 120 || result.seo.descriptionLength > 160) {
          console.log(`   ⚠️  권장 길이 120-160자 (현재: ${result.seo.descriptionLength}자)`);
        } else {
          console.log('   ✅ 길이 적정');
        }
      } else {
        console.log('\n⚠️  Description 메타 태그 없음');
      }

      // Keywords
      const keywords = await page.locator('meta[name="keywords"]').getAttribute('content');
      if (keywords) {
        result.seo.keywords = keywords;
        console.log(`\n🔑 Keywords: ${keywords.substring(0, 100)}...`);
      }

      // Robots
      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      result.seo.hasRobotsMeta = robots !== null;
      console.log(`\n🤖 Robots: ${robots || 'none (기본값 사용)'}`);

      // Viewport
      const viewport = await page.locator('meta[name="viewport"]').count();
      result.seo.hasViewportMeta = viewport > 0;
      console.log(`📱 Viewport: ${result.seo.hasViewportMeta ? '✅ 있음' : '⚠️ 없음'}`);

      // Canonical
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      if (canonical) {
        result.seo.canonical = canonical;
        console.log(`🔗 Canonical: ${canonical}`);
      }
    });

    test('Open Graph 태그 분석', async ({ page }) => {
      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      console.log('\n📱 Open Graph:');

      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      if (ogTitle) {
        result.seo.openGraph.title = ogTitle;
        console.log(`  title: ${ogTitle}`);
      }

      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      if (ogDescription) {
        result.seo.openGraph.description = ogDescription;
        console.log(`  description: ${ogDescription.substring(0, 80)}...`);
      }

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
      if (ogImage) {
        result.seo.openGraph.image = ogImage;
        console.log(`  image: ${ogImage}`);
      }

      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
      if (ogUrl) {
        result.seo.openGraph.url = ogUrl;
        console.log(`  url: ${ogUrl}`);
      }

      const hasOG = ogTitle || ogDescription || ogImage || ogUrl;
      console.log(`  ${hasOG ? '✅' : '⚠️'} Open Graph: ${hasOG ? '설정됨' : '미설정'}`);
    });

    test('Twitter Card 태그 분석', async ({ page }) => {
      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      console.log('\n🐦 Twitter Card:');

      const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
      if (twitterCard) {
        result.seo.twitter.card = twitterCard;
        console.log(`  card: ${twitterCard}`);
      }

      const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
      if (twitterTitle) {
        result.seo.twitter.title = twitterTitle;
        console.log(`  title: ${twitterTitle}`);
      }

      const hasTwitter = twitterCard || twitterTitle;
      console.log(`  ${hasTwitter ? '✅' : 'ℹ️'} Twitter Card: ${hasTwitter ? '설정됨' : '미설정'}`);
    });

    test('구조화된 데이터 (JSON-LD) 확인', async ({ page }) => {
      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      const structuredData = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        return scripts.map(script => {
          try {
            return JSON.parse(script.textContent || '{}');
          } catch {
            return null;
          }
        }).filter(Boolean);
      });

      result.seo.structuredData = structuredData;

      console.log(`\n📊 구조화된 데이터 (JSON-LD): ${structuredData.length}개`);
      if (structuredData.length > 0) {
        structuredData.forEach((data, i) => {
          console.log(`  ${i + 1}. @type: ${data['@type'] || 'Unknown'}`);
        });
      } else {
        console.log('  ℹ️  구조화된 데이터 없음');
      }
    });

    test('제목 태그 계층 구조', async ({ page }) => {
      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();
      const h3Count = await page.locator('h3').count();

      result.seo.headings = {
        h1Count,
        h2Count,
        h3Count,
      };

      console.log(`\n📑 제목 태그:`);
      console.log(`  H1: ${h1Count}개 ${h1Count === 1 ? '✅' : '⚠️'}`);
      console.log(`  H2: ${h2Count}개`);
      console.log(`  H3: ${h3Count}개`);
    });

    test('이미지 최적화 확인', async ({ page }) => {
      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      const images = await page.locator('img').all();
      result.seo.images.total = images.length;

      let withAlt = 0;
      let optimized = 0;

      for (const img of images) {
        const alt = await img.getAttribute('alt');
        if (alt) withAlt++;

        const src = await img.getAttribute('src');
        if (src && (src.includes('.webp') || src.includes('.avif'))) {
          optimized++;
        }
      }

      result.seo.images.withAlt = withAlt;
      result.seo.images.optimized = optimized;

      console.log(`\n🖼️  이미지:`);
      console.log(`  총 개수: ${images.length}개`);
      console.log(`  Alt 텍스트: ${withAlt}개 (${((withAlt / images.length) * 100).toFixed(0)}%)`);
      console.log(`  최적화 포맷 (WebP/AVIF): ${optimized}개 (${((optimized / images.length) * 100).toFixed(0)}%)`);
    });

    test('링크 분석', async ({ page }) => {
      await page.goto(result.url);
      await page.waitForLoadState('networkidle');

      const links = await page.locator('a[href]').all();
      const baseUrl = new URL(result.url).origin;

      let internal = 0;
      let external = 0;

      for (const link of links) {
        const href = await link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('javascript:')) continue;

        try {
          const fullUrl = new URL(href, result.url);
          if (fullUrl.origin === baseUrl) {
            internal++;
          } else {
            external++;
          }
        } catch {
          // 잘못된 URL 무시
        }
      }

      result.seo.links.internal = internal;
      result.seo.links.external = external;

      console.log(`\n🔗 링크:`);
      console.log(`  내부 링크: ${internal}개`);
      console.log(`  외부 링크: ${external}개`);
      console.log(`  비율: ${internal}:${external}`);
    });
  });

  test.afterAll(async () => {
    // 결과 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'performance-seo-info.json'),
      JSON.stringify(result, null, 2),
      'utf-8'
    );

    console.log('\n\n✅ 성능 및 SEO 분석 완료');
    console.log(`📁 저장 위치: ${path.join(outputDir, 'performance-seo-info.json')}`);
    console.log('\n📊 최종 요약:');
    console.log(`\n성능:`);
    console.log(`  로딩 시간: ${result.performance.loadTime}ms`);
    console.log(`  리소스: ${result.performance.requests}개`);
    console.log(`  전송 크기: ${(result.performance.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\nSEO:`);
    console.log(`  Title: ${result.seo.titleLength}자 ${result.seo.titleLength >= 30 && result.seo.titleLength <= 60 ? '✅' : '⚠️'}`);
    console.log(`  Description: ${result.seo.descriptionLength}자 ${result.seo.descriptionLength >= 120 && result.seo.descriptionLength <= 160 ? '✅' : '⚠️'}`);
    console.log(`  H1: ${result.seo.headings.h1Count}개 ${result.seo.headings.h1Count === 1 ? '✅' : '⚠️'}`);
    console.log(`  Open Graph: ${Object.keys(result.seo.openGraph).length > 0 ? '✅' : '⚠️'}`);
    console.log(`  이미지 Alt: ${result.seo.images.withAlt}/${result.seo.images.total} (${((result.seo.images.withAlt / result.seo.images.total) * 100).toFixed(0)}%)`);
  });
});
