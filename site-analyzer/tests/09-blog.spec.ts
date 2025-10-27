import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Blog 페이지 상세 분석
 * /en/blog - SURFF Company Blog
 */

interface BlogInfo {
  timestamp: string;
  url: string;
  title: string;
  description: string;
  mainHeading: string;
  categories: Array<{
    name: string;
    type: string;
  }>;
  posts: Array<{
    title: string;
    hasImage: boolean;
    excerpt?: string;
  }>;
  features: Array<{
    name: string;
    description: string;
  }>;
}

test.describe('Blog 페이지 분석', () => {
  let blogInfo: BlogInfo;

  test.beforeAll(async () => {
    blogInfo = {
      timestamp: new Date().toISOString(),
      url: 'https://www.surff.kr/en/blog',
      title: '',
      description: '',
      mainHeading: '',
      categories: [],
      posts: [],
      features: [],
    };
  });

  test('페이지 기본 정보 수집', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    blogInfo.title = await page.title();
    console.log('📄 페이지 제목:', blogInfo.title);

    const metaDesc = page.locator('meta[name="description"]').first();
    if ((await metaDesc.count()) > 0) {
      blogInfo.description = (await metaDesc.getAttribute('content')) || '';
      console.log('📝 설명:', blogInfo.description);
    }

    // 메인 제목 (h2)
    const h2 = page.locator('h2').filter({ hasText: /Blog/ }).first();
    if ((await h2.count()) > 0) {
      blogInfo.mainHeading = (await h2.textContent())?.trim() || '';
      console.log('📌 메인 제목:', blogInfo.mainHeading);
    }
  });

  test('카테고리 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    console.log('\n🏷️  카테고리:\n');

    // 메인 섹션에서 버튼 텍스트로 카테고리 찾기
    const mainSection = page.locator('section').nth(1);

    // "Logistics 101", "Popular" 같은 텍스트 패턴
    const buttons = mainSection.locator('button');
    const buttonCount = await buttons.count();

    const categoryTexts = new Set<string>();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = (await button.textContent())?.trim();

      // 카테고리로 보이는 짧은 텍스트
      if (text && text.length > 2 && text.length < 30 && !text.includes('Close')) {
        // Logistics 101, Popular 등의 패턴
        if (/^[A-Za-z]/.test(text)) {
          categoryTexts.add(text);
        }
      }
    }

    // 중복 제거 후 카테고리 추가
    const uniqueCategories = Array.from(categoryTexts)
      .filter(cat => {
        // 블로그 포스트 제목 같은 긴 텍스트 제외
        return !cat.includes('Week') && !cat.includes('VOL') && !cat.includes('Tax');
      })
      .slice(0, 10); // 최대 10개

    uniqueCategories.forEach((cat) => {
      blogInfo.categories.push({
        name: cat,
        type: 'category',
      });
    });

    console.log(`발견된 카테고리: ${blogInfo.categories.length}개`);
    blogInfo.categories.forEach((cat, idx) => {
      console.log(`  ${idx + 1}. ${cat.name}`);
    });
  });

  test('블로그 포스트 제목 수집', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    console.log('\n📝 블로그 포스트:\n');

    // h4 태그로 블로그 포스트 제목 찾기
    const mainSection = page.locator('section').nth(1);
    const postTitles = mainSection.locator('h4');
    const postCount = await postTitles.count();

    console.log(`총 ${postCount}개 포스트 제목 발견`);

    for (let i = 0; i < Math.min(postCount, 10); i++) {
      const title = (await postTitles.nth(i).textContent())?.trim();

      if (title && title.length > 10) {
        // 의미있는 제목만
        blogInfo.posts.push({
          title,
          hasImage: true, // 섹션에 이미지가 있으므로
        });

        const displayTitle = title.length > 70 ? title.substring(0, 70) + '...' : title;
        console.log(`  ${i + 1}. ${displayTitle}`);
      }
    }

    console.log(`\n✅ 수집된 포스트: ${blogInfo.posts.length}개`);
  });

  test('이미지 및 버튼 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    console.log('\n📊 콘텐츠 통계:\n');

    const mainSection = page.locator('section').nth(1);

    // 이미지
    const images = mainSection.locator('img');
    const imageCount = await images.count();
    console.log(`이미지: ${imageCount}개`);

    // 버튼
    const buttons = mainSection.locator('button');
    const buttonCount = await buttons.count();
    console.log(`버튼: ${buttonCount}개`);

    // 추정: 포스트 수
    const estimatedPosts = Math.min(imageCount, Math.floor(buttonCount / 2));
    console.log(`추정 포스트 수: 약 ${estimatedPosts}개`);
  });

  test('주요 기능 요약', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    console.log('\n🎯 주요 기능:\n');

    // 기능 1: 블로그 포스트 목록
    if (blogInfo.posts.length > 0) {
      blogInfo.features.push({
        name: 'Blog Post List',
        description: `${blogInfo.posts.length}개 블로그 포스트 표시`,
      });
      console.log(`  1. 블로그 포스트 목록 (${blogInfo.posts.length}개)`);
    }

    // 기능 2: 카테고리 필터
    if (blogInfo.categories.length > 0) {
      blogInfo.features.push({
        name: 'Category Filters',
        description: `${blogInfo.categories.length}개 카테고리로 필터링`,
      });
      console.log(`  2. 카테고리 필터 (${blogInfo.categories.length}개)`);
    }

    // 기능 3: 이미지 썸네일
    blogInfo.features.push({
      name: 'Image Thumbnails',
      description: '각 포스트에 이미지 썸네일',
    });
    console.log('  3. 이미지 썸네일 (각 포스트)');

    // 기능 4: 물류 인사이트 제공
    blogInfo.features.push({
      name: 'Logistics Insights',
      description: '최신 물류 트렌드 및 인사이트 제공',
    });
    console.log('  4. 물류 인사이트 (Logistics 101, SURFF INSIGHT 등)');

    console.log(`\n✅ 총 ${blogInfo.features.length}개 주요 기능`);
  });

  test.afterAll(async () => {
    // 수집한 정보를 JSON 파일로 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'blog-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(blogInfo, null, 2), 'utf-8');

    console.log('\n✅ Blog 정보 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log('\n📊 분석 요약:');
    console.log(`  - 제목: ${blogInfo.title}`);
    console.log(`  - 카테고리: ${blogInfo.categories.length}개`);
    console.log(`  - 포스트: ${blogInfo.posts.length}개`);
    console.log(`  - 주요 기능: ${blogInfo.features.length}개`);
  });
});
