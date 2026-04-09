/**
 * app.js — 앱 로직 (상태, 렌더링, 이벤트 핸들러)
 *
 * DATA 객체는 data.js 에서 정의됩니다.
 * HTML 구조는 index.html 에 있습니다.
 */

// ── DOM 참조 ──────────────────────────────────────────────────────────────────
const titleEl            = document.getElementById("screenTitle");
const backBtn            = document.getElementById("backButton");
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

// ── 날짜 선택 상태 ───────────────────────────────────────────────────────────
const WEEKDAY_OPTIONS = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
const WEATHER_OPTIONS = ["맑음", "흐림", "비", "눈", "바람"];
const WEATHER_EMOJI   = { "맑음": "☀️", "흐림": "🌥️", "비": "🌧️", "눈": "❄️", "바람": "💨" };
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

// ── 날짜 화면 ────────────────────────────────────────────────────────────────
function renderDateHome() {
  appMainEl.classList.remove("app--spotlight");
  spotlightViewEl.style.display = "none";
  spotlightBtnEl.onclick = null;
  heroEl.style.display = "none";
  heroEl.className = "hero";
  gridEl.style.display = "";
  gridEl.innerHTML = "";
  gridEl.className = "grid date-home";

  const month   = dateSelection.month   ? `${dateSelection.month}월`   : "몇 월";
  const day     = dateSelection.day     ? `${dateSelection.day}일`      : "몇 일";
  const weekday = dateSelection.weekday || "무슨 요일";
  const weather = dateSelection.weather || null;
  const weatherEmoji = weather ? (WEATHER_EMOJI[weather] || "🌤️") : "🌤️";
  const fullText = `오늘은 ${month} ${day} ${weekday}${weather ? " " + weather : ""}`;

  // 전체 문장 버튼
  const sentenceBtn = document.createElement("button");
  sentenceBtn.className = "btn main date-sentence";
  sentenceBtn.textContent = fullText;
  sentenceBtn.addEventListener("click", () => speak(fullText));
  gridEl.appendChild(sentenceBtn);

  // 개별 날짜 타일
  const tiles = [
    { label: month,   isSet: !!dateSelection.month,   artChar: dateSelection.month   ? String(dateSelection.month)         : "?", artClass: "date-art-month"   },
    { label: day,     isSet: !!dateSelection.day,     artChar: dateSelection.day     ? String(dateSelection.day)            : "?", artClass: "date-art-day"     },
    { label: weekday, isSet: !!dateSelection.weekday, artChar: dateSelection.weekday ? dateSelection.weekday.charAt(0)      : "?", artClass: "date-art-weekday" },
    { label: weather || "날씨 선택", isSet: !!weather, artChar: weatherEmoji, artClass: "date-art-weather", isWeather: true }
  ];

  tiles.forEach((tile) => {
    const btn = document.createElement("button");
    btn.className = "tile date-tile" + (tile.isWeather ? " date-tile-weather" : "");
    const art = document.createElement("div");
    art.className = "date-art " + (tile.isSet ? tile.artClass : "date-art-empty");
    art.textContent = tile.artChar;
    const lbl = document.createElement("div");
    lbl.className = "tile-label";
    lbl.textContent = tile.label;
    btn.appendChild(art);
    btn.appendChild(lbl);
    btn.addEventListener("click", () => {
      speak(tile.label);
      if (tile.isWeather) { pushScreen("dateWeatherPicker", "날씨 선택"); render(); }
    });
    gridEl.appendChild(btn);
  });

  // 보호자 날짜 설정 버튼
  const setupBtn = document.createElement("button");
  setupBtn.className = "btn date-guardian-btn";
  setupBtn.textContent = "📅 날짜 설정 (보호자)";
  setupBtn.addEventListener("click", () => {
    guardianDateSetup = true;
    pushScreen("dateMonthPicker", "월 선택");
    render();
  });
  gridEl.appendChild(setupBtn);
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
  } else if (screen.layout === "therapyCenterPicker") {
    renderCenterPicker();
  } else if (screen.layout === "therapyClassPicker") {
    renderClassPicker(screen.centerIndex || 0);
  } else if (screen.layout === "therapyPicker") {
    renderTherapyPicker(screen);
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
  popScreen();
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
