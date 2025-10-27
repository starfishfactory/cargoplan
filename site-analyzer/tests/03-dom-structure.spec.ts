import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * DOM 구조 상세 분석
 * 실제 페이지의 HTML 구조와 CSS 클래스명을 파악합니다.
 */

test.describe('DOM 구조 분석', () => {
  test('페이지 HTML 소스 저장', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // HTML 소스 저장
    const htmlContent = await page.content();
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'main-page-source.html');
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');

    console.log('✅ HTML 소스 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log(`📊 파일 크기: ${(htmlContent.length / 1024).toFixed(2)} KB`);
  });

  test('main 태그 구조 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // main 태그 찾기
    const main = page.locator('main').first();

    if (await main.count() > 0) {
      console.log('\n📦 <main> 태그 발견');

      // main의 직접 자식 요소들 분석
      const children = await main.evaluate((el) => {
        const childElements = Array.from(el.children);
        return childElements.map((child, index) => ({
          index,
          tag: child.tagName.toLowerCase(),
          className: child.className,
          id: child.id,
          childCount: child.children.length,
          textLength: child.textContent?.trim().length || 0,
        }));
      });

      console.log(`\n🔍 <main>의 직접 자식 요소: ${children.length}개`);
      children.forEach((child) => {
        console.log(`\n  ${child.index + 1}. <${child.tag}>`);
        if (child.className) console.log(`     class="${child.className}"`);
        if (child.id) console.log(`     id="${child.id}"`);
        console.log(`     자식 수: ${child.childCount}개`);
        console.log(`     텍스트 길이: ${child.textLength}자`);
      });

      // JSON으로 저장
      const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
      const outputPath = path.join(outputDir, 'main-structure.json');
      fs.writeFileSync(outputPath, JSON.stringify(children, null, 2), 'utf-8');
      console.log(`\n✅ 구조 정보 저장: ${outputPath}`);
    } else {
      console.log('⚠️  <main> 태그를 찾을 수 없습니다.');
    }
  });

  test('사용된 CSS 클래스명 패턴 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 모든 요소의 클래스명 수집
    const classPatterns = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const classMap: { [key: string]: number } = {};

      elements.forEach((el) => {
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.split(/\s+/);
          classes.forEach((cls) => {
            if (cls) {
              classMap[cls] = (classMap[cls] || 0) + 1;
            }
          });
        }
      });

      // 빈도순으로 정렬
      const sorted = Object.entries(classMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50); // 상위 50개

      return sorted;
    });

    console.log('\n📊 가장 많이 사용된 CSS 클래스 (상위 30개):');
    classPatterns.slice(0, 30).forEach(([className, count], index) => {
      console.log(`  ${index + 1}. ${className} (${count}회)`);
    });

    // 패턴 분석
    const patterns = {
      utility: classPatterns.filter(([cls]) =>
        /^(flex|grid|p-|m-|text-|bg-|w-|h-)/.test(cls)
      ),
      component: classPatterns.filter(([cls]) =>
        /^(btn|button|card|modal|nav|header|footer|hero|section)/.test(cls)
      ),
      cssModules: classPatterns.filter(([cls]) => /_[a-zA-Z0-9_]+/.test(cls)),
      customPrefix: classPatterns.filter(([cls]) => /^[a-z]+-[a-z]+/.test(cls)),
    };

    console.log('\n🎯 클래스명 패턴 분석:');
    console.log(`  - Utility 클래스: ${patterns.utility.length}개`);
    console.log(`  - Component 클래스: ${patterns.component.length}개`);
    console.log(`  - CSS Modules 스타일: ${patterns.cssModules.length}개`);
    console.log(`  - 커스텀 prefix: ${patterns.customPrefix.length}개`);

    // 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    const outputPath = path.join(outputDir, 'css-classes.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(
        {
          topClasses: classPatterns,
          patterns,
        },
        null,
        2
      ),
      'utf-8'
    );
    console.log(`\n✅ CSS 클래스 정보 저장: ${outputPath}`);
  });

  test('주요 섹션 식별 (데이터 속성 기반)', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    console.log('\n🔍 데이터 속성으로 섹션 찾기:');

    // 다양한 방법으로 섹션 찾기
    const sections = await page.evaluate(() => {
      const results: Array<{
        selector: string;
        tag: string;
        className: string;
        id: string;
        textPreview: string;
        hasImage: boolean;
        hasButton: boolean;
      }> = [];

      // 1. section 태그
      document.querySelectorAll('section').forEach((el, idx) => {
        results.push({
          selector: `section:nth-of-type(${idx + 1})`,
          tag: 'section',
          className: el.className,
          id: el.id,
          textPreview: el.textContent?.trim().substring(0, 50) || '',
          hasImage: el.querySelectorAll('img').length > 0,
          hasButton: el.querySelectorAll('button, a').length > 0,
        });
      });

      // 2. div with role
      document.querySelectorAll('div[role]').forEach((el, idx) => {
        if (el.children.length > 3) {
          results.push({
            selector: `div[role="${el.getAttribute('role')}"]`,
            tag: 'div',
            className: el.className,
            id: el.id,
            textPreview: el.textContent?.trim().substring(0, 50) || '',
            hasImage: el.querySelectorAll('img').length > 0,
            hasButton: el.querySelectorAll('button, a').length > 0,
          });
        }
      });

      // 3. main의 첫 번째 레벨 div들 중 큰 것들
      const main = document.querySelector('main');
      if (main) {
        Array.from(main.children).forEach((el, idx) => {
          if (el.children.length > 2) {
            results.push({
              selector: `main > *:nth-child(${idx + 1})`,
              tag: el.tagName.toLowerCase(),
              className: el.className,
              id: el.id,
              textPreview: el.textContent?.trim().substring(0, 50) || '',
              hasImage: el.querySelectorAll('img').length > 0,
              hasButton: el.querySelectorAll('button, a').length > 0,
            });
          }
        });
      }

      return results;
    });

    console.log(`\n📦 발견된 잠재적 섹션: ${sections.length}개\n`);
    sections.forEach((section, idx) => {
      console.log(`${idx + 1}. ${section.selector}`);
      console.log(`   태그: <${section.tag}>`);
      if (section.className) console.log(`   class: "${section.className.substring(0, 60)}..."`);
      if (section.id) console.log(`   id: "${section.id}"`);
      console.log(`   이미지: ${section.hasImage ? '있음' : '없음'}`);
      console.log(`   버튼: ${section.hasButton ? '있음' : '없음'}`);
      console.log(`   텍스트: "${section.textPreview}..."`);
      console.log('');
    });

    // 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    const outputPath = path.join(outputDir, 'sections.json');
    fs.writeFileSync(outputPath, JSON.stringify(sections, null, 2), 'utf-8');
    console.log(`✅ 섹션 정보 저장: ${outputPath}`);
  });

  test('텍스트 콘텐츠 추출 (제목, 버튼 등)', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    const content = await page.evaluate(() => {
      const result = {
        headings: [] as Array<{ level: string; text: string; className: string }>,
        buttons: [] as Array<{ text: string; href: string; className: string }>,
        links: [] as Array<{ text: string; href: string }>,
      };

      // 모든 제목 수집
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag) => {
        document.querySelectorAll(tag).forEach((el) => {
          const text = el.textContent?.trim();
          if (text && text.length < 200) {
            result.headings.push({
              level: tag,
              text,
              className: el.className,
            });
          }
        });
      });

      // 모든 버튼 수집
      document.querySelectorAll('button, a[role="button"]').forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length < 100) {
          result.buttons.push({
            text,
            href: el.getAttribute('href') || '',
            className: el.className,
          });
        }
      });

      // 주요 링크 수집 (내비게이션 제외)
      document.querySelectorAll('main a, section a').forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length < 100 && text.length > 2) {
          result.links.push({
            text,
            href: el.getAttribute('href') || '',
          });
        }
      });

      return result;
    });

    console.log('\n📝 페이지 텍스트 콘텐츠:\n');

    console.log(`📌 제목 (${content.headings.length}개):`);
    content.headings.slice(0, 10).forEach((h, idx) => {
      console.log(`  ${idx + 1}. <${h.level}> ${h.text}`);
      if (h.className) console.log(`     class: ${h.className.substring(0, 50)}`);
    });

    console.log(`\n🔘 버튼 (${content.buttons.length}개):`);
    content.buttons.slice(0, 10).forEach((btn, idx) => {
      console.log(`  ${idx + 1}. "${btn.text}"`);
      if (btn.href) console.log(`     → ${btn.href}`);
      if (btn.className) console.log(`     class: ${btn.className.substring(0, 50)}`);
    });

    console.log(`\n🔗 링크 (${content.links.length}개, 상위 10개):`);
    content.links.slice(0, 10).forEach((link, idx) => {
      console.log(`  ${idx + 1}. "${link.text}" → ${link.href}`);
    });

    // 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis', '.tmp');
    const outputPath = path.join(outputDir, 'text-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2), 'utf-8');
    console.log(`\n✅ 텍스트 콘텐츠 저장: ${outputPath}`);
  });
});
