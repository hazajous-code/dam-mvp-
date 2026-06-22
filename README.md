# DAM 고도화 MVP — 글로벌 Asset Operations 콘솔

LG전자 글로벌 **DAM(Digital Asset Management) 운영 고도화** 방향을 설명하기 위한 데모형 프로토타입입니다.
PIM2.0 기준정보를 기반으로 DAM 프로젝트를 생성하고, 필수 메타데이터·폴더 구조·파일명 규칙·QA 상태를 한 곳에서 관리하며,
게이트키핑 자동화 → WCM QA → DAM 이관까지 하나의 워크플로우로 연결하는 구조를 시각화합니다.

> 실제 API 연동 없이 **Mock Data + localStorage** 로만 동작합니다. 상태 변경(생성/업로드/승인/이관)은 브라우저에 영속화됩니다.

---

## 1. 프로젝트 개요

현재 운영은 PIM, DAM, CMS, WCM, GP1 Admin, 수기 QA가 분리되어 다음 문제가 있습니다.

- 프로젝트/폴더 생성, 메타데이터 입력, QA 요청, 이관 승인이 수작업 중심
- SKU·모델·카테고리·Channel·B2C/B2B·Locale·Asset Type 등 핵심 정보가 시스템별로 분산
- 게이트키핑에서 단순 경로·메타 누락 확인까지 사람이 반복 검수
- CMS/WCM 제작 QA와 DAM 이관 QA가 분리되어 이력 관리가 어려움
- JIRA·이메일·수기 코멘트 기반 커뮤니케이션으로 상태 추적이 어려움

**MVP 목표**

- PIM2.0 기준정보 기반 DAM 프로젝트 생성 구조 시각화
- 프로젝트 단위 필수 메타데이터/폴더/파일명/QA 상태 관리
- 게이트키핑 자동화: 정상 건 **자동 승인**, 예외 건만 **사람 검토**
- WCM 제작 QA 요청·승인/반려 + DAM 이관 상태를 단일 프로세스로 표현
- HQ / BU / Agency / Librarian / CNX QA / Viewer 역할별 화면·권한 차이 시연

---

## 2. 실행 방법

```bash
# Node 18+ 권장
npm install
npm run dev      # 개발 서버 (기본 http://localhost:5173)

npm run build    # 타입체크 + 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

- 우측 상단 **역할 전환(Role Switcher)** 으로 권한별 화면을 확인합니다.
- 헤더의 **↺ 초기화** 버튼으로 localStorage 데모 데이터를 초기 상태로 되돌립니다.

---

## 3. 주요 기능 (메뉴)

| 메뉴 | 설명 |
|------|------|
| **Dashboard** | 전체 KPI, 본부·채널별 현황, 상태 분포·예외·자동승인율·이관 추이 차트 |
| **Project Management** | 프로젝트 리스트 테이블, 다중 필터(BU/Status/Locale/Channel/QA/예외) |
| **Create Project** | PIM2.0 기반 5단계 생성 Wizard + **계정별 기본값 자동 입력 / 템플릿·메타데이터 추천** |
| **Template & Metadata** | 템플릿별 필수/선택 메타데이터 정의, 구분(필수전송/참고/자동/추천/이관확정) |
| **Asset Upload** | Drag&Drop 업로드, 파일명·확장자·중복·Alt Text·Locale 검증, 폴더 자동 추천 |
| **Gatekeeping QA** | 자동 검증 결과, 정상 건 자동 승인 / 예외 건 담당자 검토·승인·반려 |
| **WCM QA** | AEM 제작물 QA 체크리스트, QA 요청→검토→승인/반려, DAM 이관 가능 여부 |
| **Transfer & Approval** | Gatekeeping+WCM QA 종합, Transfer Ready/Blocked, 최종 승인·이관 처리 |
| **Analytics** | 자동 승인율/예외율/누락률/처리시간/수작업 절감 + 운영 인사이트 |
| **Rule Settings** | 7개 카테고리 자동화 룰 관리(Severity/Automation Level/Enabled 토글) |

---

## 4. 역할별 사용 흐름

| 역할 | 접근 화면 | 핵심 액션 |
|------|-----------|-----------|
| **HQ PMO** | 전체 | 프로젝트 생성, 템플릿·룰 관리, 예외 승인, 최종 승인 |
| **BU Owner** | 본부 현황·검토 | 필수 정보 검토, 게이트키핑 승인 |
| **Agency** | 업로드·검증 | 자산 업로드, 누락 확인, 수정 제출 |
| **Librarian / DAM Admin** | 이관·룰 | DAM 이관 검토, 예외 처리, 최종 승인 |
| **CNX QA** | WCM QA | WCM 제작물 QA 승인/반려 |
| **Viewer** | 전체(조회) | 현황 조회 전용 |

> 권한이 없는 액션 버튼은 비활성화되며, 안내 문구로 전환할 역할을 표시합니다.

---

## 5. 데모 시나리오 (클릭 가능)

1. **프로젝트 생성 (HQ PMO)** — `Create Project` → PIM Category/Model/Locale/Channel 입력 → 템플릿 선택 → 메타데이터 매핑 확인 → 생성
2. **자산 업로드 (Agency 역할로 전환)** — 프로젝트 상세 → `Asset Upload` → 샘플 자산 추가 → 파일명/Alt Text 검증 → 제출
3. **게이트키핑 자동 검증** — `Gatekeeping QA` → Pass/Fail 확인 → 정상 건 Auto Approved / 예외 건 코멘트 후 승인·반려
4. **WCM QA (CNX QA 역할로 전환)** — `WCM QA` → QA 요청 → 검토 → 승인/반려 → 이력 반영
5. **DAM 이관 (Librarian 역할로 전환)** — `Transfer & Approval` → Gatekeeping+WCM QA 충족 확인 → Transfer Ready → 이관 완료(Transferred)

> 추천 시연 프로젝트: `PRJ-2605 ES Air Purifier B2B`(예외 케이스), `PRJ-2603 HS Cordless Vacuum`(WCM 요청), `PRJ-2606 ES HVAC`(이관 대기)

---

## 5-1. 계정별 자동 입력 & 추천 (`src/data/accounts.ts`, `src/utils/recommend.ts`)

프로젝트 생성 시 **로그인 계정의 작업 성향 프로필**을 기반으로 입력을 자동화합니다.

- **자동 입력**: 계정별 기본값(BU·Channel·Region·Locale·Archive Rule·선호 템플릿·Search Tag 프리셋)을 위저드에 즉시 채움
- **템플릿 추천**: 채널·카테고리 규칙 + 계정 선호도/사용 이력을 가중 합산해 최적 템플릿을 신뢰도(%)·근거와 함께 제시하고, 추천 카드에 `추천` 배지 표시
- **메타데이터 추천**: 계정 기준 Region/Locale/Transfer Target/Archive Rule/Search Tag를 추천하고 "추천값 적용" 한 번으로 반영
- 위저드 상단의 **계정 기준(데모) 선택기**로 계정을 바꾸면 자동 입력·추천이 실시간으로 달라지는 것을 시연 가능

예) `김민준(HQ PMO)` → MS·LG.com·Product PDP / `윤채원(Agency)` → HS·de-DE·Gallery / `최유나(Librarian)` → ES·Contents Hub·Contents Hub Share

## 6. QA 엔진 로직 (`src/utils/qaEngine.ts`)

개별 검증 함수(`validateMetadata`, `validateFolderPath`, `validateFileNaming`, `validateChannel`, `validateLocale`, `validateArchiveRule` 등)는 공통 형태를 반환합니다.

```ts
{ ruleId, ruleName, status: 'pass'|'warning'|'fail', severity: 'critical'|'warning'|'info', message, recommendation }
```

**최종 QA 결과 계산**

- Critical Fail 없음 → `Auto Approved`
- Warning만 존재 → `Warning`
- Critical Fail 1~2개 → `Exception Required`
- 필수 필드 다수(3+) 누락 → `Rejected`
- 사람 검토 후 처리 → `Manual Review`

> **운영 원칙**: 경로 준수는 QA의 일부 조건일 뿐 QA 자체가 아닙니다. 사람의 역할은 반복 확인이 아니라 예외 판단과 최종 승인입니다.

---

## 7. 프로젝트 구조

```
src/
  main.tsx / App.tsx
  context/AppContext.tsx        # 전역 상태 + localStorage 영속화
  data/                         # mockProjects, mockRules, mockMetadata, roles, templates
  types/index.ts                # 도메인 타입
  components/                   # Layout, Sidebar, Header, StatCard, StatusBadge, DataTable, Timeline, RuleResultTable
  pages/                        # 11개 화면 (Dashboard ~ RuleSettings, ProjectDetail)
  utils/                        # qaEngine, storage, format
```

---

## 8. MVP 범위

- ✅ 11개 메뉴 라우팅, 역할 전환·권한 분기
- ✅ Mock 프로젝트 8개, 룰 16개, 메타데이터 정의표
- ✅ 5단계 생성 Wizard, Drag&Drop 업로드 + 파일 검증
- ✅ 게이트키핑 자동 판정, WCM QA 승인/반려, Transfer 상태 변경
- ✅ Dashboard·Analytics 수치가 상태 변경에 따라 일부 실시간 반영
- ✅ localStorage 영속화 / 초기화

**의도적 비범위** — 실제 파일 저장, 서버/DB, 실시간 알림, SSO는 데모 대상이 아닙니다.

---

## 9. 향후 고도화 방향

- PIM2.0 API 연동 (기준정보 자동 매핑)
- AEM Assets Cloud API 연동 (실제 폴더 생성·이관)
- CMS/WCM QA 자동화 연동
- JIRA 대체 이력 관리(워크플로우 내장 코멘트·상태 추적)
- 이메일 / Slack / Teams 알림
- 권한 관리 고도화 (조직·본부·외부사 분리)
- 실제 파일 업로드 및 DAM 이관 API 연계
- Locale별 배포 상태 추적
- Contents Hub 공유/다운로드 이력 관리

---

## 기술 스택

React 18 · Vite · TypeScript · Tailwind CSS · Recharts · React Router (HashRouter)
