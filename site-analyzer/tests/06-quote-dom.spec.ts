import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Quote 페이지 DOM 구조 분석
 * /en/quote?pageNo=1 페이지의 구조를 파악합니다.
 */

test.describe('Quote DOM 구조 분석', () => {
  test('페이지 HTML 소스 저장', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    const htmlContent = await page.content();
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'quote-source.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');

    console.log('✅ Quote HTML 소스 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log(`📊 파일 크기: ${(htmlContent.length / 1024).toFixed(2)} KB`);
  });

  test('페이지 제목 및 기본 정보', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
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
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
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
        const inputCount = await section.locator('input').count();
        const tableCount = await section.locator('table').count();

        const info = {
          index: i + 1,
          className: className?.substring(0, 60) || '',
          heading: headingText?.trim().substring(0, 50) || null,
          textPreview: textContent?.substring(0, 60) || '',
          imageCount,
          buttonCount,
          inputCount,
          tableCount,
        };

        sectionInfo.push(info);

        console.log(`섹션 ${i + 1}:`);
        console.log(`  클래스: ${info.className}...`);
        if (info.heading) console.log(`  제목: ${info.heading}`);
        console.log(`  이미지: ${imageCount}개`);
        console.log(`  버튼: ${buttonCount}개`);
        console.log(`  입력필드: ${inputCount}개`);
        console.log(`  테이블: ${tableCount}개`);
        console.log(`  텍스트: "${info.textPreview}..."`);
        console.log('');
      }
    }

    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    const outputPath = path.join(outputDir, 'quote-sections.json');
    fs.writeFileSync(outputPath, JSON.stringify(sectionInfo, null, 2), 'utf-8');
    console.log(`✅ 섹션 정보 저장: ${outputPath}`);
  });

  test('견적 요청 폼 또는 리스트 확인', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    console.log('\n📋 Quote 페이지 콘텐츠:\n');

    // 폼 필드 확인
    const inputs = page.locator('input');
    const inputCount = await inputs.count();

    if (inputCount > 0) {
      console.log(`📝 입력 필드: ${inputCount}개`);
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        const placeholder = await input.getAttribute('placeholder');
        const type = await input.getAttribute('type');
        if (placeholder) {
          console.log(`  ${i + 1}. ${placeholder} (${type})`);
        }
      }
    }

    // 테이블 확인
    const tables = page.locator('table');
    const tableCount = await tables.count();

    if (tableCount > 0) {
      console.log(`\n📊 테이블: ${tableCount}개`);

      for (let i = 0; i < tableCount; i++) {
        const table = tables.nth(i);
        const headers = table.locator('th');
        const headerCount = await headers.count();
        const rows = table.locator('tr');
        const rowCount = await rows.count();

        console.log(`\n  테이블 ${i + 1}:`);
        console.log(`    헤더: ${headerCount}개`);
        console.log(`    행: ${rowCount}개`);

        if (headerCount > 0 && headerCount < 20) {
          console.log('    컬럼:');
          for (let j = 0; j < headerCount; j++) {
            const header = headers.nth(j);
            const text = (await header.textContent())?.trim();
            if (text) {
              console.log(`      - ${text}`);
            }
          }
        }
      }
    }

    // 버튼 확인
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    console.log(`\n🔘 버튼: ${buttonCount}개`);
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const text = (await button.textContent())?.trim();
        if (text && text.length < 50) {
          console.log(`  ${i + 1}. ${text}`);
        }
      }
    }
  });

  test('텍스트 콘텐츠 추출', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    console.log('\n📝 주요 텍스트 콘텐츠:\n');

    const headings = await page.evaluate(() => {
      const result: Array<{ level: string; text: string }> = [];
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
        document.querySelectorAll(tag).forEach((el) => {
          const text = el.textContent?.trim();
          if (text && text.length < 100) {
            result.push({ level: tag, text });
          }
        });
      });
      return result;
    });

    console.log(`제목 (${headings.length}개):`);
    headings.slice(0, 10).forEach((h, idx) => {
      console.log(`  ${idx + 1}. <${h.level}> ${h.text}`);
    });

    // 라벨
    const labels = page.locator('label');
    const labelCount = await labels.count();

    if (labelCount > 0) {
      console.log(`\n라벨 (${labelCount}개):`);
      for (let i = 0; i < Math.min(labelCount, 10); i++) {
        const label = labels.nth(i);
        const text = (await label.textContent())?.trim();
        if (text) {
          console.log(`  ${i + 1}. ${text}`);
        }
      }
    }

    const content = { headings, labelCount };
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    const outputPath = path.join(outputDir, 'quote-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8');
    console.log(`\n✅ 콘텐츠 정보 저장: ${outputPath}`);
  });

  test('페이지네이션 확인', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/quote?pageNo=1');
    await page.waitForLoadState('networkidle');

    console.log('\n📄 페이지네이션 확인:\n');

    // pageNo 파라미터가 있으므로 페이지네이션 관련 요소 찾기
    const paginationSelectors = [
      'button:has-text("Next")',
      'button:has-text("Previous")',
      'button:has-text("다음")',
      'button:has-text("이전")',
      '[class*="pagination"]',
      'button[aria-label*="page"]',
      'a[href*="pageNo="]',
    ];

    let paginationFound = false;

    for (const selector of paginationSelectors) {
      const pagination = page.locator(selector);
      const count = await pagination.count();

      if (count > 0) {
        paginationFound = true;
        console.log(`✅ 페이지네이션 발견: ${selector} (${count}개)`);

        for (let i = 0; i < Math.min(count, 5); i++) {
          const el = pagination.nth(i);
          if (await el.isVisible()) {
            const text = (await el.textContent())?.trim();
            const href = await el.getAttribute('href');
            if (text) {
              console.log(`  ${i + 1}. ${text}${href ? ` → ${href}` : ''}`);
            }
          }
        }
      }
    }

    if (!paginationFound) {
      console.log('ℹ️  페이지네이션 요소를 찾을 수 없음');
      console.log('   (URL에 pageNo가 있어 페이지네이션 기능은 존재)');
    }
  });
});
