# www.surff.kr 메인 페이지 분석 (개선판)

> **분석일**: 2025-10-27
> **테스트 파일**: `tests/02-main-page.spec.ts` (개선 후)
> **테스트 결과**: 6개 테스트 모두 통과 ✅
> **분석 방법**: 실제 DOM 구조 파악 후 셀렉터 개선

---

## 📋 개요

www.surff.kr 메인 페이지는 **MARKET PLACE 중심의 기능형 페이지**입니다.

- 페이지 타입: B2B 운임 비교 플랫폼
- 주요 기능: 지역별 운임 검색 및 비교
- 디자인 특성: 마케팅 요소 최소화, 기능 우선

---

## 🎯 Hero/메인 섹션

### 구조

- **상태**: ✅ 발견됨 (실제로는 `section:nth-of-type(2)`)
- **위치**: 페이지의 두 번째 `<section>` 태그
- **특징**: 전통적인 "Hero" 형태가 아닌 기능 중심 마켓플레이스

### 콘텐츠

#### 제목
- **메인 제목**: `MARKET PLACE` (h3)
- **부제목**: `Market Place Container Space Marketplace` (h3)

#### 배경 이미지
- **존재**: ✅ 있음
- **경로**: `/_next/image?url=%2Fimages%2Fmarketplace%2Fbg_marketplace.jpg&w=1920&q=75`
- **타입**: Next.js 최적화 이미지

#### CTA 버튼

| 순번 | 버튼 텍스트 | 역할 |
|------|------------|------|
| 1 | **Please select container type.** | 컨테이너 타입 선택 |
| 2 | **North/South America** | 지역 필터 |
| 3 | **Asia/Oceania** | 지역 필터 |
| 4 | **Europe** | 지역 필터 |
| 5 | **Middle East/Africa** | 지역 필터 |

**총 5개 CTA 버튼**

---

## 📦 콘텐츠 섹션

### 전체 구조

페이지는 **2개의 section 태그**로 구성:

#### 섹션 1: 알림 영역
- **제목**: (제목 없음)
- **내용**: "알림이 없습니다" 메시지
- **이미지**: 0개
- **버튼**: 0개
- **역할**: 사용자 알림 표시

#### 섹션 2: MARKET PLACE (메인 콘텐츠)
- **제목**: `MARKET PLACE` (h3)
- **설명**: `Book a new shipment` (h6)
- **이미지**: 17개
  - 배경 이미지: 1개
  - 선사 로고: 12개 (MAERSK 등)
  - 기타 이미지: 4개
- **버튼**: 5개
  - 컨테이너 타입 선택
  - 지역별 필터 (4개)

---

## 🎨 주요 기능/특징

### 발견된 기능 (6개)

#### 1. 지역별 필터 (4개)

| 지역 | 설명 |
|------|------|
| **North/South America** | 남북미 지역 운임 정보 |
| **Asia/Oceania** | 아시아/오세아니아 지역 |
| **Europe** | 유럽 지역 |
| **Middle East/Africa** | 중동/아프리카 지역 |

#### 2. Search 기능
- **설명**: 운임 검색 기능
- **타입**: 버튼
- **CSS 클래스**: `marketplace_main_search` (실제 의미있는 클래스명)

#### 3. More View 기능
- **개수**: 6개 항목
- **설명**: 각 운임 정보의 상세 내용 확인
- **역할**: 상세 정보 모달 또는 페이지 열기

---

## 🔘 CTA (Call-to-Action) 버튼

### 전체 CTA 버튼 (6개)

| 버튼 | 위치 | 역할 |
|------|------|------|
| **North/South America** | MARKET PLACE (Filters) | 지역 필터 |
| **Asia/Oceania** | MARKET PLACE (Filters) | 지역 필터 |
| **Europe** | MARKET PLACE (Filters) | 지역 필터 |
| **Middle East/Africa** | MARKET PLACE (Filters) | 지역 필터 |
| **More View (6개)** | MARKET PLACE (Details) | 상세 정보 |
| **Select Container Type** | MARKET PLACE (Search Form) | 폼 입력 |

### CTA 특징

- ✅ **기능 중심**: 마케팅 CTA가 아닌 실제 기능 버튼
- ✅ **명확한 역할**: 각 버튼이 명확한 기능 수행
- ❌ **마케팅 요소**: "Sign Up", "Get Started" 같은 전환 유도 없음

---

## 📊 통계/수치 정보

- **상태**: ❌ 없음
- **분석**: B2B 플랫폼 특성상 통계 정보 최소화

---

## 💬 고객 후기/리뷰

- **상태**: ❌ 없음
- **분석**: B2B 특성상 메인 페이지에 후기 미노출

---

## 🔍 기술적 분석

### DOM 구조

```
페이지 루트
├─ section (알림 영역)
│  └─ "알림이 없습니다"
│
└─ section.css-z9wbo8 (메인 콘텐츠)
   ├─ h3: MARKET PLACE
   ├─ h3: Market Place Container Space Marketplace
   ├─ h6: Book a new shipment
   ├─ img (배경 이미지)
   ├─ button (컨테이너 선택)
   ├─ button × 4 (지역 필터)
   ├─ button: Search
   ├─ button × 6 (More View)
   └─ img × 16 (선사 로고 등)
```

### CSS 프레임워크

**Emotion (CSS-in-JS)**로 추정

- 동적 클래스명: `css-z9wbo8`, `css-12dcmw3`, `e1xr8nzm4`
- 일부 의미있는 클래스: `marketplace_main_search`
- 자동 생성 클래스가 대부분

### 셀렉터 전략

이 사이트를 분석하려면:

1. **CSS 클래스명 사용 불가**: 동적 생성으로 불안정
2. **Semantic HTML 제한적**: `<main>` 태그 없음
3. **추천 방법**:
   - `section:nth-of-type(n)` - 순서 기반
   - 텍스트 기반 필터: `filter({ hasText: 'Search' })`
   - 태그 기반: `h3`, `h6`, `button`
   - 일부 안정적 클래스: `marketplace_main_search`

---

## 📸 이미지 분석

### 총 17개 이미지

#### 배경 이미지 (1개)
- `bg_marketplace.jpg` - 메인 배경

#### 선사 로고 (12개)
- MAERSK 로고 반복 (12회)
- CMS에서 동적으로 로드: `https://cms.surff.kr/uploadFile/companyImage/...`

#### 기타 이미지 (4개)
- Liner 이미지 등

---

## 📊 분석 전후 비교

| 항목 | 초기 분석 | 개선 후 |
|------|----------|---------|
| Hero 섹션 | ❌ 찾을 수 없음 | ✅ 발견 |
| 메인 제목 | ❌ 없음 | ✅ "MARKET PLACE" |
| 부제목 | ❌ 없음 | ✅ "Market Place Container..." |
| Hero CTA 버튼 | 0개 | **5개** ✅ |
| 콘텐츠 섹션 | 0개 | **2개** ✅ |
| 주요 기능 | 0개 | **6개** ✅ |
| CTA 버튼 | 0개 | **6개** ✅ |

**개선율**: 0% → 100% 🎉

---

## 💡 개선 방법론

### 1단계: DOM 구조 파악
- `tests/03-dom-structure.spec.ts` 작성
- 페이지 HTML 소스 저장
- CSS 클래스 패턴 분석
- 텍스트 콘텐츠 추출

### 2단계: 실제 구조 기반 셀렉터 작성
- `section:nth-of-type(2)` 사용
- `h3`, `h6`, `button` 태그 기반
- 텍스트 필터 활용: `filter({ hasText: ... })`

### 3단계: 테스트 재실행
- 모든 테스트 통과 ✅
- 실제 콘텐츠 수집 성공

---

## 🎯 핵심 발견사항

### 페이지 특성

1. **기능 우선 디자인**
   - 마케팅 요소 최소화
   - 실제 서비스(검색, 필터) 즉시 제공

2. **B2B 플랫폼 특성**
   - 고객 후기 없음
   - 통계 정보 없음
   - CTA가 기능 버튼

3. **기술 스택**
   - Next.js (SSR/SSG)
   - Emotion (CSS-in-JS)
   - React 기반

### 사용자 플로우

```
홈페이지 진입
    ↓
컨테이너 타입 선택
    ↓
지역 필터 선택 (4개 중 1개)
    ↓
Search 버튼 클릭
    ↓
운임 목록 표시
    ↓
More View로 상세 확인
```

---

## 🔄 다른 페이지 분석에 적용

이번에 개발한 **DOM 구조 파악 → 셀렉터 개선** 방법론을 다음 페이지에 적용:

1. ✅ **메인 페이지** (완료 - 개선됨)
2. 🔄 **Marketplace 페이지** - 다음 적용 대상
3. **Quote 페이지**
4. **Blog 페이지**

### 재사용 가능한 패턴

```typescript
// 1. section 기반 선택
const mainSection = page.locator('section').nth(1);

// 2. 텍스트 필터 활용
const searchBtn = page.locator('button').filter({ hasText: 'Search' });

// 3. 정규표현식 필터
const regionBtns = page.locator('button').filter({
  hasText: /America|Asia|Europe|Africa/
});

// 4. 순차적 요소 추출
const headings = await section.locator('h3').all();
```

---

## 📝 테스트 커버리지

| 테스트 항목 | 결과 | 발견 항목 |
|-------------|------|-----------|
| Hero/메인 섹션 분석 | ✅ | 제목, 부제목, 배경, 5개 CTA |
| 콘텐츠 섹션 분석 | ✅ | 2개 섹션, 17개 이미지 |
| 주요 기능/특징 분석 | ✅ | 6개 기능 |
| 통계/수치 정보 분석 | ✅ | 0개 (정상) |
| 고객 후기/리뷰 확인 | ✅ | 0개 (정상) |
| CTA 버튼 수집 | ✅ | 6개 CTA |
| **총계** | **6/6 통과** | **15.0s** |

---

## 📚 관련 파일

### 테스트 파일
- `tests/02-main-page.spec.ts` - 메인 페이지 분석 (개선판)
- `tests/03-dom-structure.spec.ts` - DOM 구조 분석 도구

### 분석 데이터
- `docs/site-analysis/.tmp/main-page-source.html` - 페이지 HTML 소스
- `docs/site-analysis/.tmp/sections.json` - 섹션 구조
- `docs/site-analysis/.tmp/text-content.json` - 텍스트 콘텐츠
- `docs/site-analysis/.tmp/css-classes.json` - CSS 클래스 패턴

### 문서
- `docs/site-analysis/04-main-page.md` - 본 문서
- `docs/site-analysis/main-page-info.json` - 구조화된 분석 결과

---

**문서 작성**: Claude Code
**최종 업데이트**: 2025-10-27
**상태**: 메인 페이지 분석 완료 (개선판) ✅
