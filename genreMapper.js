/**
 * genreMapper.js — GP-200JR Genre → Hardware Mapping Ruleset
 *
 * MusicBrainz 장르 태그를 Valeton GP-200JR 컴포넌트 설정으로 매핑하는
 * 독립 룰셋 모듈. React / UI에 대한 의존성 없는 순수 함수 집합.
 *
 * @module GenreMapper
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// 룰셋 테이블 (우선순위 순서 — 구체적 장르가 위)
// ─────────────────────────────────────────────────────────────────────────────

/** @typedef {Object} HardwareRule
 * @property {string}   id          - 룰 식별자
 * @property {string}   label       - 사람이 읽기 좋은 장르 설명
 * @property {RegExp}   match       - 태그 문자열에 적용할 정규식
 * @property {string}   amp         - GP-200JR 앰프 모델 ID
 * @property {Object}   ampParams   - 앰프 파라미터 기본값
 * @property {string|null} cab      - 캐비닛 모델 ID (null = 캐비닛 없음)
 * @property {string|null} od       - 오버드라이브/디스토션 모델 ID
 * @property {Object|null} odParams - OD 파라미터 기본값
 * @property {boolean}  hasNS       - 노이즈 게이트 삽입 여부
 * @property {number}   nsThreshold - 노이즈 게이트 Threshold (0–100)
 * @property {boolean}  hasChorus   - 코러스 켬/끔 명시 (추가됨)
 * @property {boolean}  hasDelay    - 딜레이 켬/끔 명시 (추가됨)
 * @property {string}   pickup      - 권장 픽업 포지션
 * @property {number}   gainIdx     - wizardGenerate gainIdx (0–4)
 * @property {number}   brightIdx   - wizardGenerate brightIdx (0–4)
 * @property {number}   spaceIdx    - wizardGenerate spaceIdx (0–4)
 * @property {string[]} genres      - wizardGenerate 장르 레이블
 */

/** @type {HardwareRule[]} */
const GP200JR_GENRE_RULES = [

  // ── Extreme Metal ─────────────────────────────────────────────────────────
  {
    id: 'extreme_metal',
    label: 'Extreme Metal (Deathcore / Death / Black)',
    match: /deathcore|death metal|black metal|brutal death|grindcore/,
    amp: 'Eagle 120',
    ampParams: { Gain:92, Bass:55, Middle:32, Treble:70, Volume:70, Presence:74 },
    cab: 'Mess',
    od: 'Swarm',
    odParams: { Gain:72, Tone:50, Volume:72 },
    hasNS: true, nsThreshold: 48,
    hasChorus: false, hasDelay: false,
    pickup: 'Bridge HB',
    gainIdx: 4, brightIdx: 3, spaceIdx: 0,
    genres: ['Metal'],
  },

  // ── Metalcore / Djent ─────────────────────────────────────────────────────
  {
    id: 'metalcore',
    label: 'Metalcore / Djent / Thrash',
    match: /metalcore|djent|thrash metal|groove metal|prog metal|progressive metal|nu metal|alternative metal|industrial metal/,
    amp: 'Mess DualV',
    ampParams: { Gain:85, Bass:55, Middle:38, Treble:65, Volume:72, Presence:70 },
    cab: 'Mess',
    od: 'Revolt',
    odParams: { Gain:65, Tone:52, Volume:70 },
    hasNS: true, nsThreshold: 44,
    hasChorus: false, hasDelay: false,
    pickup: 'Bridge HB',
    gainIdx: 4, brightIdx: 3, spaceIdx: 1,
    genres: ['Metal'],
  },

  // ── Heavy / Power Metal ───────────────────────────────────────────────────
  {
    id: 'heavy_metal',
    label: 'Heavy Metal / Power Metal / Speed Metal',
    match: /heavy metal|power metal|speed metal|symphonic metal|doom metal|^(?!glam).*\bmetal\b/,   // folk·gothic metal 등 나머지 메탈도 여기로 (glam metal 은 하드록)
    amp: 'EV 51',
    ampParams: { Gain:80, Bass:52, Middle:40, Treble:62, Volume:70, Presence:68 },
    cab: 'UK LD',
    od: 'Master Dist',
    odParams: { Gain:60, Tone:55, Volume:68 },
    hasNS: true, nsThreshold: 40,
    hasChorus: false, hasDelay: false,
    pickup: 'Bridge HB',
    gainIdx: 4, brightIdx: 2, spaceIdx: 1,
    genres: ['Metal'],
  },

  // ── Hard Rock / Post-Hardcore ─────────────────────────────────────────────
  {
    id: 'hard_rock',
    label: 'Hard Rock / Post-Hardcore / Arena Rock',
    match: /hard rock|post-hardcore|glam metal|arena rock|sleaze rock/,
    amp: 'UK 800',
    ampParams: { Gain:65, Bass:48, Middle:58, Treble:62, Volume:72, Presence:65 },
    cab: 'UK GRN 2',
    od: 'Force',
    odParams: { Gain:55, Tone:52, Volume:68 },
    hasNS: true, nsThreshold: 35,
    hasChorus: false, hasDelay: false,
    pickup: 'Bridge Split (4th)',
    gainIdx: 3, brightIdx: 3, spaceIdx: 1,
    genres: ['Punk', 'J-Rock'],
  },

  // ── Punk / Emo / Grunge ───────────────────────────────────────────────────
  {
    id: 'punk',
    label: 'Punk / Emo / Grunge / Hardcore',
    match: /\bpunk\b|\bemo\b|grunge|hardcore punk|^hardcore$|screamo|post-punk/,
    amp: 'UK SLP',
    ampParams: { Gain:60, Bass:45, Middle:55, Treble:65, Volume:75, Presence:60 },
    cab: 'UK GRN 2',
    od: 'Darktale',
    odParams: { Gain:58, Tone:55, Volume:68 },
    hasNS: false, nsThreshold: 32,
    hasChorus: false, hasDelay: false,
    pickup: 'Bridge Split (4th)',
    gainIdx: 3, brightIdx: 2, spaceIdx: 1,
    genres: ['Punk'],
  },

  // ── Post-Rock / Shoegaze ──────────────────────────────────────────────────
  {
    id: 'post_rock',
    label: 'Post-Rock / Shoegaze / Math Rock',
    match: /post-rock|shoegaze|math rock|noise rock|dream pop rock/,
    amp: 'Foxy 30TB',
    ampParams: { Gain:40, Bass:48, Middle:55, Treble:65, Volume:70, Presence:58 },
    cab: 'FOXY 2',
    od: 'TaiChi OD',
    odParams: { Gain:38, Tone:55, Volume:65 },
    hasNS: false, nsThreshold: 22,
    hasChorus: true, hasDelay: true, // 공간감이 중요하므로 명시적 활성화
    pickup: 'Mid (3rd)',
    gainIdx: 2, brightIdx: 3, spaceIdx: 4,
    genres: ['J-Rock'],
  },

  // ── Indie / Alternative Rock ──────────────────────────────────────────────
  {
    id: 'alternative_rock',
    label: 'Alternative Rock / Indie Rock',
    match: /alternative rock|indie rock|\balternative\b|britpop|garage rock revival/, // 단어 경계로 안정화
    amp: 'UK 45',
    ampParams: { Gain:45, Bass:50, Middle:60, Treble:58, Volume:70, Presence:55 },
    cab: 'UK GRN 2',
    od: 'Green OD',
    odParams: { Gain:40, Tone:52, Volume:65 },
    hasNS: false, nsThreshold: 28,
    hasChorus: false, hasDelay: true,
    pickup: 'Mid (3rd)',
    gainIdx: 2, brightIdx: 3, spaceIdx: 3,
    genres: ['J-Rock'],
  },

  // ── J-Rock / Visual Kei ───────────────────────────────────────────────────
  {
    id: 'jrock',
    label: 'J-Rock / Visual Kei',
    match: /j-rock|jrock|visual kei|japanese rock/,
    amp: 'UK 800',
    ampParams: { Gain:52, Bass:45, Middle:62, Treble:58, Volume:70, Presence:60 },
    cab: 'UK LD',
    od: 'Force',
    odParams: { Gain:45, Tone:50, Volume:66 },
    hasNS: true, nsThreshold: 32,
    hasChorus: false, hasDelay: false,
    pickup: 'Bridge Split (4th)',
    gainIdx: 3, brightIdx: 2, spaceIdx: 2, // Gain 2 -> 3으로 상향 (J-Rock 특유의 드라이브감 반영)
    genres: ['J-Rock'],
  },

  // ── R&B / Funk (우선순위 변경: Blues보다 위로 이동) ─────────────────────
  {
    id: 'rnb_funk',
    label: 'R&B / Funk / Neo Soul',
    match: /r&b|rnb|funk|neo soul|soul|groove|rhythm and blues|gospel|reggae|\bska\b/, // 레게·스카의 클린 커팅도 여기
    amp: 'Dark Twin',
    ampParams: { Gain:18, Bass:55, Middle:50, Treble:65, Volume:72, Presence:50 },
    cab: null,
    od: 'Green OD',
    odParams: { Gain:20, Tone:55, Volume:62 },
    hasNS: false, nsThreshold: 18,
    hasChorus: false, hasDelay: false,
    pickup: 'Neck Split (2nd)',
    gainIdx: 1, brightIdx: 3, spaceIdx: 2,
    genres: ['Funk', 'R&B'],
  },

  // ── Blues ─────────────────────────────────────────────────────────────────
  {
    id: 'blues',
    label: 'Blues / Blues Rock',
    match: /blues rock|\bblues\b|delta blues|electric blues|chicago blues/,
    amp: 'Tweedy',
    ampParams: { Gain:35, Bass:55, Middle:58, Treble:62, Volume:70, Presence:52 },
    cab: null,
    od: 'Blues Master',
    odParams: { Gain:42, Tone:55, Volume:62 },
    hasNS: false, nsThreshold: 20,
    hasChorus: false, hasDelay: false,
    pickup: 'Neck (1st)',
    gainIdx: 1, brightIdx: 2, spaceIdx: 2,
    genres: ['Blues'],
  },

  // ── J-Pop / City Pop ──────────────────────────────────────────────────────
  {
    id: 'jpop',
    label: 'J-Pop / City Pop',
    match: /j-pop|jpop|city pop|shibuya-kei|anime|anison|vocaloid/,   // 애니송·보컬로이드
    amp: 'Dark Twin',
    ampParams: { Gain:20, Bass:52, Middle:55, Treble:68, Volume:75, Presence:52 },
    cab: null,
    od: null,
    odParams: null,
    hasNS: false, nsThreshold: 18,
    hasChorus: true, hasDelay: true,
    pickup: 'Neck Split (2nd)',
    gainIdx: 1, brightIdx: 3, spaceIdx: 3,
    genres: ['J-Pop'],
  },

  // ── Jazz ──────────────────────────────────────────────────────────────────
  {
    id: 'jazz',
    label: 'Jazz / Bossa Nova',
    match: /jazz|bossa nova|bebop|cool jazz|smooth jazz|fusion|lo-?fi/,   // 퓨전·로파이의 재지한 클린
    amp: 'J-120 CL',
    ampParams: { Gain:15, Bass:55, Middle:52, Treble:60, Volume:75, Presence:48 },
    cab: null,
    od: null,
    odParams: null,
    hasNS: false, nsThreshold: 15,
    hasChorus: false, hasDelay: false,
    pickup: 'Neck (1st)',
    gainIdx: 0, brightIdx: 1, spaceIdx: 2, // Bright 2 -> 1로 하향 (재즈 특유의 따뜻하고 먹먹한 톤)
    genres: ['Jazz'],
  },

  // ── Country / Folk ────────────────────────────────────────────────────────
  {
    id: 'country_folk',
    label: 'Country / Folk / Bluegrass',
    match: /country|folk|bluegrass|americana|roots music/,
    amp: 'Tweedy',
    ampParams: { Gain:12, Bass:48, Middle:52, Treble:65, Volume:72, Presence:55 },
    cab: null,
    od: null,
    odParams: null,
    hasNS: false, nsThreshold: 15,
    hasChorus: false, hasDelay: false,
    pickup: 'Neck (1st)',
    gainIdx: 0, brightIdx: 3, spaceIdx: 2, // Bright 2 -> 3으로 상향 (텔레캐스터 트왱 사운드 반영)
    genres: ['Country'],
  },

  // ── Classic / Garage Rock ─────────────────────────────────────────────────
  // 범용 'rock' 은 "blues rock", "folk rock" 같은 구체 장르까지 잡아버리므로 뒤쪽에 둠
  {
    id: 'rock',
    label: 'Rock / Classic Rock / Garage Rock',
    match: /\brock\b|classic rock|garage rock|stoner rock|psychedelic rock/,
    amp: 'UK 45',
    ampParams: { Gain:42, Bass:50, Middle:58, Treble:60, Volume:70, Presence:55 },
    cab: 'UK GRN 2',
    od: 'Blues Master',
    odParams: { Gain:38, Tone:50, Volume:64 },
    hasNS: false, nsThreshold: 25,
    hasChorus: false, hasDelay: false,
    pickup: 'Mid (3rd)',
    gainIdx: 2, brightIdx: 2, spaceIdx: 2,
    genres: ['J-Rock'],
  },

  // ── Pop ───────────────────────────────────────────────────────────────────
  {
    id: 'pop',
    label: 'Pop / Indie Pop / Dance Pop',
    match: /\bpop\b|indie pop|dream pop|dance pop|synth pop|electropop|kpop|ballad/, // kpop·발라드
    amp: 'Foxy 30N',
    ampParams: { Gain:15, Bass:50, Middle:55, Treble:68, Volume:75, Presence:50 },
    cab: null,
    od: null,
    odParams: null,
    hasNS: false, nsThreshold: 15,
    hasChorus: true, hasDelay: true,
    pickup: 'Neck Split (2nd)',
    gainIdx: 1, brightIdx: 3, spaceIdx: 3,
    genres: ['Pop'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Fallback — 태그 없거나 미매칭 시 기본값
// ─────────────────────────────────────────────────────────────────────────────

/** @type {HardwareRule} */
const FALLBACK_RULE = {
  id: 'fallback',
  label: 'Standard Rock — UK JTM45 (Fallback)',
  match: /.*/,
  amp: 'UK 45',
  ampParams: { Gain:42, Bass:50, Middle:58, Treble:60, Volume:70, Presence:55 },
  cab: 'UK GRN 2',
  od: 'Green OD',
  odParams: { Gain:35, Tone:50, Volume:62 },
  hasNS: false, nsThreshold: 25,
  hasChorus: false, hasDelay: false,
  pickup: 'Mid (3rd)',
  gainIdx: 2, brightIdx: 2, spaceIdx: 2,
  genres: ['J-Rock'],
};

// ─────────────────────────────────────────────────────────────────────────────
// 공개 API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MusicBrainz 장르 태그 배열 → GP-200JR 하드웨어 룰 매핑
 *
 * 태그 순서가 곧 우선순위다 (호출 측에서 MusicBrainz 득표수 내림차순으로 정렬해 넘길 것).
 * 앞쪽 태그부터 보면서, 그 태그에 맞는 룰 중 목록상 가장 위(구체적인) 룰을 고른다.
 * 예) YOASOBI [pop, j-pop, j-rock] → 대표 태그 'pop' 기준으로 판단 (뒤쪽 j-rock 에 끌려가지 않음)
 */
// 한글로 입력한 장르 → 영어 태그 (MusicBrainz 태그는 영어라 룰도 영어 기준)
// '펑크'는 한국어에서 punk·funk 둘 다라서 punk 로, funk 는 '펑키'·'훵크'로
const KO_GENRES = {
  '메탈': 'metal', '헤비메탈': 'heavy metal', '헤비 메탈': 'heavy metal', '데스메탈': 'death metal', '블랙메탈': 'black metal',
  '스래시메탈': 'thrash metal', '쓰래시메탈': 'thrash metal', '메탈코어': 'metalcore', '젠트': 'djent', '뉴메탈': 'nu metal',
  '록': 'rock', '락': 'rock', '하드록': 'hard rock', '하드락': 'hard rock', '얼터너티브': 'alternative', '얼터너티브록': 'alternative rock',
  '인디': 'indie rock', '인디록': 'indie rock', '인디락': 'indie rock', '포스트록': 'post-rock', '슈게이징': 'shoegaze', '슈게이즈': 'shoegaze', '매스록': 'math rock',
  '펑크': 'punk', '펑크록': 'punk', '펑크락': 'punk', '이모': 'emo', '그런지': 'grunge', '하드코어': 'hardcore',
  '제이록': 'j-rock', '제이락': 'j-rock', '비주얼계': 'visual kei', '비주얼케이': 'visual kei',
  '제이팝': 'j-pop', '시티팝': 'city pop', '애니': 'anime', '애니송': 'anime', '보컬로이드': 'vocaloid',
  '팝': 'pop', '케이팝': 'kpop', '인디팝': 'indie pop', '발라드': 'ballad',
  '알앤비': 'r&b', '펑키': 'funk', '훵크': 'funk', '소울': 'soul', '네오소울': 'neo soul', '가스펠': 'gospel', '레게': 'reggae', '스카': 'ska',
  '블루스': 'blues', '블루스록': 'blues rock', '재즈': 'jazz', '퓨전': 'fusion', '보사노바': 'bossa nova', '로파이': 'lo-fi',
  '컨트리': 'country', '포크': 'folk', '블루그래스': 'bluegrass',
};

function mapGenreToHardware(tags) {
  if (!tags || tags.length === 0) {
    return { rule: FALLBACK_RULE, matched: false, matchedTag: null };
  }

  for (const tag of tags) {
    const raw = String(tag).toLowerCase().trim();
    const t = KO_GENRES[raw] ?? KO_GENRES[raw.replace(/\s+/g, '')] ?? raw;
    if (!t) continue;
    const rule = GP200JR_GENRE_RULES.find(r => r.match.test(t));
    if (rule) return { rule, matched: true, matchedTag: t === raw ? tag : t };
  }

  return { rule: FALLBACK_RULE, matched: false, matchedTag: null };
}

/**
 * HardwareRule → wizardGenerate() 파라미터 객체로 변환
 * (Antigravity 개선: 룰에 명시된 플래그를 통해 이펙터 ON/OFF를 제어)
 */
function ruleToWizardParams(rule) {
  return {
    gainIdx:   rule.gainIdx,
    brightIdx: rule.brightIdx,
    spaceIdx:  rule.spaceIdx,
    genres:    rule.genres,
    fxOn: [
      'reverb', // 리버브는 항상 기본값으로 제공
      ...(rule.hasChorus ? ['chorus'] : []),
      ...(rule.hasDelay  ? ['delay']  : []),
      // NS는 wizardGenerate 내부서 gain 기준 처리
    ],
  };
}

// 전역 네임스페이스 노출 (빌드 없는 standalone 환경)
window.GenreMapper = {
  mapGenreToHardware,
  ruleToWizardParams,
  GP200JR_GENRE_RULES,
  FALLBACK_RULE,
};
