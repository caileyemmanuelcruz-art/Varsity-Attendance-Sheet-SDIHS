/* ==========================================================================
   TRAINING ATTENDANCE — SCRIPT
   Sections:
     1. Player database (Volleyball roster)
     2. Coach password / lock settings
     3. Storage helpers (Supabase-backed, per-day attendance, realtime sync)
     4. Date / time helpers
     5. Application state
     6. DOM references
     7. Navigation between sport pages
     8. Rendering (cards, stats, report mode)
     9. Filtering / sorting (incl. grade -> section cascade)
    10. Season-long per-player counters
    11. Coach lock / unlock
    12. Player Information tab
    13. Event handlers
    14. Init
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
  { id: "b19", name: "Popanes, Jhay M.", gender: "Boy", grade: 9, section: "Magalang", birthday: "06/08/2011" },
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
   2. COACH PASSWORD / LOCK SETTINGS
   By default, the site loads LOCKED: nobody can mark attendance or edit
   history. Entering this password unlocks editing for the rest of the
   browser session (it re-locks automatically on page refresh).
   To change the password, just edit the string below.
   ========================================================================== */

const COACH_PASSWORD = "spike7";

/* ==========================================================================
   2b. HIDDEN TIMESTAMP EDITOR — separate password, separate access path.
   This is intentionally not wired to any visible button or menu. It's
   reached only by a specific repeated-click gesture (see section 15,
   "SECRET TIMESTAMP EDITOR"), and gated by its own password, independent
   of COACH_PASSWORD above and independent of the lock/unlock state.
   ========================================================================== */

const TIME_EDIT_PASSWORD = "spike67";

/* ==========================================================================
   3. STORAGE HELPERS (Supabase-backed)
   All attendance now lives in the "attendance" table in Supabase, one row
   per player per date:
     { id, created_at, player_id, date, present, timestamp }
   An in-memory cache mirrors the old Local Storage shape so every other
   part of the app (stats, report, season counters) can keep reading it
   synchronously:
   { "2026-07-03": { "b01": { present: true, timestamp: "8:43:17 AM" }, ... } }
   The cache is populated once at startup from Supabase, kept in sync live
   via a Realtime subscription, and updated optimistically on every write.

   NOTE: for upsert-by-(player_id, date) to work without creating duplicate
   rows, the "attendance" table needs a unique constraint on (player_id,
   date). Run this once in the Supabase SQL editor if you haven't already:

     alter table attendance
       add constraint attendance_player_date_unique unique (player_id, date);

   ========================================================================== */

let recordsCache = {};
let recordsLoaded = false;

// Read the full attendance store (all dates) from the in-memory cache.
function getAllRecords() {
  return recordsCache;
}

// Get the attendance record object for one specific date (creates none if absent).
function getRecordForDate(dateKey) {
  return recordsCache[dateKey] || {};
}

// Pull every attendance row from Supabase and rebuild the in-memory cache.
// Called once at startup, and can be re-called to force a full resync.
async function loadAllRecordsFromSupabase() {
  const { data, error } = await supabaseClient
    .from("attendance")
    .select("player_id, date, present, timestamp");

  if (error) {
    console.error("Could not load attendance data from Supabase:", error);
    window.alert("Could not load attendance data. Check your connection and refresh the page.");
    return;
  }

  const rebuilt = {};
  (data || []).forEach((row) => {
    if (!rebuilt[row.date]) rebuilt[row.date] = {};
    rebuilt[row.date][row.player_id] = {
      present: !!row.present,
      timestamp: row.timestamp || null,
    };
  });

  recordsCache = rebuilt;
  recordsLoaded = true;
}

// Mark or unmark a single player present for a given date. Updates the
// local cache immediately (optimistic UI), then writes through to
// Supabase. Other devices pick up the change via the Realtime subscription
// below; this device also gets a Realtime echo, which is harmless since
// the write is idempotent.
async function setPlayerAttendance(dateKey, playerId, isPresent, timestamp) {
  if (!recordsCache[dateKey]) recordsCache[dateKey] = {};
  const previousEntry = recordsCache[dateKey][playerId];

  recordsCache[dateKey][playerId] = isPresent
    ? { present: true, timestamp: timestamp }
    : { present: false, timestamp: null };

  const { error } = await supabaseClient.from("attendance").upsert(
    {
      player_id: playerId,
      date: dateKey,
      present: isPresent,
      timestamp: isPresent ? timestamp : null,
    },
    { onConflict: "player_id,date" }
  );

  if (error) {
    console.error("Could not save attendance to Supabase:", error);

    // Roll back the optimistic update so the UI reflects reality.
    if (previousEntry) {
      recordsCache[dateKey][playerId] = previousEntry;
    } else {
      delete recordsCache[dateKey][playerId];
    }
    refreshAll();
    window.alert("Could not save attendance — check your connection and try again.");
  }
}

// Apply one Realtime change (from any device, including this one) to the
// local cache and repaint whatever's on screen.
function applyRealtimeChange(payload) {
  const row = payload.eventType === "DELETE" ? payload.old : payload.new;
  if (!row || !row.date || !row.player_id) return;

  if (payload.eventType === "DELETE") {
    if (recordsCache[row.date]) delete recordsCache[row.date][row.player_id];
  } else {
    if (!recordsCache[row.date]) recordsCache[row.date] = {};
    recordsCache[row.date][row.player_id] = {
      present: !!row.present,
      timestamp: row.timestamp || null,
    };
  }

  refreshAll();
}

// Subscribe to live changes on the attendance table so every open device
// (coach's tablet, phone at the gym, etc.) stays in sync instantly.
function subscribeToRealtimeUpdates() {
  supabaseClient
    .channel("attendance-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "attendance" },
      applyRealtimeChange
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.error("Realtime subscription issue:", status);
      }
    });
}

/* ==========================================================================
   4. DATE / TIME HELPERS
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
   5. APPLICATION STATE
   ========================================================================== */

const state = {
  activePage: "volleyball",     // volleyball | basketball | athletics | dance | playerinfo
  viewingDateKey: todayKey(),   // which day's attendance is on screen
  searchTerm: "",
  genderFilter: "all",
  gradeFilter: "all",
  sectionFilter: "all",
  sortBy: "name-asc",
  reportMode: false,
  reportPage: "girls",          // which report page is on screen: "girls" | "boys"
  unlocked: false,              // coach edit privileges for this session
  piSport: "",                  // Player Information: selected sport
  piSearchTerm: "",
  piGenderFilter: "all",
  piGradeFilter: "all",
  piSectionFilter: "all",
};

/* ==========================================================================
   6. DOM REFERENCES
   ========================================================================== */

const dom = {
  navButtons: document.querySelectorAll(".nav-btn"),
  pages: {
    volleyball: document.getElementById("page-volleyball"),
    basketball: document.getElementById("page-basketball"),
    athletics: document.getElementById("page-athletics"),
    dance: document.getElementById("page-dance"),
    playerinfo: document.getElementById("page-playerinfo"),
  },

  currentDate: document.getElementById("currentDate"),
  currentTime: document.getElementById("currentTime"),
  statTotal: document.getElementById("statTotal"),
  statPresent: document.getElementById("statPresent"),
  statAbsent: document.getElementById("statAbsent"),
  filterSummary: document.getElementById("filterSummary"),

  historyBanner: document.getElementById("historyBanner"),
  historyBannerText: document.getElementById("historyBannerText"),
  backToTodayBtn: document.getElementById("backToTodayBtn"),

  controlsSection: document.getElementById("controlsSection"),
  searchInput: document.getElementById("searchInput"),
  dateSelect: document.getElementById("dateSelect"),
  lockToggleBtn: document.getElementById("lockToggleBtn"),
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
  reportPageTabs: document.getElementById("reportPageTabs"),
  reportPageOne: document.getElementById("reportPageOne"),
  reportPageTwo: document.getElementById("reportPageTwo"),
  reportGirlsListP1: document.getElementById("reportGirlsListP1"),
  reportBoysListP1: document.getElementById("reportBoysListP1"),
  reportGirlsCountP1: document.getElementById("reportGirlsCountP1"),
  reportBoysCountP1: document.getElementById("reportBoysCountP1"),
  reportGirlsListP2: document.getElementById("reportGirlsListP2"),
  reportBoysListP2: document.getElementById("reportBoysListP2"),
  reportGirlsCountP2: document.getElementById("reportGirlsCountP2"),
  reportBoysCountP2: document.getElementById("reportBoysCountP2"),
  exitReportBtn: document.getElementById("exitReportBtn"),
  downloadReportBtn: document.getElementById("downloadReportBtn"),

  piSportSelect: document.getElementById("piSportSelect"),
  piSearchWrap: document.getElementById("piSearchWrap"),
  piSearchInput: document.getElementById("piSearchInput"),
  piFiltersRow: document.getElementById("piFiltersRow"),
  piGenderFilter: document.getElementById("piGenderFilter"),
  piGradeFilter: document.getElementById("piGradeFilter"),
  piSectionFilter: document.getElementById("piSectionFilter"),
  piPlaceholder: document.getElementById("piPlaceholder"),
  piEmptySport: document.getElementById("piEmptySport"),
  piListWrap: document.getElementById("piListWrap"),
  piList: document.getElementById("piList"),
  piEmptyFiltered: document.getElementById("piEmptyFiltered"),
};

/* ==========================================================================
   7. NAVIGATION BETWEEN SPORT PAGES
   ========================================================================== */

function switchPage(pageName) {
  state.activePage = pageName;

  Object.keys(dom.pages).forEach((key) => {
    dom.pages[key].classList.toggle("hidden", key !== pageName);
  });

  dom.navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === pageName);
  });

  // Leaving Volleyball while Report Mode was open should reset it, so
  // coming back later starts on the normal grid view.
  if (pageName !== "volleyball" && state.reportMode) {
    exitReportMode();
  }

  if (pageName === "playerinfo") {
    renderPlayerInfo();
  }
}

function onNavClick(e) {
  const btn = e.target.closest(".nav-btn");
  if (!btn) return;
  switchPage(btn.dataset.page);
}

/* ==========================================================================
   8. RENDERING
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

// Whether the date currently being viewed is today.
function isViewingToday() {
  return state.viewingDateKey === todayKey();
}

// Whether attendance can currently be edited. The lock applies to every
// date, including today — nothing is editable until the coach unlocks it.
function canEdit() {
  return state.unlocked;
}

// Recompute totals for the CURRENTLY FILTERED set of players and paint
// the scoreboard, so the numbers always match what's on screen.
function updateStats() {
  const record = getRecordForDate(state.viewingDateKey);
  const filtered = getFilteredSortedRoster();
  const presentCount = filtered.filter((p) => record[p.id] && record[p.id].present).length;

  dom.statTotal.textContent = filtered.length;
  dom.statPresent.textContent = presentCount;
  dom.statAbsent.textContent = filtered.length - presentCount;

  dom.filterSummary.textContent = buildFilterSummaryText(filtered.length);
}

// Human-readable summary of which filters are currently narrowing the list.
function buildFilterSummaryText(count) {
  const parts = [];
  if (state.genderFilter !== "all") parts.push(state.genderFilter === "Boy" ? "Boys" : "Girls");
  if (state.gradeFilter !== "all") parts.push(`Grade ${state.gradeFilter}`);
  if (state.sectionFilter !== "all") parts.push(state.sectionFilter);
  if (state.searchTerm.trim()) parts.push(`matching "${state.searchTerm.trim()}"`);

  if (parts.length === 0) {
    return `Showing all ${ROSTER.length} players`;
  }
  return `Showing ${count} player${count === 1 ? "" : "s"} — ${parts.join(" · ")}`;
}

// Show/hide the banner explaining why the sheet can't be edited right now.
function updateHistoryBanner() {
  if (isViewingToday()) {
    if (state.unlocked) {
      dom.historyBanner.classList.add("hidden");
    } else {
      dom.historyBannerText.textContent =
        "This attendance sheet is locked. Unlock with the coach password to mark players present.";
      dom.backToTodayBtn.classList.add("hidden");
      dom.historyBanner.classList.remove("hidden");
    }
    return;
  }
  const niceDate = formatDateLong(new Date(state.viewingDateKey + "T00:00:00"));
  dom.historyBannerText.textContent = state.unlocked
    ? `Viewing ${niceDate} — unlocked for editing (coach mode).`
    : `Viewing ${niceDate} — this attendance sheet is read-only. Unlock to edit.`;
  dom.backToTodayBtn.classList.remove("hidden");
  dom.historyBanner.classList.remove("hidden");
}

// Build one player card element.
function buildStudentCard(player, record, seasonStats) {
  const entry = record[player.id];
  const isPresent = !!(entry && entry.present);
  const editable = canEdit();

  const card = document.createElement("div");
  card.className = "student-card" + (player.gender === "Girl" ? " gender-girl" : "") + (isPresent ? " is-present" : "");

  const genderTagClass = player.gender === "Girl" ? "tag tag-girl" : "tag";
  const birthdayText = player.birthday ? player.birthday : "Not on file";
  const stats = seasonStats[player.id];

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
    <div class="season-counter">
      <span class="sc-present">${stats.present} Present</span>
      <span class="sc-absent">${stats.absent} Absent</span>
      <span>· ${stats.trainings} training${stats.trainings === 1 ? "" : "s"} so far</span>
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
  const seasonStats = computeAllSeasonStats();
  const players = getFilteredSortedRoster();

  dom.studentGrid.innerHTML = "";

  if (players.length === 0) {
    dom.emptyState.classList.remove("hidden");
  } else {
    dom.emptyState.classList.add("hidden");
    const fragment = document.createDocumentFragment();
    players.forEach((player) => {
      fragment.appendChild(buildStudentCard(player, record, seasonStats));
    });
    dom.studentGrid.appendChild(fragment);
  }
}

/* ---- Report Mode rendering ---- */

function renderReport() {
  const now = new Date();
  const viewingDate = new Date(state.viewingDateKey + "T00:00:00");
  const record = getRecordForDate(state.viewingDateKey);

  dom.reportDate.textContent = formatDateLong(viewingDate);
  dom.reportTime.textContent = isViewingToday() ? formatTime(now) : "Historical record";

  const girls = ROSTER.filter((p) => p.gender === "Girl").sort((a, b) => a.name.localeCompare(b.name));
  const boys = ROSTER.filter((p) => p.gender === "Boy").sort((a, b) => a.name.localeCompare(b.name));

  const presentTotal = ROSTER.filter((p) => record[p.id] && record[p.id].present).length;
  dom.reportTotalAll.textContent = ROSTER.length;
  dom.reportTotalPresent.textContent = presentTotal;
  dom.reportTotalAbsent.textContent = ROSTER.length - presentTotal;

  // Split each gender list into two halves (13 + 13 for a 26-player roster,
  // but this works for any count) so each page shows half the girls and
  // half the boys, side by side — instead of one page per gender.
  const girlsHalf = Math.ceil(girls.length / 2);
  const boysHalf = Math.ceil(boys.length / 2);

  const girlsP1 = girls.slice(0, girlsHalf);
  const girlsP2 = girls.slice(girlsHalf);
  const boysP1 = boys.slice(0, boysHalf);
  const boysP2 = boys.slice(boysHalf);

  renderReportHalf(girlsP1, record, dom.reportGirlsListP1, dom.reportGirlsCountP1, 0);
  renderReportHalf(boysP1, record, dom.reportBoysListP1, dom.reportBoysCountP1, 0);
  renderReportHalf(girlsP2, record, dom.reportGirlsListP2, dom.reportGirlsCountP2, girlsHalf);
  renderReportHalf(boysP2, record, dom.reportBoysListP2, dom.reportBoysCountP2, boysHalf);
}

// Renders one gender's half-list into one page, with row numbers continuing
// on from the first half (e.g. Page 2 starts at 14, not back at 1).
function renderReportHalf(players, record, listEl, countEl, startIndex) {
  const presentCount = players.filter((p) => record[p.id] && record[p.id].present).length;
  countEl.textContent = `${presentCount}/${players.length} present`;
  listEl.innerHTML = buildReportRows(players, record, startIndex);
}

// Report Mode shows names as "Surname, First Name" only — dropping middle
// names/initials so rows stay short and the two columns never overflow.
// Full names (with middle names) still appear everywhere else in the app.
function shortenNameForReport(fullName) {
  const parts = fullName.split(",");
  if (parts.length < 2) return fullName; // no comma — leave as-is, just in case

  const surname = parts[0].trim();
  const firstName = parts[1].trim().split(" ")[0]; // first word after the comma
  return `${surname}, ${firstName}`;
}

// "8:04:52 AM" -> { time: "8:04", meridiem: "AM" }. Report Mode drops the
// seconds and stacks AM/PM under the time so the timestamp column stays
// narrow, leaving more room for the name column on small screens.
function splitTimestampForReport(timestamp) {
  if (!timestamp) return { time: "", meridiem: "" };
  const [timePart, meridiem] = timestamp.split(" ");
  const [hour, minute] = timePart.split(":");
  return { time: `${hour}:${minute}`, meridiem: meridiem || "" };
}

// startIndex lets the second half of a list continue numbering from where
// the first half left off (e.g. 1–13 on Page 1, 14–26 on Page 2), since
// "players" here is already just that page's slice of the full list.
function buildReportRows(players, record, startIndex = 0) {
  return players
    .map((p, index) => {
      const entry = record[p.id];
      const isPresent = !!(entry && entry.present);
      const { time, meridiem } = isPresent ? splitTimestampForReport(entry.timestamp) : { time: "", meridiem: "" };

      return `
        <div class="report-row ${isPresent ? "present" : ""}">
          <div class="report-row-top">
            <span class="report-row-index">${startIndex + index + 1}.</span>
            <span class="report-row-name">${escapeHtml(shortenNameForReport(p.name))}</span>
          </div>
          <div class="report-row-bottom">
            ${isPresent
              ? `<span class="report-row-time">${time} <span class="report-time-meridiem">${meridiem}</span></span>`
              : `<span class="report-row-status">ABSENT</span>`
            }
          </div>
        </div>
      `;
    })
    .join("");
}

/* ==========================================================================
   9. FILTERING / SORTING (with grade -> section cascade)
   ========================================================================== */

// Map of grade -> sorted list of sections that actually exist in that grade,
// built straight from the roster so it always matches the real data.
function buildGradeSectionMap() {
  const map = {};
  ROSTER.forEach((p) => {
    if (!map[p.grade]) map[p.grade] = new Set();
    map[p.grade].add(p.section);
  });
  const sorted = {};
  Object.keys(map).sort((a, b) => a - b).forEach((grade) => {
    sorted[grade] = [...map[grade]].sort((a, b) => a.localeCompare(b));
  });
  return sorted;
}

const GRADE_SECTION_MAP = buildGradeSectionMap();

// Populate the Grade dropdown once, then keep Section in sync with it.
function populateFilterOptions() {
  Object.keys(GRADE_SECTION_MAP).forEach((grade) => {
    const opt = document.createElement("option");
    opt.value = grade;
    opt.textContent = `Grade ${grade}`;
    dom.gradeFilter.appendChild(opt);
  });

  populateSectionOptions("all");
}

// Rebuild the Section dropdown to only show sections within the chosen grade.
// "all" grade shows every section across the whole roster.
function populateSectionOptions(gradeValue) {
  dom.sectionFilter.innerHTML = '<option value="all">All Sections</option>';

  const sections = gradeValue === "all"
    ? [...new Set(ROSTER.map((p) => p.section))].sort((a, b) => a.localeCompare(b))
    : (GRADE_SECTION_MAP[gradeValue] || []);

  sections.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    dom.sectionFilter.appendChild(opt);
  });
}

// Populate the Player Information Grade dropdown once, then keep its Section
// dropdown in sync — same pattern as the main roster filters above.
function populatePiFilterOptions() {
  Object.keys(GRADE_SECTION_MAP).forEach((grade) => {
    const opt = document.createElement("option");
    opt.value = grade;
    opt.textContent = `Grade ${grade}`;
    dom.piGradeFilter.appendChild(opt);
  });

  populatePiSectionOptions("all");
}

function populatePiSectionOptions(gradeValue) {
  dom.piSectionFilter.innerHTML = '<option value="all">All Sections</option>';

  const sections = gradeValue === "all"
    ? [...new Set(ROSTER.map((p) => p.section))].sort((a, b) => a.localeCompare(b))
    : (GRADE_SECTION_MAP[gradeValue] || []);

  sections.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    dom.piSectionFilter.appendChild(opt);
  });
}

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
   10. SEASON-LONG PER-PLAYER COUNTERS
   A "training day" is any date key in Local Storage that currently has at
   least one player marked present. Simply toggling a player Present and
   back to Not Yet Marked (a misclick) leaves no one present that day, so
   it does NOT count as a training — this stays true even if the toggle
   happened and was undone weeks ago, since we check the saved data itself
   rather than remembering that an update occurred.
   ========================================================================== */

function computeAllSeasonStats() {
  const allRecords = getAllRecords();

  // Only keep dates where at least one player is currently present.
  const trainingDates = Object.keys(allRecords).filter((date) =>
    Object.values(allRecords[date]).some((entry) => entry && entry.present)
  );

  const stats = {};

  ROSTER.forEach((p) => {
    let present = 0;
    trainingDates.forEach((date) => {
      if (allRecords[date][p.id] && allRecords[date][p.id].present) present += 1;
    });
    stats[p.id] = {
      present: present,
      absent: trainingDates.length - present,
      trainings: trainingDates.length,
    };
  });

  return stats;
}

/* ==========================================================================
   11. COACH LOCK / UNLOCK
   The site loads locked by default so visitors can only view. Entering the
   coach password unlocks marking attendance today AND editing/correcting
   past, otherwise read-only, attendance sheets. It re-locks on refresh.
   ========================================================================== */

function updateLockButton() {
  if (state.unlocked) {
    dom.lockToggleBtn.textContent = "🔓 Unlocked (Coach)";
    dom.lockToggleBtn.classList.remove("locked");
    dom.lockToggleBtn.classList.add("unlocked");
  } else {
    dom.lockToggleBtn.textContent = "🔒 Locked";
    dom.lockToggleBtn.classList.remove("unlocked");
    dom.lockToggleBtn.classList.add("locked");
  }
}

function toggleLock() {
  if (state.unlocked) {
    // Re-locking never requires a password.
    state.unlocked = false;
    updateLockButton();
    refreshAll();
    return;
  }

  const entered = window.prompt("Enter coach password to unlock editing:");
  if (entered === null) return; // cancelled
  if (entered === COACH_PASSWORD) {
    state.unlocked = true;
    updateLockButton();
    refreshAll();
  } else {
    window.alert("Incorrect password.");
  }
}

/* ==========================================================================
   12. PLAYER INFORMATION TAB
   Gated by a sport filter: nothing shows until a sport is chosen. Only
   Volleyball has real roster + attendance data right now.
   ========================================================================== */

function onPiSportChange(e) {
  state.piSport = e.target.value;
  renderPlayerInfo();
}

function onPiSearchInput(e) {
  state.piSearchTerm = e.target.value;
  renderPlayerInfo();
}

function onPiGenderFilterChange(e) {
  state.piGenderFilter = e.target.value;
  renderPlayerInfo();
}

function onPiGradeFilterChange(e) {
  state.piGradeFilter = e.target.value;
  state.piSectionFilter = "all";
  populatePiSectionOptions(state.piGradeFilter);
  renderPlayerInfo();
}

function onPiSectionFilterChange(e) {
  state.piSectionFilter = e.target.value;
  renderPlayerInfo();
}

function renderPlayerInfo() {
  const sport = state.piSport;

  if (!sport) {
    dom.piPlaceholder.classList.remove("hidden");
    dom.piEmptySport.classList.add("hidden");
    dom.piSearchWrap.classList.add("hidden");
    dom.piFiltersRow.classList.add("hidden");
    dom.piListWrap.classList.add("hidden");
    return;
  }

  if (sport !== "volleyball") {
    const labels = { basketball: "Basketball", athletics: "Athletics", dance: "Cultural Dance Group" };
    dom.piPlaceholder.classList.add("hidden");
    dom.piSearchWrap.classList.add("hidden");
    dom.piFiltersRow.classList.add("hidden");
    dom.piListWrap.classList.add("hidden");
    dom.piEmptySport.textContent = `No player data yet for ${labels[sport]} — it doesn't have a roster or attendance sheet set up.`;
    dom.piEmptySport.classList.remove("hidden");
    return;
  }

  // Volleyball: show the searchable, filterable list with season totals.
  dom.piPlaceholder.classList.add("hidden");
  dom.piEmptySport.classList.add("hidden");
  dom.piSearchWrap.classList.remove("hidden");
  dom.piFiltersRow.classList.remove("hidden");
  dom.piListWrap.classList.remove("hidden");

  const seasonStats = computeAllSeasonStats();
  const term = state.piSearchTerm.toLowerCase();
  const players = ROSTER
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(term);
      const matchesGender = state.piGenderFilter === "all" || p.gender === state.piGenderFilter;
      const matchesGrade = state.piGradeFilter === "all" || String(p.grade) === state.piGradeFilter;
      const matchesSection = state.piSectionFilter === "all" || p.section === state.piSectionFilter;
      return matchesSearch && matchesGender && matchesGrade && matchesSection;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  dom.piEmptyFiltered.classList.toggle("hidden", players.length > 0);

  dom.piList.innerHTML = players
    .map((p) => {
      const s = seasonStats[p.id];
      const genderTagClass = p.gender === "Girl" ? "tag tag-girl" : "tag tag-boy";
      const rowGenderClass = p.gender === "Girl" ? " pi-row-girl" : " pi-row-boy";
      return `
        <div class="pi-row${rowGenderClass}">
          <span class="pi-row-name" data-label="Player">
            <strong>${escapeHtml(p.name)}</strong>
            <small>
              <span class="${genderTagClass}">${p.gender}</span>
              · Grade ${p.grade} · ${escapeHtml(p.section)}
            </small>
          </span>
          <span class="pi-present" data-label="Present">${s.present}</span>
          <span class="pi-absent" data-label="Absent">${s.absent}</span>
          <span class="pi-total" data-label="Trainings held">${s.trainings}</span>
        </div>
      `;
    })
    .join("");
}

/* ==========================================================================
   13. EVENT HANDLERS
   ========================================================================== */

// Toggle a single player's Present status for the date currently in view.
function handlePresentToggle(playerId) {
  if (!canEdit()) return;

  const record = getRecordForDate(state.viewingDateKey);
  const entry = record[playerId];
  const currentlyPresent = !!(entry && entry.present);

  const now = new Date();
  // Not awaited: the cache updates synchronously before the network call,
  // so refreshAll() below already reflects the new state. The Supabase
  // write continues in the background (see setPlayerAttendance).
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
  updateStats();
}

function onGenderFilterChange(e) {
  state.genderFilter = e.target.value;
  renderGrid();
  updateStats();
}

function onGradeFilterChange(e) {
  state.gradeFilter = e.target.value;
  state.sectionFilter = "all";
  populateSectionOptions(e.target.value);
  renderGrid();
  updateStats();
}

function onSectionFilterChange(e) {
  state.sectionFilter = e.target.value;
  renderGrid();
  updateStats();
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
  switchReportPage("page1");
  renderReport();
}

function exitReportMode() {
  state.reportMode = false;
  dom.controlsSection.classList.remove("hidden");
  dom.mainView.classList.remove("hidden");
  dom.reportView.classList.add("hidden");
  updateHistoryBanner();
}

// Show only the chosen page (Page 1 or Page 2) on screen — each page is
// half the girls plus half the boys, side by side. The download always
// produces two separate images, one per page, regardless of which one is
// currently showing (see downloadReportImage).
function switchReportPage(page) {
  state.reportPage = page;

  dom.reportPageOne.classList.toggle("hidden", page !== "page1");
  dom.reportPageTwo.classList.toggle("hidden", page !== "page2");

  dom.reportPageTabs.querySelectorAll(".report-page-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
}

function onReportPageTabClick(e) {
  const btn = e.target.closest(".report-page-tab");
  if (!btn) return;
  switchReportPage(btn.dataset.page);
}

// Capture just ONE report page (page1 or page2) as its own canvas. Everything
// outside the report card — sticky nav, action buttons, the page tabs — is
// hidden in the cloned document so it can never bleed into the image, and
// only the requested page is shown while the other stays hidden.
function captureReportPage(target, page) {
  return html2canvas(target, {
    backgroundColor: "#ffffff",
    scale: 2, // sharper image for screenshots/printing
    useCORS: true,
    onclone: (clonedDoc) => {
      const nav = clonedDoc.querySelector(".main-nav");
      if (nav) nav.style.display = "none";

      const actions = clonedDoc.querySelector(".report-actions");
      if (actions) actions.style.display = "none";

      const tabs = clonedDoc.querySelector("#reportPageTabs");
      if (tabs) tabs.style.display = "none";

      const pageOne = clonedDoc.querySelector("#reportPageOne");
      const pageTwo = clonedDoc.querySelector("#reportPageTwo");

      if (pageOne) pageOne.classList.toggle("hidden", page !== "page1");
      if (pageTwo) pageTwo.classList.toggle("hidden", page !== "page2");
    },
  });
}

// Trigger a browser download for a canvas as a PNG file.
function downloadCanvasAsPng(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Small pause between the two downloads — firing two link.click() downloads
// back-to-back with zero delay can cause a browser to silently drop the
// second one, so we give it a beat.
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// One click of the download button produces TWO separate PNGs — one photo
// for Page 1 and one photo for Page 2 — regardless of which page happens to
// be showing on screen. The coach never has to switch tabs and download
// twice by hand.
async function downloadReportImage() {
  const target = document.querySelector(".report-card");
  const btn = dom.downloadReportBtn;

  if (typeof html2canvas !== "function") {
    window.alert("Image export isn't available right now — check your internet connection and try again.");
    return;
  }

  const originalLabel = btn.textContent;
  const originalPage = state.reportPage;
  btn.disabled = true;

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  window.scrollTo(0, 0);

  try {
    btn.textContent = "Generating page 1…";
    const canvas1 = await captureReportPage(target, "page1");
    downloadCanvasAsPng(canvas1, `attendance-report-page1-${state.viewingDateKey}.png`);

    await wait(400);

    btn.textContent = "Generating page 2…";
    const canvas2 = await captureReportPage(target, "page2");
    downloadCanvasAsPng(canvas2, `attendance-report-page2-${state.viewingDateKey}.png`);
  } catch (err) {
    console.error("Could not generate report images:", err);
    window.alert("Something went wrong generating the images. Please try again.");
  } finally {
    // Restore whichever page was actually showing on screen before we
    // started swapping pages in the (separate) cloned documents.
    switchReportPage(originalPage);
    window.scrollTo(scrollX, scrollY);
    btn.textContent = originalLabel;
    btn.disabled = false;
  }
}

/* ==========================================================================
   14. INIT
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

/* ==========================================================================
   14b. SECRET TIMESTAMP EDITOR
   Hidden on purpose: there is no visible button or menu entry anywhere in
   the UI for this. It's reached only by clicking the volleyball emoji next
   to the page title 7 times in a row (within ~2 seconds), and it asks for
   its OWN password (TIME_EDIT_PASSWORD, defined in section 2b) — separate
   from the coach lock password and independent of whether the app is
   currently locked or unlocked. Use it to correct the recorded time for a
   player's attendance on any date, past or present.
   ========================================================================== */

let secretClickCount = 0;
let secretClickResetTimer = null;
const SECRET_CLICKS_REQUIRED = 7;
const SECRET_CLICK_WINDOW_MS = 2000;

function bindSecretTimeEditorTrigger() {
  const trigger = document.querySelector("#page-volleyball .app-title .ball");
  if (!trigger) return;
  trigger.addEventListener("click", handleSecretTriggerClick);
}

function handleSecretTriggerClick() {
  secretClickCount += 1;
  clearTimeout(secretClickResetTimer);
  secretClickResetTimer = setTimeout(() => {
    secretClickCount = 0;
  }, SECRET_CLICK_WINDOW_MS);

  if (secretClickCount >= SECRET_CLICKS_REQUIRED) {
    secretClickCount = 0;
    clearTimeout(secretClickResetTimer);
    openSecretTimeEditor();
  }
}

function openSecretTimeEditor() {
  const code = window.prompt("Access code:");
  if (code === null) return; // cancelled
  if (code !== TIME_EDIT_PASSWORD) {
    window.alert("Incorrect code.");
    return;
  }
  promptEditAttendanceTime();
}

// "8:45 AM" or "8:45:30 AM" -> canonical "8:45:00 AM" / "8:45:30 AM" to
// match the format already used everywhere else in the app.
function normalizeTimeInput(input) {
  const match = String(input).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)$/);
  if (!match) return null;

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const second = match[3] ? parseInt(match[3], 10) : 0;
  const meridiem = match[4].toUpperCase();

  if (hour < 1 || hour > 12 || minute > 59 || second > 59) return null;

  return `${hour}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")} ${meridiem}`;
}

async function promptEditAttendanceTime() {
  const dateInput = window.prompt("Date to edit (YYYY-MM-DD):", state.viewingDateKey);
  if (dateInput === null) return;
  const dateKey = dateInput.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    window.alert("That doesn't look like a valid date — use YYYY-MM-DD.");
    return;
  }

  const nameInput = window.prompt("Player name (or part of it):");
  if (nameInput === null) return;
  const term = nameInput.trim().toLowerCase();
  if (!term) return;

  const matches = ROSTER.filter((p) => p.name.toLowerCase().includes(term));
  if (matches.length === 0) {
    window.alert("No player matches that name.");
    return;
  }

  let player = matches[0];
  if (matches.length > 1) {
    const list = matches.map((p, i) => `${i + 1}. ${p.name}`).join("\n");
    const pick = window.prompt(`Multiple matches — enter a number:\n${list}`);
    const idx = parseInt(pick, 10) - 1;
    if (!matches[idx]) {
      window.alert("No valid selection made.");
      return;
    }
    player = matches[idx];
  }

  const record = getRecordForDate(dateKey);
  const entry = record[player.id];
  const currentlyPresent = !!(entry && entry.present);
  const currentTimestamp = currentlyPresent ? entry.timestamp : null;

  const promptLabel = currentTimestamp
    ? `New time for ${player.name} on ${dateKey} (currently ${currentTimestamp}):\nFormat: h:mm AM/PM, e.g. 8:45 AM`
    : `${player.name} isn't currently marked present on ${dateKey}.\nEnter a time to mark them present at that time, or cancel:\nFormat: h:mm AM/PM, e.g. 8:45 AM`;

  const timeInput = window.prompt(promptLabel, currentTimestamp || "");
  if (timeInput === null) return;

  const normalized = normalizeTimeInput(timeInput);
  if (!normalized) {
    window.alert("Couldn't understand that time — use a format like 8:45 AM.");
    return;
  }

  await setPlayerAttendance(dateKey, player.id, true, normalized);
  refreshAll();
  window.alert(`Updated: ${player.name} — ${dateKey} — ${normalized}`);
}

function bindEvents() {
  document.querySelector(".main-nav").addEventListener("click", onNavClick);

  dom.studentGrid.addEventListener("click", onGridClick);
  dom.searchInput.addEventListener("input", onSearchInput);
  dom.genderFilter.addEventListener("change", onGenderFilterChange);
  dom.gradeFilter.addEventListener("change", onGradeFilterChange);
  dom.sectionFilter.addEventListener("change", onSectionFilterChange);
  dom.sortSelect.addEventListener("change", onSortChange);
  dom.dateSelect.addEventListener("change", onDateSelectChange);
  dom.backToTodayBtn.addEventListener("click", onBackToToday);
  dom.lockToggleBtn.addEventListener("click", toggleLock);
  dom.reportModeBtn.addEventListener("click", enterReportMode);
  dom.exitReportBtn.addEventListener("click", exitReportMode);
  dom.downloadReportBtn.addEventListener("click", downloadReportImage);
  dom.reportPageTabs.addEventListener("click", onReportPageTabClick);

  dom.piSportSelect.addEventListener("change", onPiSportChange);
  dom.piSearchInput.addEventListener("input", onPiSearchInput);
  dom.piGenderFilter.addEventListener("change", onPiGenderFilterChange);
  dom.piGradeFilter.addEventListener("change", onPiGradeFilterChange);
  dom.piSectionFilter.addEventListener("change", onPiSectionFilterChange);

  bindSecretTimeEditorTrigger();
}

async function init() {
  state.lastKnownToday = todayKey();

  populateFilterOptions();
  populatePiFilterOptions();

  dom.dateSelect.max = state.lastKnownToday;
  dom.dateSelect.value = state.viewingDateKey;

  updateLockButton();
  bindEvents();
  updateClock();

  // Show a lightweight loading state while the initial fetch from
  // Supabase is in flight, so the grid doesn't briefly flash "all absent".
  dom.studentGrid.innerHTML = '<p class="empty-state">Loading attendance data…</p>';

  await loadAllRecordsFromSupabase();
  refreshAll();

  // Stay in sync with every other device from now on.
  subscribeToRealtimeUpdates();

  // Live clock, ticking every second; also drives midnight rollover checks.
  setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", init);