# Site Analyzer

Playwright + TypeScript 기반 웹사이트 분석 도구

## 📋 개요

이 도구는 Playwright를 사용하여 웹사이트를 자동으로 탐색하고 분석합니다.
- 페이지 구조 파악
- 메타 정보 수집
- 스크린샷 캡처
- UI/UX 요소 분석
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

### 현재 구현된 테스트

#### `00-site-discovery.spec.ts` - 사이트 초기 탐색
- [x] 메인 페이지 접속 및 기본 정보 수집
- [x] 모든 링크 수집 및 분류 (내부/외부)
- [x] 이미지 정보 수집 (src, alt)
- [x] 스크립트 및 스타일시트 수집
- [x] 데스크톱 스크린샷 캡처 (전체/뷰포트)
- [x] 모바일 스크린샷 캡처 (375x667)

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

## 🎯 다음 단계

`docs/SITE_ANALYSIS_PLAN.md` 체크리스트를 따라 추가 분석 예정:

1. [ ] 네비게이션 구조 상세 분석
2. [ ] 메인 페이지 요소별 분석
3. [ ] 마켓플레이스 기능 분석
4. [ ] 폼 요소 및 유효성 검사
5. [ ] 인터랙티브 요소 (모달, 슬라이더 등)
6. [ ] 반응형 디자인 검증
7. [ ] 접근성 (a11y) 평가
8. [ ] 성능 및 SEO 분석

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
