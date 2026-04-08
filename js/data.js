/**
 * data.js — 화면 정의 데이터
 *
 * 이 파일에는 앱의 모든 화면(screens)과 YouTube URL 목록이 정의되어 있습니다.
 * 새 화면 추가, 항목 수정 등은 이 파일에서만 하면 됩니다.
 */

// ── 공부하기 화면 동적 생성 ──────────────────────────────────────────────────
function buildStudyScreensMap() {
  const BLANK_TILE_IMAGE =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23ffffff'/></svg>";

  const stickerKinds = [
    { label: "마트",     image: "./images/stickerbook_mart.png" },
    { label: "과일",     image: "./images/stickerbook_fruit.png" },
    { label: "우리집",   image: "./images/stickerbook_myhome.png" },
    { label: "동물",     image: "./images/stickerbook_animal.png" },
    { label: "탈것",     image: "./images/stickerbook_vehicle.png" },
    { label: "숫자",     image: "./images/stickerbook_number.png" },
    { label: "눈코입",   image: "./images/stickerbook_eyenosemouth.png" },
    { label: "한글",     image: "./images/stickerbook_language.png" },
    { label: "애완동물", image: "./images/stickerbook_pet.png" },
    { label: "모양.색깔",image: "./images/stickerbook_shape.png" }
  ];

  const knobKinds = [
    { label: "숫자", image: "./images/knobpuzzle_numbers.png" },
    { label: "모양", image: "./images/knobpuzzle_shapes2.png" },
    { label: "과일", image: "./images/knobpuzzle_fruits.png" },
    { label: "탈것", image: "./images/knobpuzzle_vehicles.png" }
  ];

  const defs = [
    {
      key: "studyPeg",
      label: "페그꼽기",
      studyTileImage: "./images/study_pegboard.png",
      subs: ["페그꼽기 ①", "페그꼽기 ②", "페그꼽기 ③", "페그꼽기 ④", "페그꼽기 ⑤", "페그꼽기 ⑥"]
    },
    {
      key: "studySoundCard",
      label: "사운드북 카드",
      studyTileImage: "./images/study_soundbook_card.png",
      subs: ["사운드북 카드 ①", "사운드북 카드 ②", "사운드북 카드 ③", "사운드북 카드 ④", "사운드북 카드 ⑤", "사운드북 카드 ⑥"]
    },
    {
      key: "studyColorPencil",
      label: "색연필",
      studyTileImage: "./images/study_color_pencil.png",
      subs: ["색연필 ①", "색연필 ②", "색연필 ③", "색연필 ④", "색연필 ⑤", "색연필 ⑥"]
    },
    {
      key: "studyCard",
      label: "카드",
      subs: ["카드 ①", "카드 ②", "카드 ③", "카드 ④", "카드 ⑤", "카드 ⑥"]
    }
  ];

  const rest = {};
  const homeItems = [
    { label: "스티커북", nav: "studySticker",    image: "./images/stickerbook_mart.png" },
    { label: "꼭지퍼즐", nav: "studyKnobPuzzle", image: "./images/knobpuzzle_fruits.png" },
    ...defs.map((d) => ({
      label: d.label,
      nav: d.key,
      image: d.studyTileImage || "./images/study.png"
    }))
  ];

  // 스티커북
  rest.studySticker = {
    title: "스티커북",
    helper: "원하는 종류를 선택하세요. (더 많은 종류는 「다음」)",
    hero: [],
    items: [
      ...stickerKinds.slice(0, 6).map((sub, i) => ({
        label: sub.label,
        nav: `studySticker_${i + 1}`,
        image: sub.image
      })),
      { label: "다음", nav: "studySticker_p2", image: "./images/study.png" }
    ],
    layout: "main",
    showPlayer: false
  };

  rest.studySticker_p2 = {
    title: "스티커북",
    helper: "나머지 종류를 선택하세요. (앞 화면은 「이전」)",
    hero: [],
    items: [
      ...stickerKinds.slice(6, 10).map((sub, i) => ({
        label: sub.label,
        nav: `studySticker_${i + 7}`,
        image: sub.image
      })),
      { label: "이전", nav: "studySticker", image: "./images/study.png" }
    ],
    layout: "main",
    showPlayer: false
  };

  stickerKinds.forEach((sub, i) => {
    const k = `studySticker_${i + 1}`;
    rest[k] = {
      title: sub.label,
      helper: "그림을 누르면 읽어 줘요.",
      hero: [],
      items: [],
      layout: "spotlight",
      spotlight: { image: sub.image, label: sub.label },
      showPlayer: false
    };
  });

  // 꼭지퍼즐
  rest.studyKnobPuzzle = {
    title: "꼭지퍼즐",
    helper: "원하는 종류를 선택하세요.",
    hero: [],
    items: knobKinds.map((sub, i) => ({
      label: sub.label,
      nav: `studyKnobPuzzle_${i + 1}`,
      image: sub.image
    })),
    layout: "main",
    showPlayer: false
  };

  knobKinds.forEach((sub, i) => {
    const k = `studyKnobPuzzle_${i + 1}`;
    let items;
    if (sub.label === "숫자") {
      items = [
        { label: `${sub.label} · 1번`, image: "./images/knobpuzzle_numbers.png" },
        { label: `${sub.label} · 2번`, image: "./images/knobpuzzle_numbers2.png" },
        { label: `${sub.label} · 3번`, image: "./images/knobpuzzle_numbers3.png" },
        { label: `${sub.label} · 4번`, image: "./images/knobpuzzle_numbers.png" },
        { label: `${sub.label} · 5번`, image: "./images/knobpuzzle_numbers2.png" },
        { label: `${sub.label} · 6번`, image: "./images/knobpuzzle_numbers3.png" }
      ];
    } else if (sub.label === "모양") {
      items = [
        { label: `${sub.label} · 1번`, image: "./images/knobpuzzle_shapes2.png" },
        { label: `${sub.label} · 2번`, image: "./images/knobpuzzle_shapes.png" },
        { label: `${sub.label} · 3번`, image: "./images/knobpuzzle_shapes2.png" },
        { label: `${sub.label} · 4번`, image: "./images/knobpuzzle_shapes.png" },
        { label: `${sub.label} · 5번`, image: "./images/knobpuzzle_shapes2.png" },
        { label: `${sub.label} · 6번`, image: "./images/knobpuzzle_shapes.png" }
      ];
    } else {
      items = Array.from({ length: 6 }, (_, j) => ({
        label: `${sub.label} · ${j + 1}번`,
        image: sub.image
      }));
    }
    const visibleCount = sub.label === "숫자" ? 3 : (sub.label === "모양" ? 2 : 6);
    rest[k] = {
      title: sub.label,
      helper: "원하는 항목을 선택하세요.",
      hero: [],
      items: items.map((row, j) => ({
        label: row.label,
        nav: `${k}_${j + 1}`,
        image: j < visibleCount ? row.image : BLANK_TILE_IMAGE
      })),
      layout: "main",
      showPlayer: false
    };
    items.forEach((row, j) => {
      const leafKey = `${k}_${j + 1}`;
      const isBlankSlot =
        (sub.label === "숫자" && j >= 3) ||
        (sub.label === "모양" && j >= 2);
      rest[leafKey] = isBlankSlot
        ? { title: row.label, helper: "", hero: [], items: [], layout: "empty", showPlayer: false }
        : {
          title: row.label,
          helper: "그림을 누르면 읽어 줘요.",
          hero: [],
          items: [],
          layout: "spotlight",
          spotlight: { image: row.image, label: row.label },
          showPlayer: false
        };
    });
  });

  // 나머지 공부하기 항목
  defs.forEach((d) => {
    const isSpotlightStudy =
      d.key === "studyPeg" || d.key === "studySoundCard" || d.key === "studyColorPencil";
    const isBlankCard = d.key === "studyCard";
    rest[d.key] = isSpotlightStudy
      ? {
        title: d.label,
        helper: "그림을 누르면 읽어 줘요.",
        hero: [],
        items: [],
        layout: "spotlight",
        spotlight: { image: d.studyTileImage || "./images/study.png", label: d.label },
        showPlayer: false
      }
      : {
        title: d.label,
        helper: "원하는 종류를 선택하세요.",
        hero: [],
        items: d.subs.map((sub, i) => ({
          label: sub,
          nav: `${d.key}_${i + 1}`,
          image: isBlankCard ? BLANK_TILE_IMAGE : (d.studyTileImage || "./images/study.png")
        })),
        layout: "main",
        showPlayer: false
      };
    if (isSpotlightStudy) return;
    d.subs.forEach((sub, i) => {
      const k = `${d.key}_${i + 1}`;
      rest[k] = isBlankCard
        ? { title: sub, helper: "", hero: [], items: [], layout: "empty", showPlayer: false }
        : {
          title: sub,
          helper: "원하는 항목을 선택하세요.",
          hero: [],
          items: Array.from({ length: 6 }, (_, j) => ({
            label: `${sub} · ${j + 1}번`,
            image: "./images/study.png"
          })),
          layout: "main",
          showPlayer: false
        };
    });
  });

  return { homeItems, rest };
}

const STUDY_SCREEN_MAP = buildStudyScreensMap();

// ── 앱 전체 데이터 ────────────────────────────────────────────────────────────
const DATA = {
  youtube: {
    busVideo:   "https://www.youtube.com/watch?v=Bks5WybVkQ0&t=441s",
    pororo:     "https://www.youtube.com/watch?v=NUb53dtqt6E&t=1002s",
    gayo:       "https://www.youtube.com/watch?v=ekr2nIex040",
    bus1: "https://www.youtube.com/watch?v=Bks5WybVkQ0&t=441s",
    bus2: "https://www.youtube.com/watch?v=Iz1YrvCq5x4",
    bus3: "https://www.youtube.com/watch?v=qz5mck_-jXM",
    bus4: "https://www.youtube.com/watch?v=fa6RXRvixXI",
    bus5: "https://www.youtube.com/watch?v=A1JfsShN2GE",
    bus6: "https://www.youtube.com/watch?v=EZvRpLoNazg",
    pororo1: "https://www.youtube.com/watch?v=NUb53dtqt6E",
    pororo2: "https://www.youtube.com/watch?v=t8vR8wN9rXw",
    pororo3: "https://www.youtube.com/watch?v=4wW5vR3n0no",
    pororo4: "https://www.youtube.com/watch?v=W9D5ZQdYQqY",
    pororo5: "https://www.youtube.com/watch?v=G2bT3Q5h1gM",
    pororo6: "https://www.youtube.com/watch?v=u8Qx4M5cGxA",
    kongsuni1: "https://www.youtube.com/watch?v=NUb53dtqt6E",
    kongsuni2: "https://www.youtube.com/watch?v=ekr2nIex040",
    kongsuni3: "https://www.youtube.com/watch?v=Iz1YrvCq5x4",
    kongsuni4: "https://www.youtube.com/watch?v=qz5mck_-jXM",
    kongsuni5: "https://www.youtube.com/watch?v=fa6RXRvixXI",
    kongsuni6: "https://www.youtube.com/watch?v=A1JfsShN2GE",
    tayo1: "https://www.youtube.com/watch?v=Bks5WybVkQ0&t=441s",
    tayo2: "https://www.youtube.com/watch?v=Iz1YrvCq5x4",
    tayo3: "https://www.youtube.com/watch?v=qz5mck_-jXM",
    tayo4: "https://www.youtube.com/watch?v=fa6RXRvixXI",
    tayo5: "https://www.youtube.com/watch?v=A1JfsShN2GE",
    tayo6: "https://www.youtube.com/watch?v=EZvRpLoNazg",
    bebefin1: "https://www.youtube.com/watch?v=ekr2nIex040",
    bebefin2: "https://www.youtube.com/watch?v=NUb53dtqt6E",
    bebefin3: "https://www.youtube.com/watch?v=Iz1YrvCq5x4",
    bebefin4: "https://www.youtube.com/watch?v=qz5mck_-jXM",
    bebefin5: "https://www.youtube.com/watch?v=fa6RXRvixXI",
    bebefin6: "https://www.youtube.com/watch?v=A1JfsShN2GE",
    pinkfong1: "https://www.youtube.com/watch?v=ekr2nIex040",
    pinkfong2: "https://www.youtube.com/watch?v=NUb53dtqt6E",
    pinkfong3: "https://www.youtube.com/watch?v=Iz1YrvCq5x4",
    pinkfong4: "https://www.youtube.com/watch?v=qz5mck_-jXM",
    pinkfong5: "https://www.youtube.com/watch?v=fa6RXRvixXI",
    pinkfong6: "https://www.youtube.com/watch?v=A1JfsShN2GE",
    gayo1: "https://www.youtube.com/watch?v=ekr2nIex040",
    gayo2: "https://www.youtube.com/watch?v=Bks5WybVkQ0&t=441s",
    gayo3: "https://www.youtube.com/watch?v=Iz1YrvCq5x4",
    gayo4: "https://www.youtube.com/watch?v=qz5mck_-jXM",
    gayo5: "https://www.youtube.com/watch?v=fa6RXRvixXI",
    gayo6: "https://www.youtube.com/watch?v=A1JfsShN2GE"
  },

  screens: {
    // ── 메인 ──────────────────────────────────────────────────────────────────
    main: {
      title: "메인 화면",
      helper: "버튼을 누르면 음성으로 읽어줍니다.",
      hero: [],
      items: [
        { label: "아이패드",   nav: "ipadHome",    image: "./images/ipad.png" },
        { label: "밥 먹기",   nav: "meal",        image: "./images/meal.png" },
        { label: "화장실",    nav: "toilet",      image: "./images/toilet.png" },
        { label: "외출하기",  nav: "outingHome",  image: "./images/outing.png" },
        { label: "공부하기",  nav: "studyHome",   image: "./images/study.png" },
        { label: "학교",      nav: "outingSchool",image: "./images/school_classroom.png" },
        { label: "다음",      nav: "main_p2",     image: "./images/study.png" }
      ],
      layout: "main"
    },

    main_p2: {
      title: "메인 화면 (2)",
      helper: "추가 카테고리를 선택하세요.",
      hero: [],
      items: [
        { label: "스케줄표", nav: "scheduleHome", icon: "📅" },
        { label: "과목",    nav: "subjectHome",  icon: "📚" },
        { label: "날짜",    nav: "dateHome",     icon: "📆" },
        { label: "사람",    nav: "peopleHome",   image: "./images/outing_person_me.png" },
        { label: "휴식",    icon: "🛋️" },
        { label: "이전",    nav: "main",         image: "./images/study.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    // ── 사람 ──────────────────────────────────────────────────────────────────
    peopleHome: {
      title: "사람",
      helper: "사람을 선택하세요.",
      hero: [],
      items: [
        { label: "나",            image: "./images/outing_person_me.png" },
        { label: "엄마",          image: "./images/outing_person_mom.png" },
        { label: "아빠",          image: "./images/outing_person_dad.png" },
        { label: "활동보조 선생님", image: "./images/outing_person_activity_support.png" },
        { label: "할아버지",       image: "./images/outing_person_grandpa.png" },
        { label: "할머니",         image: "./images/outing_person_grandma.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    // ── 스케줄 ────────────────────────────────────────────────────────────────
    scheduleHome: {
      title: "스케줄표",
      helper: "스케줄 관련 항목을 선택하세요.",
      hero: [],
      items: [
        { label: "오늘 일정", nav: "scheduleToday" },
        { label: "내일 일정" },
        { label: "이번 주" }
      ],
      layout: "main",
      showPlayer: false
    },

    scheduleToday: {
      title: "오늘 일정",
      helper: "순서대로 눌러 말해 보세요. (치료실은 선택)",
      hero: [],
      items: [
        { label: "1. 학교가요",          image: "./images/outing_school1.png" },
        { label: "2. 장애인 콜택시 타요",  image: "./images/transport_calltaxi.png" },
        { label: "3. 치료실 선택",         nav: "scheduleTodayTherapy" },
        { label: "4. 장애인 콜택시 타요",  image: "./images/transport_calltaxi.png" },
        { label: "5. 집에 와요",           image: "./images/home.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    // 치료실 선택 (1~2개 병원 체크 → 각 병원 수업 선택)
    scheduleTodayTherapy: {
      title: "치료실 선택",
      helper: "오늘 갈 치료실을 1~2개 선택하세요.",
      hero: [],
      items: [],
      layout: "therapyCenterPicker",
      showPlayer: false
    },

    scheduleTodayClassesA: {
      title: "수업 선택 (1번째 치료실)",
      helper: "수업을 선택하세요.",
      hero: [],
      items: [],
      layout: "therapyClassPicker",
      centerIndex: 0,
      showPlayer: false
    },

    scheduleTodayClassesB: {
      title: "수업 선택 (2번째 치료실)",
      helper: "수업을 선택하세요.",
      hero: [],
      items: [],
      layout: "therapyClassPicker",
      centerIndex: 1,
      showPlayer: false
    },

    scheduleTodayTherapyResult: {
      title: "오늘 일정",
      helper: "선택한 치료실/수업 일정이에요.",
      hero: [],
      items: [],
      layout: "main",
      showPlayer: false
    },

    // ── 과목 ──────────────────────────────────────────────────────────────────
    subjectHome: {
      title: "과목",
      helper: "과목을 선택하세요.",
      hero: [],
      items: [
        { label: "국어" },
        { label: "수학" },
        { label: "체육" },
        { label: "음악" },
        { label: "미술" }
      ],
      layout: "main",
      showPlayer: false
    },

    // ── 날짜 ──────────────────────────────────────────────────────────────────
    dateHome: {
      title: "날짜",
      helper: "날짜/요일을 말해보세요.",
      hero: [],
      items: [],
      layout: "main",
      showPlayer: false
    },

    dateWeatherPicker: {
      title: "날씨 선택",
      helper: "오늘 날씨를 선택하세요.",
      hero: [],
      items: [
        { label: "맑음" }, { label: "흐림" }, { label: "비" },
        { label: "눈" },   { label: "바람" }
      ],
      layout: "main",
      showPlayer: false
    },

    dateMonthPicker: {
      title: "월 선택",
      helper: "1월~12월 중에서 선택하세요.",
      hero: [],
      items: Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}월` })),
      layout: "main",
      showPlayer: false
    },

    dateDayPicker: {
      title: "일 선택",
      helper: "1일~30일 중에서 선택하세요.",
      hero: [],
      items: Array.from({ length: 30 }, (_, i) => ({ label: `${i + 1}일` })),
      layout: "main",
      showPlayer: false
    },

    dateWeekdayPicker: {
      title: "요일 선택",
      helper: "요일을 선택하세요.",
      hero: [],
      items: [
        { label: "월요일" }, { label: "화요일" }, { label: "수요일" },
        { label: "목요일" }, { label: "금요일" }, { label: "토요일" }, { label: "일요일" }
      ],
      layout: "main",
      showPlayer: false
    },

    // ── 공부하기 (동적 생성) ──────────────────────────────────────────────────
    studyHome: {
      title: "공부하기",
      helper: "카테고리를 선택하세요.",
      hero: [],
      items: STUDY_SCREEN_MAP.homeItems,
      layout: "main",
      showPlayer: false
    },

    ...STUDY_SCREEN_MAP.rest,

    // ── 아이패드 / 유튜브 ────────────────────────────────────────────────────
    ipadHome: {
      title: "아이패드(유튜브)",
      helper: "아이패드에서 사용할 기능을 선택하세요.",
      hero: [],
      items: [{ label: "유튜브", nav: "ipadYouTube", image: "./images/youtube.png", icon: "▶️" }],
      layout: "main",
      showPlayer: false
    },

    ipadYouTube: {
      title: "유튜브",
      helper: "원하는 메뉴를 선택하세요.",
      hero: [],
      items: [
        { label: "버스 영상", nav: "busVideoList", image: "./images/bus.png" },
        { label: "노래",      nav: "ipadMusic",    image: "./images/sing.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    ipadMusic: {
      title: "노래",
      helper: "원하는 콘텐츠를 선택하세요.",
      hero: [],
      items: [
        { label: "뽀로로", nav: "pororoList",   youtube: "pororo",   image: "https://img.youtube.com/vi/NUb53dtqt6E/hqdefault.jpg" },
        { label: "콩순이", nav: "kongsuniList", youtube: "kongsuni1",image: "https://img.youtube.com/vi/NUb53dtqt6E/hqdefault.jpg" },
        { label: "타요",   nav: "tayoList",     youtube: "tayo1",    image: "https://img.youtube.com/vi/Bks5WybVkQ0/hqdefault.jpg" },
        { label: "베베핀", nav: "bebefinList",  youtube: "bebefin1", image: "https://img.youtube.com/vi/ekr2nIex040/hqdefault.jpg" },
        { label: "핑크퐁", nav: "pinkfongList", youtube: "pinkfong1",image: "https://img.youtube.com/vi/ekr2nIex040/hqdefault.jpg" },
        { label: "가요",   nav: "gayoList",     youtube: "gayo1",    image: "https://img.youtube.com/vi/ekr2nIex040/hqdefault.jpg" }
      ],
      layout: "main",
      showPlayer: false
    },

    busVideoList: {
      title: "버스 영상",
      helper: "보고 싶은 버스 영상을 선택하세요.",
      hero: [],
      items: Array.from({ length: 6 }, (_, i) => ({ label: `버스 ${i + 1}`, youtube: `bus${i + 1}`, playInApp: true })),
      layout: "media",
      showPlayer: false
    },

    pororoList: {
      title: "뽀로로",
      helper: "보고 싶은 뽀로로 영상을 선택하세요.",
      hero: [],
      items: Array.from({ length: 6 }, (_, i) => ({ label: `뽀로로 ${i + 1}`, youtube: `pororo${i + 1}`, playInApp: true })),
      layout: "media",
      showPlayer: false
    },

    kongsuniList: {
      title: "콩순이",
      helper: "보고 싶은 콩순이 영상을 선택하세요.",
      hero: [],
      items: Array.from({ length: 6 }, (_, i) => ({ label: `콩순이 ${i + 1}`, youtube: `kongsuni${i + 1}`, playInApp: true })),
      layout: "media",
      showPlayer: false
    },

    tayoList: {
      title: "타요",
      helper: "보고 싶은 타요 영상을 선택하세요.",
      hero: [],
      items: Array.from({ length: 6 }, (_, i) => ({ label: `타요 ${i + 1}`, youtube: `tayo${i + 1}`, playInApp: true })),
      layout: "media",
      showPlayer: false
    },

    bebefinList: {
      title: "베베핀",
      helper: "보고 싶은 베베핀 영상을 선택하세요.",
      hero: [],
      items: Array.from({ length: 6 }, (_, i) => ({ label: `베베핀 ${i + 1}`, youtube: `bebefin${i + 1}`, playInApp: true })),
      layout: "media",
      showPlayer: false
    },

    pinkfongList: {
      title: "핑크퐁",
      helper: "보고 싶은 핑크퐁 영상을 선택하세요.",
      hero: [],
      items: Array.from({ length: 6 }, (_, i) => ({ label: `핑크퐁 ${i + 1}`, youtube: `pinkfong${i + 1}`, playInApp: true })),
      layout: "media",
      showPlayer: false
    },

    gayoList: {
      title: "가요",
      helper: "듣고 싶은 가요를 선택하세요.",
      hero: [],
      items: Array.from({ length: 6 }, (_, i) => ({ label: `가요 ${i + 1}`, youtube: `gayo${i + 1}`, playInApp: true })),
      layout: "media",
      showPlayer: false
    },

    youtubePlayer: {
      title: "영상 재생",
      helper: "영상을 보고 뒤로 가기로 돌아가세요.",
      hero: [],
      items: [],
      layout: "detail",
      showPlayer: true
    },

    // ── 일상 ──────────────────────────────────────────────────────────────────
    meal: {
      title: "밥 먹기",
      helper: "원하는 것을 선택하세요.",
      hero: [],
      items: [
        { label: "밥" }, { label: "주스" }, { label: "물" }, { label: "고기" }
      ],
      layout: "detail"
    },

    toilet: {
      title: "화장실",
      helper: "원하는 것을 선택하세요.",
      hero: [],
      items: [
        { label: "양치하기", image: "./images/brush.png" },
        { label: "샤워",     image: "./images/shower.png" },
        { label: "소변",     image: "./images/pee.png" },
        { label: "대변",     image: "./images/poo.png" },
        { label: "세수",     image: "./images/wash_face.png" },
        { label: "손씻기",   image: "./images/wash_hands.png" }
      ],
      layout: "media",
      showPlayer: false
    },

    // ── 외출하기 ──────────────────────────────────────────────────────────────
    outingHome: {
      title: "외출하기",
      helper: "사람, 장소, 이동수단을 선택할 수 있어요.",
      hero: [
        { label: "버스",   image: "./images/outing.png" },
        { label: "아빠차", image: "./images/dadcar.png" }
      ],
      items: [
        { label: "사람 선택",    nav: "outingPerson" },
        { label: "장소 선택",    nav: "outingPlace" },
        { label: "이동수단 선택", nav: "outingTransport" }
      ],
      layout: "detail"
    },

    outingPerson: {
      title: "사람 선택",
      helper: "누가 함께 가나요?",
      hero: [],
      items: [
        { label: "나",            image: "./images/outing_person_me.png" },
        { label: "엄마",          image: "./images/outing_person_mom.png" },
        { label: "아빠",          image: "./images/outing_person_dad.png" },
        { label: "활동보조 선생님", image: "./images/outing_person_activity_support.png" },
        { label: "할아버지",       image: "./images/outing_person_grandpa.png" },
        { label: "할머니",         image: "./images/outing_person_grandma.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    outingPlace: {
      title: "장소 선택",
      helper: "어디로 갈까요?",
      hero: [],
      items: [
        { label: "학교", nav: "outingSchool", image: "./images/outing_school1.png" },
        { label: "공원",                      image: "./images/outing_park1.png" },
        { label: "마트",                      image: "./images/outing_mart1.png" },
        { label: "빵집",                      image: "./images/outing_bakery.png" },
        { label: "카페",                      image: "./images/outing_cafe.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    // ── 학교 ──────────────────────────────────────────────────────────────────
    outingSchool: {
      title: "학교",
      helper: "어디로 갈까요? (더 보기는 「다음」)",
      hero: [],
      items: [
        { label: "신발장",     image: "./images/school_shoe_locker.png" },
        { label: "엘리베이터", image: "./images/school_elevator.png" },
        { label: "화장실",     image: "./images/school_restroom.png" },
        { label: "교실",       image: "./images/school_classroom.png" },
        { label: "담임선생님", image: "./images/school_homeroom_teacher.png" },
        { label: "친구들",     nav: "outingSchoolFriends", image: "./images/school_friends.png" },
        { label: "다음",       nav: "outingSchool_p2",     image: "./images/study.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    outingSchoolFriends: {
      title: "친구들",
      helper: "친구를 선택하세요.",
      hero: [],
      items: [
        { label: "건민",  image: "./images/school_friends_건민.png" },
        { label: "동하",  image: "./images/school_friends_동하.png" },
        { label: "승우",  image: "./images/school_friends_승우.png" },
        { label: "윤희",  image: "./images/school_friends_윤희.png" },
        { label: "윤희 2",image: "./images/school_friends_윤희1.png" },
        { label: "하린",  image: "./images/school_friends_하린.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    outingSchool_p2: {
      title: "학교",
      helper: "계속 선택하세요. (「이전」「다음」)",
      hero: [],
      items: [
        { label: "교과실",       image: "./images/school_subject_room.png" },
        { label: "급식실",       image: "./images/school_cafeteria.png" },
        { label: "무한상상실",   image: "./images/school_imagination_room.png" },
        { label: "학교정원",     image: "./images/school_garden.png" },
        { label: "디지털액티브실",image: "./images/school_digital_active_room.png" },
        { label: "체육관",       image: "./images/school_gym.png" },
        { label: "다음", nav: "outingSchool_p3", image: "./images/study.png" },
        { label: "이전", nav: "outingSchool",    image: "./images/study.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    outingSchool_p3: {
      title: "학교",
      helper: "마지막 항목이에요.",
      hero: [],
      items: [
        { label: "보치아경기", image: "./images/school_boccia.png" },
        { label: "이전", nav: "outingSchool_p2", image: "./images/study.png" }
      ],
      layout: "main",
      showPlayer: false
    },

    outingTransport: {
      title: "이동수단 선택",
      helper: "어떻게 이동할까요?",
      hero: [],
      items: [
        { label: "걸어서",      image: "./images/transport_walk.png" },
        { label: "자동차",      image: "./images/dadcar.png" },
        { label: "버스",        image: "./images/bus.png" },
        { label: "지하철",      image: "./images/transport_subway_JM.png" },
        { label: "자전거",      image: "./images/transport_bike.png" },
        { label: "장애인콜택시", image: "./images/transport_calltaxi.png" }
      ],
      layout: "main",
      showPlayer: false
    }
  }
};
