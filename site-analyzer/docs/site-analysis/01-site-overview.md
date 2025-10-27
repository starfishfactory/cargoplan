# www.surff.kr 사이트 개요

> **분석일**: 2025-10-27
> **분석 도구**: Playwright + TypeScript
> **테스트 브라우저**: Chromium

---

## 📋 기본 정보

### 사이트 정보
- **URL**: https://www.surff.kr/
- **사이트 타입**: B2B 물류 플랫폼 (해상 운송 비교 및 예약)
- **주요 언어**: 영어 (기본 경로가 /en)
- **문자 인코딩**: UTF-8
- **반응형 디자인**: ✅ 지원 (viewport meta 태그 확인됨)

### 페이지 메타 정보
```
타이틀: Marketplace - Freight Comparison & Booking

설명: Compare sea freight rates from global shipping companies
      and forwarders, and book at reasonable prices.

키워드:
- sea freight rates
- sea freight forecast
- sea freight inquiry
- sea freight calculation
- sea freight trends
- 40FT container sea freight
- 20FT container sea freight
```

### Open Graph (소셜 미디어 공유)
- **og:title**: Marketplace - Freight Comparison & Booking
- **og:description**: Compare sea freight rates from global shipping companies and forwarders...
- **og:image**: https://surff.kr/en/marketplace/opengraph-image.jpg?3b4f8fc26092f449

---

## 🗂️ 사이트 구조

### 발견된 페이지 (내부 링크: 6개)

1. **메인 페이지**
   - URL: `https://www.surff.kr/en`
   - 설명: 홈페이지

2. **블로그**
   - URL: `https://www.surff.kr/en/blog`
   - 설명: 블로그 / 뉴스 섹션

3. **마켓플레이스**
   - URL: `https://www.surff.kr/en/marketplace`
   - 설명: 해상 운임 비교 및 예약 마켓플레이스

4. **견적 페이지**
   - URL: `https://www.surff.kr/en/quote?pageNo=1`
   - 설명: 견적 조회 페이지 (페이지네이션 포함)

5. **개인정보 처리방침**
   - URL: `https://www.surff.kr/en/termPersonal`
   - 설명: 개인정보 처리방침

6. **이용약관**
   - URL: `https://www.surff.kr/en/termUse`
   - 설명: 서비스 이용약관

### 외부 링크
- 총 3개의 외부 링크 발견
- (소셜 미디어, 외부 서비스 등)

---

## 🎨 리소스 분석

### 이미지
- **총 개수**: 18개
- **주요 용도**: 로고, 아이콘, 일러스트레이션
- **접근성**: alt 텍스트 확인 필요

### 스크립트 파일
- **총 개수**: 11~12개
- **추정 기술**:
  - React/Next.js (경로 패턴으로 추정)
  - JavaScript 번들링 사용
  - 외부 라이브러리 포함 가능

### 스타일시트
- **총 개수**: 4개
- **스타일 방식**: CSS-in-JS 또는 모듈 CSS 추정

---

## 🖥️ 기술 스택 (추정)

### 프론트엔드
- **프레임워크**: Next.js (URL 구조와 파일 경로로 추정)
  - `/en/` 경로 구조 → i18n 지원
  - `opengraph-image.jpg?hash` → Next.js 이미지 최적화
- **언어**: TypeScript 가능성 높음
- **스타일링**: CSS Modules / Tailwind CSS / Styled Components 중 하나

### SEO 최적화
- ✅ 메타 디스크립션
- ✅ 키워드 설정
- ✅ Open Graph 태그 완비
- ✅ 의미있는 URL 구조
- ✅ 반응형 디자인

---

## 📱 화면 스크린샷

### 데스크톱 뷰
- 전체 페이지: `screenshots/desktop-home-full.png` (614 KB)
- 초기 뷰포트: `screenshots/desktop-home-viewport.png` (362 KB)

### 모바일 뷰 (375x667)
- 전체 페이지: `screenshots/mobile-home-full.png` (307 KB)
- 초기 뷰포트: `screenshots/mobile-home-viewport.png` (63 KB)

---

## 🎯 사이트 목적 및 타겟 사용자

### 주요 기능
1. **해상 운임 비교** - 여러 선사 및 포워더의 운임 비교
2. **온라인 예약** - 합리적인 가격으로 직접 예약
3. **견적 조회** - 운송 견적 요청 및 조회
4. **시장 정보** - 해상 운임 동향 및 예측 정보

### 타겟 사용자
- **수출입 업체** - 화물 운송이 필요한 기업
- **물류 담당자** - 운송 비용 최적화를 원하는 실무자
- **포워더** - 서비스를 제공하고자 하는 물류 업체

### 비즈니스 모델
- B2B 마켓플레이스 플랫폼
- 화물 운송 중개 서비스
- 컨테이너 운송 (20FT, 40FT) 특화

---

## 📊 초기 분석 요약

| 항목 | 수치 | 상태 |
|------|------|------|
| 내부 페이지 | 6개 | ✅ 구조 단순 |
| 외부 링크 | 3개 | ✅ 적정 |
| 이미지 | 18개 | ⚠️ alt 확인 필요 |
| 스크립트 | 11~12개 | ⚠️ 번들 크기 확인 필요 |
| 스타일시트 | 4개 | ✅ 적정 |
| 반응형 | 지원 | ✅ |
| SEO | 최적화됨 | ✅ |

---

## ⏭️ 다음 단계 분석 항목

1. ✅ **사이트 기본 구조 파악** (완료)
2. 🔄 **네비게이션 구조 분석** (진행 예정)
   - 헤더 메뉴
   - 푸터 링크
   - 모바일 메뉴
3. 🔄 **메인 페이지 상세 분석**
   - Hero 섹션
   - 주요 콘텐츠 영역
   - CTA 버튼 및 링크
4. 🔄 **각 페이지별 상세 분석**
   - Marketplace
   - Blog
   - Quote
   - Terms
5. 🔄 **인터랙티브 요소**
   - 폼 (검색, 견적 요청)
   - 모달/팝업
   - 필터링 기능
6. 🔄 **반응형 동작 검증**
   - 다양한 뷰포트 테스트
   - 터치 인터랙션
7. 🔄 **접근성 평가**
   - 키보드 네비게이션
   - 스크린 리더 호환성
   - 색상 대비

---

**문서 작성**: Claude Code
**최종 업데이트**: 2025-10-27
**상태**: 초기 탐색 완료 ✅