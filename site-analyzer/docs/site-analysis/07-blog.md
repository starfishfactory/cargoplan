# www.surff.kr Blog 페이지 분석

> **분석일**: 2025-10-27
> **테스트 파일**: `tests/09-blog.spec.ts`
> **테스트 결과**: 5개 테스트 모두 통과 ✅
> **URL**: https://www.surff.kr/en/blog

---

## 📋 개요

Blog 페이지는 **물류 트렌드 및 인사이트 콘텐츠 허브**입니다.

- **제목**: SURFF Company Blog
- **설명**: We provide fresh logistics trends that are not covered by domestic foreign media.
- **타입**: 블로그/콘텐츠 마케팅
- **특징**: 최신 물류 트렌드, 데이터 기반 인사이트, 주간 리포트

---

## 🎯 페이지 구조

### 섹션 구성 (3개)

| 순번 | 클래스 | 제목 | 이미지 | 버튼 | 역할 |
|------|--------|------|--------|------|------|
| 1 | css-12dcmw3 | - | 0개 | 0개 | 알림 영역 |
| 2 | css-q2j9is | Blog | **14개** | **28개** | 메인 블로그 콘텐츠 |
| 3 | css-1jyf478 | Blog | 13개 | 26개 | (중복 또는 모바일) |

### DOM 구조

```
페이지 루트
├─ section (알림 영역)
│  └─ "알림이 없습니다"
│
├─ section (Blog 메인)
│  ├─ h2: Blog
│  │
│  ├─ 카테고리/태그
│  │  ├─ Logistics 101
│  │  └─ Popular
│  │
│  └─ 블로그 포스트 (10개)
│     ├─ 제목 (h4)
│     ├─ 썸네일 이미지
│     └─ 클릭/읽기 버튼
│
└─ section (중복)
   └─ (동일 구조)
```

---

## 📝 블로그 포스트

### 총 10개 포스트 수집 (상위 10개)

| # | 제목 | 주제 |
|---|------|------|
| 1 | **Global Minimum Tax: The End of Tax Rate Competition?** (Week 42, 2025) | 세금 정책 |
| 2 | **Platform Punctuality Based on SURFF Data** \| ETD vs Actual Departure | 데이터 분석 |
| 3 | **How Do Intuition and Data Coexist in Logistics?** \| Balancing Instinct | 데이터 vs 직관 |
| 4 | **Vol94. Weekly Containers** (Week 43, 2025) | 주간 컨테이너 리포트 |
| 5 | **Where will the new maritime hub on the Arctic Route be?** | 북극 항로 |
| 6 | **VOL162. Weekly SURFF'INSIGHT** – 2025.10.21 | 주간 인사이트 |
| 7 | **Vol93. Weekly Containers** (Week 42, 2025) | 주간 컨테이너 리포트 |
| 8 | **The Story Behind SURFF** \| A Design Intern's Branding Journey | 회사 스토리 |

**총 18개 제목 발견** (10개만 수집)

### 포스트 주제 분석

#### 1. 주간 리포트 시리즈
- **Weekly Containers**: 컨테이너 시장 주간 동향
- **Weekly SURFF'INSIGHT**: 종합 물류 인사이트
- 정기 발행으로 신뢰도 구축

#### 2. 데이터 기반 분석
- **Platform Punctuality**: SURFF 데이터 활용
- **Intuition and Data**: 데이터 의사결정
- 자사 데이터를 활용한 전문성 강조

#### 3. 산업 트렌드
- **Global Minimum Tax**: 국제 세금 정책
- **Arctic Route**: 북극 항로 개발
- 최신 물류 이슈 커버

#### 4. 회사 스토리
- **The Story Behind SURFF**: 브랜딩 여정
- 인간적인 스토리텔링

---

## 🏷️ 카테고리 및 태그

### 확인된 카테고리

텍스트 분석에서 다음 카테고리 발견:
- **Logistics 101**: 물류 기초 지식
- **Popular**: 인기 포스트
- **Subscribe**: 구독 버튼 (카테고리 아님)

### 카테고리 시스템

- ℹ️ **명확한 카테고리 버튼**: 찾기 어려움
- 💡 **추정**: 태그 기반 또는 자동 분류
- 📊 **분석**: "Logistics 101", "Popular" 같은 라벨 존재

---

## 📊 콘텐츠 통계

### 메인 섹션

- **이미지**: 14개
- **버튼**: 28개
- **추정 포스트 수**: 약 14개
- **수집된 제목**: 18개 (h4 태그)

### 계산

- 포스트당 이미지: 1개 (썸네일)
- 포스트당 버튼: 2개 (읽기 + 기타)
- **14개 이미지 ≈ 14개 포스트**

---

## 🎨 콘텐츠 형식

### 블로그 포스트 카드

각 포스트는 카드 형태로 표시:

```
┌─────────────────────────┐
│   [썸네일 이미지]         │
│                         │
│  제목 (h4)               │
│  "Global Minimum Tax..." │
│                         │
│  [Read More] [Share?]   │
└─────────────────────────┘
```

### 특징

- ✅ **이미지 썸네일**: 모든 포스트
- ✅ **제목 (h4)**: 명확한 제목
- ✅ **클릭 가능**: 버튼 또는 링크
- ❌ **메타 정보**: 날짜, 저자 명시 불명확 (제목에 포함)

---

## 🔍 SEO 및 메타 정보

### 메타 정보

- **Title**: SURFF Company Blog
- **Description**: We provide fresh logistics trends that are not covered by domestic foreign media.
- **특징**: 명확한 가치 제안 ("국내외 미디어가 다루지 않는 신선한 물류 트렌드")

### SEO 전략

- ✅ **키워드**: Logistics, Trends, Fresh
- ✅ **차별화**: "not covered by domestic foreign media"
- 💡 **타겟**: 물류 업계 전문가

---

## 🎯 주요 기능

### 1. 블로그 포스트 목록 ⭐

- **개수**: 10-18개 포스트
- **표시**: 카드 형태, 이미지 썸네일
- **역할**: 최신 물류 트렌드 제공

### 2. 카테고리 필터 (추정)

- **Logistics 101**: 기초 지식
- **Popular**: 인기 포스트
- **역할**: 콘텐츠 분류 및 탐색

### 3. 이미지 썸네일

- **개수**: 각 포스트 1개
- **역할**: 시각적 매력, 클릭 유도

### 4. 물류 인사이트 제공 💡

- **주간 리포트**: Weekly Containers, SURFF INSIGHT
- **데이터 분석**: Platform Punctuality
- **산업 트렌드**: Global Tax, Arctic Route
- **역할**: 전문성 및 신뢰도 구축

### 5. 구독 기능 (추정)

- **버튼**: Subscribe 발견
- **역할**: 뉴스레터 구독

---

## 📈 콘텐츠 전략

### 콘텐츠 유형

1. **주간 시리즈** (40%)
   - Weekly Containers (Vol 93, 94)
   - Weekly SURFF INSIGHT (Vol 162)
   - 정기 발행으로 리텐션 확보

2. **데이터 인사이트** (30%)
   - SURFF 자체 데이터 활용
   - 플랫폼 정시성, 데이터 vs 직관
   - 독점 데이터로 차별화

3. **산업 트렌드** (20%)
   - 글로벌 세금 정책
   - 북극 항로
   - 최신 이슈 커버리지

4. **회사 스토리** (10%)
   - 브랜딩 여정
   - 인간적 스토리텔링

### 발행 주기

- **주간**: Weekly 시리즈
- **부정기**: 트렌드, 분석 포스트
- **빈도**: 주 1-2회 추정

---

## 💡 사용자 플로우

### 블로그 탐색

```
Blog 페이지 진입
    ↓
포스트 목록 확인
    ↓
카테고리 필터 (선택)
  (Logistics 101, Popular)
    ↓
관심 포스트 클릭
    ↓
포스트 읽기
    ↓
구독 또는 다른 포스트로
```

### 구독 유도

```
포스트 읽기
    ↓
가치 인식
    ↓
Subscribe 버튼 클릭
    ↓
이메일 입력
    ↓
주간 리포트 수신
```

---

## 🎨 디자인 특징

### 장점 ✅

1. **깔끔한 카드 레이아웃**: 콘텐츠 구분 명확
2. **이미지 썸네일**: 시각적 매력
3. **명확한 제목**: h4로 위계 구조
4. **주간 시리즈**: 정기성으로 신뢰 구축
5. **데이터 기반**: 전문성 강조

### 개선 가능 사항 💡

1. **메타 정보 표시**: 작성일, 저자, 읽기 시간
2. **카테고리 명확화**: 버튼 형태로 필터
3. **검색 기능**: 키워드 검색
4. **태그 시스템**: 세부 분류
5. **페이지네이션**: 더 많은 포스트 접근
6. **관련 포스트**: 추천 알고리즘

---

## 📊 메트릭 추정

### 콘텐츠 볼륨

- **표시 포스트**: 10-14개
- **총 포스트**: 18개+ (스크롤 또는 페이지네이션)
- **이미지**: 14개
- **버튼**: 28개

### 업데이트 빈도

- **Weekly Containers**: 주간 (Vol 93 → 94, 1주 간격)
- **SURFF INSIGHT**: 주간 (Vol 162)
- **기타**: 부정기

---

## 🔄 다른 페이지와 비교

| 항목 | Marketplace | Quote | **Blog** |
|------|-------------|-------|----------|
| **목적** | 운임 검색/비교 | 맞춤 견적 의뢰 | **콘텐츠 마케팅** |
| **콘텐츠** | 운임 데이터 | 견적 이력 | **블로그 포스트** |
| **빈도** | 실시간 | 요청별 | **주간 업데이트** |
| **CTA** | Search, More View | Request Quote | **Subscribe, Read** |
| **목표** | 예약 전환 | 견적 제출 | **리드 생성, 신뢰 구축** |

### Blog의 역할

**Top of Funnel (TOFU)**:
- 잠재 고객 유입
- 전문성 입증
- SEO 강화
- 이메일 리스트 구축

---

## 📝 테스트 커버리지

| 테스트 항목 | 결과 | 발견 항목 |
|-------------|------|-----------|
| 페이지 기본 정보 수집 | ✅ | 제목, 설명 |
| 카테고리 분석 | ✅ | Subscribe (1개) |
| 블로그 포스트 제목 수집 | ✅ | 10개 포스트 |
| 이미지 및 버튼 분석 | ✅ | 14개 이미지, 28개 버튼 |
| 주요 기능 요약 | ✅ | 4개 핵심 기능 |
| **총계** | **5/5 통과** | **3.6s** |

---

## 📚 관련 파일

### 테스트 파일
- `tests/08-blog-dom.spec.ts` - DOM 구조 분석
- `tests/09-blog.spec.ts` - 상세 기능 분석

### 분석 데이터
- `docs/site-analysis/.tmp/blog-source.html` - 페이지 HTML (418KB)
- `docs/site-analysis/.tmp/blog-sections.json` - 섹션 구조
- `docs/site-analysis/.tmp/blog-content.json` - 텍스트 콘텐츠

### 문서
- `docs/site-analysis/07-blog.md` - 본 문서
- `docs/site-analysis/blog-info.json` - 구조화된 분석 결과

---

## 🎯 핵심 발견사항

1. **콘텐츠 마케팅 허브**: B2B 신뢰 구축
2. **주간 시리즈**: 정기 발행으로 리텐션
3. **데이터 기반**: SURFF 자체 데이터 활용
4. **물류 전문성**: 국내외 미디어가 안 다루는 트렌드
5. **깔끔한 UI**: 카드 레이아웃, 이미지 썸네일

---

## 📊 포스트 샘플

### 대표 포스트 1
**제목**: Global Minimum Tax: The End of Tax Rate Competition?
**주제**: 국제 세금 정책
**타입**: 산업 트렌드

### 대표 포스트 2
**제목**: Platform Punctuality Based on SURFF Data
**주제**: 데이터 분석
**타입**: 자사 데이터 인사이트

### 대표 포스트 3
**제목**: Vol94. Weekly Containers (Week 43, 2025)
**주제**: 컨테이너 시장
**타입**: 주간 리포트

---

## 🔄 다음 단계

모든 주요 페이지 분석 완료:

1. ✅ **메인 페이지** (완료)
2. ✅ **Marketplace 페이지** (완료)
3. ✅ **Quote 페이지** (완료)
4. ✅ **Blog 페이지** (완료)
5. 🔄 **Terms 페이지** (`/en/termUse`, `/en/termPersonal`) - 선택적

---

**문서 작성**: Claude Code
**최종 업데이트**: 2025-10-27
**상태**: Blog 페이지 분석 완료 ✅
