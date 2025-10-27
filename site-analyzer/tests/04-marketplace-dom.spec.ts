import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Marketplace 페이지 DOM 구조 분석
 * /en/marketplace 페이지의 구조를 파악합니다.
 */

test.describe('Marketplace DOM 구조 분석', () => {
  test('페이지 HTML 소스 저장', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    const htmlContent = await page.content();
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'marketplace-source.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');

    console.log('✅ Marketplace HTML 소스 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log(`📊 파일 크기: ${(htmlContent.length / 1024).toFixed(2)} KB`);
  });

  test('페이지 제목 및 기본 정보', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    console.log('\n📄 페이지 정보:');
    console.log(`  제목: ${title}`);

    // URL 확인
    const url = page.url();
    console.log(`  URL: ${url}`);

    // 메타 정보
    const description = await page
      .locator('meta[name="description"]')
      .first()
      .getAttribute('content');
    if (description) {
      console.log(`  설명: ${description}`);
    }
  });

  test('섹션 구조 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
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

        // 제목 찾기
        const heading = section.locator('h1, h2, h3, h4').first();
        const headingText =
          (await heading.count()) > 0 ? await heading.textContent() : null;

        // 이미지, 버튼, 입력 필드 수
        const imageCount = await section.locator('img').count();
        const buttonCount = await section.locator('button').count();
        const inputCount = await section.locator('input').count();

        const info = {
          index: i + 1,
          className: className?.substring(0, 60) || '',
          heading: headingText?.trim().substring(0, 50) || null,
          textPreview: textContent?.substring(0, 60) || '',
          imageCount,
          buttonCount,
          inputCount,
        };

        sectionInfo.push(info);

        console.log(`섹션 ${i + 1}:`);
        console.log(`  클래스: ${info.className}...`);
        if (info.heading) console.log(`  제목: ${info.heading}`);
        console.log(`  이미지: ${imageCount}개`);
        console.log(`  버튼: ${buttonCount}개`);
        console.log(`  입력필드: ${inputCount}개`);
        console.log(`  텍스트: "${info.textPreview}..."`);
        console.log('');
      }
    }

    // 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    const outputPath = path.join(outputDir, 'marketplace-sections.json');
    fs.writeFileSync(outputPath, JSON.stringify(sectionInfo, null, 2), 'utf-8');
    console.log(`✅ 섹션 정보 저장: ${outputPath}`);
  });

  test('검색 필터 UI 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    console.log('\n🔍 검색 필터 UI:\n');

    // 입력 필드 찾기
    const inputs = page.locator('input[type="text"], input[placeholder]');
    const inputCount = await inputs.count();

    console.log(`📝 입력 필드: ${inputCount}개`);
    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder');
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');

      console.log(`  ${i + 1}. ${placeholder || name || type}`);
    }

    // 선택 박스 (드롭다운)
    const selects = page.locator('select');
    const selectCount = await selects.count();

    console.log(`\n📋 드롭다운: ${selectCount}개`);
    for (let i = 0; i < selectCount; i++) {
      const select = selects.nth(i);
      const name = await select.getAttribute('name');
      console.log(`  ${i + 1}. ${name}`);
    }

    // 날짜 입력
    const dateInputs = page.locator('input[type="date"]');
    const dateCount = await dateInputs.count();

    console.log(`\n📅 날짜 입력: ${dateCount}개`);

    // 버튼 (검색, 필터 등)
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    console.log(`\n🔘 버튼: ${buttonCount}개`);
    for (let i = 0; i < Math.min(buttonCount, 15); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const text = (await button.textContent())?.trim();
        if (text && text.length < 50) {
          console.log(`  ${i + 1}. ${text}`);
        }
      }
    }
  });

  test('결과 테이블/카드 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    console.log('\n📊 결과 표시 영역:\n');

    // 테이블 찾기
    const tables = page.locator('table');
    const tableCount = await tables.count();

    if (tableCount > 0) {
      console.log(`✅ 테이블 발견: ${tableCount}개`);

      for (let i = 0; i < tableCount; i++) {
        const table = tables.nth(i);
        const headers = table.locator('th');
        const headerCount = await headers.count();
        const rows = table.locator('tr');
        const rowCount = await rows.count();

        console.log(`\n  테이블 ${i + 1}:`);
        console.log(`    헤더: ${headerCount}개`);
        console.log(`    행: ${rowCount}개`);

        if (headerCount > 0) {
          console.log('    컬럼:');
          for (let j = 0; j < Math.min(headerCount, 10); j++) {
            const header = headers.nth(j);
            const text = (await header.textContent())?.trim();
            if (text) {
              console.log(`      - ${text}`);
            }
          }
        }
      }
    } else {
      console.log('ℹ️  테이블 없음 - 카드 형태일 가능성');

      // 카드 형태 찾기
      const cards = page.locator('[class*="card"], [class*="item"], [class*="result"]');
      const cardCount = await cards.count();

      if (cardCount > 0) {
        console.log(`\n📇 카드 형태: ${cardCount}개 요소`);
        console.log('  (상위 3개 샘플)');

        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          const card = cards.nth(i);
          const text = (await card.textContent())?.trim().substring(0, 100);
          console.log(`\n  카드 ${i + 1}:`);
          console.log(`    ${text}...`);
        }
      }
    }
  });

  test('텍스트 콘텐츠 및 라벨 추출', async ({ page }) => {
    await page.goto('https://www.surff.kr/en/marketplace');
    await page.waitForLoadState('networkidle');

    console.log('\n📝 주요 텍스트 콘텐츠:\n');

    // 모든 제목
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

    // 라벨 (폼 필드 등)
    const labels = page.locator('label');
    const labelCount = await labels.count();

    console.log(`\n라벨 (${labelCount}개):`);
    for (let i = 0; i < Math.min(labelCount, 10); i++) {
      const label = labels.nth(i);
      const text = (await label.textContent())?.trim();
      if (text) {
        console.log(`  ${i + 1}. ${text}`);
      }
    }

    // 저장
    const content = { headings, labelCount };
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    const outputPath = path.join(outputDir, 'marketplace-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8');
    console.log(`\n✅ 콘텐츠 정보 저장: ${outputPath}`);
  });
});
