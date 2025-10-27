import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 접근성 (a11y) 분석 테스트
 * WCAG 2.1 가이드라인 기반
 */

interface AccessibilityIssue {
  type: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element?: string;
  description: string;
}

interface AccessibilityAnalysis {
  analyzedAt: string;
  url: string;
  issues: AccessibilityIssue[];
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  checks: {
    images: {
      total: number;
      withAlt: number;
      withoutAlt: number;
    };
    headings: {
      total: number;
      structure: string[];
      hasH1: boolean;
      multipleH1: boolean;
    };
    forms: {
      total: number;
      withLabels: number;
      withoutLabels: number;
    };
    links: {
      total: number;
      withText: number;
      emptyLinks: number;
    };
    buttons: {
      total: number;
      withText: number;
      emptyButtons: number;
    };
    colorContrast: {
      checked: number;
      lowContrast: number;
    };
    landmarks: {
      hasMain: boolean;
      hasNav: boolean;
      hasHeader: boolean;
      hasFooter: boolean;
    };
    aria: {
      ariaLabels: number;
      ariaDescriptions: number;
      ariaHidden: number;
    };
  };
}

test.describe('접근성 분석', () => {
  const analysis: AccessibilityAnalysis = {
    analyzedAt: new Date().toISOString(),
    url: 'https://www.surff.kr/en/marketplace',
    issues: [],
    summary: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    },
    checks: {
      images: { total: 0, withAlt: 0, withoutAlt: 0 },
      headings: { total: 0, structure: [], hasH1: false, multipleH1: false },
      forms: { total: 0, withLabels: 0, withoutLabels: 0 },
      links: { total: 0, withText: 0, emptyLinks: 0 },
      buttons: { total: 0, withText: 0, emptyButtons: 0 },
      colorContrast: { checked: 0, lowContrast: 0 },
      landmarks: { hasMain: false, hasNav: false, hasHeader: false, hasFooter: false },
      aria: { ariaLabels: 0, ariaDescriptions: 0, ariaHidden: 0 },
    },
  };

  test('이미지 alt 텍스트 검사', async ({ page }) => {
    await page.goto(analysis.url);
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();
    analysis.checks.images.total = images.length;

    console.log(`🖼️  총 이미지: ${images.length}개`);

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const src = await img.getAttribute('src');

      if (alt !== null && alt.trim() !== '') {
        analysis.checks.images.withAlt++;
      } else {
        analysis.checks.images.withoutAlt++;
        analysis.issues.push({
          type: 'missing-alt',
          severity: 'serious',
          element: `img[src="${src?.substring(0, 50)}..."]`,
          description: 'Image missing alt text',
        });
      }
    }

    console.log(`✅ Alt 텍스트 있음: ${analysis.checks.images.withAlt}개`);
    console.log(`⚠️  Alt 텍스트 없음: ${analysis.checks.images.withoutAlt}개`);

    if (analysis.checks.images.withoutAlt > 0) {
      analysis.summary.serious += analysis.checks.images.withoutAlt;
    }
  });

  test('제목 구조 검사', async ({ page }) => {
    await page.goto(analysis.url);
    await page.waitForLoadState('networkidle');

    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    analysis.checks.headings.total = headings.length;

    console.log(`\n📑 총 제목 태그: ${headings.length}개`);

    const structure: string[] = [];
    let h1Count = 0;

    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const text = await heading.textContent();
      structure.push(`${tagName}: ${text?.trim().substring(0, 50)}`);

      if (tagName === 'h1') {
        h1Count++;
      }
    }

    analysis.checks.headings.structure = structure;
    analysis.checks.headings.hasH1 = h1Count > 0;
    analysis.checks.headings.multipleH1 = h1Count > 1;

    console.log(`${analysis.checks.headings.hasH1 ? '✅' : '⚠️'} H1 태그: ${h1Count}개`);

    if (!analysis.checks.headings.hasH1) {
      analysis.issues.push({
        type: 'missing-h1',
        severity: 'serious',
        description: 'Page is missing an H1 heading',
      });
      analysis.summary.serious++;
    }

    if (analysis.checks.headings.multipleH1) {
      analysis.issues.push({
        type: 'multiple-h1',
        severity: 'moderate',
        description: `Page has ${h1Count} H1 headings (should have only one)`,
      });
      analysis.summary.moderate++;
    }

    console.log('\n제목 구조 (상위 5개):');
    structure.slice(0, 5).forEach((h, i) => {
      console.log(`  ${i + 1}. ${h}`);
    });
  });

  test('폼 레이블 검사', async ({ page }) => {
    await page.goto(analysis.url);
    await page.waitForLoadState('networkidle');

    const inputs = await page.locator('input:not([type="hidden"]), textarea, select').all();
    analysis.checks.forms.total = inputs.length;

    console.log(`\n📝 폼 입력 필드: ${inputs.length}개`);

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      let hasLabel = false;

      // id로 연결된 label 확인
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        hasLabel = label > 0;
      }

      // aria-label 또는 aria-labelledby 확인
      if (!hasLabel && (ariaLabel || ariaLabelledBy)) {
        hasLabel = true;
      }

      if (hasLabel) {
        analysis.checks.forms.withLabels++;
      } else {
        analysis.checks.forms.withoutLabels++;
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        const type = await input.getAttribute('type');
        analysis.issues.push({
          type: 'missing-label',
          severity: 'serious',
          element: `${tagName}${type ? `[type="${type}"]` : ''}`,
          description: 'Form input missing associated label',
        });
      }
    }

    console.log(`✅ 레이블 있음: ${analysis.checks.forms.withLabels}개`);
    console.log(`⚠️  레이블 없음: ${analysis.checks.forms.withoutLabels}개`);

    if (analysis.checks.forms.withoutLabels > 0) {
      analysis.summary.serious += analysis.checks.forms.withoutLabels;
    }
  });

  test('링크 텍스트 검사', async ({ page }) => {
    await page.goto(analysis.url);
    await page.waitForLoadState('networkidle');

    const links = await page.locator('a[href]').all();
    analysis.checks.links.total = links.length;

    console.log(`\n🔗 총 링크: ${links.length}개`);

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      const hasText = (text && text.trim() !== '') || ariaLabel || title;

      if (hasText) {
        analysis.checks.links.withText++;
      } else {
        analysis.checks.links.emptyLinks++;
        const href = await link.getAttribute('href');
        analysis.issues.push({
          type: 'empty-link',
          severity: 'serious',
          element: `a[href="${href?.substring(0, 50)}"]`,
          description: 'Link has no accessible text',
        });
      }
    }

    console.log(`✅ 텍스트 있음: ${analysis.checks.links.withText}개`);
    console.log(`⚠️  빈 링크: ${analysis.checks.links.emptyLinks}개`);

    if (analysis.checks.links.emptyLinks > 0) {
      analysis.summary.serious += analysis.checks.links.emptyLinks;
    }
  });

  test('버튼 텍스트 검사', async ({ page }) => {
    await page.goto(analysis.url);
    await page.waitForLoadState('networkidle');

    const buttons = await page.locator('button').all();
    analysis.checks.buttons.total = buttons.length;

    console.log(`\n🔘 총 버튼: ${buttons.length}개`);

    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      const hasText = (text && text.trim() !== '') || ariaLabel;

      if (hasText) {
        analysis.checks.buttons.withText++;
      } else {
        analysis.checks.buttons.emptyButtons++;
        analysis.issues.push({
          type: 'empty-button',
          severity: 'serious',
          description: 'Button has no accessible text',
        });
      }
    }

    console.log(`✅ 텍스트 있음: ${analysis.checks.buttons.withText}개`);
    console.log(`⚠️  빈 버튼: ${analysis.checks.buttons.emptyButtons}개`);

    if (analysis.checks.buttons.emptyButtons > 0) {
      analysis.summary.serious += analysis.checks.buttons.emptyButtons;
    }
  });

  test('랜드마크 요소 검사', async ({ page }) => {
    await page.goto(analysis.url);
    await page.waitForLoadState('networkidle');

    console.log('\n🏛️  랜드마크 요소:');

    // main
    const mainCount = await page.locator('main, [role="main"]').count();
    analysis.checks.landmarks.hasMain = mainCount > 0;
    console.log(`  ${analysis.checks.landmarks.hasMain ? '✅' : '⚠️'} <main>: ${mainCount}개`);

    // nav
    const navCount = await page.locator('nav, [role="navigation"]').count();
    analysis.checks.landmarks.hasNav = navCount > 0;
    console.log(`  ${analysis.checks.landmarks.hasNav ? '✅' : '⚠️'} <nav>: ${navCount}개`);

    // header
    const headerCount = await page.locator('header, [role="banner"]').count();
    analysis.checks.landmarks.hasHeader = headerCount > 0;
    console.log(`  ${analysis.checks.landmarks.hasHeader ? '✅' : '⚠️'} <header>: ${headerCount}개`);

    // footer
    const footerCount = await page.locator('footer, [role="contentinfo"]').count();
    analysis.checks.landmarks.hasFooter = footerCount > 0;
    console.log(`  ${analysis.checks.landmarks.hasFooter ? '✅' : '⚠️'} <footer>: ${footerCount}개`);

    if (!analysis.checks.landmarks.hasMain) {
      analysis.issues.push({
        type: 'missing-landmark',
        severity: 'moderate',
        description: 'Page is missing a main landmark',
      });
      analysis.summary.moderate++;
    }
  });

  test('ARIA 속성 검사', async ({ page }) => {
    await page.goto(analysis.url);
    await page.waitForLoadState('networkidle');

    console.log('\n♿ ARIA 속성:');

    // aria-label
    const ariaLabelCount = await page.locator('[aria-label]').count();
    analysis.checks.aria.ariaLabels = ariaLabelCount;
    console.log(`  aria-label: ${ariaLabelCount}개`);

    // aria-describedby
    const ariaDescCount = await page.locator('[aria-describedby]').count();
    analysis.checks.aria.ariaDescriptions = ariaDescCount;
    console.log(`  aria-describedby: ${ariaDescCount}개`);

    // aria-hidden
    const ariaHiddenCount = await page.locator('[aria-hidden]').count();
    analysis.checks.aria.ariaHidden = ariaHiddenCount;
    console.log(`  aria-hidden: ${ariaHiddenCount}개`);
  });

  test('색상 대비 검사 (샘플)', async ({ page }) => {
    await page.goto(analysis.url);
    await page.waitForLoadState('networkidle');

    console.log('\n🎨 색상 대비 (샘플 체크):');

    // 주요 텍스트 요소 샘플 체크
    const textElements = await page.locator('p, h1, h2, h3, a, button, span').all();
    const sampleSize = Math.min(textElements.length, 20);

    let lowContrastCount = 0;

    for (let i = 0; i < sampleSize; i++) {
      const el = textElements[i];
      const contrast = await el.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const bgColor = style.backgroundColor;

        // RGB 추출 (간단한 파싱)
        const colorMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const bgMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

        if (!colorMatch || !bgMatch) return null;

        const [, r1, g1, b1] = colorMatch.map(Number);
        const [, r2, g2, b2] = bgMatch.map(Number);

        // 밝기 계산 (relative luminance 간소화)
        const lum1 = (0.299 * r1 + 0.587 * g1 + 0.114 * b1) / 255;
        const lum2 = (0.299 * r2 + 0.587 * g2 + 0.114 * b2) / 255;

        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);

        const contrast = (lighter + 0.05) / (darker + 0.05);
        return contrast;
      });

      analysis.checks.colorContrast.checked++;

      if (contrast !== null && contrast < 4.5) {
        lowContrastCount++;
      }
    }

    analysis.checks.colorContrast.lowContrast = lowContrastCount;

    console.log(`  검사한 요소: ${sampleSize}개`);
    console.log(`  ${lowContrastCount === 0 ? '✅' : '⚠️'} 낮은 대비: ${lowContrastCount}개`);

    if (lowContrastCount > 0) {
      analysis.issues.push({
        type: 'low-contrast',
        severity: 'moderate',
        description: `${lowContrastCount} elements may have insufficient color contrast (WCAG AA requires 4.5:1)`,
      });
      analysis.summary.moderate++;
    }
  });

  test.afterAll(async () => {
    // 결과 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'accessibility-info.json'),
      JSON.stringify(analysis, null, 2),
      'utf-8'
    );

    console.log('\n\n✅ 접근성 분석 완료');
    console.log(`📁 저장 위치: ${path.join(outputDir, 'accessibility-info.json')}`);
    console.log('\n📊 분석 요약:');
    console.log(`\n이슈 심각도:`);
    console.log(`  🔴 Critical: ${analysis.summary.critical}개`);
    console.log(`  🟠 Serious: ${analysis.summary.serious}개`);
    console.log(`  🟡 Moderate: ${analysis.summary.moderate}개`);
    console.log(`  🟢 Minor: ${analysis.summary.minor}개`);
    console.log(`\n총 이슈: ${analysis.issues.length}개`);
    console.log(`\n주요 발견 사항:`);
    console.log(`  이미지: ${analysis.checks.images.withoutAlt}개 alt 텍스트 누락`);
    console.log(`  폼: ${analysis.checks.forms.withoutLabels}개 레이블 누락`);
    console.log(`  링크: ${analysis.checks.links.emptyLinks}개 빈 링크`);
    console.log(`  버튼: ${analysis.checks.buttons.emptyButtons}개 빈 버튼`);
    console.log(`  H1: ${analysis.checks.headings.hasH1 ? '있음' : '없음'}`);
  });
});
