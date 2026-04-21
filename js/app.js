/**
 * app.js — 앱 로직 (상태, 렌더링, 이벤트 핸들러)
 *
 * DATA 객체는 data.js 에서 정의됩니다.
 * HTML 구조는 index.html 에 있습니다.
 */

// ── DOM 참조 ──────────────────────────────────────────────────────────────────
const titleEl            = document.getElementById("screenTitle");
const backBtn            = document.getElementById("backButton");
const homeBtn            = document.getElementById("homeButton") || { style: {}, addEventListener: () => {} };
const crumbEl            = document.getElementById("breadcrumb");
const gridEl             = document.getElementById("buttonGrid");
const appMainEl          = document.querySelector("main.app");
const spotlightViewEl    = document.getElementById("spotlightView");
const spotlightBtnEl     = document.getElementById("spotlightButton");
const spotlightImgEl     = document.getElementById("spotlightImage");
const helperEl           = document.getElementById("helperText");
const heroEl             = document.getElementById("heroRow");
const playerWrapEl       = document.getElementById("playerWrap");
const playerEl           = document.getElementById("youtubePlayer");
const openInYoutubeButton= document.getElementById("openInYoutubeButton");
const returnHintEl       = document.getElementById("returnHint");

// ── 네비게이션 상태 ──────────────────────────────────────────────────────────
const navStack = [{ key: "main", label: "메인" }];
let selectedYoutube = "";

function currentKey()           { return navStack[navStack.length - 1]?.key || "main"; }
function pushScreen(key, label) { navStack.push({ key, label }); selectedYoutube = ""; }
function popScreen()            { if (navStack.length > 1) navStack.pop(); }
function breadcrumbText() {
  const parts = navStack.filter((x) => x.key !== "main").map((x) => x.label);
  return parts.join(" > ");
}

// ── 외출 플래너 상태 ─────────────────────────────────────────────────────────
const OUTING_MAX_PERSON = 4;
let outingPlannerMode = "";
const outingSelection = { people: [], place: null, transport: null };

// ── 치료 선택 상태 ───────────────────────────────────────────────────────────
const THERAPY_MAX_SELECT = 3;
const THERAPY_OPTIONS = ["언어", "인지", "음악", "연하", "작업", "물리"];
const THERAPY_OPTIONS_BY_CENTER = {
  "큰나무병원":  ["언어", "인지", "음악"],
  "세브란스병원": ["언어", "작업", "연하", "물리"],
  "사람과소통":  ["언어"]
};
const THERAPY_CENTER_IMAGE = {
  "세브란스병원": "./images/therapy_center_severance.png"
};
const THERAPY_CLASS_IMAGE = {
  "언어": "./images/therapy_class_speech.png",
  "인지": "./images/therapy_class_cognitive.png",
  "음악": "./images/therapy_class_music.png"
};
const THERAPY_CLASS_EMOJI = {
  "언어": "🗣️", "인지": "🧠", "음악": "🎵",
  "연하": "💧", "작업": "🖐️", "물리": "🏃"
};
const therapySelection = {
  centers: [],          // 선택한 병원 이름 배열 (최대 2)
  classesByCenter: {}   // { "큰나무병원": ["언어", "인지"], ... }
};

const fridayTherapySelection = {
  slot1: { center: null, classes: [] },
  slot2: { center: null, classes: [] }
};

// ── 주간 스케줄 상수 및 상태 ─────────────────────────────────────────────────
const SCHEDULE_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const SCHEDULE_ACTIVITY_DEFS = [
  { type: "school",     label: "학교",       shortLabel: "학교",    image: "./images/outing_school1.png",           emoji: "🏫" },
  { type: "home",       label: "집",         shortLabel: "집",      image: "./images/home.png",                     emoji: "🏠" },
  { type: "큰나무",     label: "큰나무병원", shortLabel: "큰나무",  image: null,                                    emoji: "🌳" },
  { type: "세브란스",   label: "세브란스병원", shortLabel: "세브란스", image: "./images/therapy_center_severance.png", emoji: "🏥" },
  { type: "사람과소통", label: "사람과소통", shortLabel: "소통",    image: null,                                    emoji: "🗣️" },
  { type: "mart",       label: "마트",       shortLabel: "마트",    image: "./images/outing_mart1.png",             emoji: "🛒" },
  { type: "bakery",     label: "빵가게",     shortLabel: "빵가게",  image: "./images/outing_bakery.png",            emoji: "🥐" },
  { type: "cafe",       label: "카페",       shortLabel: "카페",    image: "./images/outing_cafe.png",              emoji: "☕" },
  { type: "park",       label: "공원",       shortLabel: "공원",    image: "./images/outing_park1.png",             emoji: "🌳" },
  { type: "calltaxi",  label: "장애인콜택시", shortLabel: "콜택시",  image: "./images/transport_calltaxi.png",       emoji: "🚕" },
  { type: "fieldtrip", label: "학교 현장학습", shortLabel: "현장학습", image: "./images/school bus.png",               emoji: "🚌" },
];

const SCHEDULE_PERSON_DEFS = [
  { label: "나",              image: "./images/outing_person_me.png",               emoji: "🙋",  groups: ["family"] },
  { label: "엄마",            image: "./images/outing_person_mom.png",              emoji: "👩",  groups: ["family", "home"] },
  { label: "아빠",            image: "./images/outing_person_dad.png",              emoji: "👨",  groups: ["family", "home"] },
  { label: "활동보조 선생님", image: "./images/outing_person_activity_support.png", emoji: "🤝",  groups: ["family", "school"] },
  { label: "할아버지",        image: "./images/outing_person_grandpa.png",          emoji: "👴",  groups: ["family", "home"] },
  { label: "할머니",          image: "./images/outing_person_grandma.png",          emoji: "👵",  groups: ["family", "home"] },
  { label: "큰나무 언어 선생님",  image: "./images/therapy_class_speech.png",    emoji: "🗣️", groups: ["큰나무"] },
  { label: "큰나무 인지 선생님",  image: "./images/therapy_class_cognitive.png", emoji: "🧠",  groups: ["큰나무"] },
  { label: "큰나무 음악 선생님",  image: "./images/therapy_class_music.png",     emoji: "🎵",  groups: ["큰나무"] },
  { label: "큰나무 작업 선생님",  image: null,                                   emoji: "🖐️", groups: ["큰나무"] },
  { label: "큰나무 물리 선생님",  image: null,                                   emoji: "🏃",  groups: ["큰나무"] },
  { label: "큰나무 연하 선생님",  image: null,                                   emoji: "💧",  groups: ["큰나무"] },
  { label: "세브란스 언어 선생님", image: null, emoji: "🗣️", groups: ["세브란스"] },
  { label: "세브란스 작업 선생님", image: null, emoji: "🖐️", groups: ["세브란스"] },
  { label: "세브란스 연하 선생님", image: null, emoji: "💧",  groups: ["세브란스"] },
  { label: "세브란스 물리 선생님", image: null, emoji: "🏃",  groups: ["세브란스"] },
  { label: "사람과소통 선생님",   image: null, emoji: "🗣️", groups: ["사람과소통"] },
  { label: "담임선생님",        image: "./images/school_homeroom_teacher.png",       emoji: "👩‍🏫", groups: ["school"] },
  { label: "건민",             image: "./images/school_friends_건민.png",            emoji: "🧒",  groups: ["school"] },
  { label: "동하",             image: "./images/school_friends_동하.png",            emoji: "🧒",  groups: ["school"] },
  { label: "승우",             image: "./images/school_friends_승우.png",            emoji: "🧒",  groups: ["school"] },
  { label: "윤희",             image: "./images/school_friends_윤희.png",            emoji: "🧒",  groups: ["school"] },
  { label: "하린",             image: "./images/school_friends_하린.png",            emoji: "🧒",  groups: ["school"] },
];

function getDefaultWeeklySchedule() {
  return {
    "월": [{ type: "school", people: [] }, { type: "home", people: [] }],
    "화": [{ type: "school", people: [] }, { type: "home", people: [] }],
    "수": [{ type: "school", people: [] }, { type: "home", people: [] }],
    "목": [{ type: "school", people: [] }, { type: "home", people: [] }],
    "금": [{ type: "school", people: [] }, { type: "home", people: [] }],
    "토": [{ type: "home", people: [] }],
    "일": [{ type: "home", people: [] }],
  };
}

// 각 활동에 허용된 사람 그룹 정의 (오염 데이터 자동 정리용)
const ALLOWED_GROUPS_BY_ACT = {
  "school":     ["school"],
  "fieldtrip":  ["school"],
  "home":       ["home"],
  "큰나무":     ["큰나무"],
  "세브란스":   ["세브란스"],
  "사람과소통": ["사람과소통"],
  // 마트/카페/공원 등은 home 그룹만
  "_default":   ["home"],
};

function cleanWeeklySchedule(data) {
  const inGroup = (pd, g) => (pd.groups || [pd.group || ""]).includes(g);
  Object.values(data).forEach((acts) => {
    acts.forEach((act) => {
      const allowedGroups = ALLOWED_GROUPS_BY_ACT[act.type] || ALLOWED_GROUPS_BY_ACT["_default"];
      act.people = (act.people || []).filter((pLabel) => {
        const pd = SCHEDULE_PERSON_DEFS.find((p) => p.label === pLabel);
        if (!pd) return false;
        return allowedGroups.some((g) => inGroup(pd, g));
      });
    });
  });
  return data;
}

function loadWeeklySchedule() {
  try {
    const raw = localStorage.getItem("jaemin-weekly-v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      return cleanWeeklySchedule(parsed);
    }
  } catch (_) {}
  return getDefaultWeeklySchedule();
}

function saveWeeklySchedule() {
  try {
    localStorage.setItem("jaemin-weekly-v1", JSON.stringify(weeklyScheduleData));
  } catch (_) {}
}

const WEEKLY_DAY_COLORS = [
  { bg: "#fef9c3", border: "#fbbf24", text: "#713f12" }, // 월 - 노랑
  { bg: "#ffedd5", border: "#fb923c", text: "#7c2d12" }, // 화 - 주황
  { bg: "#dcfce7", border: "#4ade80", text: "#14532d" }, // 수 - 초록
  { bg: "#dbeafe", border: "#60a5fa", text: "#1e3a8a" }, // 목 - 파랑
  { bg: "#ede9fe", border: "#a78bfa", text: "#4c1d95" }, // 금 - 보라
  { bg: "#fce7f3", border: "#f472b6", text: "#831843" }, // 토 - 핑크
  { bg: "#fee2e2", border: "#f87171", text: "#7f1d1d" }, // 일 - 빨강
];

function loadWeeklyPeriods() {
  try {
    const raw = localStorage.getItem("jaemin-weekly-periods-v1");
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return ["오전", "오후"];
}

function saveWeeklyPeriods() {
  try {
    localStorage.setItem("jaemin-weekly-periods-v1", JSON.stringify(weeklyPeriodLabels));
  } catch (_) {}
}

let weeklyScheduleData  = loadWeeklySchedule();
let weeklyPeriodLabels  = loadWeeklyPeriods();
let weeklyDetailAct     = null; // { type, people, day } — 상세 페이지용
let weeklySelectedDay   = null; // 하루 스케줄 페이지용
let weeklyDayEditMode   = false; // 하루 스케줄 수정 모드
let weeklyEditMode      = false;
let weeklyEditDay       = "월";
let weeklyEditPersonFor = null; // 사람 선택 중인 activity index (null = 활동 선택 단계)
let weeklyEditPeriods   = false; // 시간대 레이블 편집 중

// ── 집 스케줄 상태 ───────────────────────────────────────────────────────────
const HOME_ACTIVITIES = [
  { label: "양치",           image: "./images/brush.png",        emoji: "🪥" },
  { label: "샤워",           image: "./images/shower.png",       emoji: "🚿" },
  { label: "밥 먹기",        image: "./images/meal.png",         emoji: "🍚" },
  { label: "마트 장보기",    image: "./images/outing_mart1.png", emoji: "🛒" },
  { label: "분리수거",       image: null,                         emoji: "♻️" },
  { label: "설거지",         image: null,                         emoji: "🍽️" },
  { label: "옷 정리",        image: null,                         emoji: "👕" },
  { label: "신발장 정리",    image: null,                         emoji: "👟" },
  { label: "화분에 물 주기", image: null,                         emoji: "🪴" },
  { label: "요리",           image: null,                         emoji: "🍳" },
  { label: "잠자기",         image: null,                         emoji: "😴" },
];
let homeSchedule = [];
let homeScheduleRemaining = [];

// ── 날짜 선택 상태 ───────────────────────────────────────────────────────────
const WEEKDAY_OPTIONS = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
const WEATHER_OPTIONS = ["맑음", "흐림", "비", "눈", "바람", "천둥번개"];
const WEATHER_EMOJI   = { "맑음": "☀️", "흐림": "🌥️", "비": "🌧️", "눈": "❄️", "바람": "💨", "천둥번개": "⚡" };
let datePlannerMode = "";
let guardianDateSetup = false;
const dateSelection = { month: null, day: null, weekday: null, weather: null };

// ── TTS ──────────────────────────────────────────────────────────────────────
let preferredKoVoice = null;
let ttsWarmedUp = false;
const isAppleMobile = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const useDirectYoutubeOpen = true;

const isAndroid = /android/i.test(navigator.userAgent);

// ── 1. 한국어 목소리 선택 (fallback: default 목소리) ─────────────────────────
function pickPreferredKoVoice() {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;
  const koVoices = voices.filter((v) => (v.lang || "").toLowerCase().startsWith("ko"));
  if (koVoices.length) {
    const priorities = [/female/i, /woman/i, /여성/, /google/i, /premium|neural|natural/i];
    for (const rule of priorities) {
      const found = koVoices.find((v) => rule.test(v.name || "") || rule.test(v.voiceURI || ""));
      if (found) return found;
    }
    return koVoices[0];
  }
  // 한국어 없으면 브라우저 기본(default) 목소리 우선, 없으면 첫 번째
  return voices.find((v) => v.default) || voices[0] || null;
}

// ── 2. speak: 안드로이드 정교한 예외 처리 ────────────────────────────────────
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  if (!preferredKoVoice) preferredKoVoice = pickPreferredKoVoice();

  const doSpeak = () => {
    const u = new SpeechSynthesisUtterance(text);
    if (preferredKoVoice) {
      u.voice = preferredKoVoice;
      u.lang = preferredKoVoice.lang || "ko-KR";
    } else {
      u.lang = "ko-KR";
    }
    u.rate = 0.95;
    u.pitch = 1.0;
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(u);
  };

  if (isAndroid) {
    // 안드로이드: 재생 중일 때만 cancel, 아닐 때는 바로 재생
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setTimeout(doSpeak, 80);
    } else {
      setTimeout(doSpeak, 50);
    }
  } else {
    window.speechSynthesis.cancel();
    doSpeak();
  }
}

// ── 3. warmupTTS: 첫 터치 시 오디오 엔진 강제 활성화 ─────────────────────────
function warmupTTS() {
  if (!("speechSynthesis" in window) || ttsWarmedUp) return;
  ttsWarmedUp = true;
  if (!preferredKoVoice) preferredKoVoice = pickPreferredKoVoice();
  const warm = new SpeechSynthesisUtterance("\u200b"); // 제로폭 공백
  warm.lang = preferredKoVoice?.lang || "ko-KR";
  if (preferredKoVoice) warm.voice = preferredKoVoice;
  warm.volume = 0;
  warm.rate = 1.0;
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(warm);
  setTimeout(() => window.speechSynthesis.cancel(), 200);
}

// ── YouTube 유틸 ─────────────────────────────────────────────────────────────
function getYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "").trim();
    return u.searchParams.get("v");
  } catch (_e) { return ""; }
}

function parseStartSeconds(url) {
  try {
    const u = new URL(url);
    const t = u.searchParams.get("t");
    if (!t) return 0;
    if (/^\d+$/.test(t)) return Number(t);
    const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    if (!m) return 0;
    return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
  } catch (_e) { return 0; }
}

function setPlayer(youtubeUrl) {
  const id = getYouTubeId(youtubeUrl);
  if (!id) return;
  selectedYoutube = youtubeUrl;
  const start = parseStartSeconds(youtubeUrl);
  const startQuery = start > 0 ? `&start=${start}` : "";
  playerEl.src = `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&autoplay=1&rel=0&modestbranding=1${startQuery}`;
}

function openYoutubeDirect(url) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function resolveYoutube(item) {
  if (!item.youtube) return "";
  return DATA.youtube[item.youtube] || "";
}

function getThumbnail(youtubeUrl) {
  const id = getYouTubeId(youtubeUrl);
  if (!id) return "";
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

// ── 이미지 프리페치 ──────────────────────────────────────────────────────────
function setupImageElement(img, eager = false) {
  img.loading = eager ? "eager" : "lazy";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  img.draggable = false;
}

const prefetchedImages = new Set();
function prefetchLocalImage(src) {
  if (!src || !src.startsWith("./images/")) return;
  if (prefetchedImages.has(src)) return;
  prefetchedImages.add(src);
  const im = new Image();
  setupImageElement(im, true);
  im.src = src;
}

function prefetchScreenImages(screenKey) {
  const screen = DATA.screens[screenKey];
  if (!screen) return;
  (screen.hero || []).forEach((it) => prefetchLocalImage(it.image));
  (screen.items || []).forEach((it) => prefetchLocalImage(it.image));
  if (screen.spotlight && screen.spotlight.image) prefetchLocalImage(screen.spotlight.image);
}

function prefetchLikelyNextScreens(screenKey) {
  if (screenKey === "outingPlace") {
    prefetchScreenImages("outingSchool");
  } else if (screenKey === "outingSchool") {
    prefetchScreenImages("outingSchoolFriends");
    prefetchScreenImages("outingSchool_p2");
  } else if (screenKey === "outingSchool_p2") {
    prefetchScreenImages("outingSchool_p3");
  }
}

// ── 외출 플래너 ──────────────────────────────────────────────────────────────
function outingOptions(kind) {
  if (kind === "person")    return DATA.screens.outingPerson.items    || [];
  if (kind === "place")     return DATA.screens.outingPlace.items     || [];
  if (kind === "transport") return DATA.screens.outingTransport.items || [];
  return [];
}

function isOutingSelected(kind, item) {
  if (kind === "person")    return outingSelection.people.some((p) => p.label === item.label);
  if (kind === "place")     return outingSelection.place     && outingSelection.place.label     === item.label;
  if (kind === "transport") return outingSelection.transport && outingSelection.transport.label === item.label;
  return false;
}

function toggleOutingSelection(kind, item) {
  if (kind === "person") {
    const idx = outingSelection.people.findIndex((p) => p.label === item.label);
    if (idx >= 0) { outingSelection.people.splice(idx, 1); return; }
    if (outingSelection.people.length >= OUTING_MAX_PERSON) return;
    outingSelection.people.push({ label: item.label, image: item.image || "./images/outing_person_me.png" });
    if (outingSelection.people.length >= OUTING_MAX_PERSON) outingPlannerMode = "";
    return;
  }
  if (kind === "place") {
    outingSelection.place = { label: item.label, image: item.image || "./images/outing_school1.png" };
    outingPlannerMode = "";
    return;
  }
  if (kind === "transport") {
    outingSelection.transport = { label: item.label, image: item.image || "./images/transport_bus.png" };
    outingPlannerMode = "";
  }
}

function getOutingHeroItems() {
  const peopleCards = outingSelection.people.length
    ? outingSelection.people.map((p, i) => ({ label: `사람${i + 1}: ${p.label}`, image: p.image }))
    : [{ label: "사람: 미선택", image: "./images/outing_person_me.png" }];
  return [
    ...peopleCards,
    { label: `장소: ${outingSelection.place?.label || "미선택"}`,        image: outingSelection.place?.image     || "./images/outing_school1.png" },
    { label: `교통수단: ${outingSelection.transport?.label || "미선택"}`, image: outingSelection.transport?.image || "./images/transport_bus.png" }
  ];
}

function renderOutingPlanner() {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";

  if (outingPlannerMode) {
    // ── 선택 화면: 항목들 표시 ──
    gridEl.className = "grid";
    outingOptions(outingPlannerMode).forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "tile" + (isOutingSelected(outingPlannerMode, item) ? " is-selected" : "");
      const img = document.createElement("img");
      img.src = item.image || "./images/study.png";
      img.alt = item.label;
      setupImageElement(img, true);
      const lbl = document.createElement("div");
      lbl.className = "tile-label";
      lbl.textContent = item.label;
      btn.appendChild(img);
      btn.appendChild(lbl);
      if (isOutingSelected(outingPlannerMode, item)) {
        const check = document.createElement("span");
        check.className = "tile-check";
        check.textContent = "✓";
        btn.appendChild(check);
      }
      btn.addEventListener("click", () => {
        speak(item.label);
        if (item.subScreen) {
          pushScreen(item.subScreen, item.label);
          render();
          return;
        }
        toggleOutingSelection(outingPlannerMode, item);
        render();
      });
      gridEl.appendChild(btn);
    });

    if (outingPlannerMode === "person") {
      const doneBtn = document.createElement("button");
      doneBtn.className = "btn";
      doneBtn.textContent = "선택 완료";
      doneBtn.addEventListener("click", () => {
        speak("사람 선택 완료");
        outingPlannerMode = "";
        render();
      });
      gridEl.appendChild(doneBtn);
    }
    return;
  }

  // ── 메인 요약 화면: 3개 타일 ──
  gridEl.className = "grid outing-summary-tiles";
  const tiles = [
    {
      kind: "person",
      title: "사람",
      image: outingSelection.people.length
        ? outingSelection.people[0].image
        : "./images/outing_person_me.png",
      subtitle: outingSelection.people.length
        ? outingSelection.people.map((p) => p.label).join(", ")
        : "눌러서 선택",
    },
    {
      kind: "place",
      title: "장소",
      image: outingSelection.place?.image || "./images/outing_school1.png",
      subtitle: outingSelection.place?.label || "눌러서 선택",
    },
    {
      kind: "transport",
      title: "이동수단",
      image: outingSelection.transport?.image || "./images/transport_bus.png",
      subtitle: outingSelection.transport?.label || "눌러서 선택",
    },
  ];

  tiles.forEach(({ kind, title, image, subtitle }) => {
    const btn = document.createElement("button");
    btn.className = "tile outing-summary-tile";

    if (kind === "person") {
      // 선택된 사람이 있으면 최대 3명 사진을 격자로 표시
      const people = outingSelection.people;
      const photoWrap = document.createElement("div");
      photoWrap.className = "outing-person-photos" + (people.length === 0 ? " outing-person-empty" : "");
      if (people.length === 0) {
        const img = document.createElement("img");
        img.src = "./images/outing_person_me.png";
        img.alt = "사람";
        setupImageElement(img, true);
        photoWrap.appendChild(img);
      } else {
        people.forEach((p) => {
          const img = document.createElement("img");
          img.src = p.image;
          img.alt = p.label;
          setupImageElement(img, true);
          photoWrap.appendChild(img);
        });
      }
      btn.appendChild(photoWrap);
    } else {
      const img = document.createElement("img");
      img.src = image;
      img.alt = title;
      setupImageElement(img, true);
      btn.appendChild(img);
    }

    const lbl = document.createElement("div");
    lbl.className = "tile-label";
    lbl.textContent = `${title}: ${subtitle}`;
    btn.appendChild(lbl);
    btn.addEventListener("click", () => {
      speak(title);
      outingPlannerMode = kind;
      render();
    });
    gridEl.appendChild(btn);
  });
}

// ── 치료 선택 ────────────────────────────────────────────────────────────────
function buildTherapyPlanItems() {
  const result = [
    { label: "1. 학교가요",         image: "./images/outing_school1.png" },
    { label: "2. 장애인 콜택시 타요", image: "./images/transport_calltaxi.png" }
  ];
  let idx = 3;
  therapySelection.centers.forEach((center) => {
    const classes = therapySelection.classesByCenter[center] || [];
    result.push({
      label: `${idx++}. ${center} 치료실 가요`,
      ...(THERAPY_CENTER_IMAGE[center] ? { image: THERAPY_CENTER_IMAGE[center] } : {})
    });
    classes.forEach((cls) => result.push({
      label: `${idx++}. ${cls} 수업 받아요`,
      ...(THERAPY_CLASS_IMAGE[cls] ? { image: THERAPY_CLASS_IMAGE[cls] } : {})
    }));
    result.push({ label: `${idx++}. 장애인 콜택시 타요`, image: "./images/transport_calltaxi.png" });
  });
  result.push({ label: `${idx}. 집에 와요`, image: "./images/home.png" });
  return result;
}

function renderCenterPicker() {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "grid outing-picker";

  const _stamp = navStack.map((x) => x.key).join(",");
  if (therapySelection._stamp !== _stamp) {
    therapySelection._stamp = _stamp;
    therapySelection.centers = [];
    therapySelection.classesByCenter = {};
  }

  const CENTERS = ["큰나무병원", "세브란스병원", "사람과소통"];
  const CENTER_EMOJI = { "큰나무병원": "🌳", "세브란스병원": "🏥", "사람과소통": "🗣️" };
  const MAX_CENTERS = 2;

  CENTERS.forEach((name) => {
    const btn = document.createElement("button");
    const selected = therapySelection.centers.includes(name);
    btn.className = `tile${selected ? " is-selected" : ""}`;
    if (THERAPY_CENTER_IMAGE[name]) {
      const img = document.createElement("img");
      img.src = THERAPY_CENTER_IMAGE[name];
      img.alt = name;
      setupImageElement(img, true);
      btn.appendChild(img);
    } else {
      const art = document.createElement("div");
      art.className = "tile-art";
      art.textContent = CENTER_EMOJI[name] || "🏥";
      btn.appendChild(art);
    }
    const label = document.createElement("div");
    label.className = "tile-label";
    label.textContent = name;
    btn.appendChild(label);
    if (selected) {
      const check = document.createElement("span");
      check.className = "tile-check";
      check.textContent = therapySelection.centers.length > 1
        ? `${therapySelection.centers.indexOf(name) + 1}` : "✓";
      btn.appendChild(check);
    }
    btn.addEventListener("click", () => {
      speak(name);
      const idx = therapySelection.centers.indexOf(name);
      if (idx >= 0) therapySelection.centers.splice(idx, 1);
      else if (therapySelection.centers.length < MAX_CENTERS) therapySelection.centers.push(name);
      render();
    });
    gridEl.appendChild(btn);
  });

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn main";
  nextBtn.disabled = therapySelection.centers.length === 0;
  nextBtn.textContent = therapySelection.centers.length === 0
    ? "치료실을 선택하세요"
    : `다음 → ${therapySelection.centers[0]} 수업 선택`;
  nextBtn.addEventListener("click", () => {
    if (!therapySelection.centers.length) return;
    speak("수업 선택");
    pushScreen("scheduleTodayClassesA", `${therapySelection.centers[0]} 수업`);
    render();
  });
  gridEl.appendChild(nextBtn);
}

function renderClassPicker(centerIndex) {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "grid outing-picker";

  const center = therapySelection.centers[centerIndex] || "";
  if (!therapySelection.classesByCenter[center]) therapySelection.classesByCenter[center] = [];
  const selected = therapySelection.classesByCenter[center];
  const centerOptions = THERAPY_OPTIONS_BY_CENTER[center] || THERAPY_OPTIONS;

  const headerBtn = document.createElement("button");
  headerBtn.className = "btn main";
  headerBtn.style.cssText = "pointer-events:none; opacity:0.75; grid-column:1/-1;";
  headerBtn.textContent = `${centerIndex + 1}번째 치료실: ${center}`;
  gridEl.appendChild(headerBtn);

  centerOptions.forEach((name) => {
    const btn = document.createElement("button");
    const isSelected = selected.includes(name);
    btn.className = `tile${isSelected ? " is-selected" : ""}`;
    if (THERAPY_CLASS_IMAGE[name]) {
      const img = document.createElement("img");
      img.src = THERAPY_CLASS_IMAGE[name];
      img.alt = name;
      setupImageElement(img, true);
      btn.appendChild(img);
    } else {
      const art = document.createElement("div");
      art.className = "tile-art";
      art.textContent = THERAPY_CLASS_EMOJI[name] || "🧩";
      btn.appendChild(art);
    }
    const label = document.createElement("div");
    label.className = "tile-label";
    label.textContent = name;
    btn.appendChild(label);
    if (isSelected) {
      const check = document.createElement("span");
      check.className = "tile-check";
      check.textContent = "✓";
      btn.appendChild(check);
    }
    btn.addEventListener("click", () => {
      speak(name);
      const idx = selected.indexOf(name);
      if (idx >= 0) selected.splice(idx, 1);
      else selected.push(name);
      render();
    });
    gridEl.appendChild(btn);
  });

  const isLast = centerIndex >= therapySelection.centers.length - 1;
  const doneBtn = document.createElement("button");
  doneBtn.className = "btn main";
  doneBtn.disabled = selected.length === 0;
  doneBtn.textContent = selected.length === 0
    ? "수업을 한 개 이상 선택하세요"
    : isLast
      ? `완료 (${selected.length}개 선택)`
      : `다음 → ${therapySelection.centers[centerIndex + 1]} 수업 선택`;
  doneBtn.addEventListener("click", () => {
    if (!selected.length) return;
    if (!isLast) {
      speak("다음 수업 선택");
      pushScreen("scheduleTodayClassesB", `${therapySelection.centers[centerIndex + 1]} 수업`);
    } else {
      speak("수업 선택 완료");
      DATA.screens.scheduleTodayTherapyResult.items = buildTherapyPlanItems();
      pushScreen("scheduleTodayTherapyResult", "오늘 일정");
    }
    render();
  });
  gridEl.appendChild(doneBtn);
}

// 이전 코드 호환용
function renderTherapyPicker(screen) { renderClassPicker(screen.centerIndex || 0); }

// ── 집 스케줄 활동 선택 ────────────────────────────────────────────────────
function renderHomeActivityPicker() {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "grid";

  HOME_ACTIVITIES.forEach((activity) => {
    const orderIdx = homeSchedule.indexOf(activity.label);
    const isSelected = orderIdx >= 0;
    const btn = document.createElement("button");
    btn.className = `tile${isSelected ? " is-selected" : ""}`;

    if (activity.image) {
      const img = document.createElement("img");
      img.src = activity.image;
      img.alt = activity.label;
      setupImageElement(img, true);
      btn.appendChild(img);
    } else {
      const art = document.createElement("div");
      art.className = "tile-art";
      art.textContent = activity.emoji;
      btn.appendChild(art);
    }

    const lbl = document.createElement("div");
    lbl.className = "tile-label";
    lbl.textContent = activity.label;
    btn.appendChild(lbl);

    if (isSelected) {
      const check = document.createElement("span");
      check.className = "tile-check";
      check.textContent = String(orderIdx + 1);
      btn.appendChild(check);
    }

    btn.addEventListener("click", () => {
      speak(activity.label);
      const idx = homeSchedule.indexOf(activity.label);
      if (idx >= 0) homeSchedule.splice(idx, 1);
      else homeSchedule.push(activity.label);
      render();
    });

    gridEl.appendChild(btn);
  });

  // 전체 지우기 버튼
  if (homeSchedule.length > 0) {
    const clearBtn = document.createElement("button");
    clearBtn.className = "btn";
    clearBtn.style.cssText = "grid-column:1/-1; background:#f1f5f9; color:#64748b; min-height:56px; font-size:1rem;";
    clearBtn.textContent = "전체 지우기";
    clearBtn.addEventListener("click", () => {
      homeSchedule = [];
      render();
    });
    gridEl.appendChild(clearBtn);
  }

  // 시작하기 버튼
  const startBtn = document.createElement("button");
  startBtn.className = "btn main";
  startBtn.style.cssText = "grid-column:1/-1;";
  startBtn.disabled = homeSchedule.length === 0;
  startBtn.textContent = homeSchedule.length === 0
    ? "할 일을 선택하세요"
    : `시작하기 → (${homeSchedule.length}가지)`;
  startBtn.addEventListener("click", () => {
    if (!homeSchedule.length) return;
    homeScheduleRemaining = [...homeSchedule];
    speak("시작해봐요");
    pushScreen("scheduleHomeRun", "집 스케줄 실행");
    render();
  });
  gridEl.appendChild(startBtn);
}

// ── 집 스케줄 실행 화면 ───────────────────────────────────────────────────
function renderHomeScheduleRunner() {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "grid home-runner-grid";

  // 모두 완료
  if (homeScheduleRemaining.length === 0) {
    const doneWrap = document.createElement("div");
    doneWrap.className = "home-runner-complete";
    const emoji = document.createElement("div");
    emoji.className = "home-runner-complete-emoji";
    emoji.textContent = "🎉";
    const msg = document.createElement("div");
    msg.className = "home-runner-complete-text";
    msg.textContent = "모두 다 했어요!";
    const sub = document.createElement("div");
    sub.className = "home-runner-complete-sub";
    sub.textContent = "정말 잘했어요!";
    doneWrap.appendChild(emoji);
    doneWrap.appendChild(msg);
    doneWrap.appendChild(sub);
    gridEl.appendChild(doneWrap);

    const againBtn = document.createElement("button");
    againBtn.className = "btn main";
    againBtn.style.cssText = "grid-column:1/-1; margin-top:8px;";
    againBtn.textContent = "처음부터 다시";
    againBtn.addEventListener("click", () => {
      homeScheduleRemaining = [...homeSchedule];
      render();
    });
    gridEl.appendChild(againBtn);
    return;
  }

  // helperEl에 남은 개수 표시
  helperEl.textContent = `남은 할 일: ${homeScheduleRemaining.length}가지 · 눌러서 완료`;

  homeScheduleRemaining.forEach((label, idx) => {
    const activity = HOME_ACTIVITIES.find((a) => a.label === label);
    const btn = document.createElement("button");
    btn.className = `tile home-runner-tile${idx === 0 ? " home-runner-current" : ""}`;

    if (activity?.image) {
      const img = document.createElement("img");
      img.src = activity.image;
      img.alt = label;
      setupImageElement(img, true);
      btn.appendChild(img);
    } else {
      const art = document.createElement("div");
      art.className = "tile-art";
      art.textContent = activity?.emoji || "✅";
      btn.appendChild(art);
    }

    const lbl = document.createElement("div");
    lbl.className = "tile-label";
    lbl.textContent = label;
    btn.appendChild(lbl);

    const numBadge = document.createElement("span");
    numBadge.className = "tile-check";
    numBadge.textContent = String(idx + 1);
    btn.appendChild(numBadge);

    btn.addEventListener("click", () => {
      const isLast = homeScheduleRemaining.length === 1;
      speak(isLast ? "모두 다 했어요! 정말 잘했어요!" : label + " 완료!");
      btn.classList.add("home-runner-done-anim");
      btn.addEventListener("animationend", () => {
        const i = homeScheduleRemaining.indexOf(label);
        if (i >= 0) homeScheduleRemaining.splice(i, 1);
        render();
      }, { once: true });
    });

    gridEl.appendChild(btn);
  });

  // 처음부터 다시 버튼
  const resetBtn = document.createElement("button");
  resetBtn.className = "btn";
  resetBtn.style.cssText = "grid-column:1/-1; background:#f1f5f9; color:#64748b; min-height:56px; font-size:1rem;";
  resetBtn.textContent = "처음부터 다시";
  resetBtn.addEventListener("click", () => {
    homeScheduleRemaining = [...homeSchedule];
    render();
  });
  gridEl.appendChild(resetBtn);
}

// ── 주간 스케줄 헬퍼 ─────────────────────────────────────────────────────────
// 얼굴 사진 생성: 이미지 없으면 emoji 원형 아바타로 대체
function makeFaceImg(pd, className) {
  const wrap = document.createElement("div");
  wrap.className = `person-avatar ${className || ""}`;
  wrap.title = pd.label;

  const img = document.createElement("img");
  img.src = pd.image;
  img.alt = pd.label;
  img.loading = "eager";
  img.onerror = () => {
    img.style.display = "none";
    const fb = document.createElement("div");
    fb.className = "person-avatar-emoji";
    fb.textContent = pd.emoji || "👤";
    wrap.appendChild(fb);
  };
  wrap.appendChild(img);
  return wrap;
}

// ── 주간 스케줄 뷰 ───────────────────────────────────────────────────────────
function makeWeeklyEmptyCell() {
  const el = document.createElement("div");
  el.className = "wt-empty";
  return el;
}

function renderWeeklySchedule() {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "weekly-outer";

  if (weeklyEditMode) {
    renderWeeklyEditor();
    return;
  }

  titleEl.textContent = "주간 스케줄";
  helperEl.textContent = "활동을 누르면 소리로 읽어줍니다.";

  // 최대 행 수 계산 (시간대 레이블 수 vs 실제 활동 수 중 큰 것)
  const maxRows = Math.max(
    weeklyPeriodLabels.length,
    ...SCHEDULE_DAYS.map((d) => (weeklyScheduleData[d] || []).length)
  );

  // CSS grid 열: [시간대 레이블] + [7개 요일]
  const grid = document.createElement("div");
  grid.className = "wt-grid";

  // ── 헤더 행: 빈 코너 + 요일 7개 ──
  const corner = document.createElement("div");
  corner.className = "wt-corner";
  grid.appendChild(corner);

  SCHEDULE_DAYS.forEach((day, di) => {
    const c = WEEKLY_DAY_COLORS[di];
    const hdr = document.createElement("button");
    hdr.className = "wt-dayhdr wt-dayhdr--btn";
    hdr.textContent = day;
    hdr.style.cssText = `background:${c.bg}; color:${c.text}; border-color:${c.border};`;
    hdr.setAttribute("aria-label", `${day}요일 스케줄 보기`);
    hdr.addEventListener("click", () => {
      speak(`${day}요일`);
      weeklySelectedDay = day;
      pushScreen("scheduleWeeklyDay", `${day}요일`);
      render();
    });
    grid.appendChild(hdr);
  });

  // ── 활동 행 ──
  for (let row = 0; row < maxRows; row++) {
    // 시간대 레이블 셀
    const periodCell = document.createElement("div");
    periodCell.className = "wt-period";
    periodCell.textContent = weeklyPeriodLabels[row] || `${row + 1}`;
    grid.appendChild(periodCell);

    // 각 요일 셀
    SCHEDULE_DAYS.forEach((day, di) => {
      const acts = weeklyScheduleData[day] || [];
      const act  = acts[row];
      if (!act) { grid.appendChild(makeWeeklyEmptyCell()); return; }

      const def = SCHEDULE_ACTIVITY_DEFS.find((d) => d.type === act.type);
      if (!def) { grid.appendChild(makeWeeklyEmptyCell()); return; }

      const c = WEEKLY_DAY_COLORS[di];
      const tile = document.createElement("button");
      tile.className = "wt-tile";
      tile.setAttribute("aria-label", def.label);
      tile.style.setProperty("--day-border", c.border);
      tile.style.setProperty("--day-bg",     c.bg);

      if (def.image) {
        const img = document.createElement("img");
        img.src = def.image;
        img.alt = def.label;
        img.className = "wt-img";
        img.loading = "eager";
        img.referrerPolicy = "no-referrer";
        tile.appendChild(img);
      } else {
        const art = document.createElement("div");
        art.className = "wt-art";
        art.textContent = def.emoji;
        tile.appendChild(art);
      }

      const lbl = document.createElement("div");
      lbl.className = "wt-lbl";
      lbl.textContent = def.shortLabel || def.label;
      tile.appendChild(lbl);

      if (act.people && act.people.length > 0) {
        const faces = document.createElement("div");
        faces.className = "weekly-faces";
        act.people.slice(0, 2).forEach((pLabel) => {
          const pd = SCHEDULE_PERSON_DEFS.find((p) => p.label === pLabel);
          if (!pd) return;
          faces.appendChild(makeFaceImg(pd, "weekly-face"));
        });
        tile.appendChild(faces);
      }

      tile.addEventListener("click", () => {
        speak(def.label);
        weeklyDetailAct = { type: act.type, people: act.people || [], day };
        pushScreen("scheduleWeeklyDetail", def.label);
        render();
      });

      grid.appendChild(tile);
    });
  }

  gridEl.appendChild(grid);

  // ── 버튼 행: 수정 + 초기화 ──
  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display:flex;gap:10px;margin-top:4px;";

  const editBtn = document.createElement("button");
  editBtn.className = "weekly-edit-btn primary";
  editBtn.textContent = "✏️ 수정";
  editBtn.addEventListener("click", () => {
    weeklyEditMode = true; weeklyEditDay = "월";
    weeklyEditPersonFor = null; weeklyEditPeriods = false;
    render();
  });
  btnRow.appendChild(editBtn);

  const resetBtn = document.createElement("button");
  resetBtn.className = "weekly-edit-btn weekly-reset-btn";
  resetBtn.textContent = "🗑 초기화";
  resetBtn.addEventListener("click", () => {
    if (!confirm("주간 스케줄을 모두 초기화할까요?\n입력한 내용이 모두 지워집니다.")) return;
    weeklyScheduleData = getDefaultWeeklySchedule();
    saveWeeklySchedule();
    render();
  });
  btnRow.appendChild(resetBtn);
  gridEl.appendChild(btnRow);
}

// ── 일일 시각 스케줄 ──────────────────────────────────────────────────────────
function renderDailyVisual() {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "dv-outer";

  // 오늘 요일 → 주간 스케줄 데이터에서 활동 가져오기
  const KO_DAYS = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();
  const todayDay = KO_DAYS[today.getDay()];
  const month   = today.getMonth() + 1;
  const date    = today.getDate();
  const acts    = (weeklyScheduleData[todayDay] || []);

  titleEl.textContent = "일일 시각 스케줄";
  helperEl.textContent = "";

  // ── 날짜 헤더 ──
  const dateBar = document.createElement("div");
  dateBar.className = "dv-date-bar";

  const dateNum = document.createElement("span");
  dateNum.className = "dv-date-num";
  dateNum.textContent = `${month}월 ${date}일`;
  dateBar.appendChild(dateNum);

  const dayBadge = document.createElement("span");
  dayBadge.className = "dv-day-badge";
  dayBadge.textContent = `${todayDay}`;
  dateBar.appendChild(dayBadge);

  gridEl.appendChild(dateBar);

  if (acts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "dv-empty";
    empty.textContent = "오늘 스케줄이 없어요. 주간 스케줄에서 오늘 활동을 추가해 주세요.";
    gridEl.appendChild(empty);
    return;
  }

  // ── 활동 카드 그리드 ──
  const cardGrid = document.createElement("div");
  cardGrid.className = "dv-grid";

  acts.forEach((act, idx) => {
    const def = SCHEDULE_ACTIVITY_DEFS.find((d) => d.type === act.type);
    if (!def) return;

    const card = document.createElement("button");
    card.className = "dv-card";
    card.setAttribute("aria-label", def.label);

    // 번호 배지
    const num = document.createElement("div");
    num.className = "dv-num";
    num.textContent = idx + 1;
    card.appendChild(num);

    // 활동 이미지
    const imgWrap = document.createElement("div");
    imgWrap.className = "dv-img-wrap";
    if (def.image) {
      const img = document.createElement("img");
      img.src = def.image;
      img.alt = def.label;
      img.className = "dv-img";
      img.loading = "eager";
      img.referrerPolicy = "no-referrer";
      imgWrap.appendChild(img);
    } else {
      const art = document.createElement("div");
      art.className = "dv-art";
      art.textContent = def.emoji;
      imgWrap.appendChild(art);
    }
    card.appendChild(imgWrap);

    // 텍스트 + 사람 블록
    const textBlock = document.createElement("div");
    textBlock.className = "dv-text-block";

    const lbl = document.createElement("div");
    lbl.className = "dv-lbl";
    lbl.textContent = def.label;
    textBlock.appendChild(lbl);

    // 함께하는 사람 얼굴 (최대 4명)
    if (act.people && act.people.length > 0) {
      const faces = document.createElement("div");
      faces.className = "dv-faces";
      act.people.slice(0, 4).forEach((pLabel) => {
        const pd = SCHEDULE_PERSON_DEFS.find((p) => p.label === pLabel);
        if (!pd) return;
        const fw = document.createElement("div");
        fw.className = "dv-face-wrap";
        fw.appendChild(makeFaceImg(pd, "dv-face"));
        const fl = document.createElement("div");
        fl.className = "dv-face-lbl";
        fl.textContent = pLabel;
        fw.appendChild(fl);
        faces.appendChild(fw);
      });
      textBlock.appendChild(faces);
    }

    card.appendChild(textBlock);
    card.addEventListener("click", () => {
      speak(def.label);
      weeklyDetailAct = { type: act.type, people: act.people || [], day: todayDay };
      pushScreen("scheduleWeeklyDetail", def.label);
      render();
    });
    cardGrid.appendChild(card);
  });

  gridEl.appendChild(cardGrid);
}

// ── 하루 스케줄 페이지 ────────────────────────────────────────────────────────
function renderWeeklyDaySchedule() {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "wday-outer";

  const day = weeklySelectedDay;
  if (!day) { popScreen(); render(); return; }

  const acts = weeklyScheduleData[day] || [];
  titleEl.textContent = `${day}요일 스케줄`;
  helperEl.textContent = acts.length > 0 ? "활동을 누르면 자세히 볼 수 있어요." : "아직 활동이 없어요.";

  if (acts.length === 0) {
    const empty = document.createElement("div");
    empty.className = "wday-empty";
    empty.textContent = "📅 스케줄이 없어요";
    gridEl.appendChild(empty);
    return;
  }

  acts.forEach((act, idx) => {
    const def = SCHEDULE_ACTIVITY_DEFS.find((d) => d.type === act.type);
    if (!def) return;

    const periodLabel = weeklyPeriodLabels[idx] || `${idx + 1}`;
    const c = WEEKLY_DAY_COLORS[SCHEDULE_DAYS.indexOf(day)];

    const card = document.createElement("button");
    card.className = "wday-card";
    card.style.setProperty("--day-border", c.border);
    card.style.setProperty("--day-bg", c.bg);
    card.setAttribute("aria-label", def.label);

    // 시간대 배지
    const badge = document.createElement("div");
    badge.className = "wday-badge";
    badge.textContent = periodLabel;
    badge.style.background = c.border;
    card.appendChild(badge);

    // 활동 이미지
    if (def.image) {
      const img = document.createElement("img");
      img.src = def.image;
      img.alt = def.label;
      img.className = "wday-img";
      img.loading = "eager";
      img.referrerPolicy = "no-referrer";
      card.appendChild(img);
    } else {
      const art = document.createElement("div");
      art.className = "wday-art";
      art.textContent = def.emoji;
      card.appendChild(art);
    }

    // 활동 이름
    const lbl = document.createElement("div");
    lbl.className = "wday-lbl";
    lbl.textContent = def.label;
    card.appendChild(lbl);

    // 함께하는 사람 얼굴 (미리보기 - 최대 4명)
    if (act.people && act.people.length > 0) {
      const facesRow = document.createElement("div");
      facesRow.className = "wday-faces";
      act.people.slice(0, 4).forEach((pLabel) => {
        const pd = SCHEDULE_PERSON_DEFS.find((p) => p.label === pLabel);
        if (!pd) return;
        const wrap = document.createElement("div");
        wrap.className = "wday-face-wrap";
        wrap.appendChild(makeFaceImg(pd, "wday-face"));
        const fl = document.createElement("div");
        fl.className = "wday-face-lbl";
        fl.textContent = pLabel;
        wrap.appendChild(fl);
        facesRow.appendChild(wrap);
      });
      card.appendChild(facesRow);
    }

    // 탭하면 항상 상세 페이지로 이동 + TTS
    card.addEventListener("click", () => {
      speak(def.label);
      weeklyDetailAct = { type: act.type, people: act.people || [], day };
      pushScreen("scheduleWeeklyDetail", def.label);
      render();
    });

    gridEl.appendChild(card);
  });
}

// ── 주간 스케줄 상세 페이지 ───────────────────────────────────────────────────
function renderWeeklyDetail() {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "wdetail-outer";

  if (!weeklyDetailAct) { popScreen(); render(); return; }

  const def = SCHEDULE_ACTIVITY_DEFS.find((d) => d.type === weeklyDetailAct.type);
  if (!def) { popScreen(); render(); return; }

  // 요일 표시
  titleEl.textContent = def.label;
  helperEl.textContent = weeklyDetailAct.day + "요일";

  // ── 활동 히어로 카드 (탭하면 이름 읽기) ──
  const hero = document.createElement("button");
  hero.className = "wdetail-hero";
  hero.setAttribute("aria-label", def.label);

  if (def.image) {
    const img = document.createElement("img");
    img.src = def.image;
    img.alt = def.label;
    img.className = "wdetail-hero-img";
    img.loading = "eager";
    img.referrerPolicy = "no-referrer";
    hero.appendChild(img);
  } else {
    const art = document.createElement("div");
    art.className = "wdetail-hero-art";
    art.textContent = def.emoji;
    hero.appendChild(art);
  }

  const heroLbl = document.createElement("div");
  heroLbl.className = "wdetail-hero-lbl";
  heroLbl.textContent = def.label;
  hero.appendChild(heroLbl);

  hero.addEventListener("click", () => speak(def.label));
  gridEl.appendChild(hero);

  // ── 함께하는 사람 ──
  const people = weeklyDetailAct.people || [];

  const heading = document.createElement("div");
  heading.className = "wdetail-heading";
  heading.textContent = people.length > 0 ? "함께하는 사람" : "아직 함께하는 사람이 없어요";
  gridEl.appendChild(heading);

  if (people.length > 0) {
    const peopleRow = document.createElement("div");
    peopleRow.className = "wdetail-people-row";

    people.forEach((pLabel) => {
      const pd = SCHEDULE_PERSON_DEFS.find((p) => p.label === pLabel);
      if (!pd) return;

      const btn = document.createElement("button");
      btn.className = "wdetail-person-btn";
      btn.setAttribute("aria-label", pLabel);

      const avatar = makeFaceImg(pd, "wdetail-avatar");
      btn.appendChild(avatar);

      const lbl = document.createElement("div");
      lbl.className = "wdetail-person-lbl";
      lbl.textContent = pLabel;
      btn.appendChild(lbl);

      btn.addEventListener("click", () => speak(pLabel));
      peopleRow.appendChild(btn);
    });

    gridEl.appendChild(peopleRow);
  }

  // 처음 진입 시 활동 이름 자동 읽기
  speak(def.label);
}

// ── 사람 선택 버튼 생성 헬퍼 ────────────────────────────────────────────────
function makePersonPickerBtn(pd, actEntry, maxPeople) {
  const isSelected  = actEntry.people.includes(pd.label);
  const isMaxed     = !isSelected && actEntry.people.length >= maxPeople;

  const btn = document.createElement("button");
  btn.className = `weekly-person-btn${isSelected ? " is-selected" : ""}${isMaxed ? " is-maxed" : ""}`;
  btn.disabled = isMaxed;

  // 아바타 (이미지 or emoji)
  const avatar = makeFaceImg(pd, "weekly-person-avatar-img");
  btn.appendChild(avatar);

  const lbl = document.createElement("div");
  lbl.className = "weekly-person-lbl";
  lbl.textContent = pd.label;
  btn.appendChild(lbl);

  if (isSelected) {
    const chk = document.createElement("span");
    chk.className = "tile-check";
    chk.textContent = "✓";
    btn.appendChild(chk);
  }

  btn.addEventListener("click", () => {
    if (isMaxed) return;
    speak(pd.label);
    const idx = actEntry.people.indexOf(pd.label);
    if (idx >= 0) actEntry.people.splice(idx, 1);
    else actEntry.people.push(pd.label);
    saveWeeklySchedule();
    render();
  });
  return btn;
}

// ── 주간 스케줄 편집 ─────────────────────────────────────────────────────────
function renderWeeklyEditor() {
  titleEl.textContent = "스케줄 편집";

  // 요일 탭 + 시간대 탭
  const tabRow = document.createElement("div");
  tabRow.className = "weekly-tab-row";
  SCHEDULE_DAYS.forEach((day, di) => {
    const c = WEEKLY_DAY_COLORS[di];
    const tab = document.createElement("button");
    tab.className = `weekly-tab${day === weeklyEditDay && !weeklyEditPeriods ? " weekly-tab--active" : ""}`;
    tab.textContent = day;
    if (!weeklyEditPeriods && day === weeklyEditDay) {
      tab.style.cssText = `background:${c.bg}; color:${c.text}; border-color:${c.border};`;
    }
    tab.addEventListener("click", () => {
      weeklyEditDay = day; weeklyEditPersonFor = null; weeklyEditPeriods = false;
      render();
    });
    tabRow.appendChild(tab);
  });
  // 시간대 탭
  const periodTab = document.createElement("button");
  periodTab.className = `weekly-tab${weeklyEditPeriods ? " weekly-tab--active" : ""}`;
  periodTab.style.cssText = weeklyEditPeriods ? "" : "color:#64748b; font-size:0.8rem;";
  periodTab.textContent = "⏰";
  periodTab.title = "시간대 편집";
  periodTab.addEventListener("click", () => {
    weeklyEditPeriods = true; weeklyEditPersonFor = null;
    render();
  });
  tabRow.appendChild(periodTab);
  gridEl.appendChild(tabRow);

  // ── 시간대 레이블 편집 ──
  if (weeklyEditPeriods) {
    helperEl.textContent = "각 시간대 이름을 수정하세요.";
    const heading = document.createElement("div");
    heading.className = "weekly-edit-heading";
    heading.textContent = "시간대 이름 편집";
    gridEl.appendChild(heading);

    const periodsWrap = document.createElement("div");
    periodsWrap.className = "weekly-periods-edit";

    weeklyPeriodLabels.forEach((label, i) => {
      const row = document.createElement("div");
      row.className = "weekly-period-row";

      const numBadge = document.createElement("span");
      numBadge.className = "weekly-period-num";
      numBadge.textContent = `${i + 1}`;
      row.appendChild(numBadge);

      const input = document.createElement("input");
      input.type = "text";
      input.className = "weekly-period-input";
      input.value = label;
      input.maxLength = 6;
      input.addEventListener("input", () => {
        weeklyPeriodLabels[i] = input.value || `${i + 1}`;
        saveWeeklyPeriods();
      });
      row.appendChild(input);

      // 삭제 버튼 (3개 이상일 때만)
      if (weeklyPeriodLabels.length > 1) {
        const delBtn = document.createElement("button");
        delBtn.className = "weekly-period-del";
        delBtn.textContent = "✕";
        delBtn.addEventListener("click", () => {
          weeklyPeriodLabels.splice(i, 1);
          saveWeeklyPeriods();
          render();
        });
        row.appendChild(delBtn);
      }
      periodsWrap.appendChild(row);
    });
    gridEl.appendChild(periodsWrap);

    if (weeklyPeriodLabels.length < 6) {
      const addBtn = document.createElement("button");
      addBtn.className = "weekly-edit-btn";
      addBtn.textContent = "+ 시간대 추가";
      addBtn.addEventListener("click", () => {
        weeklyPeriodLabels.push(`${weeklyPeriodLabels.length + 1}번`);
        saveWeeklyPeriods();
        render();
      });
      gridEl.appendChild(addBtn);
    }

    const doneBtn = document.createElement("button");
    doneBtn.className = "weekly-edit-btn weekly-edit-btn--primary";
    doneBtn.textContent = "✓ 완료";
    doneBtn.addEventListener("click", () => { weeklyEditPeriods = false; render(); });
    gridEl.appendChild(doneBtn);
    return;
  }

  const dayActs    = weeklyScheduleData[weeklyEditDay] || [];
  const dayActTypes = dayActs.map((a) => a.type);

  if (weeklyEditPersonFor !== null) {
    // ── 사람 선택 단계 ──
    const MAX_PEOPLE = 20;
    const actEntry = dayActs[weeklyEditPersonFor];
    const def = SCHEDULE_ACTIVITY_DEFS.find((d) => d.type === actEntry?.type);

    const heading = document.createElement("div");
    heading.className = "weekly-edit-heading";
    heading.textContent = `${def?.label || ""} — 함께하는 사람`;
    gridEl.appendChild(heading);

    const inGroup = (pd, g) => (pd.groups || [pd.group]).includes(g);

    // ── 헬퍼: 섹션 만들기 ──
    // ── 활동 유형에 따른 섹션 설정 ──
    const actType = actEntry?.type || "";
    const CENTER_MAP = {
      "큰나무":     { icon: "🏥", label: "큰나무병원 선생님" },
      "세브란스":   { icon: "🏥", label: "세브란스병원 선생님" },
      "사람과소통": { icon: "🏥", label: "사람과소통 선생님" },
    };
    const centerKey = Object.keys(CENTER_MAP).find((k) => actType === k);
    const isSchoolAct = ["school", "fieldtrip"].includes(actType);

    const collectPeople = (group) => SCHEDULE_PERSON_DEFS.filter((p) => inGroup(p, group));

    // ── 섹션별 전체선택 포함 렌더 헬퍼 ──
    const makeSection = (icon, label, people) => {
      if (!people.length) return;

      // 헤더 행: 섹션 이름 + 전체선택 버튼
      const hdrRow = document.createElement("div");
      hdrRow.className = "weekly-person-section-hdr-row";

      const hdr = document.createElement("span");
      hdr.className = "weekly-person-section-hdr";
      hdr.textContent = `${icon} ${label}`;
      hdrRow.appendChild(hdr);

      const toggleAllBtn = document.createElement("button");
      toggleAllBtn.className = "section-select-all-btn";
      const allLabels = people.map((p) => p.label);
      const refreshToggleBtn = () => {
        const sel = new Set(actEntry.people || []);
        const allSel = allLabels.every((l) => sel.has(l));
        toggleAllBtn.textContent = allSel ? "전체 해제" : "전체 선택";
        toggleAllBtn.classList.toggle("is-all-selected", allSel);
      };
      refreshToggleBtn();
      toggleAllBtn.addEventListener("click", () => {
        const sel = new Set(actEntry.people || []);
        const allSel = allLabels.every((l) => sel.has(l));
        if (allSel) {
          actEntry.people = actEntry.people.filter((l) => !allLabels.includes(l));
        } else {
          const existing = new Set(actEntry.people || []);
          allLabels.forEach((l) => existing.add(l));
          actEntry.people = [...existing];
        }
        saveWeeklySchedule(weeklyScheduleData);
        render();
      });
      hdrRow.appendChild(toggleAllBtn);
      gridEl.appendChild(hdrRow);

      const grid = document.createElement("div");
      grid.className = "weekly-person-grid";
      people.forEach((pd) => grid.appendChild(makePersonPickerBtn(pd, actEntry, MAX_PEOPLE)));
      gridEl.appendChild(grid);
    };

    // 활동 유형에 따라 해당 그룹만 표시
    if (centerKey) {
      const { icon, label } = CENTER_MAP[centerKey];
      makeSection(icon, label, collectPeople(centerKey));
    } else if (isSchoolAct) {
      makeSection("🏫", "학교 선생님 · 친구", collectPeople("school"));
    } else if (actType === "home") {
      makeSection("🏠", "집 사람", collectPeople("home"));
    } else {
      // 마트·카페·공원 등: 집 사람들
      makeSection("🏠", "함께 가는 사람", collectPeople("home"));
    }

    const backBtn2 = document.createElement("button");
    backBtn2.className = "weekly-edit-btn";
    backBtn2.style.marginTop = "6px";
    backBtn2.textContent = "← 활동 선택으로 돌아가기";
    backBtn2.addEventListener("click", () => { weeklyEditPersonFor = null; render(); });
    gridEl.appendChild(backBtn2);

  } else {
    // ── 활동 선택 단계 ──
    helperEl.textContent = `${weeklyEditDay}요일 활동을 선택하세요.`;

    const actList = document.createElement("div");
    actList.className = "weekly-act-list";

    SCHEDULE_ACTIVITY_DEFS.forEach((def) => {
      const isChecked = dayActTypes.includes(def.type);
      const actIdx    = dayActTypes.indexOf(def.type);
      const actEntry  = isChecked ? dayActs[actIdx] : null;

      const row = document.createElement("div");
      row.className = `weekly-act-row${isChecked ? " weekly-act-row--checked" : ""}`;

      // 왼쪽: 활동 토글 영역
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "weekly-act-toggle";

      const checkIcon = document.createElement("span");
      checkIcon.className = "weekly-act-checkmark";
      checkIcon.textContent = isChecked ? "☑" : "☐";
      toggleBtn.appendChild(checkIcon);

      if (def.image) {
        const img = document.createElement("img");
        img.src = def.image;
        img.alt = def.label;
        img.className = "weekly-act-img";
        img.loading = "eager";
        toggleBtn.appendChild(img);
      } else {
        const art = document.createElement("span");
        art.className = "weekly-act-art";
        art.textContent = def.emoji;
        toggleBtn.appendChild(art);
      }

      const lbl = document.createElement("span");
      lbl.className = "weekly-act-lbl";
      lbl.textContent = def.label;
      toggleBtn.appendChild(lbl);

      toggleBtn.addEventListener("click", () => {
        if (isChecked) {
          weeklyScheduleData[weeklyEditDay] = dayActs.filter((a) => a.type !== def.type);
        } else {
          weeklyScheduleData[weeklyEditDay] = [...dayActs, { type: def.type, people: [] }];
        }
        saveWeeklySchedule();
        render();
      });
      row.appendChild(toggleBtn);

      // 오른쪽: 사람 선택 버튼 (선택된 활동만)
      if (isChecked && actEntry) {
        const facesBtn = document.createElement("button");
        facesBtn.className = "weekly-act-faces-btn";

        if (actEntry.people.length > 0) {
          actEntry.people.slice(0, 2).forEach((pLabel) => {
            const pd = SCHEDULE_PERSON_DEFS.find((p) => p.label === pLabel);
            if (!pd) return;
            facesBtn.appendChild(makeFaceImg(pd, "weekly-face"));
          });
        } else {
          facesBtn.innerHTML = `<span style="font-size:1.4rem;color:#94a3b8;">👤+</span>`;
        }

        facesBtn.addEventListener("click", () => {
          weeklyEditPersonFor = actIdx;
          render();
        });
        row.appendChild(facesBtn);
      }

      actList.appendChild(row);
    });
    gridEl.appendChild(actList);

    const doneBtn = document.createElement("button");
    doneBtn.className = "weekly-edit-btn weekly-edit-btn--primary";
    doneBtn.textContent = "✓ 편집 완료";
    doneBtn.addEventListener("click", () => {
      weeklyEditMode = false;
      weeklyEditPersonFor = null;
      render();
    });
    gridEl.appendChild(doneBtn);
  }
}

// ── 금요일 완성 일정 빌더 ────────────────────────────────────────────────────
function buildFridayPlanItems() {
  const result = [];
  let idx = 1;
  const addTaxi = () => result.push({ label: `${idx++}. 장애인 콜택시 타요`, image: "./images/transport_calltaxi.png" });
  const addSlot = (slot) => {
    if (slot.center) {
      result.push({ label: `${idx++}. ${slot.center} 치료실 가요`, ...(THERAPY_CENTER_IMAGE[slot.center] ? { image: THERAPY_CENTER_IMAGE[slot.center] } : {}) });
      slot.classes.forEach((cls) => result.push({ label: `${idx++}. ${cls} 수업 받아요`, ...(THERAPY_CLASS_IMAGE[cls] ? { image: THERAPY_CLASS_IMAGE[cls] } : {}) }));
    }
  };
  addTaxi();
  addSlot(fridayTherapySelection.slot1);
  addTaxi();
  result.push({ label: `${idx++}. 학교 가요`, image: "./images/outing_school1.png" });
  addTaxi();
  addSlot(fridayTherapySelection.slot2);
  addTaxi();
  result.push({ label: `${idx++}. 집에 와요`, image: "./images/home.png" });
  return result;
}

// ── 금요일 치료실 슬롯 피커 ──────────────────────────────────────────────────
function renderFridaySlotPicker(slotKey) {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  heroEl.style.display = "none";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "grid";

  const slot = fridayTherapySelection[slotKey];
  const CENTERS = ["큰나무병원", "세브란스병원", "사람과소통"];
  const CENTER_EMOJI = { "큰나무병원": "🌳", "세브란스병원": "🏥", "사람과소통": "🗣️" };

  if (!slot.center) {
    titleEl.textContent = "치료실 선택";
    CENTERS.forEach((name) => {
      const btn = document.createElement("button");
      btn.className = "tile";
      if (THERAPY_CENTER_IMAGE[name]) {
        const img = document.createElement("img");
        img.src = THERAPY_CENTER_IMAGE[name]; img.alt = name;
        setupImageElement(img, true);
        btn.appendChild(img);
      } else {
        const art = document.createElement("div");
        art.className = "tile-art";
        art.textContent = CENTER_EMOJI[name] || "🏥";
        btn.appendChild(art);
      }
      const lbl = document.createElement("div");
      lbl.className = "tile-label";
      lbl.textContent = name;
      btn.appendChild(lbl);
      btn.addEventListener("click", () => { speak(name); slot.center = name; slot.classes = []; render(); });
      gridEl.appendChild(btn);
    });
  } else {
    titleEl.textContent = `${slot.center} 과목 선택`;
    const options = THERAPY_OPTIONS_BY_CENTER[slot.center] || THERAPY_OPTIONS;
    options.forEach((name) => {
      const isSelected = slot.classes.includes(name);
      const btn = document.createElement("button");
      btn.className = `tile${isSelected ? " is-selected" : ""}`;
      if (THERAPY_CLASS_IMAGE[name]) {
        const img = document.createElement("img");
        img.src = THERAPY_CLASS_IMAGE[name]; img.alt = name;
        setupImageElement(img, true);
        btn.appendChild(img);
      } else {
        const art = document.createElement("div");
        art.className = "tile-art";
        art.textContent = THERAPY_CLASS_EMOJI[name] || "🧩";
        btn.appendChild(art);
      }
      const lbl = document.createElement("div");
      lbl.className = "tile-label"; lbl.textContent = name;
      btn.appendChild(lbl);
      if (isSelected) {
        const check = document.createElement("span");
        check.className = "tile-check"; check.textContent = "✓";
        btn.appendChild(check);
      }
      btn.addEventListener("click", () => {
        speak(name);
        const idx = slot.classes.indexOf(name);
        if (idx >= 0) slot.classes.splice(idx, 1); else slot.classes.push(name);
        render();
      });
      gridEl.appendChild(btn);
    });

    const backBtn2 = document.createElement("button");
    backBtn2.className = "btn";
    backBtn2.textContent = "← 치료실 다시 선택";
    backBtn2.addEventListener("click", () => { slot.center = null; slot.classes = []; render(); });
    gridEl.appendChild(backBtn2);

    const doneBtn = document.createElement("button");
    doneBtn.className = "btn main";
    doneBtn.disabled = slot.classes.length === 0;
    doneBtn.textContent = slot.classes.length === 0 ? "과목을 선택하세요" : `완료 (${slot.classes.length}개 선택)`;
    doneBtn.addEventListener("click", () => {
      if (!slot.classes.length) return;
      speak("선택 완료");
      // 두 슬롯 모두 선택됐으면 전체 일정 결과 표시, 아니면 뒤로
      if (fridayTherapySelection.slot1.center && fridayTherapySelection.slot2.center) {
        DATA.screens.scheduleFridayFinalResult.items = buildFridayPlanItems();
        while (currentKey() !== "scheduleFriday" && navStack.length > 1) popScreen();
        pushScreen("scheduleFridayFinalResult", "금요일 일정");
      } else {
        while (currentKey() !== "scheduleFriday" && navStack.length > 1) popScreen();
      }
      render();
    });
    gridEl.appendChild(doneBtn);
  }
}

// ── 날짜 화면 ────────────────────────────────────────────────────────────────
function renderDateHome() {
  // 오늘 날짜 초기화 (최초 1회)
  if (!dateSelection._initialized) {
    const now = new Date();
    dateSelection.month   = now.getMonth() + 1;
    dateSelection.day     = now.getDate();
    const wNames = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"];
    dateSelection.weekday = wNames[now.getDay()];
    dateSelection._initialized = true;
  }

  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "date-home-wrap";

  const weather     = dateSelection.weather;
  const weatherEmoji = weather ? (WEATHER_EMOJI[weather] || "🌤️") : null;

  function buildFullText() {
    return `오늘은 ${dateSelection.month}월 ${dateSelection.day}일 ${dateSelection.weekday}${dateSelection.weather ? " " + dateSelection.weather : ""}`;
  }

  // ── 드럼 피커 생성 함수 ──
  function createDrumPicker(initVal, min, max, unit, onCommit) {
    let curVal     = initVal;
    let dragStartY = 0;
    let dragStartV = initVal;
    let dragging   = false;

    const wrap   = document.createElement("div");
    wrap.className = "date-drum";

    const upBtn  = document.createElement("button");
    upBtn.type   = "button";
    upBtn.className = "date-drum-arrow";
    upBtn.setAttribute("aria-label", `${unit} 올리기`);
    upBtn.textContent = "▲";

    const numRow = document.createElement("div");
    numRow.className = "date-drum-numrow";

    const numEl  = document.createElement("div");
    numEl.className = "date-drum-number";

    numRow.appendChild(numEl);   // 숫자만 박스 안에

    const unitEl = document.createElement("div");
    unitEl.className = "date-drum-unit";
    unitEl.textContent = unit;   // 박스 바깥에 배치

    const downBtn = document.createElement("button");
    downBtn.type  = "button";
    downBtn.className = "date-drum-arrow";
    downBtn.setAttribute("aria-label", `${unit} 내리기`);
    downBtn.textContent = "▼";

    const range = max - min + 1;
    function clamp(v) { return ((v - min) % range + range) % range + min; }

    function display(v, offset = 0) {
      curVal = clamp(v);
      numEl.textContent = curVal;
      numRow.style.transform = offset ? `translateY(${offset * 0.38}px)` : "";
      numRow.style.opacity   = offset ? String(Math.max(0.45, 1 - Math.abs(offset) * 0.007)) : "";
    }

    display(initVal);

    upBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      display(curVal + 1);
      onCommit(curVal);
    });
    downBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      display(curVal - 1);
      onCommit(curVal);
    });

    numRow.addEventListener("pointerdown", (e) => {
      dragging   = true;
      dragStartY = e.clientY;
      dragStartV = curVal;
      numRow.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    numRow.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dy    = e.clientY - dragStartY;
      const steps = -Math.round(dy / 38);
      display(dragStartV + steps, dy);
    });
    numRow.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      const dy    = e.clientY - dragStartY;
      const steps = -Math.round(dy / 38);
      display(dragStartV + steps);
      onCommit(curVal);
    });
    numRow.addEventListener("pointercancel", () => { dragging = false; display(curVal); });

    wrap.appendChild(upBtn);
    wrap.appendChild(numRow);
    wrap.appendChild(downBtn);

    // 바깥 컨테이너: [드럼] + [단위 레이블]
    const outer = document.createElement("div");
    outer.className = "date-drum-outer";
    outer.appendChild(wrap);
    outer.appendChild(unitEl);
    return outer;
  }

  // ── 날짜 카드 ──
  const dateCard = document.createElement("div");
  dateCard.className = "date-card";

  const badge = document.createElement("div");
  badge.className = "date-card-badge";
  badge.textContent = "오늘 📅";
  dateCard.appendChild(badge);

  // ── 드럼 피커 행 (먼저 선언 — 꼭지 이벤트에서 참조) ──
  const drumRow = document.createElement("div");
  drumRow.className = "date-drum-row";

  // ── 오늘 꼭지 3개 ──
  const chipNow = new Date();
  const chipM   = chipNow.getMonth() + 1;
  const chipD   = chipNow.getDate();
  const chipWS  = ["일","월","화","수","목","금","토"][chipNow.getDay()];
  const chipWF  = ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"][chipNow.getDay()];

  function makeDragChip(displayText, sublabel, onApply) {
    const chip = document.createElement("div");
    chip.className = "date-today-chip";
    chip.innerHTML =
      `<span class="chip-vals">${displayText}</span>` +
      `<span class="chip-sub">${sublabel}</span>` +
      `<span class="chip-hint">↓</span>`;

    let cDrag = false, cSX = 0, cSY = 0, cRect0 = null, cGhost = null;

    chip.addEventListener("pointerdown", (e) => {
      cDrag = true; cSX = e.clientX; cSY = e.clientY;
      cRect0 = chip.getBoundingClientRect();
      chip.setPointerCapture(e.pointerId);
      cGhost = chip.cloneNode(true);
      cGhost.className = "date-today-chip date-today-chip--ghost";
      Object.assign(cGhost.style, {
        position: "fixed", left: cRect0.left + "px", top: cRect0.top + "px",
        width: cRect0.width + "px", zIndex: "9999", pointerEvents: "none", margin: "0"
      });
      document.body.appendChild(cGhost);
      chip.classList.add("date-today-chip--dragging");
      e.preventDefault();
    });

    chip.addEventListener("pointermove", (e) => {
      if (!cDrag || !cGhost) return;
      cGhost.style.left = (cRect0.left + e.clientX - cSX) + "px";
      cGhost.style.top  = (cRect0.top  + e.clientY - cSY) + "px";
      const ov = document.elementFromPoint(e.clientX, e.clientY);
      drumRow.classList.toggle("date-drum-row--highlight",
        !!(ov?.closest(".date-drum-row, .date-drum-outer, .date-drum")));
    });

    chip.addEventListener("pointerup", (e) => {
      if (!cDrag) return;
      cDrag = false;
      chip.classList.remove("date-today-chip--dragging");
      drumRow.classList.remove("date-drum-row--highlight");
      if (cGhost) { cGhost.remove(); cGhost = null; }
      const moved = Math.hypot(e.clientX - cSX, e.clientY - cSY) > 12;
      if (!moved) { onApply(); return; }
      const ov = document.elementFromPoint(e.clientX, e.clientY);
      if (ov?.closest(".date-drum-row, .date-drum-outer, .date-drum, .date-card") ||
          (e.clientY - cSY) > 40) onApply();
    });

    chip.addEventListener("pointercancel", () => {
      cDrag = false;
      chip.classList.remove("date-today-chip--dragging");
      drumRow.classList.remove("date-drum-row--highlight");
      if (cGhost) { cGhost.remove(); cGhost = null; }
    });

    return chip;
  }

  const chipRow = document.createElement("div");
  chipRow.className = "date-chip-row";
  chipRow.appendChild(makeDragChip(String(chipM), "월", () => { dateSelection.month   = chipM;  render(); }));
  chipRow.appendChild(makeDragChip(String(chipD), "일", () => { dateSelection.day     = chipD;  render(); }));
  chipRow.appendChild(makeDragChip(chipWS, "요일",    () => { dateSelection.weekday = chipWF; render(); }));

  dateCard.appendChild(chipRow);

  drumRow.appendChild(
    createDrumPicker(dateSelection.month, 1, 12, "월", (v) => { dateSelection.month = v; render(); })
  );

  drumRow.appendChild(
    createDrumPicker(dateSelection.day, 1, 31, "일", (v) => { dateSelection.day = v; render(); })
  );

  // 요일 드럼 피커
  const WDAY_FULL = ["월요일","화요일","수요일","목요일","금요일","토요일","일요일"];
  let wdayIdx = WDAY_FULL.indexOf(dateSelection.weekday);
  if (wdayIdx < 0) wdayIdx = 0;

  const weekdayDrum = (() => {
    let curIdx = wdayIdx;
    let dragStartY = 0, dragStartIdx = wdayIdx, isDragging = false;

    const wrap = document.createElement("div");
    wrap.className = "date-drum";

    const upBtn2 = document.createElement("button");
    upBtn2.type = "button"; upBtn2.className = "date-drum-arrow"; upBtn2.textContent = "▲";

    const wdRow = document.createElement("div");
    wdRow.className = "date-drum-numrow";

    const wdNameEl = document.createElement("div");
    wdNameEl.className = "date-drum-number date-drum-number--wd";

    wdRow.appendChild(wdNameEl);   // 요일명(수/목/금)만 박스 안에

    const wdSuffixEl = document.createElement("div");
    wdSuffixEl.className = "date-drum-unit date-drum-unit--wd";
    wdSuffixEl.textContent = "요일";  // 박스 바깥에 배치

    const downBtn2 = document.createElement("button");
    downBtn2.type = "button"; downBtn2.className = "date-drum-arrow"; downBtn2.textContent = "▼";

    function ci(i) { return ((i % 7) + 7) % 7; }
    function dispWd(idx, off = 0) {
      curIdx = ci(idx);
      wdNameEl.textContent = WDAY_FULL[curIdx].replace("요일", "");
      wdRow.style.transform = off ? `translateY(${off * 0.38}px)` : "";
      wdRow.style.opacity   = off ? String(Math.max(0.45, 1 - Math.abs(off) * 0.007)) : "";
    }
    dispWd(curIdx);

    upBtn2.addEventListener("click",   (e) => { e.stopPropagation(); dispWd(curIdx - 1); dateSelection.weekday = WDAY_FULL[curIdx]; render(); });
    downBtn2.addEventListener("click", (e) => { e.stopPropagation(); dispWd(curIdx + 1); dateSelection.weekday = WDAY_FULL[curIdx]; render(); });

    wdRow.addEventListener("pointerdown", (e) => { isDragging = true; dragStartY = e.clientY; dragStartIdx = curIdx; wdRow.setPointerCapture(e.pointerId); e.preventDefault(); });
    wdRow.addEventListener("pointermove", (e) => { if (!isDragging) return; const dy = e.clientY - dragStartY; dispWd(dragStartIdx - Math.round(dy / 38), dy); });
    wdRow.addEventListener("pointerup",   (e) => { if (!isDragging) return; isDragging = false; const dy = e.clientY - dragStartY; dispWd(dragStartIdx - Math.round(dy / 38)); dateSelection.weekday = WDAY_FULL[curIdx]; render(); });
    wdRow.addEventListener("pointercancel", () => { isDragging = false; dispWd(curIdx); });

    wrap.appendChild(upBtn2); wrap.appendChild(wdRow); wrap.appendChild(downBtn2);

    const wdOuter = document.createElement("div");
    wdOuter.className = "date-drum-outer";
    wdOuter.appendChild(wrap);
    wdOuter.appendChild(wdSuffixEl);
    return wdOuter;
  })();

  drumRow.appendChild(weekdayDrum);
  dateCard.appendChild(drumRow);

  // 선택된 날씨 배지
  if (weather) {
    const wb = document.createElement("div");
    wb.className = "date-card-weather";
    wb.textContent = `${weatherEmoji} ${weather}`;
    dateCard.appendChild(wb);
  }

  gridEl.appendChild(dateCard);

  // ── 날씨 선택 섹션 ──
  const weatherSection = document.createElement("div");
  weatherSection.className = "date-weather-section";

  const weatherLabel = document.createElement("div");
  weatherLabel.className = "date-weather-label";
  weatherLabel.textContent = "오늘 날씨";
  weatherSection.appendChild(weatherLabel);

  const weatherGrid = document.createElement("div");
  weatherGrid.className = "date-weather-grid";

  DATA.screens.dateWeatherPicker.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "date-weather-tile" + (dateSelection.weather === item.label ? " is-selected" : "");
    const img = document.createElement("img");
    img.src = item.image; img.alt = item.label;
    setupImageElement(img, true);
    const lbl = document.createElement("div");
    lbl.className = "date-weather-tile-label";
    lbl.textContent = item.label;
    btn.appendChild(img); btn.appendChild(lbl);
    btn.addEventListener("click", () => { speak(item.label); dateSelection.weather = item.label; render(); });
    weatherGrid.appendChild(btn);
  });

  weatherSection.appendChild(weatherGrid);
  gridEl.appendChild(weatherSection);

  // ── 전체 문장 읽기 버튼 ──
  const sentenceBtn = document.createElement("button");
  sentenceBtn.type = "button";
  sentenceBtn.className = "date-sentence-btn";
  const ft = buildFullText();
  sentenceBtn.innerHTML = `<span class="date-sentence-icon">🔊</span><span>${ft}</span>`;
  sentenceBtn.addEventListener("click", () => speak(buildFullText()));
  gridEl.appendChild(sentenceBtn);
}

// 이전 코드 호환용 alias
function renderDatePlanner() { renderDateHome(); }

// ── 공통 렌더 함수 ───────────────────────────────────────────────────────────
function renderHero(items) {
  heroEl.innerHTML = "";
  if (!items || !items.length) { heroEl.style.display = "none"; return; }
  heroEl.style.display = "grid";
  items.forEach((item) => {
    const btn = document.createElement("button");
    if (item.image) {
      btn.className = "tile";
      const img = document.createElement("img");
      img.src = item.image; img.alt = item.label;
      const label = document.createElement("div");
      label.className = "tile-label"; label.textContent = item.label;
      btn.appendChild(img); btn.appendChild(label);
    } else {
      btn.className = "btn hero";
      btn.textContent = item.label;
    }
    btn.addEventListener("click", () => {
      speak(item.label);
      if (item.nav) { pushScreen(item.nav, item.label); render(); }
    });
    heroEl.appendChild(btn);
  });
}

function renderButtons(items, layout) {
  gridEl.innerHTML = "";
  const isMain  = layout === "main";
  const isMedia = layout === "media";
  gridEl.className = isMain ? "grid" : (isMedia ? "grid media" : "grid detail");

  items.forEach((item, index) => {
    const btn  = document.createElement("button");
    const yUrl = resolveYoutube(item);

    if ((isMain && item.image) || (isMedia && (item.image || yUrl))) {
      const isNavBtn = isMain && (item.label === "다음" || item.label === "이전");
      btn.className = isNavBtn ? "tile tile-nav" : "tile";
      if (!isNavBtn) {
        const img = document.createElement("img");
        img.src = item.image || getThumbnail(yUrl); img.alt = item.label;
        setupImageElement(img, index < 2 || !!(item.image && item.image.startsWith("./images/")));
        btn.appendChild(img);
      }
      const label = document.createElement("div");
      label.className = "tile-label"; label.textContent = item.label;
      btn.appendChild(label);
    } else if (isMain) {
      btn.className = "tile";
      const art = document.createElement("div");
      art.className = "tile-art";
      art.textContent = item.icon || (
        item.label.includes("버스") ? "🚌" :
        (item.label.includes("음악") || item.label.includes("노래")) ? "🎵" :
        item.label.includes("유튜브") ? "▶️" : "📌"
      );
      const label = document.createElement("div");
      label.className = "tile-label"; label.textContent = item.label;
      btn.appendChild(art); btn.appendChild(label);
    } else {
      btn.className = isMain ? "btn main" : "btn";
      if (!isMain && yUrl && yUrl === selectedYoutube) btn.classList.add("selected");
      btn.textContent = item.label;
    }

    btn.addEventListener("click", () => {
      // 날짜 picker 처리
      if (currentKey() === "dateMonthPicker") {
        dateSelection.month = Number(item.label.replace("월", ""));
        speak(item.label); popScreen();
        if (guardianDateSetup) pushScreen("dateDayPicker", "일 선택");
        render(); return;
      }
      if (currentKey() === "dateDayPicker") {
        dateSelection.day = Number(item.label.replace("일", ""));
        speak(item.label); popScreen();
        if (guardianDateSetup) pushScreen("dateWeekdayPicker", "요일 선택");
        render(); return;
      }
      if (currentKey() === "dateWeekdayPicker") {
        dateSelection.weekday = item.label;
        speak(item.label);
        guardianDateSetup = false;
        while (currentKey() !== "dateHome" && navStack.length > 1) popScreen();
        render(); return;
      }
      if (currentKey() === "dateWeatherPicker") {
        dateSelection.weather = item.label;
        speak(item.label); popScreen(); render(); return;
      }

      speak(item.label);
      window.setTimeout(() => {
        if (item.nav) { pushScreen(item.nav, item.label); render(); return; }
        if (yUrl) {
          if (item.playInApp && !useDirectYoutubeOpen) {
            pushScreen("youtubePlayer", item.label); setPlayer(yUrl); render();
          } else {
            const screen = DATA.screens[currentKey()] || {};
            if (screen.showPlayer) { setPlayer(yUrl); render(); }
            else openYoutubeDirect(yUrl);
          }
        }
      }, 70);
    });

    if (item.nav) {
      btn.addEventListener("pointerdown", () => prefetchScreenImages(item.nav), { passive: true });
    }
    gridEl.appendChild(btn);
  });
}

// ── 메인 렌더 ────────────────────────────────────────────────────────────────
function render() {
  const key    = currentKey();
  const screen = DATA.screens[key] || DATA.screens.main;
  const isMain = key === "main";
  backBtn.style.display = isMain ? "none" : "inline-flex";
  homeBtn.style.display = isMain ? "none" : "inline-flex";
  titleEl.textContent = screen.title || "AAC";
  helperEl.textContent = screen.helper || "";
  const crumb = breadcrumbText();
  crumbEl.textContent = crumb;
  crumbEl.style.display = crumb ? "block" : "none";
  renderHero(screen.hero);

  if (screen.showPlayer) {
    playerWrapEl.style.display = "block";
    openInYoutubeButton.style.display = "inline-flex";
    const screenYoutubeUrls = (screen.items || []).map((x) => resolveYoutube(x)).filter(Boolean);
    if (screenYoutubeUrls.length && selectedYoutube && !screenYoutubeUrls.includes(selectedYoutube))
      selectedYoutube = "";
    const firstUrl = screenYoutubeUrls[0] || "";
    if (!selectedYoutube && firstUrl) setPlayer(firstUrl);
  } else {
    playerWrapEl.style.display = "none";
    openInYoutubeButton.style.display = "none";
    playerEl.src = "";
  }

  const isSpotlight = screen.layout === "spotlight" && screen.spotlight?.image;
  const isEmpty     = screen.layout === "empty";

  if (key === "scheduleFridayFinalResult") {
    DATA.screens.scheduleFridayFinalResult.items = buildFridayPlanItems();
  }

  if (key === "outingHome") {
    if (outingPlannerMode) {
      const modeTitle = { person: "사람 선택", place: "장소 선택", transport: "이동수단 선택" };
      titleEl.textContent = modeTitle[outingPlannerMode] || "선택";
    }
    renderOutingPlanner();
  } else if (key === "outingCarTypes") {
    // 자동차 서브 선택 → 고르면 transport로 저장 후 outingHome으로 복귀
    appMainEl.classList.remove("app--spotlight");
    spotlightViewEl.style.display = "none";
    heroEl.style.display = "none";
    gridEl.style.display = "";
    gridEl.innerHTML = "";
    gridEl.className = "grid";
    (screen.items || []).forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "tile";
      const img = document.createElement("img");
      img.src = item.image || "./images/transport_car.png";
      img.alt = item.label;
      setupImageElement(img, true);
      const lbl = document.createElement("div");
      lbl.className = "tile-label";
      lbl.textContent = item.label;
      btn.appendChild(img);
      btn.appendChild(lbl);
      btn.addEventListener("click", () => {
        speak(item.label);
        outingSelection.transport = { label: item.label, image: item.image || "./images/transport_car.png" };
        outingPlannerMode = "";
        while (currentKey() !== "outingHome" && navStack.length > 1) popScreen();
        render();
      });
      gridEl.appendChild(btn);
    });
  } else if (key === "dateHome") {
    renderDateHome();
  } else if (screen.layout === "weeklySchedule") {
    renderWeeklySchedule();
  } else if (screen.layout === "dailyVisual") {
    renderDailyVisual();
  } else if (screen.layout === "weeklyDay") {
    renderWeeklyDaySchedule();
  } else if (screen.layout === "weeklyDetail") {
    renderWeeklyDetail();
  } else if (screen.layout === "homeActivityPicker") {
    renderHomeActivityPicker();
  } else if (screen.layout === "homeScheduleRunner") {
    renderHomeScheduleRunner();
  } else if (screen.layout === "therapyCenterPicker") {
    renderCenterPicker();
  } else if (screen.layout === "therapyClassPicker") {
    renderClassPicker(screen.centerIndex || 0);
  } else if (screen.layout === "therapyPicker") {
    renderTherapyPicker(screen);
  } else if (screen.layout === "fridayClassPicker") {
    const slotKey = screen.fridaySlot === 1 ? "slot1" : "slot2";
    renderFridaySlotPicker(slotKey);
  } else if (isSpotlight) {
    appMainEl.classList.add("app--spotlight");
    spotlightViewEl.style.display = "flex";
    gridEl.style.display = "none";
    gridEl.innerHTML = "";
    spotlightImgEl.src = screen.spotlight.image;
    spotlightImgEl.alt = screen.spotlight.label || screen.title || "";
    setupImageElement(spotlightImgEl, true);
    const spotLabel = screen.spotlight.label || screen.title || "";
    spotlightBtnEl.setAttribute("aria-label", `${spotLabel}, 눌러서 읽기`);
    spotlightBtnEl.onclick = () => speak(spotLabel);
  } else if (isEmpty) {
    appMainEl.classList.add("app--spotlight");
    spotlightViewEl.style.display = "none";
    spotlightBtnEl.onclick = null;
    gridEl.style.display = "none";
    gridEl.innerHTML = "";
  } else {
    appMainEl.classList.remove("app--spotlight");
    spotlightViewEl.style.display = "none";
    spotlightBtnEl.onclick = null;
    heroEl.className = "hero";
    gridEl.style.display = "";
    renderButtons(screen.items || [], screen.layout || (isMain ? "main" : "detail"));
  }

  requestAnimationFrame(() => prefetchLikelyNextScreens(key));
}

// ── 이벤트 핸들러 ────────────────────────────────────────────────────────────
backBtn.addEventListener("click", () => {
  speak("뒤로 가기");
  if (currentKey() === "outingHome" && outingPlannerMode) {
    outingPlannerMode = "";
    render();
    return;
  }
  if (currentKey() === "scheduleWeekly" && weeklyEditMode) {
    if (weeklyEditPersonFor !== null) {
      weeklyEditPersonFor = null;
    } else {
      weeklyEditMode = false;
    }
    render();
    return;
  }
  if (currentKey() === "scheduleWeeklyDay") {
    weeklyDayEditMode = false;
  }
  popScreen();
  selectedYoutube = "";
  render();
});

homeBtn.addEventListener("click", () => {
  speak("홈");
  while (navStack.length > 1) popScreen();
  outingPlannerMode = "";
  selectedYoutube = "";
  render();
});

openInYoutubeButton.addEventListener("click", () => {
  if (!selectedYoutube) return;
  speak("유튜브에서 열기");
  openYoutubeDirect(selectedYoutube);
});

// ── 4. 목소리 강제 로딩: 0.2초 간격으로 계속 확인 ───────────────────────────
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    preferredKoVoice = pickPreferredKoVoice();
  };
  preferredKoVoice = pickPreferredKoVoice();
  // Chrome/Android: getVoices()가 빈 배열을 반환할 때를 대비해 0.2초 간격으로 재시도
  let voiceRetry = 0;
  const voiceTimer = setInterval(() => {
    const v = pickPreferredKoVoice();
    if (v) { preferredKoVoice = v; clearInterval(voiceTimer); return; }
    if (voiceRetry++ > 30) clearInterval(voiceTimer); // 최대 6초
  }, 200);
}

window.addEventListener("pointerdown", warmupTTS, { once: true });
window.addEventListener("touchstart",  warmupTTS, { once: true });

if (isAppleMobile) returnHintEl.style.display = "block";

// ── 앱 시작 ──────────────────────────────────────────────────────────────────
render();
