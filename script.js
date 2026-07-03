

/* ==========================================================================
   VOLLEYBALL TRAINING ATTENDANCE — SCRIPT
   Sections:
     1. Player database
     2. Storage helpers (Local Storage, per-day attendance)
     3. Date / time helpers
     4. Application state
     5. DOM references
     6. Rendering (cards, stats, report mode)
     7. Filtering / sorting
     8. Event handlers
     9. Init
   ========================================================================== */

/* ==========================================================================
   1. PLAYER DATABASE
   Embedded roster. Each player has a stable id so attendance records can
   reference them regardless of name changes, sort order, etc.
   Birthday is stored as "MM/DD/YYYY" or null when not on file.
   ========================================================================== */

const ROSTER = [
  // ---- Boys ----
  { id: "b01", name: "Adriano, Jeremy John Behmen D.", gender: "Boy", grade: 7, section: "Magsaysay", birthday: "03/06/2012" },
  { id: "b02", name: "Agustin, Carlo Hernandez", gender: "Boy", grade: 11, section: "Yakal", birthday: "11/16/2009" },
  { id: "b03", name: "Alamida, Rhaylee Klaine P.", gender: "Boy", grade: 7, section: "Magsaysay", birthday: "01/16/2012" },
  { id: "b04", name: "Balagso, Francis C.", gender: "Boy", grade: 10, section: "Pulag", birthday: "06/10/2011" },
  { id: "b05", name: "Baring, Arnel", gender: "Boy", grade: 9, section: "Mapagmahal", birthday: "08/15/2012" },
  { id: "b06", name: "Borlaza, Gabriel Lenard S.", gender: "Boy", grade: 9, section: "Mapagmahal", birthday: "03/01/2012" },
  { id: "b07", name: "Braganca, Bruce Rola", gender: "Boy", grade: 8, section: "Corinthians", birthday: "09/08/2013" },
  { id: "b08", name: "Bueza, Renz Andrei", gender: "Boy", grade: 10, section: "Mayon", birthday: "01/05/2011" },
  { id: "b09", name: "Cayabyab, Hiro O.", gender: "Boy", grade: 8, section: "Exodus", birthday: "04/04/2011" },
  { id: "b10", name: "Cruz, Cailey Emmanuel", gender: "Boy", grade: 11, section: "Acacia", birthday: "02/10/2010" },
  { id: "b11", name: "Cuarteros, Charles R.", gender: "Boy", grade: 10, section: "Pulag", birthday: "09/16/2009" },
  { id: "b12", name: "Garcia, Kier Zaijan T.", gender: "Boy", grade: 9, section: "Mapagmahal", birthday: "12/01/2011" },
  { id: "b13", name: "Jacinto, Alexander S.", gender: "Boy", grade: 8, section: "Corinthians", birthday: "04/03/2013" },
  { id: "b14", name: "Lazatin, John Cyrus", gender: "Boy", grade: 7, section: "Magsaysay", birthday: "05/11/2014" },
  { id: "b15", name: "Mendoza, Joshua", gender: "Boy", grade: 7, section: "Marcos", birthday: "04/04/2014" },
  { id: "b16", name: "Mendoza, Mark Gabriel", gender: "Boy", grade: 10, section: "Sierra Madre", birthday: "05/02/2011" },
  { id: "b17", name: "Merhan, Jhon Vincent", gender: "Boy", grade: 9, section: "Mapagmahal", birthday: "07/13/2011" },
  { id: "b18", name: "Plandez, Jhon Harold", gender: "Boy", grade: 12, section: "HUMSS 1, Mirasol", birthday: "11/20/2009" },
  { id: "b19", name: "Popanes, Jhay M.", gender: "Boy", grade: 8, section: "Magalang", birthday: "06/08/2011" },
  { id: "b20", name: "Ramos, Gabriel", gender: "Boy", grade: 10, section: "Kanlaon", birthday: "01/14/2011" },
  { id: "b21", name: "Redoma, Robert M.", gender: "Boy", grade: 8, section: "Ephesians", birthday: "09/22/2011" },
  { id: "b22", name: "Rodriguez, Jhon Ruan", gender: "Boy", grade: 11, section: "Yakal", birthday: "03/07/2010" },
  { id: "b23", name: "Sancha, Rhalf Rain P.", gender: "Boy", grade: 8, section: "Chronicles", birthday: "12/09/2011" },
  { id: "b24", name: "Satingin, John Kaizer", gender: "Boy", grade: 11, section: "Yakal", birthday: "01/11/2010" },
  { id: "b25", name: "Umali, Yale Rayven G.", gender: "Boy", grade: 11, section: "Yakal", birthday: "03/29/2009" },
  { id: "b26", name: "Villanueva, Gian Carlo L.", gender: "Boy", grade: 11, section: "Yakal", birthday: "02/27/2010" },

  // ---- Girls ----
  { id: "g01", name: "Alvarez, Jeryssa Coleen L.", gender: "Girl", grade: 10, section: "Banahaw", birthday: "01/13/2011" },
  { id: "g02", name: "Ballesteros, Yvinneah Zeah C.", gender: "Girl", grade: 9, section: "Mabait", birthday: "04/10/2012" },
  { id: "g03", name: "Bautista, Glaiza Mae", gender: "Girl", grade: 10, section: "Banahaw", birthday: "12/30/2010" },
  { id: "g04", name: "Bibat, Chriza Jane", gender: "Girl", grade: 9, section: "Matatag", birthday: "06/15/2011" },
  { id: "g05", name: "Bueza, Rhianwhen B.", gender: "Girl", grade: 7, section: "Aquino", birthday: "10/04/2013" },
  { id: "g06", name: "Dano, Amver Jazztine B.", gender: "Girl", grade: 9, section: "Matapat", birthday: "01/31/2012" },
  { id: "g07", name: "Desepeda, Kate", gender: "Girl", grade: 10, section: "Halcon", birthday: null },
  { id: "g08", name: "Ilyas, Jamaity Travinne N.", gender: "Girl", grade: 7, section: "Magsaysay", birthday: null },
  { id: "g09", name: "Jacinto, Alyza Z.", gender: "Girl", grade: 9, section: "Matipid", birthday: "03/27/2012" },
  { id: "g10", name: "Jagonoy, Huxlie", gender: "Girl", grade: 9, section: "Magalang", birthday: "01/11/2012" },
  { id: "g11", name: "Latayan, Ashley Anne B.", gender: "Girl", grade: 7, section: "Macapagal", birthday: "05/12/2014" },
  { id: "g12", name: "Madrideo, Ayesha Mae R.", gender: "Girl", grade: 10, section: "Sierra Madre", birthday: "06/11/2011" },
  { id: "g13", name: "Manzano, Jolynnes R.", gender: "Girl", grade: 7, section: "Aguinaldo", birthday: "10/25/2013" },
  { id: "g14", name: "Marasigan, Jermae Q.", gender: "Girl", grade: 11, section: "Acacia", birthday: "06/28/2010" },
  { id: "g15", name: "Mata, April Dhane A.", gender: "Girl", grade: 8, section: "Chronicles", birthday: "04/20/2013" },
  { id: "g16", name: "Merabona, Janina Misha M.", gender: "Girl", grade: 9, section: "Magalang", birthday: "08/16/2011" },
  { id: "g17", name: "Merabona, Jhamaica M.", gender: "Girl", grade: 8, section: "Corinthians", birthday: "01/25/2013" },
  { id: "g18", name: "Moron, Maria Michaela L.", gender: "Girl", grade: 8, section: "Corinthians", birthday: "09/18/2011" },
  { id: "g19", name: "Noche, Rhia Candylaria M.", gender: "Girl", grade: 10, section: "Mayon", birthday: "03/05/2011" },
  { id: "g20", name: "Ramos, Rhian", gender: "Girl", grade: 10, section: "Makiling", birthday: "12/29/2009" },
  { id: "g21", name: "Rebecca, Rhianne", gender: "Girl", grade: 9, section: "Mabait", birthday: "07/10/2011" },
  { id: "g22", name: "Regodon, Cezanne", gender: "Girl", grade: 9, section: "Mapagmahal", birthday: "11/26/2011" },
  { id: "g23", name: "Salanatin, Daniela Corazon", gender: "Girl", grade: 11, section: "Yakal", birthday: null },
  { id: "g24", name: "Santos, Kim Andrea O.", gender: "Girl", grade: 9, section: "Mapagmahal", birthday: "08/17/2012" },
  { id: "g25", name: "Satingin, Janyra", gender: "Girl", grade: 7, section: "Garcia", birthday: "01/21/2012" },
  { id: "g26", name: "Tapas, Samantha Faye B.", gender: "Girl", grade: 8, section: "Ephesians", birthday: "08/12/2012" },
];

/* ==========================================================================
   2. STORAGE HELPERS
   All attendance is kept in one Local Storage key, namespaced by date:
   { "2026-07-03": { "b01": { present: true, timestamp: "8:43:17 AM" }, ... } }
   ========================================================================== */

const STORAGE_KEY = "vta_attendance_records";

// Read the full attendance store (all dates) from Local Storage.
function getAllRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Could not read attendance data:", err);
    return {};
  }
}

// Persist the full attendance store back to Local Storage.
function saveAllRecords(allRecords) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allRecords));
  } catch (err) {
    console.error("Could not save attendance data:", err);
  }
}

// Get the attendance record object for one specific date (creates none if absent).
function getRecordForDate(dateKey) {
  const all = getAllRecords();
  return all[dateKey] || {};
}

// Mark or unmark a single player present for a given date, then save.
function setPlayerAttendance(dateKey, playerId, isPresent, timestamp) {
  const all = getAllRecords();
  if (!all[dateKey]) all[dateKey] = {};

  if (isPresent) {
    all[dateKey][playerId] = { present: true, timestamp: timestamp };
  } else {
    all[dateKey][playerId] = { present: false, timestamp: null };
  }

  saveAllRecords(all);
}

/* ==========================================================================
   3. DATE / TIME HELPERS
   ========================================================================== */

// "2026-07-03" style key used to namespace attendance by day.
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// "Friday, July 3, 2026" for the header.
function formatDateLong(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// "10:32:15 AM" style live clock / timestamp text.
function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function todayKey() {
  return toDateKey(new Date());
}

/* ==========================================================================
   4. APPLICATION STATE
   ========================================================================== */

const state = {
  viewingDateKey: todayKey(),   // which day's attendance is on screen
  searchTerm: "",
  genderFilter: "all",
  gradeFilter: "all",
  sectionFilter: "all",
  sortBy: "name-asc",
  reportMode: false,
};

/* ==========================================================================
   5. DOM REFERENCES
   ========================================================================== */

const dom = {
  currentDate: document.getElementById("currentDate"),
  currentTime: document.getElementById("currentTime"),
  statTotal: document.getElementById("statTotal"),
  statPresent: document.getElementById("statPresent"),
  statAbsent: document.getElementById("statAbsent"),

  historyBanner: document.getElementById("historyBanner"),
  historyBannerText: document.getElementById("historyBannerText"),
  backToTodayBtn: document.getElementById("backToTodayBtn"),

  controlsSection: document.getElementById("controlsSection"),
  searchInput: document.getElementById("searchInput"),
  dateSelect: document.getElementById("dateSelect"),
  reportModeBtn: document.getElementById("reportModeBtn"),
  genderFilter: document.getElementById("genderFilter"),
  gradeFilter: document.getElementById("gradeFilter"),
  sectionFilter: document.getElementById("sectionFilter"),
  sortSelect: document.getElementById("sortSelect"),

  mainView: document.getElementById("mainView"),
  studentGrid: document.getElementById("studentGrid"),
  emptyState: document.getElementById("emptyState"),

  reportView: document.getElementById("reportView"),
  reportDate: document.getElementById("reportDate"),
  reportTime: document.getElementById("reportTime"),
  reportTotalAll: document.getElementById("reportTotalAll"),
  reportTotalPresent: document.getElementById("reportTotalPresent"),
  reportTotalAbsent: document.getElementById("reportTotalAbsent"),
  reportGirlsList: document.getElementById("reportGirlsList"),
  reportBoysList: document.getElementById("reportBoysList"),
  reportGirlsCount: document.getElementById("reportGirlsCount"),
  reportBoysCount: document.getElementById("reportBoysCount"),
  exitReportBtn: document.getElementById("exitReportBtn"),
};

/* ==========================================================================
   6. RENDERING
   ========================================================================== */

// Update the live date/time display in the header. Also detects midnight
// rollover so a new attendance sheet starts automatically while the app
// stays open, without disturbing someone viewing a past date on purpose.
function updateClock() {
  const now = new Date();
  dom.currentDate.textContent = formatDateLong(now);
  dom.currentTime.textContent = formatTime(now);

  const liveTodayKey = toDateKey(now);
  const wasViewingToday = state.viewingDateKey === state.lastKnownToday;

  if (state.lastKnownToday && liveTodayKey !== state.lastKnownToday && wasViewingToday) {
    // Midnight passed while the user was viewing "today" — follow it forward.
    state.viewingDateKey = liveTodayKey;
    dom.dateSelect.value = liveTodayKey;
    dom.dateSelect.max = liveTodayKey;
    refreshAll();
  }

  state.lastKnownToday = liveTodayKey;
  dom.dateSelect.max = liveTodayKey;
}

// Whether the date currently being viewed is today (and therefore editable).
function isViewingToday() {
  return state.viewingDateKey === todayKey();
}

// Recompute totals for the date being viewed and paint the scoreboard.
function updateStats() {
  const record = getRecordForDate(state.viewingDateKey);
  const presentCount = ROSTER.filter((p) => record[p.id] && record[p.id].present).length;

  dom.statTotal.textContent = ROSTER.length;
  dom.statPresent.textContent = presentCount;
  dom.statAbsent.textContent = ROSTER.length - presentCount;
}

// Show/hide the "viewing a past, read-only date" banner.
function updateHistoryBanner() {
  if (isViewingToday()) {
    dom.historyBanner.classList.add("hidden");
    return;
  }
  const niceDate = formatDateLong(new Date(state.viewingDateKey + "T00:00:00"));
  dom.historyBannerText.textContent = `Viewing ${niceDate} — this attendance sheet is read-only.`;
  dom.historyBanner.classList.remove("hidden");
}

// Build one player card element.
function buildStudentCard(player, record) {
  const entry = record[player.id];
  const isPresent = !!(entry && entry.present);
  const editable = isViewingToday();

  const card = document.createElement("div");
  card.className = "student-card" + (player.gender === "Girl" ? " gender-girl" : "") + (isPresent ? " is-present" : "");

  const genderTagClass = player.gender === "Girl" ? "tag tag-girl" : "tag";
  const birthdayText = player.birthday ? player.birthday : "Not on file";

  card.innerHTML = `
    <div class="card-top">
      <span class="card-name">${escapeHtml(player.name)}</span>
      <span class="status-dot" aria-hidden="true"></span>
    </div>
    <div class="card-meta">
      <span class="${genderTagClass}">${player.gender}</span>
      <span class="tag">Grade ${player.grade}</span>
      <span>Section: ${escapeHtml(player.section)}</span>
      <span>🎂 ${birthdayText}</span>
    </div>
    <div class="card-status-row">
      <div class="status-info">
        <span class="status-text ${isPresent ? "present" : ""}">${isPresent ? "Present" : "Not Yet Marked"}</span>
        <span class="status-timestamp">${isPresent ? "Marked at: " + entry.timestamp : "&nbsp;"}</span>
      </div>
      ${editable
        ? `<button class="btn-present ${isPresent ? "marked" : ""}" data-player-id="${player.id}">${isPresent ? "✓ Present" : "Mark Present"}</button>`
        : `<span class="readonly-note">Locked</span>`
      }
    </div>
  `;

  return card;
}

// Basic HTML escaping for names/sections rendered via innerHTML.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Apply search + filters + sort to the roster and render the grid.
function renderGrid() {
  const record = getRecordForDate(state.viewingDateKey);
  const players = getFilteredSortedRoster();

  dom.studentGrid.innerHTML = "";

  if (players.length === 0) {
    dom.emptyState.classList.remove("hidden");
  } else {
    dom.emptyState.classList.add("hidden");
    const fragment = document.createDocumentFragment();
    players.forEach((player) => {
      fragment.appendChild(buildStudentCard(player, record));
    });
    dom.studentGrid.appendChild(fragment);
  }
}

// Populate the Grade and Section filter dropdowns from the roster (once).
function populateFilterOptions() {
  const grades = [...new Set(ROSTER.map((p) => p.grade))].sort((a, b) => a - b);
  grades.forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.textContent = `Grade ${g}`;
    dom.gradeFilter.appendChild(opt);
  });

  const sections = [...new Set(ROSTER.map((p) => p.section))].sort((a, b) => a.localeCompare(b));
  sections.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    dom.sectionFilter.appendChild(opt);
  });
}

/* ---- Report Mode rendering ---- */

function renderReport() {
  const now = new Date();
  const viewingDate = new Date(state.viewingDateKey + "T00:00:00");
  const record = getRecordForDate(state.viewingDateKey);

  dom.reportDate.textContent = formatDateLong(viewingDate);
  dom.reportTime.textContent = isViewingToday() ? formatTime(now) : "Historical record";

  const girls = ROSTER.filter((p) => p.gender === "Girl");
  const boys = ROSTER.filter((p) => p.gender === "Boy");

  const presentTotal = ROSTER.filter((p) => record[p.id] && record[p.id].present).length;

  dom.reportTotalAll.textContent = ROSTER.length;
  dom.reportTotalPresent.textContent = presentTotal;
  dom.reportTotalAbsent.textContent = ROSTER.length - presentTotal;

  dom.reportGirlsCount.textContent = `${girls.filter((p) => record[p.id] && record[p.id].present).length}/${girls.length} present`;
  dom.reportBoysCount.textContent = `${boys.filter((p) => record[p.id] && record[p.id].present).length}/${boys.length} present`;

  dom.reportGirlsList.innerHTML = buildReportRows(girls, record);
  dom.reportBoysList.innerHTML = buildReportRows(boys, record);
}

function buildReportRows(players, record) {
  const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name));
  return sorted
    .map((p) => {
      const entry = record[p.id];
      const isPresent = !!(entry && entry.present);
      return `
        <div class="report-row ${isPresent ? "present" : ""}">
          <span class="report-row-name">${escapeHtml(p.name)}</span>
          ${isPresent
            ? `<span class="report-row-time">${entry.timestamp}</span>`
            : `<span class="report-row-status">ABSENT</span>`
          }
        </div>
      `;
    })
    .join("");
}

/* ==========================================================================
   7. FILTERING / SORTING
   ========================================================================== */

function getFilteredSortedRoster() {
  let players = ROSTER.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(state.searchTerm.toLowerCase());
    const matchesGender = state.genderFilter === "all" || p.gender === state.genderFilter;
    const matchesGrade = state.gradeFilter === "all" || String(p.grade) === state.gradeFilter;
    const matchesSection = state.sectionFilter === "all" || p.section === state.sectionFilter;
    return matchesSearch && matchesGender && matchesGrade && matchesSection;
  });

  switch (state.sortBy) {
    case "name-asc":
      players.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      players.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "grade":
      players.sort((a, b) => a.grade - b.grade || a.name.localeCompare(b.name));
      break;
    case "section":
      players.sort((a, b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name));
      break;
  }

  return players;
}

/* ==========================================================================
   8. EVENT HANDLERS
   ========================================================================== */

// Toggle a single player's Present status for the date currently in view.
// Only allowed when viewing today (past days are locked in buildStudentCard,
// which simply omits the button, but we guard here too for safety).
function handlePresentToggle(playerId) {
  if (!isViewingToday()) return;

  const record = getRecordForDate(state.viewingDateKey);
  const entry = record[playerId];
  const currentlyPresent = !!(entry && entry.present);

  const now = new Date();
  setPlayerAttendance(state.viewingDateKey, playerId, !currentlyPresent, formatTime(now));

  refreshAll();
}

// Grid click delegation — catches clicks on any "Mark Present" button.
function onGridClick(e) {
  const btn = e.target.closest(".btn-present");
  if (!btn) return;
  handlePresentToggle(btn.dataset.playerId);
}

function onSearchInput(e) {
  state.searchTerm = e.target.value;
  renderGrid();
}

function onGenderFilterChange(e) {
  state.genderFilter = e.target.value;
  renderGrid();
}

function onGradeFilterChange(e) {
  state.gradeFilter = e.target.value;
  renderGrid();
}

function onSectionFilterChange(e) {
  state.sectionFilter = e.target.value;
  renderGrid();
}

function onSortChange(e) {
  state.sortBy = e.target.value;
  renderGrid();
}

// Switch which day's attendance sheet is being viewed.
function onDateSelectChange(e) {
  state.viewingDateKey = e.target.value;
  refreshAll();
}

function onBackToToday() {
  state.viewingDateKey = todayKey();
  dom.dateSelect.value = state.viewingDateKey;
  refreshAll();
}

function enterReportMode() {
  state.reportMode = true;
  dom.controlsSection.classList.add("hidden");
  dom.mainView.classList.add("hidden");
  dom.historyBanner.classList.add("hidden");
  dom.reportView.classList.remove("hidden");
  renderReport();
}

function exitReportMode() {
  state.reportMode = false;
  dom.controlsSection.classList.remove("hidden");
  dom.mainView.classList.remove("hidden");
  dom.reportView.classList.add("hidden");
  updateHistoryBanner();
}

/* ==========================================================================
   9. INIT
   ========================================================================== */

// Re-run everything that depends on the currently viewed date / data.
function refreshAll() {
  updateStats();
  updateHistoryBanner();
  if (state.reportMode) {
    renderReport();
  } else {
    renderGrid();
  }
}

function bindEvents() {
  dom.studentGrid.addEventListener("click", onGridClick);
  dom.searchInput.addEventListener("input", onSearchInput);
  dom.genderFilter.addEventListener("change", onGenderFilterChange);
  dom.gradeFilter.addEventListener("change", onGradeFilterChange);
  dom.sectionFilter.addEventListener("change", onSectionFilterChange);
  dom.sortSelect.addEventListener("change", onSortChange);
  dom.dateSelect.addEventListener("change", onDateSelectChange);
  dom.backToTodayBtn.addEventListener("click", onBackToToday);
  dom.reportModeBtn.addEventListener("click", enterReportMode);
  dom.exitReportBtn.addEventListener("click", exitReportMode);
}

function init() {
  state.lastKnownToday = todayKey();

  populateFilterOptions();

  dom.dateSelect.max = state.lastKnownToday;
  dom.dateSelect.value = state.viewingDateKey;

  bindEvents();
  updateClock();
  refreshAll();

  // Live clock, ticking every second; also drives midnight rollover checks.
  setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", init);
