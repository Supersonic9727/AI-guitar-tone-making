/**
 * gp200jrModels.js — Valeton GP-200JR 실제 이펙트 모델 & 파라미터 표 (펌웨어 V1.8.0)
 *
 * 출처: GP-200JR Online Manual (EN, Firmware V1.8.0) "Effect List" (V1.7.0 표에 A-Chorus·Gate 3·Tube OD·Broken Delay 추가)
 *       https://www.valeton.net/wpfd_file/gp-200jr_online-manual_en_firmware-v1-7-0-pdf/
 *       ※ 매뉴얼 PDF 의 DLY 표는 설명·파라미터 칸이 모델 이름보다 한 줄씩 밀려 있어 설명 내용으로 맞춤
 *
 * - module : 기기의 실제 모듈. 한 프리셋에서 모듈당 이펙트는 1개만 켤 수 있음
 *            (PRE → WAH → DST → AMP → NR → CAB → EQ → MOD → DLY → RVB → VOL)
 * - params : 기기 화면에 나오는 이름·순서 그대로
 *            { n }                       노브 0~100 (매뉴얼에 범위 표기 없음 → 기본값)
 *            { n, min, max, unit }       범위/단위가 다른 노브 (ms, dB, cents …)
 *            { n, t:'switch' }           ON/OFF
 *            { n, t:'select', o:[…] }    선택형
 * - verify : 매뉴얼만으로 확정하지 못한 값 → 실제 기기로 확인 필요
 */

'use strict';

(() => {
const K    = (...names) => names.map(n => ({ n }));
const R    = (n, min, max, unit, extra = {}) => ({ n, min, max, unit, ...extra });
const SW   = n => ({ n, t: 'switch' });
const SEL  = (n, o) => ({ n, t: 'select', o });
const SYNC = SW('Sync'), TRAIL = SW('Trail');
const TIME = R('Time', 0, 4000, 'ms');   // 사용자 확인(2026-10): 0~4000ms

// 모듈별로 따로 보관 — 같은 이름이 여러 모듈에 있음 (예: 'Dark Twin' 은 AMP 이자 CAB)
const models = {};
const add = (module, type, names, params, extra = {}) =>
  [].concat(names).forEach(name => { (models[module] ??= {})[name] = { module, type, params, ...extra }; });

// ── 여러 모듈에 공통으로 들어가는 모델 ───────────────────────────────────────
const boosts = m => {
  add(m, 'Boost', 'Micro Boost', K('Gain'));
  add(m, 'Boost', ['AC Boost', 'B-Boost', 'P-Boost'], K('Gain', 'Volume', 'Bass', 'Treble'));
  add(m, 'Boost', '14 Boost', K('Gain'));
  add(m, 'Boost', 'FAT BB', [...K('Volume', 'Bass', 'Treble'), SW('Low Cut')]);
  add(m, 'Boost', 'Boost',  [...K('Volume'), SW('+3dB'), SW('Bright')]);
};
const odsShared = m => {
  add(m, 'OD', ['OD 9', 'Penesas', 'Super OD', 'Blues OD'], K('Gain', 'Tone', 'Volume'));
  add(m, 'OD', 'Yellow OD', K('Gain', 'Volume'));
};
const autoSwell = m => add(m, 'Special', 'Auto Swell', [...K('Attack'), SEL('Curve', ['Line', 'Exp', 'Log'])]);
const hammy = m => add(m, 'Pitch', 'Hammy', [...K('Range'), SW('Harmony'), ...K('Volume', 'Position')]);
const freezes = m => {
  add(m, 'Special', 'Hold',   [...K('Volume'), SW('Activate')]);
  add(m, 'Special', 'Freeze', [...K('Volume', 'Attack', 'Release'), SW('Activate')]);
};
const snapTones = m => {
  for (let i = 1; i <= 5; i++) add(m, 'SnapTone', `SnapTone ${i}`, K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'));
};

// ── PRE ──────────────────────────────────────────────────────────────────────
add('PRE', 'Comp', 'COMP',   K('Sustain', 'Volume'));
add('PRE', 'Comp', 'COMP4',  K('Sustain', 'Attack', 'Volume', 'Clipping'));
add('PRE', 'Comp', 'S-Comp', K('Threshold', 'Ratio', 'Volume', 'Attack', 'Release', 'Blend', 'Tone'));
boosts('PRE');
odsShared('PRE');
add('PRE', 'Acoustic', 'AC Refiner', K('Shape'));
add('PRE', 'Acoustic', 'AC Sim', [...K('Body', 'Top', 'Volume'), SEL('Mode', ['Standard', 'Jumbo', 'Enhanced', 'Piezo'])]);
add('PRE', 'Filter', 'T-Wah', [...K('Sens', 'Range', 'Q', 'Mix'), SEL('Mode', ['Guitar', 'Bass'])]);
add('PRE', 'Auto Filter', 'A-WAH', [...K('Depth', 'Rate', 'Volume', 'Low', 'High', 'Q'), SYNC]);
add('PRE', 'Filter', 'Step Filter', [...K('Step 1', 'Step 2', 'Step 3', 'Step 4', 'Rate'), SYNC]);
add('PRE', 'Pitch', 'OCTA',   K('Oct 1', 'Oct 2', 'Dry'));
add('PRE', 'Pitch', 'Pitch',  [R('Low Pitch', -24, 24, 'st', { verify: true }), R('Hi Pitch', -24, 24, 'st', { verify: true }), ...K('Dry', 'Low Volume', 'High Volume')]);
add('PRE', 'Pitch', 'P-Bend', [R('Low Pitch', -24, 24, 'st', { verify: true }), R('Hi Pitch', -24, 24, 'st', { verify: true }), ...K('Wet', 'Dry', 'Range')]);
hammy('PRE');
const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
add('PRE', 'Pitch', 'Harmonizer 1', [...K('Mix'), SEL('Key', KEYS), SEL('Mode', ['Major', 'Minor']), SEL('Interval', ['3rd', '4th', '5th', '6th', 'Oct']), SW('Smooth Mode')], { verify: true });
add('PRE', 'Pitch', 'Harmonizer 2', [...K('Mix'), SEL('Key', KEYS), SEL('Mode', ['Major', 'Minor']), SEL('Interval 1', ['3rd', '4th', '5th', '6th', 'Oct']), SEL('Interval 2', ['3rd', '4th', '5th', '6th', 'Oct']), SW('Smooth Mode')], { verify: true });
add('PRE', 'Special', 'Ring Mod', [...K('Mix', 'Freq'), R('Fine', -50, 50, 'Hz'), ...K('Tone')]);
add('PRE', 'Special', 'Saturate', K('Saturation', 'Mix', 'Volume', 'High Cut'));
autoSwell('PRE');
freezes('PRE');

// ── WAH ──────────────────────────────────────────────────────────────────────
add('WAH', 'Wah', ['V-Wah', 'C-Wah', 'S-Wah', 'B-Wah'], K('Range', 'Q', 'Volume'));
add('WAH', 'Wah', 'P-Wah', [...K('Range', 'Q', 'Volume'), SW('EQ')]);
hammy('WAH');

// ── DST (오버드라이브·디스토션·퍼즈·부스트) ───────────────────────────────────
add('DST', 'OD', ['Green OD', 'Swarm'], K('Gain', 'Tone', 'Volume'));
odsShared('DST');
add('DST', 'OD', 'Scream OD',   [...K('Gain', 'Volume', 'Tone'), SW('Fat'), SW('Air')]);
add('DST', 'OD', 'Force',       [...K('Gain', 'Tone', 'Volume'), SEL('Mode', ['HP', 'LP'])]);
add('DST', 'OD', 'Tube OD',     K('Gain', 'Volume', 'Bass', 'Treble'));   // V1.8.0 신규 — B.K. Butler Tube Driver
add('DST', 'OD', 'Blues Master', K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'));
add('DST', 'OD', 'Master OD',   K('Gain', 'Tone', 'Volume'));
add('DST', 'OD', 'TaiChi OD',   K('Gain', 'Tone', 'Volume', 'Voice'));
add('DST', 'OD', 'Timmy OD',    [...K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'), SEL('Mode', ['I', 'II', 'III'])]);
add('DST', 'OD', 'Precise OD',  [...K('Gain', 'Tone', 'Volume'), SEL('Attack', ['1', '2', '3', '4', '5', '6']), ...K('Gate')]);
add('DST', 'OD', 'Empire OD',   [...K('Gain', 'Tone', 'Volume'), SEL('Mode', ['1', '2', '3'])]);
add('DST', 'Fuzz', 'Lazaro',    K('Sustain', 'Tone', 'Volume'));
add('DST', 'Fuzz', ['Red Haze', 'Sora Fuzz'], K('Fuzz', 'Volume'));
add('DST', 'Distortion', 'Plustortion', K('Gain', 'Volume'));
add('DST', 'Distortion', ['SM Dist', 'La Charger'], K('Gain', 'Tone', 'Volume'));
add('DST', 'Distortion', 'Darktale', K('Gain', 'Filter', 'Volume'));
add('DST', 'Distortion', 'Chief', K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'));
add('DST', 'Distortion', 'Master Dist', K('Gain', 'Volume', 'Bass', 'Contour', 'Treble'));
add('DST', 'Distortion', 'Revolt', [...K('Gain', 'Tone', 'Volume'), SEL('Mode', ['I', 'II', 'III'])]);
add('DST', 'Distortion', 'Flagman Dist', K('Gain', 'Volume', 'Bass', 'Treble', 'Presence', 'Tight'));
add('DST', 'Bass Drive', 'Flex OD', [...K('Gain', 'Tone', 'Volume'), SEL('Mode', ['Normal', 'Scoop', 'Edge']), ...K('Blend')]);
add('DST', 'Bass Drive', 'Bass OD', K('Gain', 'Blend', 'Volume', 'Bass', 'Treble'));
add('DST', 'Bass Preamp', 'Black Bass', [...K('Gain', 'Blend', 'Volume', 'Low', 'Lo-mid', 'Hi-mid', 'Treble'), SEL('Attack', ['Cut', 'Boost', 'Flat'])]);
add('DST', 'Bass Preamp', 'Bass Hammer', [...K('Gain', 'Master', 'Bass', 'Middle', 'Treble', 'Mid Freq'), SW('Drive')]);
boosts('DST');
snapTones('DST');

// ── AMP ──────────────────────────────────────────────────────────────────────
const AMP6 = K('Gain', 'Presence', 'Volume', 'Bass', 'Middle', 'Treble');
add('AMP', 'Clean', 'Tweedy', K('Gain', 'Tone', 'Volume'));
add('AMP', 'Clean', 'Bellman 59N', AMP6);
add('AMP', 'Drive', 'Bellman 59B', AMP6);
add('AMP', 'Clean', 'Dark Twin',   [...K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'), SW('Bright')]);
add('AMP', 'Clean', 'Dark DLX',    K('Gain', 'Volume', 'Bass', 'Treble'));
add('AMP', 'Clean', 'Dark Vibra',  [...K('Gain', 'Volume', 'Bass', 'Treble'), SW('Bright')]);
add('AMP', 'Clean', 'Silver Twin', K('Gain', 'Volume', 'Bass', 'Treble'));
add('AMP', 'Clean', 'SUPDual CL',  K('Gain', 'Volume', 'Tone'));
add('AMP', 'Drive', 'SUPDual OD',  K('Gain 1', 'Gain 2', 'Tone 1', 'Tone 2', 'Volume'));
add('AMP', 'Clean', 'Foxy 15TB',   K('Gain', 'Tone', 'Volume', 'Bass', 'Treble'));
add('AMP', 'Clean', 'Foxy 30N',    [...K('Gain', 'Volume', 'Tone Cut'), SW('Bright')]);
add('AMP', 'Drive', 'Foxy 30TB',   [...K('Gain', 'Tone Cut', 'Volume', 'Bass', 'Treble'), SEL('Char', ['Cool', 'Hot'])]);
add('AMP', 'Clean', 'J-120 CL',    [...K('Gain'), SW('Bright'), ...K('Bass', 'Middle', 'Treble')]);
add('AMP', 'Clean', ['Match CL', 'L-Star CL'], AMP6);
add('AMP', 'Drive', 'Match OD', AMP6);
add('AMP', 'Drive', 'L-Star OD', K('Input', 'Gain', 'Presence', 'Volume', 'Bass', 'Middle', 'Treble'));
add('AMP', 'Clean', 'BogSV CL', [...K('Gain', 'Presence', 'Volume', 'Bass', 'Treble'), SW('Bright')]);
add('AMP', 'Drive', ['BogSV OD', 'Bog BlueV', 'Bog BlueM'], AMP6);
add('AMP', 'Hi Gain', ['Bog RedV', 'Bog RedM'], AMP6);
add('AMP', 'Clean', 'Z38 CL', K('Gain', 'Tone Cut', 'Volume', 'Bass', 'Middle', 'Treble'));
add('AMP', 'Drive', 'Z38 OD', K('Gain', 'Tone Cut', 'Volume', 'Bass', 'Middle', 'Treble'));
add('AMP', 'Clean', ['Knights CL', 'Knights CL+'], K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'));
add('AMP', 'Drive', 'Knights OD', K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'));
add('AMP', 'Clean', 'Bad-KT CL', K('Gain', 'Presence', 'Volume'));
add('AMP', 'Drive', 'Bad-KT OD', K('Gain', 'Presence', 'Volume', 'Edge', 'Bass', 'Treble'));
add('AMP', 'Clean', 'Solo100 CL', AMP6);
add('AMP', 'Drive', 'Solo100 OD', AMP6);
add('AMP', 'Hi Gain', 'Solo100 LD', AMP6);
add('AMP', 'Drive', ['UK 45', 'UK 45+', 'UK 45JP', 'UK 50', 'UK 50+', 'UK SLP', 'UK 800'], AMP6);
add('AMP', 'Drive', 'UK 50JP', K('Gain 1', 'Gain 2', 'Presence', 'Volume', 'Bass', 'Middle', 'Treble'));
add('AMP', 'Hi Gain', 'UK 900', AMP6);
add('AMP', 'Drive', ['Flagman 1', 'Flagman 2'], AMP6);
add('AMP', 'Hi Gain', ['Flagman+ 1', 'Flagman+ 2'], AMP6);
add('AMP', 'Drive', ['Mess2C+ 1', 'Mess2C+ 2', 'Mess 2C+ 3'], AMP6);
add('AMP', 'Hi Gain', ['Mess4 LD', 'Mess4 LD 2', 'Mess4 LD 3', 'Mess DualV', 'Mess DualM'], AMP6);
add('AMP', 'Drive', 'Juice30 OD', K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'));
add('AMP', 'Hi Gain', 'Juice R100', [...K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'), SW('Bright')]);
add('AMP', 'Hi Gain', ['EV 51', 'Eagle 120', 'Eagle 120+', 'Power LD'], AMP6);
add('AMP', 'Hi Gain', ['Dizz VH', 'Dizz VH S', 'Dizz VH+', 'Dizz VH+ S'], AMP6);
add('AMP', 'Bass', 'Classic Bass', [...K('Gain'), SEL('Mid Freq', ['220Hz', '450Hz', '800Hz', '1.6kHz', '3kHz']), ...K('Volume', 'Bass', 'Midrange', 'Treble')]);
add('AMP', 'Bass', ['Foxy Bass', 'Mini Bass'], K('Volume', 'Bass', 'Treble'));
add('AMP', 'Bass', 'Mess Bass', K('Gain', 'Volume', 'Bass', 'Middle', 'Treble'));
add('AMP', 'Bass', 'Bass Pre', [...K('Volume'), SW('Bright'), ...K('Bass', 'Middle', 'Treble')]);
add('AMP', 'Acoustic', ['AC Pre', 'AC Pre 2'], K('Volume', 'Tone', 'Balance', 'EQ Freq', 'EQ Q', 'EQ Gain'));
snapTones('AMP');

// ── NR ───────────────────────────────────────────────────────────────────────
add('NR', 'Gate', 'Gate 1', K('Threshold'));   // 사용자 확인: 0~100
add('NR', 'Gate', 'Gate 2', K('Threshold', 'Attack', 'Release'));
add('NR', 'Gate', 'Gate 3', K('Threshold', 'Ratio', 'Attack', 'Release', 'Hold', 'Hysteresis'));   // V1.8.0 신규 — 인버스 익스팬더
autoSwell('NR');

// ── CAB (모든 캐비닛 공통 파라미터) ─────────────────────────────────────────
// 사용자 확인(2026-10): Low Cut 0~2000Hz, Hi Cut 0~2000Hz
// Hi Cut 0Hz = 고음을 깎지 않음 (OFF) — 실기에서 소리로 확인
const CAB = [...K('Volume'), R('Low Cut', 0, 2000, 'Hz'), R('Hi Cut', 0, 2000, 'Hz', { offAtZero: true })];
const cabs = {
  'SUP ZEP': '1x6 Supro', 'TWD CP': '1x8 Fender Champ', 'TWD PRC': '1x10 Fender Princeton', 'TWD SUP': '2x10 Fender Tweed',
  'TWD LUX': '1x12 Fender Tweed Deluxe', 'Dark LUX': '1x12 Fender Deluxe', 'Dark VIT': '1x12 Fender Vibrolux',
  'Dark Twin': "2x12 Fender '65 Twin Reverb", 'Dark CS': '2x12 custom Fender', 'Bellman 1': '2x12 Fender Bassman piggyback',
  'Bellman 2': "4x10 Fender '59 Bassman", 'J-120': '2x12 Roland Jazz Chorus', 'UK G12': '1x12 Marshall',
  'UK GRN 1': '2x12 Marshall 2550', 'UK LD': '4x12 Marshall 1960AV (Vintage 30)', 'UK TD': "4x12 '68 Marshall Basketweave",
  'UK MD': '4x12 custom Marshall', 'UK GRN 2': '4x12 Marshall Greenback', 'UK 75': '4x12 Marshall G12T-75', 'UK Dark': '4x12 1968 Marshall',
  'FOXY 1': '1x12 VOX AC15', 'FOXY 2': '2x12 VOX AC30', 'ROUT': '1x12 Carr Rambler', 'BogSV': '1x12 Bogner Shiva',
  'Bad-KT': '1x12 Bad Cat Hot Cat', 'Match': '2x12 Matchless Chieftain', 'TOM OPEN': '1x12 Swart Atomic Space',
  'ACE': '1x12 Morgan AC-20', 'Mess': '4x12 Mesa/Boogie Rectifier', 'D STAR': '1x12 Mesa Lonestar', 'SUP Star': '2x12 Mesa Lonestar',
  'US STO': "1x12 1980's Mesa/Boogie", 'BOUTI': '2x12 custom', 'SUP': '2x12 Supro 1624T', 'MATT TWD': '2x12 Matchless',
  'Freed': '2x12 Fryette Deliverance', 'DB Rock': '2x12 Two-Rock', 'Blue SK': '2x12 Celestion Alnico Blue',
  'EV': '4x12 Peavey 6505', 'Bog': '4x12 Bogner', 'Eagle': '4x12 ENGL', 'Uban': '4x12 Bogner Uberkab', 'Solo': '4x12 Soldano',
  'Juice': '4x12 Orange PPC412', 'H-WAY': '4x12 Hiwatt SE4123', 'Way': '4x12 WEM', 'Dumb': '4x12 Dumble', 'Dizz': '4x12 Diezel',
  'TRP': '4x12 Hughes & Kettner Triamp', 'King': '4x12 Mesa Road King',
  'ADM 1': '1x15 Eden bass', 'ADM 2': '4x10 Eden bass', 'Workman 1': '1x15 SWR bass', 'Workman 2': '4x10 SWR bass',
  'US BASS': '2x10 Mesa bass', 'MATT': '2x10 Mark Bass', 'F-TOP': '1x15 Ampeg PF-115HE', 'AMPG 1': '4x10 Ampeg SVT-410HE',
  'AMPG 2': '8x10 Ampeg SVT-810E', 'HACK': '4x12 Hartke bass',
  'AC': 'Dreadnought 1', 'AC Dream': 'Dreadnought 2', 'OM': 'OM acoustic', 'JUMBO': 'Jumbo acoustic', 'Bird': 'H-Bird acoustic',
  'GA': 'GA acoustic', 'Classic AC': 'Classical guitar', 'Mandolin': 'Mandolin', 'Fretless Bass': 'Fretless acoustic bass', 'Double Bass': 'Double bass',
};
Object.entries(cabs).forEach(([name, base]) => add('CAB', 'Cab', name, CAB, { base }));
for (let i = 1; i <= 20; i++) add('CAB', 'User IR', `User IR ${i}`, CAB);

// ── EQ (밴드 값 = dB) ────────────────────────────────────────────────────────
const bands = (freqs, verify) => freqs.map((hz, i) => R(`Band ${i + 1}`, -12, 12, 'dB', { hz, ...(verify ? { verify } : {}) }));
add('EQ', 'EQ', 'Guitar EQ 1', [...bands(['125Hz', '400Hz', '800Hz', '1.6kHz', '4kHz'], true), ...K('Volume')]);
add('EQ', 'EQ', 'Guitar EQ 2', [...bands(['100Hz', '500Hz', '1kHz', '3kHz', '6kHz'], true), ...K('Volume')]);
add('EQ', 'EQ', 'Bass EQ 1',   [...bands(['33Hz', '150Hz', '600Hz', '2kHz', '8kHz'], true), ...K('Volume')]);
add('EQ', 'EQ', 'Bass EQ 2',   [...bands(['50Hz', '120Hz', '400Hz', '800Hz', '4.5kHz'], true), ...K('Volume')]);
add('EQ', 'EQ', 'Mess EQ',     bands(['80Hz', '240Hz', '750Hz', '2.2kHz', '6.6kHz'], true));
add('EQ', 'EQ', 'Hyper EQ',    [...bands(['31Hz', '63Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz']), ...K('Volume')]);   // 매뉴얼: ±12dB

// ── MOD (코러스·플랜저·페이저·트레몰로 등 — 한 번에 1개만) ──────────────────
add('MOD', 'Chorus', ['G-Chorus', 'B-Chorus'], [...K('Depth', 'Rate', 'Volume'), SYNC]);
add('MOD', 'Chorus', 'C-Chorus', [SEL('Mode', ['1', '2', '3', '4'])]);
add('MOD', 'Chorus', 'A-Chorus', [...K('Depth', 'Rate', 'Tone'), SYNC]);   // V1.8.0 신규 — 80년대 코러스
add('MOD', 'Chorus', 'M-Chorus', [...K('Mix', 'Rate', 'Filter', 'Depth L', 'Depth C', 'Depth R'), SYNC]);
add('MOD', 'Flanger', ['Jet', 'B-Jet', 'N-Jet'], [...K('Depth', 'Rate', 'Pre Delay', 'Feedback'), SYNC]);
add('MOD', 'Flanger', 'Trem Jet', [...K('Flg Depth', 'Flg Rate', 'Feedback', 'Trm Depth', 'Trm Rate'), SW('Flg Sync'), SW('Trm Sync')]);
add('MOD', 'Vibrato', 'V-Roto', [...K('Depth', 'Rate'), SYNC]);
add('MOD', 'Vibrato', ['G-Roto', 'Vibrato'], [...K('Depth', 'Rate', 'Volume'), SYNC]);
add('MOD', 'Vibrato', 'Vibrato T', [...K('Sens', 'Rate', 'Output'), SYNC]);
add('MOD', 'Phaser', 'O-Phase', [...K('Rate'), SYNC]);
add('MOD', 'Phaser', ['G-Phase', 'M-Vibe'], [...K('Depth', 'Rate'), SYNC]);
add('MOD', 'Phaser', 'S-Phase', [...K('Rate'), SYNC, SEL('Char', ['Warm', 'Sharp'])]);
add('MOD', 'Phaser', 'Pan Phase', [...K('Pan Depth', 'Pan Rate', 'Phaser Depth', 'Phaser Rate'), SW('Phs Sync'), SW('Pan Sync')]);
add('MOD', 'Phaser', 'Vibe', [...K('Depth', 'Rate', 'Volume'), SEL('Mode', ['Chorus', 'Vibrato']), SYNC]);
add('MOD', 'Tremolo', 'O-Trem', [...K('Depth', 'Rate'), SYNC]);
add('MOD', 'Tremolo', 'Sine Trem', [...K('Depth', 'Rate', 'Volume'), SYNC]);
add('MOD', 'Tremolo', 'Bias Trem', [...K('Depth', 'Rate', 'Volume'), SYNC, ...K('Bias')]);
add('MOD', 'Pitch', 'Detune', [...K('Dry/Wet'), R('Detune', -50, 50, 'cents')]);
add('MOD', 'Special', 'Bit Smash', K('Mix', 'Krush', 'Bit', 'Hi Cut', 'Lo Cut'));
autoSwell('MOD');
freezes('MOD');

// ── DLY (Time = ms) ──────────────────────────────────────────────────────────
const DLY_BASIC = [...K('Mix', 'Feedback'), TIME, SYNC, TRAIL];
add('DLY', 'Delay', ['BBD Delay S', 'Digital Delay S'], [...K('Mix', 'Feedback'), TIME, ...K('Time R%', 'Spread', 'Level'), SYNC, TRAIL]);
add('DLY', 'Delay', 'Tape Delay S', [...K('Mix', 'Feedback'), TIME, ...K('Time R%', 'Spread', 'Wow & Flutter'), SEL('Age', ['1', '2', '3']), ...K('Scrape', 'Drive', 'Level'), SYNC, TRAIL]);
add('DLY', 'Delay', ['Ambience 1', 'Ambience 2'], [...K('Mix', 'Feedback'), TIME, ...K('Level', 'Mod', 'Tone'), SYNC, TRAIL]);
add('DLY', 'Delay', ['Pure', 'Analog', 'Tape', 'Ping Pong', 'Tube', 'Sweet Echo', '999 Echo'], DLY_BASIC);
add('DLY', 'Delay', 'Slapback', [...K('Mix', 'Feedback'), TIME, TRAIL]);
add('DLY', 'Delay', 'Sweep Echo', [...K('Mix', 'Feedback'), TIME, ...K('Sweep Depth', 'Sweep Rate'), SW('Swp Sync'), SW('Time Sync'), TRAIL]);
add('DLY', 'Delay', 'Ring Echo', [...K('Dly Mix', 'Feedback'), TIME, ...K('Ring Mix', 'Freq', 'Tone'), SYNC, TRAIL]);
add('DLY', 'Delay', 'M-Echo', [...K('Mix', 'Feedback'), TIME, ...K('Tone'), SEL('Mode', Array.from({ length: 12 }, (_, i) => String(i + 1))), SYNC, TRAIL]);
add('DLY', 'Delay', 'Vintage Rack', [...K('Mix', 'Feedback'), TIME, ...K('Mod', 'Tone'), SYNC, TRAIL]);
add('DLY', 'Delay', 'Lofi Echo', [...K('Mix', 'Feedback'), TIME, ...K('Crush', 'Bit'), SYNC, TRAIL]);
add('DLY', 'Delay', 'Rev Echo', [...K('Mix', 'Feedback'), TIME, ...K('Volume'), SYNC, TRAIL]);
add('DLY', 'Delay', 'Dual Echo', [...K('Mix A', 'FB A'), R('Time A', 0, 4000, 'ms'), ...K('Mix B', 'FB B'), R('Time B', 0, 4000, 'ms'), SW('A Sync'), SW('B Sync'), TRAIL]);
add('DLY', 'Delay', 'Ice Delay', [...K('Mix'), TIME, ...K('Feedback', 'Mod', 'Tone'), SEL('Pitch', ['-12', '-7', '-5', '+5', '+7', '+12']), SEL('Slice', ['1/16', '1/8', '1/4']), SEL('Direction', ['Forward', 'Reverse']), ...K('Blend', 'Smooth', 'Level'), SYNC, TRAIL], { verify: true });
add('DLY', 'Delay', 'Broken Delay', [...K('Mix'), TIME, ...K('Feedback', 'Latch', 'Cut'), SYNC, TRAIL]);   // V1.8.0 신규 (Latch·Cut 0 = 글리치 없음)

// ── RVB ──────────────────────────────────────────────────────────────────────
add('RVB', 'Reverb', ['Room', 'Hall', 'Church'], [...K('Mix', 'Pre Delay', 'Decay'), TRAIL]);
add('RVB', 'Reverb', 'Plate',  [...K('Mix', 'Decay', 'High Damp'), TRAIL]);
add('RVB', 'Reverb', 'Spring', [...K('Mix', 'Decay', 'Tone'), TRAIL]);
add('RVB', 'Reverb', ['Tube Spring', 'Amp Spring', 'Studio'], [...K('Mix', 'Pre Delay', 'Decay', 'Low Damp', 'Hi Damp', 'Mod'), TRAIL]);
add('RVB', 'Reverb', ['N-Star', 'Deepsea'], [...K('Mix', 'Decay'), TRAIL]);
add('RVB', 'Reverb', ['Sweet Space', 'Shimmer'], [...K('Mix', 'Pre Delay', 'Decay', 'Low End', 'High End'), TRAIL]);

// ── VOL ──────────────────────────────────────────────────────────────────────
add('VOL', 'Volume', 'Volume', K('Volume'));

window.GP200JR = {
  firmware: 'V1.8.0',
  source: 'GP-200JR Online Manual EN (Firmware V1.8.0) — Effect List',
  modules: ['PRE', 'WAH', 'DST', 'AMP', 'NR', 'CAB', 'EQ', 'MOD', 'DLY', 'RVB', 'VOL'],
  models,
  // 앱 블록 카테고리 → 기기 모듈 (앱의 'WAH' 카테고리 모델 T-Wah/A-WAH/Step Filter 는 기기에선 PRE)
  moduleOf: { COMP: 'PRE', BOOST: 'PRE', PIT: 'PRE', SPX: 'PRE', WAH: 'PRE', PWAH: 'WAH', OD: 'DST', DST: 'DST', AMP: 'AMP', NS: 'NR',
              CAB: 'CAB', EQ: 'EQ', CHO: 'MOD', FLG: 'MOD', PHS: 'MOD', TREM: 'MOD', DLY: 'DLY', RVB: 'RVB' },
  find(module, name) { return models[module]?.[name] ?? null; },
};
})();
