import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Blog 페이지 DOM 구조 분석
 * /en/blog 페이지의 구조를 파악합니다.
 */

test.describe('Blog DOM 구조 분석', () => {
  test('페이지 HTML 소스 저장', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    const htmlContent = await page.content();
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'blog-source.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');

    console.log('✅ Blog HTML 소스 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log(`📊 파일 크기: ${(htmlContent.length / 1024).toFixed(2)} KB`);
  });

  test('페이지 제목 및 기본 정보', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log('\n📄 페이지 정보:');
    console.log(`  제목: ${title}`);

    const url = page.url();
    console.log(`  URL: ${url}`);

    const description = await page
      .locator('meta[name="description"]')
      .first()
      .getAttribute('content');
    if (description) {
      console.log(`  설명: ${description}`);
    }
  });

  test('섹션 구조 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    const sections = page.locator('section');
    const sectionCount = await sections.count();

    console.log(`\n📦 전체 섹션 수: ${sectionCount}개\n`);

    const sectionInfo = [];

    for (let i = 0; i < sectionCount; i++) {
      const section = sections.nth(i);

      if (await section.isVisible()) {
        const className = await section.getAttribute('class');
        const textContent = (await section.textContent())?.trim().substring(0, 100);

        const heading = section.locator('h1, h2, h3, h4').first();
        const headingText =
          (await heading.count()) > 0 ? await heading.textContent() : null;

        const imageCount = await section.locator('img').count();
        const buttonCount = await section.locator('button').count();
        const articleCount = await section.locator('article').count();

        const info = {
          index: i + 1,
          className: className?.substring(0, 60) || '',
          heading: headingText?.trim().substring(0, 50) || null,
          textPreview: textContent?.substring(0, 60) || '',
          imageCount,
          buttonCount,
          articleCount,
        };

        sectionInfo.push(info);

        console.log(`섹션 ${i + 1}:`);
        console.log(`  클래스: ${info.className}...`);
        if (info.heading) console.log(`  제목: ${info.heading}`);
        console.log(`  이미지: ${imageCount}개`);
        console.log(`  버튼: ${buttonCount}개`);
        console.log(`  Article: ${articleCount}개`);
        console.log(`  텍스트: "${info.textPreview}..."`);
        console.log('');
      }
    }

    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    const outputPath = path.join(outputDir, 'blog-sections.json');
    fs.writeFileSync(outputPath, JSON.stringify(sectionInfo, null, 2), 'utf-8');
    console.log(`✅ 섹션 정보 저장: ${outputPath}`);
  });

  test('블로그 포스트 카드 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    console.log('\n📝 블로그 포스트 카드:\n');

    // Article 태그로 블로그 포스트 찾기
    const articles = page.locator('article');
    const articleCount = await articles.count();

    if (articleCount > 0) {
      console.log(`✅ Article 발견: ${articleCount}개`);

      for (let i = 0; i < Math.min(articleCount, 5); i++) {
        const article = articles.nth(i);

        // 제목
        const titleElement = article.locator('h1, h2, h3, h4, h5').first();
        const title =
          (await titleElement.count()) > 0
            ? (await titleElement.textContent())?.trim()
            : null;

        // 이미지
        const img = article.locator('img').first();
        const imgSrc = (await img.count()) > 0 ? await img.getAttribute('src') : null;

        // 링크
        const link = article.locator('a').first();
        const href = (await link.count()) > 0 ? await link.getAttribute('href') : null;

        console.log(`\n포스트 ${i + 1}:`);
        if (title) console.log(`  제목: ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}`);
        if (imgSrc) console.log(`  이미지: 있음`);
        if (href) console.log(`  링크: ${href}`);
      }
    } else {
      console.log('ℹ️  Article 태그 없음 - 다른 구조 사용 중');

      // 카드 형태 찾기
      const cards = page.locator('[class*="card"], [class*="post"], [class*="item"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        console.log(`\n📇 카드 형태: ${cardCount}개`);
      }
    }
  });

  test('카테고리 및 필터 확인', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    console.log('\n🏷️  카테고리/필터:\n');

    // 카테고리 버튼이나 탭 찾기
    const categorySelectors = [
      'button:has-text("All")',
      'button:has-text("Category")',
      '[role="tab"]',
      '[class*="category"]',
      '[class*="filter"]',
    ];

    let categoryFound = false;

    for (const selector of categorySelectors) {
      const categories = page.locator(selector);
      const count = await categories.count();

      if (count > 0 && count < 20) {
        categoryFound = true;
        console.log(`✅ 카테고리/필터 발견: ${count}개`);

        for (let i = 0; i < count; i++) {
          const cat = categories.nth(i);
          if (await cat.isVisible()) {
            const text = (await cat.textContent())?.trim();
            if (text && text.length < 50) {
              console.log(`  ${i + 1}. ${text}`);
            }
          }
        }
        break;
      }
    }

    if (!categoryFound) {
      console.log('ℹ️  카테고리/필터를 찾을 수 없음');
    }
  });

  test('텍스트 콘텐츠 추출', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/blog');
    await page.waitForLoadState('networkidle');

    console.log('\n📝 주요 텍스트 콘텐츠:\n');

    const headings = await page.evaluate(() => {
      const result: Array<{ level: string; text: string }> = [];
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
        document.querySelectorAll(tag).forEach((el) => {
          const text = el.textContent?.trim();
          if (text && text.length < 150) {
            result.push({ level: tag, text });
          }
        });
      });
      return result;
    });

    console.log(`제목 (${headings.length}개):`);
    headings.slice(0, 10).forEach((h, idx) => {
      const displayText = h.text.length > 60 ? h.text.substring(0, 60) + '...' : h.text;
      console.log(`  ${idx + 1}. <${h.level}> ${displayText}`);
    });

    const content = { headings };
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    const outputPath = path.join(outputDir, 'blog-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8');
    console.log(`\n✅ 콘텐츠 정보 저장: ${outputPath}`);
  });
});
