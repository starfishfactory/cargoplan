# www.surff.kr Marketplace 페이지 분석

> **분석일**: 2025-10-27
> **테스트 파일**: `tests/05-marketplace.spec.ts`
> **테스트 결과**: 6개 테스트 모두 통과 ✅
> **URL**: https://www.surff.kr/en/marketplace

---

## 📋 개요

Marketplace 페이지는 **운임 비교 및 예약을 위한 핵심 기능 페이지**입니다.

- **제목**: Marketplace - Freight Comparison & Booking
- **설명**: Compare sea freight rates from global shipping companies and forwarders, and book at reasonable prices.
- **타입**: B2B 운임 비교 플랫폼
- **특징**: 검색 폼 + 지역 필터 + 실시간 운임 정보

---

## 🎯 페이지 구조

### 메인 페이지와의 유사성

Marketplace 페이지는 메인 페이지(`/`)와 **거의 동일한 구조**를 가지고 있습니다:

| 특징 | 메인 페이지 | Marketplace |
|------|------------|-------------|
| 섹션 수 | 2개 | 2개 |
| 알림 영역 | ✅ | ✅ |
| 메인 콘텐츠 | MARKET PLACE | MARKET PLACE |
| 이미지 수 | 17개 | 17개 |
| 입력 필드 | 2개 | **4개** ⭐ |
| 버튼 수 | 7개 | 7개 |

**주요 차이점**: 입력 필드가 2개 → 4개로 증가 (POL, POD 추가)

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
   │
   ├─ 검색 폼
   │  ├─ input: POL (Port of Loading)
   │  ├─ input: POD (Port of Discharge)
   │  ├─ button: Container Type 선택
   │  └─ button: Search
   │
   ├─ 지역 필터 (4개)
   │  ├─ North/South America
   │  ├─ Asia/Oceania
   │  ├─ Europe
   │  └─ Middle East/Africa
   │
   ├─ 운임 결과 (6개 카드)
   │  └─ More View 버튼
   │
   └─ 선사 로고 (17개 이미지)
      └─ MAERSK 등
```

---

## 🔍 검색 폼

### 완성도: 4/4 ✅

Marketplace 페이지의 핵심 기능인 검색 폼이 **완전히 구현**되어 있습니다.

#### 1. POL (Port of Loading) 입력

- **Placeholder**: "Please select POL."
- **역할**: 출발지 항구 선택
- **타입**: 입력 필드 (아마도 자동완성 또는 드롭다운)

#### 2. POD (Port of Discharge) 입력

- **Placeholder**: "Please select POD."
- **역할**: 도착지 항구 선택
- **타입**: 입력 필드 (아마도 자동완성 또는 드롭다운)

#### 3. 컨테이너 타입 선택

- **텍스트**: "Please select container type."
- **역할**: 컨테이너 종류 선택 (20ft, 40ft, 40HC 등)
- **타입**: 버튼 (클릭 시 옵션 표시)

#### 4. Search 버튼

- **텍스트**: "Search"
- **역할**: 검색 실행
- **타입**: Primary CTA 버튼
- **CSS 클래스**: `marketplace_main_search`

### 검색 프로세스

```
사용자 입력
    ↓
1. POL 선택 (예: Busan)
    ↓
2. POD 선택 (예: Los Angeles)
    ↓
3. 컨테이너 타입 선택 (예: 40HC)
    ↓
4. Search 버튼 클릭
    ↓
운임 결과 표시 (6개 카드)
```

---

## 🌍 지역 필터

### 4개 지역 필터

운임 정보를 지역별로 필터링할 수 있습니다:

| 순번 | 필터명 | 커버 지역 |
|------|--------|-----------|
| 1 | **North/South America** | 남북미 대륙 |
| 2 | **Asia/Oceania** | 아시아 + 오세아니아 |
| 3 | **Europe** | 유럽 |
| 4 | **Middle East/Africa** | 중동 + 아프리카 |

### 필터 특징

- ✅ **전세계 커버**: 4개 필터로 전세계 주요 지역 커버
- ✅ **명확한 분류**: 직관적인 지역 구분
- 🔘 **버튼 형태**: 클릭으로 활성화/비활성화

---

## 📊 운임 결과 표시

### 표시 방식: 카드 형태

- **타입**: 카드 (Card) 레이아웃
- **개수**: 6개 운임 항목
- **액션**: "More View" 버튼으로 상세 정보 확인

### 카드 정보 추정

각 카드에 포함될 것으로 추정되는 정보:

1. **선사/포워더명**
2. **출발지 → 도착지**
3. **운임 가격**
4. **운송 기간**
5. **컨테이너 타입**
6. **More View 버튼**

### 페이지네이션

- **상태**: ❌ 없음 (또는 찾을 수 없음)
- **분석**: 6개 항목만 표시하거나, 무한 스크롤 방식 가능성

---

## 🚢 선사/포워더

### 확인된 선사

**MAERSK** (마스크 라인)

- **로고**: ✅ 있음
- **이미지 경로**: `https://cms.surff.kr/uploadFile/companyImage/MFH8YMhh.png`
- **특징**: 세계 최대 컨테이너 선사 중 하나

### 총 이미지 수

- **17개 이미지** (메인 페이지와 동일)
- 배경 이미지 1개 + 선사 로고 등 16개

---

## 🎯 주요 기능

### 1. 운임 검색 (POL/POD 기반) ⭐

- **방법**: 출발지와 도착지 항구 입력
- **추가 옵션**: 컨테이너 타입 선택
- **결과**: 실시간 운임 정보 제공

### 2. 컨테이너 타입 선택

- **역할**: 다양한 컨테이너 규격 지원
- **예상 옵션**: 20ft, 40ft, 40HC, 45HC 등

### 3. 지역별 필터 (4개)

- **4개 주요 지역으로 분류**
- **빠른 필터링** 지원

### 4. 실시간 운임 비교 (6개 항목)

- **여러 선사/포워더** 비교
- **투명한 가격 정보** 제공

### 5. 상세 정보 확인 (More View)

- **각 운임 항목별** More View 버튼
- **상세 스케줄 및 조건** 확인 가능

---

## 📝 입력 필드 상세

### 발견된 입력 필드 (4개)

| 순번 | Placeholder | 역할 |
|------|-------------|------|
| 1 | **검색어를 입력하세요** | 헤더 검색 (네비게이션) |
| 2 | **Please select POL.** | 출발지 항구 ⭐ |
| 3 | **Please select POD.** | 도착지 항구 ⭐ |
| 4 | **Enter email to subscribe to newsletter** | 뉴스레터 구독 (푸터) |

**핵심 기능**: 2, 3번 (POL/POD)

---

## 🔘 버튼 분석

### 총 32개 버튼

주요 버튼 분류:

#### 1. 검색 관련 (7개)
- Search (Primary CTA)
- Container Type 선택
- POL/POD 입력 보조
- 지역 필터 4개

#### 2. More View (6개)
- 각 운임 카드별 1개

#### 3. UI 제어
- Close (모달/알림 닫기)
- EN (언어 선택)
- × (닫기 아이콘)

---

## 💡 사용자 경험 (UX)

### 검색 플로우

```
페이지 진입
    ↓
검색 폼 작성
  ├─ POL 입력
  ├─ POD 입력
  └─ 컨테이너 타입 선택
    ↓
Search 버튼 클릭
    ↓
운임 결과 표시 (6개)
    ↓
More View로 상세 확인
    ↓
예약 또는 문의
```

### 필터 사용 플로우

```
페이지 진입
    ↓
지역 필터 선택
  (예: Asia/Oceania)
    ↓
해당 지역 운임만 표시
    ↓
검색 또는 More View
```

---

## 🎨 디자인 특징

### 장점 ✅

1. **간결한 검색 폼**: 필수 정보만 입력
2. **명확한 CTA**: Search 버튼이 뚜렷함
3. **직관적 필터**: 4개 지역으로 단순화
4. **카드 레이아웃**: 운임 정보 비교 용이
5. **반응형**: 모바일에서도 사용 가능

### 개선 가능 사항 💡

1. **페이지네이션**: 더 많은 결과 표시 필요
2. **정렬 기능**: 가격순, 기간순 정렬
3. **필터 확장**: 출발일, 선사 선택 등
4. **비교 기능**: 여러 운임 동시 비교
5. **저장/즐겨찾기**: 자주 찾는 노선 저장

---

## 🔄 메인 페이지와 비교

| 항목 | 메인 페이지 | Marketplace |
|------|------------|-------------|
| **URL** | `/` | `/en/marketplace` |
| **제목** | Marketplace - ... | Marketplace - ... |
| **구조** | 2개 섹션 | 2개 섹션 (동일) |
| **입력 필드** | 2개 | **4개** (POL/POD 추가) |
| **검색 폼** | 기본 | **완전** ⭐ |
| **지역 필터** | 4개 | 4개 (동일) |
| **운임 결과** | 6개 | 6개 (동일) |
| **목적** | 소개 + 검색 | 검색 + 비교 |

### 주요 차이점

**Marketplace 페이지만의 특징**:
- ✅ POL/POD 입력 필드 추가
- ✅ 검색 폼 완전 구현
- ✅ 메타 설명 더 상세함

**가능성**: 메인 페이지(`/`)가 자동으로 Marketplace로 리다이렉트되거나, 동일한 컴포넌트를 공유할 가능성

---

## 📊 테스트 커버리지

| 테스트 항목 | 결과 | 발견 항목 |
|-------------|------|-----------|
| 페이지 기본 정보 수집 | ✅ | 제목, 설명, URL |
| 검색 폼 분석 | ✅ | 4/4 완성 (POL, POD, Type, Search) |
| 지역 필터 분석 | ✅ | 4개 필터 |
| 운임 결과 표시 방식 | ✅ | 카드 형태, 6개 항목 |
| 선사/포워더 로고 수집 | ✅ | MAERSK 확인, 17개 이미지 |
| 주요 기능 요약 | ✅ | 5개 핵심 기능 |
| **총계** | **6/6 통과** | **15.5s** |

---

## 📚 관련 파일

### 테스트 파일
- `tests/04-marketplace-dom.spec.ts` - DOM 구조 분석
- `tests/05-marketplace.spec.ts` - 상세 기능 분석

### 분석 데이터
- `docs/site-analysis/.tmp/marketplace-source.html` - 페이지 HTML (373KB)
- `docs/site-analysis/.tmp/marketplace-sections.json` - 섹션 구조
- `docs/site-analysis/.tmp/marketplace-content.json` - 텍스트 콘텐츠

### 문서
- `docs/site-analysis/05-marketplace.md` - 본 문서
- `docs/site-analysis/marketplace-info.json` - 구조화된 분석 결과

---

## 🎯 핵심 발견사항

1. **기능 완성도 높음**: 검색 폼이 완전히 구현됨 (4/4)
2. **메인 페이지와 유사**: 거의 동일한 구조 공유
3. **POL/POD 기반**: B2B 해운 플랫폼 표준 UX 적용
4. **실시간 비교**: 여러 선사/포워더 운임 동시 비교
5. **간결한 UI**: 복잡하지 않은 직관적 인터페이스

---

## 🔄 다음 단계

이제 다른 페이지도 분석할 수 있습니다:

1. ✅ **메인 페이지** (완료)
2. ✅ **Marketplace 페이지** (완료)
3. 🔄 **Quote 페이지** (`/en/quote`) - 다음
4. **Blog 페이지** (`/en/blog`)

---

**문서 작성**: Claude Code
**최종 업데이트**: 2025-10-27
**상태**: Marketplace 페이지 분석 완료 ✅
