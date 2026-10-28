# TONE CLOUD (GP-200JR Edition)

Valeton GP-200JR 멀티이펙터용 기타 톤 관리 웹앱. 사용자 한 명(저장소 주인)이 자기 장비로 쓰는 앱이라, 아래 장비·연결 방식을 전제로 만든다.
라이브: https://supersonic9727.github.io/AI-guitar-tone-making/

## 사용자 장비
- 기타: Schecter Sunset-6 Extreme, 5-way 픽업 셀렉터
  - P1 Full Bridge / P2 Inner Coils / P3 Both Humbuckers / P4 Outer Coils / P5 Full Neck
- 멀티이펙터: Valeton GP-200JR, 펌웨어 **V1.8.0**
- 연결: 앰프 리턴(FX Loop Return) → CAB 모듈 OFF 또는 Global Settings → Input/Output → No CAB Mode ON
  - 헤드폰·인터페이스로 들을 때만 CAB ON. 그래서 AI TONE 결과는 기본 CAB OFF
- 페달: 내장 EXP 페달 = 볼륨 페달 (EXP 1 → VOL 모듈 Volume)
  - 와우로도 쓰려면 Patch Settings → EXP Settings에서 EXP 1 A/B로 나눠 지정

## 체인 순서 (사용자 기준)
`PRE → WAH → DST → AMP → NR → CAB → EQ → MOD → VOL → DLY → RVB`
- 기기 기본 순서에서 **VOL만 DLY 앞으로** 옮김 → 볼륨을 줄여도 딜레이·리버브 잔향이 남음(볼륨 스웰). 코드: `CHAIN_ORDER` (`index.html`)
- 노이즈 게이트(NR)는 AMP 뒤 (기기 기본 위치)
- **한 모듈에는 이펙트 1개만** 켤 수 있음 → 앱은 `moduleConflicts`로 경고
- 기기에서 모듈 이동: 모듈 선택 → PARA 길게 → Manage Signal Chain → Knob 2로 이동 → SAVE (패치마다 저장)

## 기기 값 — 확인된 것과 아닌 것
값의 기준은 `gp200jrModels.js` (기기 화면과 같은 파라미터 이름·개수·순서·범위). **추측으로 범위를 바꾸지 말 것.**

사용자가 기기에서 직접 확인한 값:
- 일반 노브 0~100
- Gate 1: Threshold 하나뿐, 0~100
- 딜레이 Time 0~4000ms
- CAB Low Cut 0~2000Hz / Hi Cut 0~2000Hz, **Hi Cut 0Hz = 고음을 깎지 않음(OFF)** (`offAtZero`)
- 리버브 Pre Delay 0~100 (단위 없음)
- 앰프 Bright: ON/OFF 스위치
- Revolt(DST) Mode: I / II / III
- 패치 번호 01-A ~ 64-D (01-A~25-D는 공장 프리셋 자리)

아직 확인 안 된 값 → `verify` 표시, 앱 화면에 노란 `?`로 나옴:
- EQ 밴드 범위(±12dB로 가정), Mess EQ에 Volume이 있는지
- 딜레이 Time R% / Spread 범위
- Gate 3 Ratio/Hold/Hysteresis, Broken Delay Latch/Cut 범위
- Precise OD Attack 선택 항목 이름 (Revolt Mode I·II·III는 확인됨)
- Pitch/P-Bend 범위, Harmonizer·Ice Delay 옵션

사용자가 값을 확인해 주면: 해당 항목의 `KU(…)` → `K(…)`, `UNV(SEL(…))` → `SEL(…)`, 범위가 0~100이 아니면 `R('이름', min, max, '단위')`. 모델 단위 `verify: '…'` 문자열은 지움. 확인 날짜를 주석으로 남긴다(예: `// 사용자 확인(2026-10)`).
사용자에게 설명할 때 미확인 값은 추정이라고 밝힌다.

## 코드 구조 (빌드 도구 없음)
- `index.html` — 앱 전체. React 18 UMD + Babel standalone이 브라우저에서 JSX를 변환. Tailwind CDN. 버전은 모두 고정(react@18.3.1 등) — 버전 범위(`react@18`)로 되돌리지 말 것
- `gp200jrModels.js` — 기기 모델·파라미터 표 (`window.GP200JR`)
- `genreMapper.js` — 장르 태그 → 하드웨어 룰 (`window.GenreMapper`). AI TONE은 MusicBrainz 장르 태그 사용
- 저장: localStorage(`tonecloud.gp200jr.v1`) + 구글 로그인 시 Firestore 동기화(프리셋 단위 타임스탬프·삭제 tombstone)
- AI TONE은 장르 기준이라 같은 장르 밴드는 같은 톤. 밴드 고유 톤은 사용자가 Claude 채팅 프로젝트에서 JSON으로 받아 IMPORT → 붙여넣기로 가져옴
  - `parseImportedPresets(text, { pasted })`: 코드 블록·설명이 섞인 글에서 JSON 추출, 붙여넣기는 schema 없으면 현재 형식, 틀린 cat 은 모델 이름으로 바로잡음, 표에 없는 모델·파라미터는 경고
  - 형식 설명서는 Claude 프로젝트 자료 폴더의 "TONE CLOUD 프리셋 JSON 형식.md" — 저장 형식을 바꾸면 같이 고칠 것
  - `myTones`: AI TONE 검색 시 같은 아티스트 이름(MusicBrainz 이름·별칭)으로 저장된 프리셋을 "📌 내가 저장한 톤"으로 먼저 보여줌
- 저장 형식을 바꾸면 `PARAM_SCHEMA`를 올리고 `normalizeChain`에 옛 데이터 변환을 추가 (옛 백업·클라우드 데이터도 읽혀야 함)

## 작업 규칙
- `gp200jrModels.js`·`genreMapper.js`를 바꾸면 `index.html`의 `<script src="./…js?v=N">` 숫자를 올린다 (폰 캐시 때문)
- 화면 문구와 코드 주석은 한국어, 주변 코드 스타일(짧은 함수, 인라인 Tailwind)에 맞춘다
- 배포: `main`에 push하면 GitHub Pages가 1~2분 뒤 반영. 큰 변경은 브랜치에서 먼저
- 테스트: 별도 테스트 코드 없음. Playwright + 로컬 npm 패키지(react, react-dom, @babel/standalone 같은 버전)로 CDN 요청을 가로채 `file://`로 띄워 확인하는 방식을 써 왔음
