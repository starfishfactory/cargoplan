# www.surff.kr Quote 페이지 분석

> **분석일**: 2025-10-27
> **테스트 파일**: `tests/07-quote.spec.ts`
> **테스트 결과**: 6개 테스트 모두 통과 ✅
> **URL**: https://www.surff.kr/en/quote?pageNo=1

---

## 📋 개요

Quote 페이지는 **맞춤 견적 의뢰 및 이력 관리 페이지**입니다.

- **제목**: 서프컴퍼니 | 맞춤 견적 의뢰
- **설명**: 글로벌 선사와 포워더의 해상운임을 비교하고 합리적인 가격으로 예약하세요
- **타입**: 견적 요청 및 이력 관리
- **특징**: 요청 버튼 + 이력 목록 + 지역 필터 + 페이지네이션

---

## 🎯 페이지 구조

### 섹션 구성 (3개)

| 순번 | 클래스 | 제목 | 버튼 | 역할 |
|------|--------|------|------|------|
| 1 | css-12dcmw3 | - | 0개 | 알림 영역 |
| 2 | css-gzkhku | Quote Request | 15개 | 메인 콘텐츠 |
| 3 | css-1j9j0t1 | Quote Request | 15개 | (중복 또는 모바일) |

**특이사항**: 섹션 2와 3이 동일한 구조 → Sticky header 또는 반응형 디자인

### DOM 구조

```
페이지 루트
├─ section (알림 영역)
│  └─ "알림이 없습니다"
│
├─ section (Quote Request 메인)
│  ├─ h2: Quote Request
│  ├─ h3: All Request History
│  │
│  ├─ Request Quote 버튼
│  │
│  ├─ 지역 필터 (3개)
│  │  ├─ Americas
│  │  ├─ Europe
│  │  └─ Asia
│  │
│  ├─ 견적 이력 (4개 항목)
│  │  ├─ KRPUS → SIKOP
│  │  ├─ KRPUS → LKCMB
│  │  ├─ KRPUS → MXLZC
│  │  └─ KRPUS → GUGUM
│  │
│  └─ 페이지네이션
│
└─ section (중복)
   └─ (동일 구조)
```

---

## 🔘 Request Quote 버튼

### 상태: ✅ 있음

- **텍스트**: "Request Quote"
- **위치**: 페이지 상단
- **상태**: 보임 (클릭 가능)
- **역할**: 새로운 맞춤 견적 요청 시작

### 동작 추정

```
Request Quote 클릭
    ↓
견적 요청 폼 표시
  (모달 또는 새 페이지)
    ↓
POL/POD 입력
컨테이너 타입 선택
기타 요구사항 입력
    ↓
제출
    ↓
견적 이력에 추가
```

---

## 📋 견적 요청 이력

### 총 4개 항목

각 항목은 **POL → POD** 쌍으로 표시됩니다:

| # | POL (출발지) | POD (도착지) | 설명 |
|---|-------------|-------------|------|
| 1 | **KRPUS** | **SIKOP** | Busan (한국) → Singapore |
| 2 | **KRPUS** | **LKCMB** | Busan (한국) → Colombo (스리랑카) |
| 3 | **KRPUS** | **MXLZC** | Busan (한국) → Lazaro Cardenas (멕시코) |
| 4 | **KRPUS** | **GUGUM** | Busan (한국) → Guam (괌) |

### 항구 코드 해석

- **KRPUS**: KR (South Korea) + PUS (Pusan/Busan)
- **SIKOP**: SI (Singapore) + KOP (Singapore Port)
- **LKCMB**: LK (Sri Lanka) + CMB (Colombo)
- **MXLZC**: MX (Mexico) + LZC (Lazaro Cardenas)
- **GUGUM**: GU (Guam) + GUM (Guam)

### 표시 방식

- ✅ **항구 코드 기반**: UN/LOCODE 형식 (5-6자)
- ✅ **방향 표시**: POL → POD
- ✅ **h6 태그 사용**: 각 항구 코드를 h6로 표시

---

## 🌍 지역 필터

### 3개 지역

| 순번 | 필터명 | 커버 지역 | 차이점 |
|------|--------|-----------|--------|
| 1 | **Americas** | 남북미 대륙 | Marketplace의 "North/South America"와 동일 |
| 2 | **Europe** | 유럽 | 동일 |
| 3 | **Asia** | 아시아 | Marketplace의 "Asia/Oceania"에서 Oceania 제외 |

### Marketplace와 비교

| 필터 | Marketplace | Quote |
|------|-------------|-------|
| 미주 | North/South America | **Americas** |
| 유럽 | Europe | Europe ✅ |
| 아시아 | Asia/Oceania | **Asia** |
| 중동/아프리카 | Middle East/Africa | ❌ **없음** |

**Quote 페이지만의 특징**:
- ✅ 간소화: 4개 → 3개 필터
- ❌ Middle East/Africa 필터 없음

---

## 📄 페이지네이션

### 상태: ✅ 있음

- **현재 페이지**: 1 (URL: `?pageNo=1`)
- **페이지네이션 링크**: 1개 발견
- **링크 대상**: `/en/quote?pageNo=1`

### 특징

- ✅ **URL 기반**: `pageNo` 파라미터
- 🔍 **링크 제한적**: 단일 링크만 발견 (다음 페이지 또는 자기 자신)
- 💡 **동적 생성**: 이력 개수에 따라 페이지 생성

---

## 🎯 주요 기능

### 1. 맞춤 견적 요청 ⭐

- **버튼**: Request Quote
- **역할**: 새로운 견적 의뢰 시작
- **프로세스**: 폼 작성 → 제출 → 이력 추가

### 2. 견적 이력 확인

- **항목 수**: 4개
- **표시 형식**: POL → POD
- **정보**: 항구 코드 쌍

### 3. 지역별 필터 (3개)

- **필터**: Americas, Europe, Asia
- **역할**: 지역별 견적 이력 필터링
- **특징**: Marketplace보다 간소화

### 4. 페이지네이션

- **URL 기반**: `?pageNo=N`
- **역할**: 다중 페이지 견적 이력 탐색
- **현재 페이지**: 1

### 5. 항구 코드 기반 이력

- **형식**: UN/LOCODE (5-6자)
- **표시**: h6 태그
- **예시**: KRPUS, SIKOP

---

## 📊 Marketplace vs Quote 비교

| 항목 | Marketplace | Quote |
|------|-------------|-------|
| **URL** | `/en/marketplace` | `/en/quote?pageNo=1` |
| **제목** | Marketplace - ... | 맞춤 견적 의뢰 |
| **목적** | 운임 검색 및 비교 | 맞춤 견적 요청 및 이력 |
| **검색 폼** | POL/POD 입력 ✅ | ❌ 없음 |
| **Request 버튼** | ❌ 없음 | ✅ **있음** |
| **결과 표시** | 6개 운임 카드 | 4개 견적 이력 |
| **지역 필터** | 4개 | **3개** (축소) |
| **페이지네이션** | ❌ 없음 | ✅ **있음** |
| **선사 로고** | 17개 이미지 | ❌ 없음 |

### 역할 구분

**Marketplace**:
- 실시간 운임 비교
- 여러 선사/포워더 검색
- 즉시 예약 가능

**Quote**:
- 맞춤 견적 요청
- 요청 이력 관리
- 개별 협상 필요

---

## 💡 사용자 플로우

### 신규 견적 요청

```
Quote 페이지 진입
    ↓
Request Quote 클릭
    ↓
견적 요청 폼 작성
  ├─ POL 선택
  ├─ POD 선택
  ├─ 컨테이너 타입
  └─ 추가 요구사항
    ↓
제출
    ↓
이력에 추가
    ↓
결과 대기 (이메일 알림 등)
```

### 이력 확인

```
Quote 페이지 진입
    ↓
지역 필터 선택 (선택사항)
    ↓
견적 이력 목록 확인
    ↓
각 항목 클릭 (추정)
    ↓
상세 정보 확인
  ├─ 요청 일자
  ├─ 견적 상태
  ├─ 응답 내용
  └─ 선택된 운임
```

---

## 🎨 디자인 특징

### 장점 ✅

1. **명확한 CTA**: Request Quote 버튼 뚜렷함
2. **간결한 이력**: POL → POD로 핵심 정보만
3. **페이지네이션**: 많은 이력 관리 가능
4. **필터링**: 지역별 빠른 필터

### 개선 가능 사항 💡

1. **상세 정보**: 각 이력의 상태, 일자 표시
2. **정렬 기능**: 최신순, 오래된순
3. **검색 기능**: 항구 코드로 검색
4. **액션 버튼**: 재요청, 삭제, 복사 등
5. **상태 표시**: 대기 중, 응답 완료, 만료 등

---

## 📝 테스트 커버리지

| 테스트 항목 | 결과 | 발견 항목 |
|-------------|------|-----------|
| 페이지 기본 정보 수집 | ✅ | 제목, 설명, 제목 태그 |
| Request Quote 버튼 | ✅ | 있음, 클릭 가능 |
| 견적 요청 이력 분석 | ✅ | 4개 항목 (POL → POD) |
| 지역 필터 분석 | ✅ | 3개 (Americas, Europe, Asia) |
| 페이지네이션 분석 | ✅ | 있음 (pageNo=1) |
| 주요 기능 요약 | ✅ | 5개 핵심 기능 |
| **총계** | **6/6 통과** | **6.1s** |

---

## 📚 관련 파일

### 테스트 파일
- `tests/06-quote-dom.spec.ts` - DOM 구조 분석
- `tests/07-quote.spec.ts` - 상세 기능 분석

### 분석 데이터
- `docs/site-analysis/.tmp/quote-source.html` - 페이지 HTML (356KB)
- `docs/site-analysis/.tmp/quote-sections.json` - 섹션 구조
- `docs/site-analysis/.tmp/quote-content.json` - 텍스트 콘텐츠

### 문서
- `docs/site-analysis/06-quote.md` - 본 문서
- `docs/site-analysis/quote-info.json` - 구조화된 분석 결과

---

## 🎯 핵심 발견사항

1. **맞춤 견적 전용**: Marketplace와 명확히 구분된 역할
2. **이력 관리**: 과거 요청 내역 확인 가능
3. **항구 코드 표시**: UN/LOCODE 형식 사용
4. **필터 간소화**: 3개 지역으로 축소
5. **페이지네이션**: 많은 이력 처리 가능

---

## 🔄 다음 단계

이제 다른 페이지도 분석할 수 있습니다:

1. ✅ **메인 페이지** (완료)
2. ✅ **Marketplace 페이지** (완료)
3. ✅ **Quote 페이지** (완료)
4. 🔄 **Blog 페이지** (`/en/blog`) - 다음
5. **Terms 페이지** (`/en/termUse`, `/en/termPersonal`)

---

**문서 작성**: Claude Code
**최종 업데이트**: 2025-10-27
**상태**: Quote 페이지 분석 완료 ✅
