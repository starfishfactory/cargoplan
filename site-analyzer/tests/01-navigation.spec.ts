import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 네비게이션 구조 분석 테스트
 * www.surff.kr 사이트의 헤더, 푸터, 메뉴 구조를 분석합니다.
 */

interface NavigationInfo {
  timestamp: string;
  header: {
    logo: {
      exists: boolean;
      src?: string;
      alt?: string;
      link?: string;
    };
    menuItems: Array<{
      text: string;
      href: string;
      hasDropdown: boolean;
    }>;
    searchBox?: {
      exists: boolean;
      placeholder?: string;
    };
    userMenu?: {
      loginButton?: string;
      signupButton?: string;
    };
  };
  footer: {
    companyInfo: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
    };
    footerLinks: Array<{
      text: string;
      href: string;
    }>;
    socialMedia: Array<{
      platform: string;
      href: string;
    }>;
    copyright?: string;
  };
  mobile: {
    hamburgerMenu: boolean;
    mobileMenuWorks: boolean;
  };
}

test.describe('네비게이션 구조 분석', () => {
  let navInfo: NavigationInfo;

  test.beforeAll(async () => {
    navInfo = {
      timestamp: new Date().toISOString(),
      header: {
        logo: { exists: false },
        menuItems: [],
      },
      footer: {
        companyInfo: {},
        footerLinks: [],
        socialMedia: [],
      },
      mobile: {
        hamburgerMenu: false,
        mobileMenuWorks: false,
      },
    };
  });

  test('헤더 - 로고 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 로고 찾기 (일반적인 셀렉터들 시도)
    const logoSelectors = [
      'header img',
      '.logo img',
      'a[href="/"] img',
      'a[href="/en"] img',
      '[class*="logo"] img',
      'nav img',
    ];

    for (const selector of logoSelectors) {
      const logo = page.locator(selector).first();
      if (await logo.count() > 0) {
        navInfo.header.logo.exists = true;
        navInfo.header.logo.src = await logo.getAttribute('src') || undefined;
        navInfo.header.logo.alt = await logo.getAttribute('alt') || undefined;

        // 로고를 감싸는 링크 찾기
        const parentLink = logo.locator('xpath=ancestor::a[1]');
        if (await parentLink.count() > 0) {
          navInfo.header.logo.link = await parentLink.getAttribute('href') || undefined;
        }

        console.log('🏷️  로고 발견:', {
          src: navInfo.header.logo.src,
          alt: navInfo.header.logo.alt,
          link: navInfo.header.logo.link,
        });
        break;
      }
    }

    if (!navInfo.header.logo.exists) {
      console.log('⚠️  로고를 찾을 수 없습니다.');
    }
  });

  test('헤더 - 메인 메뉴 항목 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 네비게이션 메뉴 찾기
    const navSelectors = [
      'header nav a',
      'nav a',
      '.navigation a',
      '.menu a',
      '[role="navigation"] a',
      'header ul li a',
    ];

    for (const selector of navSelectors) {
      const menuLinks = page.locator(selector);
      const count = await menuLinks.count();

      if (count > 0) {
        console.log(`📍 메뉴 링크 ${count}개 발견 (${selector})`);

        for (let i = 0; i < count; i++) {
          const link = menuLinks.nth(i);
          const text = (await link.textContent())?.trim() || '';
          const href = await link.getAttribute('href') || '';

          // 빈 텍스트나 중복 제외
          if (text && !navInfo.header.menuItems.some(item => item.text === text)) {
            // 드롭다운 여부 확인
            const parent = link.locator('xpath=parent::*');
            const hasDropdown = await parent.locator('ul, .dropdown, .submenu').count() > 0;

            navInfo.header.menuItems.push({
              text,
              href,
              hasDropdown,
            });
          }
        }

        break;
      }
    }

    console.log(`\n📋 메인 메뉴 항목 (${navInfo.header.menuItems.length}개):`);
    navInfo.header.menuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.text} → ${item.href}${item.hasDropdown ? ' (드롭다운 있음)' : ''}`);
    });
  });

  test('헤더 - 검색 기능 확인', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 검색 박스 찾기
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="검색" i]',
      '.search input',
      '[role="search"] input',
    ];

    for (const selector of searchSelectors) {
      const searchInput = page.locator(selector).first();
      if (await searchInput.count() > 0) {
        navInfo.header.searchBox = {
          exists: true,
          placeholder: await searchInput.getAttribute('placeholder') || undefined,
        };
        console.log('🔍 검색 기능 발견:', navInfo.header.searchBox);
        break;
      }
    }

    if (!navInfo.header.searchBox) {
      console.log('ℹ️  검색 기능 없음');
    }
  });

  test('헤더 - 로그인/회원가입 버튼 확인', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 로그인 버튼 찾기
    const loginSelectors = [
      'a:has-text("Login")',
      'a:has-text("Sign in")',
      'a:has-text("로그인")',
      'button:has-text("Login")',
      'button:has-text("로그인")',
    ];

    for (const selector of loginSelectors) {
      const loginBtn = page.locator(selector).first();
      if (await loginBtn.count() > 0) {
        const href = await loginBtn.getAttribute('href');
        if (href) {
          navInfo.header.userMenu = navInfo.header.userMenu || {};
          navInfo.header.userMenu.loginButton = href;
          console.log('🔐 로그인 버튼:', href);
        }
        break;
      }
    }

    // 회원가입 버튼 찾기
    const signupSelectors = [
      'a:has-text("Sign up")',
      'a:has-text("Register")',
      'a:has-text("회원가입")',
      'button:has-text("Sign up")',
      'button:has-text("회원가입")',
    ];

    for (const selector of signupSelectors) {
      const signupBtn = page.locator(selector).first();
      if (await signupBtn.count() > 0) {
        const href = await signupBtn.getAttribute('href');
        if (href) {
          navInfo.header.userMenu = navInfo.header.userMenu || {};
          navInfo.header.userMenu.signupButton = href;
          console.log('✍️  회원가입 버튼:', href);
        }
        break;
      }
    }

    if (!navInfo.header.userMenu) {
      console.log('ℹ️  로그인/회원가입 버튼 없음 (또는 찾을 수 없음)');
    }
  });

  test('푸터 - 회사 정보 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 푸터 영역 찾기
    const footer = page.locator('footer, .footer, [role="contentinfo"]').first();

    if (await footer.count() > 0) {
      const footerText = await footer.textContent() || '';

      // 이메일 추출
      const emailMatch = footerText.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        navInfo.footer.companyInfo.email = emailMatch[0];
        console.log('📧 이메일:', emailMatch[0]);
      }

      // 전화번호 추출 (다양한 패턴)
      const phoneMatch = footerText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/);
      if (phoneMatch) {
        navInfo.footer.companyInfo.phone = phoneMatch[0];
        console.log('📞 전화번호:', phoneMatch[0]);
      }

      // 회사명 추출 (일반적으로 푸터 첫 부분에 있음)
      const companySelectors = [
        'footer .company-name',
        'footer h3',
        'footer strong',
        'footer b',
      ];

      for (const selector of companySelectors) {
        const companyElement = footer.locator(selector).first();
        if (await companyElement.count() > 0) {
          navInfo.footer.companyInfo.name = (await companyElement.textContent())?.trim();
          if (navInfo.footer.companyInfo.name) {
            console.log('🏢 회사명:', navInfo.footer.companyInfo.name);
            break;
          }
        }
      }

      console.log('\n📄 푸터 전체 텍스트 (일부):');
      console.log(footerText.substring(0, 300) + '...');
    } else {
      console.log('⚠️  푸터를 찾을 수 없습니다.');
    }
  });

  test('푸터 - 링크 및 소셜 미디어 분석', async ({ page }) => {
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('footer, .footer').first();

    if (await footer.count() > 0) {
      // 푸터 링크 수집
      const footerLinks = footer.locator('a');
      const linkCount = await footerLinks.count();

      for (let i = 0; i < linkCount; i++) {
        const link = footerLinks.nth(i);
        const text = (await link.textContent())?.trim() || '';
        const href = await link.getAttribute('href') || '';

        if (text && href && !href.startsWith('#')) {
          // 소셜 미디어인지 확인
          const socialPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'github'];
          const isSocial = socialPlatforms.some(platform =>
            href.toLowerCase().includes(platform) || text.toLowerCase().includes(platform)
          );

          if (isSocial) {
            const platform = socialPlatforms.find(p =>
              href.toLowerCase().includes(p) || text.toLowerCase().includes(p)
            ) || 'unknown';
            navInfo.footer.socialMedia.push({ platform, href });
          } else {
            navInfo.footer.footerLinks.push({ text, href });
          }
        }
      }

      console.log(`\n🔗 푸터 링크 (${navInfo.footer.footerLinks.length}개):`);
      navInfo.footer.footerLinks.forEach((link, index) => {
        console.log(`  ${index + 1}. ${link.text} → ${link.href}`);
      });

      if (navInfo.footer.socialMedia.length > 0) {
        console.log(`\n📱 소셜 미디어 (${navInfo.footer.socialMedia.length}개):`);
        navInfo.footer.socialMedia.forEach((social, index) => {
          console.log(`  ${index + 1}. ${social.platform} → ${social.href}`);
        });
      }

      // 저작권 표시 찾기
      const copyrightText = await footer.textContent() || '';
      const copyrightMatch = copyrightText.match(/©\s*\d{4}.*?(?:\.|$)/);
      if (copyrightMatch) {
        navInfo.footer.copyright = copyrightMatch[0].trim();
        console.log('\n©️  저작권:', navInfo.footer.copyright);
      }
    }
  });

  test('모바일 - 햄버거 메뉴 확인', async ({ page }) => {
    // 모바일 뷰포트로 설정
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://www.surff.kr/');
    await page.waitForLoadState('networkidle');

    // 햄버거 메뉴 버튼 찾기
    const hamburgerSelectors = [
      'button.hamburger',
      'button.menu-toggle',
      '.mobile-menu-button',
      'button[aria-label*="menu" i]',
      '[class*="burger"]',
      'button:has(span:has-text("☰"))',
    ];

    for (const selector of hamburgerSelectors) {
      const hamburger = page.locator(selector).first();
      if (await hamburger.count() > 0 && await hamburger.isVisible()) {
        navInfo.mobile.hamburgerMenu = true;
        console.log('🍔 햄버거 메뉴 발견:', selector);

        // 클릭하여 메뉴 열기 테스트
        try {
          await hamburger.click();
          await page.waitForTimeout(500); // 애니메이션 대기

          // 모바일 메뉴가 나타났는지 확인
          const mobileMenuSelectors = [
            '.mobile-menu',
            '.menu-open',
            '[aria-expanded="true"]',
            'nav[style*="display: block"]',
          ];

          for (const menuSelector of mobileMenuSelectors) {
            if (await page.locator(menuSelector).first().isVisible()) {
              navInfo.mobile.mobileMenuWorks = true;
              console.log('✅ 모바일 메뉴 동작 확인');
              break;
            }
          }
        } catch (error) {
          console.log('⚠️  모바일 메뉴 클릭 실패:', error);
        }

        break;
      }
    }

    if (!navInfo.mobile.hamburgerMenu) {
      console.log('ℹ️  햄버거 메뉴 없음 (또는 찾을 수 없음)');
    }
  });

  test.afterAll(async () => {
    // 수집한 정보를 JSON 파일로 저장
    const outputDir = path.join(process.cwd(), 'docs', 'site-analysis');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'navigation-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(navInfo, null, 2), 'utf-8');

    console.log('\n✅ 네비게이션 정보 저장 완료');
    console.log(`📁 저장 위치: ${outputPath}`);
    console.log('\n📊 분석 요약:');
    console.log(`  - 로고: ${navInfo.header.logo.exists ? '있음' : '없음'}`);
    console.log(`  - 메뉴 항목: ${navInfo.header.menuItems.length}개`);
    console.log(`  - 검색 기능: ${navInfo.header.searchBox?.exists ? '있음' : '없음'}`);
    console.log(`  - 로그인/회원가입: ${navInfo.header.userMenu ? '있음' : '없음'}`);
    console.log(`  - 푸터 링크: ${navInfo.footer.footerLinks.length}개`);
    console.log(`  - 소셜 미디어: ${navInfo.footer.socialMedia.length}개`);
    console.log(`  - 햄버거 메뉴: ${navInfo.mobile.hamburgerMenu ? '있음' : '없음'}`);
  });
});
