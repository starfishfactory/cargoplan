# Site Analyzer

Playwright + TypeScript 기반 웹사이트 분석 도구

## 📋 개요

이 도구는 Playwright를 사용하여 웹사이트를 자동으로 탐색하고 분석합니다.
- 페이지 구조 파악
- 메타 정보 수집
- 스크린샷 캡처
- UI/UX 요소 분석
- 반응형 디자인 검증
- 접근성 (a11y) 평가
- 성능 및 SEO 분석
- 상세 기능 명세 작성

## 🚀 설치

```bash
cd site-analyzer
npm install
npx playwright install chromium
```

## 📖 사용법

### 기본 테스트 실행

```bash
# 전체 테스트 실행
npm test

# Chromium만 실행
npm run test:chromium

# UI 모드로 실행 (디버깅에 유용)
npm run test:ui

# 특정 테스트 파일만 실행
npm run test:chromium -- tests/00-site-discovery.spec.ts
```

### 테스트 결과 확인

```bash
# HTML 리포트 보기
npm run test:report
```

## 📂 프로젝트 구조

```
site-analyzer/
├── tests/                    # Playwright 테스트 파일
│   └── 00-site-discovery.spec.ts
├── docs/                     # 분석 결과 문서
│   ├── SITE_ANALYSIS_PLAN.md    # 상세 분석 계획 (225개 TODO)
│   └── site-analysis/           # 분석 결과
│       ├── 01-site-overview.md
│       ├── 02-page-inventory.md
│       ├── site-info.json
│       └── screenshots/
├── playwright.config.ts      # Playwright 설정
├── tsconfig.json            # TypeScript 설정
└── package.json             # 프로젝트 의존성
```

## 📝 분석 문서

### 주요 문서
- **[SITE_ANALYSIS_PLAN.md](docs/SITE_ANALYSIS_PLAN.md)** - 225개 항목의 상세 TODO 체크리스트
- **[01-site-overview.md](docs/site-analysis/01-site-overview.md)** - 사이트 개요 및 기술 스택 분석
- **[02-page-inventory.md](docs/site-analysis/02-page-inventory.md)** - 페이지 목록 및 우선순위

### 생성되는 파일
- `docs/site-analysis/site-info.json` - 수집된 사이트 정보 (JSON)
- `docs/site-analysis/screenshots/` - 스크린샷 (데스크톱/모바일)

## 🧪 테스트 목록

### Phase 1: 기본 분석 (완료 ✅)
- `00-site-discovery.spec.ts` (6개) - 사이트 초기 탐색
- `01-navigation.spec.ts` (7개) - 네비게이션 구조
- `02-main-page.spec.ts` (6개) - 메인 페이지
- `03-dom-structure.spec.ts` (4개) - DOM 구조

### Phase 2: 페이지별 분석 (완료 ✅)
- `04-marketplace-dom.spec.ts` (5개) - 마켓플레이스 DOM
- `05-marketplace.spec.ts` (5개) - 마켓플레이스 기능
- `06-quote-dom.spec.ts` (5개) - Quote DOM
- `07-quote.spec.ts` (5개) - Quote 기능
- `08-blog-dom.spec.ts` (5개) - Blog DOM
- `09-blog.spec.ts` (4개) - Blog 기능
- `10-terms.spec.ts` (12개) - 약관 페이지

### Phase 3: 고급 분석 (완료 ✅)
- `11-responsive.spec.ts` (7개) - 반응형 디자인
- `12-accessibility.spec.ts` (8개) - 접근성 (WCAG 2.1)
- `13-performance-seo.spec.ts` (10개) - 성능 및 SEO

**총 테스트**: 96개 (모두 통과 ✅)

## 🔧 설정

### playwright.config.ts 주요 설정

```typescript
{
  baseURL: 'https://www.surff.kr',
  ignoreHTTPSErrors: true,  // SSL 인증서 오류 우회
  projects: [
    'chromium',
    'firefox',
    'webkit',
    'Mobile Chrome'
  ]
}
```

## 📊 분석 대상

현재 분석 중인 사이트: **www.surff.kr**
- 사이트 타입: B2B 해상 운송 비교 및 예약 플랫폼
- 기술 스택: Next.js, React, TypeScript
- 페이지 수: 6개

## 🎯 분석 완료

모든 주요 분석이 완료되었습니다:

1. [x] 네비게이션 구조 상세 분석
2. [x] 메인 페이지 요소별 분석
3. [x] 마켓플레이스 기능 분석
4. [x] 폼 요소 및 유효성 검사
5. [x] 인터랙티브 요소 (모달, 슬라이더 등)
6. [x] 반응형 디자인 검증 (4개 뷰포트)
7. [x] 접근성 (a11y) 평가 (WCAG 2.1)
8. [x] 성능 및 SEO 분석

### 📊 주요 발견 사항
- ⚠️ 약관 페이지 미구현
- ⚠️ 접근성 이슈 11개
- ⚠️ 로딩 시간 10.7초
- ⚠️ 페이지 크기 3.62MB
- ✅ Open Graph 설정
- ✅ 이미지 Alt 100%

## 🤝 기여

새로운 테스트나 분석 기능 추가 시:

1. `tests/` 폴더에 새 테스트 파일 생성 (`XX-feature-name.spec.ts`)
2. TDD 방식으로 테스트 작성
3. 테스트 실행 및 검증
4. `docs/` 폴더에 분석 결과 문서 생성

## 📄 라이선스

This project uses:
- Playwright (Apache-2.0 License)
- TypeScript (Apache-2.0 License)

---

**Created with**: Claude Code
**Last Updated**: 2025-10-27
