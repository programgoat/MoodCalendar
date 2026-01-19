/* ===========================
   MoodCalendar v3 — JavaScript
   ・今日だけ編集可能
   ・翌日以降は閲覧のみ
   ・スマホ/PC UI判定
   ・ポップなアニメーション制御
=========================== */

/* ---------------------------
   日付フォーマット
--------------------------- */
function formatDateKey(date) {
  return date.toISOString().split("T")[0];
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ---------------------------
   localStorage
--------------------------- */
function loadEntries() {
  return JSON.parse(localStorage.getItem("moodEntries") || "{}");
}

function saveEntries(entries) {
  localStorage.setItem("moodEntries", JSON.stringify(entries));
}

/* ---------------------------
   UI要素取得
--------------------------- */
const calendarEl = document.getElementById("calendar");
const monthLabel = document.getElementById("month-label");
const todayLabel = document.getElementById("today-label");

const modalBackdrop = document.getElementById("modal-backdrop");
const modalClose = document.getElementById("modal-close");
const moodButtons = document.querySelectorAll(".mood-option");
const noteEl = document.getElementById("note");
const charCount = document.getElementById("char-count");
const saveBtn = document.getElementById("save-btn");
const clearBtn = document.getElementById("clear-btn");

const selectedDayInfo = document.getElementById("selected-day-info");
const selectedNoteBox = document.getElementById("selected-note-box");

const graphEl = document.getElementById("graph");
const graphLabelsEl = document.getElementById("graph-labels");
const moodDistributionEl = document.getElementById("mood-distribution");

const helpBtn = document.getElementById("help-btn");
const helpBackdrop = document.getElementById("help-backdrop");
const helpClose = document.getElementById("help-close");

const analysisBtn = document.getElementById("analysis-btn");
const analysisBackdrop = document.getElementById("analysis-backdrop");
const analysisClose = document.getElementById("analysis-close");

/* ---------------------------
   状態
--------------------------- */
let currentDate = new Date();
let selectedDate = null;
let selectedMood = null;

/* ---------------------------
   スマホ判定
--------------------------- */
function isMobile() {
  return window.innerWidth < 768;
}

/* ---------------------------
   カレンダー描画
--------------------------- */
function renderCalendar() {
  calendarEl.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthLabel.textContent = `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startWeekday = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const entries = loadEntries();
  const today = new Date();

  // 空白
  for (let i = 0; i < startWeekday; i++) {
    const blank = document.createElement("div");
    calendarEl.appendChild(blank);
  }

  // 日付
  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement("div");
    cell.className = "day";

    const dateObj = new Date(year, month, d);
    const key = formatDateKey(dateObj);

    // 今日
    if (sameDay(dateObj, today)) {
      cell.classList.add("day-today");
    }

    // mood
    if (entries[key]) {
      const mood = entries[key].mood;
      cell.classList.add(`mood-${mood}`);

      const label = document.createElement("div");
      label.className = "day-mood-label";
      label.textContent = entries[key].label;
      cell.appendChild(label);
    }

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = d;
    cell.appendChild(num);

    // クリック
    cell.addEventListener("click", () => onDayClick(dateObj));

    calendarEl.appendChild(cell);
  }
}

/* ---------------------------
   日付クリック
--------------------------- */
function onDayClick(dateObj) {
  selectedDate = dateObj;
  const key = formatDateKey(dateObj);
  const entries = loadEntries();
  const today = new Date();

  // 選択日表示
  updateSelectedDayDisplay();

  // 今日以外 → 編集禁止
  if (!sameDay(dateObj, today)) {
    return; // モーダル開かない
  }

  // 今日 → 編集可能
  openModal();

  // 既存データ
  if (entries[key]) {
    selectedMood = entries[key].mood;
    noteEl.value = entries[key].note;
    charCount.textContent = `${noteEl.value.length} / 120`;

    moodButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mood === selectedMood);
    });
  } else {
    selectedMood = null;
    noteEl.value = "";
    charCount.textContent = "0 / 120";
    moodButtons.forEach((btn) => btn.classList.remove("active"));
  }
}

/* ---------------------------
   選択日表示（右側）
--------------------------- */
function updateSelectedDayDisplay() {
  if (!selectedDate) {
    selectedDayInfo.textContent = "まだ日付が選択されていません。";
    selectedNoteBox.innerHTML = `<span class="note-empty">メモはまだありません。</span>`;
    return;
  }

  const key = formatDateKey(selectedDate);
  const entries = loadEntries();

  selectedDayInfo.textContent = `${selectedDate.getFullYear()}年 ${
    selectedDate.getMonth() + 1
  }月 ${selectedDate.getDate()}日`;

  if (entries[key]) {
    selectedNoteBox.textContent = entries[key].note || "（メモなし）";
  } else {
    selectedNoteBox.innerHTML = `<span class="note-empty">メモはまだありません。</span>`;
  }
}

/* ---------------------------
   モーダル
--------------------------- */
function openModal() {
  modalBackdrop.classList.add("show");
}

function closeModal() {
  modalBackdrop.classList.remove("show");
}

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

/* ---------------------------
   気分ボタン
--------------------------- */
moodButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    moodButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedMood = btn.dataset.mood;
  });
});

/* ---------------------------
   メモ文字数
--------------------------- */
noteEl.addEventListener("input", () => {
  charCount.textContent = `${noteEl.value.length} / 120`;
});

/* ---------------------------
   保存
--------------------------- */
saveBtn.addEventListener("click", () => {
  if (!selectedDate || !selectedMood) return;

  const key = formatDateKey(selectedDate);
  const entries = loadEntries();

  const moodLabels = {
    bad: "しんどい",
    meh: "ふつう",
    good: "わりと良い",
    great: "最高",
  };

  entries[key] = {
    mood: selectedMood,
    label: moodLabels[selectedMood],
    note: noteEl.value,
    createdAt: new Date().toISOString(),
  };

  saveEntries(entries);
  closeModal();
  renderCalendar();
  updateSelectedDayDisplay();
});

/* ---------------------------
   クリア
--------------------------- */
clearBtn.addEventListener("click", () => {
  noteEl.value = "";
  charCount.textContent = "0 / 120";
});

/* ---------------------------
   月移動
--------------------------- */
document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

/* ---------------------------
   使い方モーダル
--------------------------- */
helpBtn.addEventListener("click", () => {
  helpBackdrop.classList.add("show");
});

helpClose.addEventListener("click", () => {
  helpBackdrop.classList.remove("show");
});

helpBackdrop.addEventListener("click", (e) => {
  if (e.target === helpBackdrop) helpBackdrop.classList.remove("show");
});

/* ---------------------------
   グラフ描画
--------------------------- */
function renderGraph() {
  const entries = loadEntries();
  const today = new Date();

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }

  graphEl.innerHTML = "";
  graphLabelsEl.innerHTML = "";

  days.forEach((d) => {
    const key = formatDateKey(d);
    const bar = document.createElement("div");
    bar.className = "graph-bar";

    const inner = document.createElement("div");
    inner.className = "graph-bar-inner";

    if (entries[key]) {
      const moodScore = { bad: 1, meh: 2, good: 3, great: 4 }[
        entries[key].mood
      ];
      inner.style.setProperty("--bar-height", `${(moodScore / 4) * 100}%`);
    } else {
      inner.style.setProperty("--bar-height", "0%");
    }

    bar.appendChild(inner);
    graphEl.appendChild(bar);

    const label = document.createElement("div");
    label.textContent = d.getDate();
    graphLabelsEl.appendChild(label);
  });
}

/* ---------------------------
   初期化
--------------------------- */
function init() {
  const today = new Date();
  todayLabel.textContent = `${today.getMonth() + 1}月${today.getDate()}日`;

  renderCalendar();
}

/* ---------------------------
   分析モーダル
--------------------------- */
function openAnalysisModal() {
  renderGraph();
  renderMoodDistribution();
  analysisBackdrop.classList.add("show");
}

function closeAnalysisModal() {
  analysisBackdrop.classList.remove("show");
}

analysisBtn.addEventListener("click", openAnalysisModal);
analysisClose.addEventListener("click", closeAnalysisModal);
analysisBackdrop.addEventListener("click", (e) => {
  if (e.target === analysisBackdrop) closeAnalysisModal();
});

/* ---------------------------
   ムード分布レンダリング
--------------------------- */
function renderMoodDistribution() {
  const entries = loadEntries();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const moodCounts = { bad: 0, meh: 0, good: 0, great: 0 };
  let total = 0;

  Object.keys(entries).forEach((key) => {
    const date = new Date(key);
    if (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    ) {
      moodCounts[entries[key].mood]++;
      total++;
    }
  });

  moodDistributionEl.innerHTML = "";

  const moods = [
    { key: "bad", label: "しんどい", emoji: "😣" },
    { key: "meh", label: "ふつう", emoji: "😐" },
    { key: "good", label: "わりと良い", emoji: "🙂" },
    { key: "great", label: "最高", emoji: "😄" },
  ];

  moods.forEach((mood) => {
    const count = moodCounts[mood.key];
    const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

    const barDiv = document.createElement("div");
    barDiv.className = "mood-dist-bar";

    const label = document.createElement("div");
    label.className = "mood-dist-label";
    label.textContent = `${mood.emoji} ${mood.label}`;

    const container = document.createElement("div");
    container.className = "mood-dist-container";

    const fill = document.createElement("div");
    fill.className = `mood-dist-fill ${mood.key}`;
    fill.style.width = `${percent}%`;
    if (percent > 0) {
      fill.textContent = `${count}`;
    }

    container.appendChild(fill);

    const percentEl = document.createElement("div");
    percentEl.className = "mood-dist-percent";
    percentEl.textContent = `${percent}%`;

    barDiv.appendChild(label);
    barDiv.appendChild(container);
    barDiv.appendChild(percentEl);

    moodDistributionEl.appendChild(barDiv);
  });
}

init();
