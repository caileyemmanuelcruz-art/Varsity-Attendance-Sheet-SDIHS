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
  { id: "b04", name: "Balagso, Francis C.", gender: "Boy", grade: 10, section: "Pulag", birthday: "06/10/2011" },
  { id: "b06", name: "Borlaza, Gabriel Lenard S.", gender: "Boy", grade: 9, section: "Mapagmahal", birthday: "03/01/2012" },
  { id: "b09", name: "Cayabyab, Hiro O.", gender: "Boy", grade: 8, section: "Exodus", birthday: "04/04/2011" },
  { id: "b10", name: "Cruz, Cailey Emmanuel", gender: "Boy", grade: 11, section: "Acacia", birthday: "02/10/2010" },
  { id: "b11", name: "Cuarteros, Charles R.", gender: "Boy", grade: 10, section: "Pulag", birthday: "09/16/2009" },
  { id: "b12", name: "Garcia, Kier Zaijan T.", gender: "Boy", grade: 9, section: "Mapagmahal", birthday: "12/01/2011" },
  { id: "b16", name: "Mendoza, Mark Gabriel", gender: "Boy", grade: 10, section: "Sierra Madre", birthday: "05/02/2011" },
  { id: "b19", name: "Popanes, Jhay M.", gender: "Boy", grade: 9, section: "Magalang", birthday: "06/08/2011" },
  { id: "b20", name: "Ramos, Gabriel", gender: "Boy", grade: 10, section: "Kanlaon", birthday: "01/14/2011" },
  { id: "b22", name: "Rodriguez, Jhon Ruan", gender: "Boy", grade: 11, section: "Yakal", birthday: "03/07/2010" },
  { id: "b24", name: "Satingin, John Kaizer", gender: "Boy", grade: 11, section: "Yakal", birthday: "01/11/2010" },
  { id: "b25", name: "Umali, Yale Rayven G.", gender: "Boy", grade: 11, section: "Yakal", birthday: "03/29/2009" },
  { id: "b26", name: "Villanueva, Gian Carlo L.", gender: "Boy", grade: 11, section: "Yakal", birthday: "02/27/2010" },

  // ---- Girls ----
  { id: "g03", name: "Bautista, Glaiza Mae", gender: "Girl", grade: 10, section: "Banahaw", birthday: "12/30/2010" },
  { id: "g04", name: "Bibat, Chriza Jane", gender: "Girl", grade: 9, section: "Matatag", birthday: "06/15/2011" },
  { id: "g05", name: "Bueza, Rhianwhen B.", gender: "Girl", grade: 7, section: "Aquino", birthday: "10/04/2013" },
  { id: "g07", name: "Desepeda, Kate", gender: "Girl", grade: 10, section: "Halcon", birthday: "03/31/2011" },
  { id: "g10", name: "Jagonoy, Huxlie", gender: "Girl", grade: 9, section: "Magalang", birthday: "01/11/2012" },
  { id: "g11", name: "Latayan, Ashley Anne B.", gender: "Girl", grade: 7, section: "Macapagal", birthday: "05/12/2014" },
  { id: "g12", name: "Madrideo, Ayesha Mae R.", gender: "Girl", grade: 10, section: "Sierra Madre", birthday: "06/11/2011" },
  { id: "g14", name: "Marasigan, Jermae Q.", gender: "Girl", grade: 11, section: "Acacia", birthday: "06/28/2010" },
  { id: "g15", name: "Mata, April Dhane A.", gender: "Girl", grade: 8, section: "Chronicles", birthday: "04/20/2013" },
  { id: "g18", name: "Moron, Maria Michaela L.", gender: "Girl", grade: 8, section: "Corinthians", birthday: "09/18/2011" },
  { id: "g20", name: "Ramos, Rhian", gender: "Girl", grade: 10, section: "Makiling", birthday: "12/29/2009" },
  { id: "g22", name: "Regodon, Cezanne", gender: "Girl", grade: 9, section: "Mapagmahal", birthday: "11/26/2011" },
  { id: "g23", name: "Salanatin, Daniela Corazon", gender: "Girl", grade: 11, section: "Yakal", birthday: "02/15/2010" },
  { id: "g25", name: "Satingin, Janyra", gender: "Girl", grade: 7, section: "Garcia", birthday: "01/21/2012" },
  { id: "g26", name: "Tapas, Samantha Faye B.", gender: "Girl", grade: 8, section: "Ephesians", birthday: "08/12/2012" },
];

// Basketball roster — 27 players, all boys. IDs are prefixed "bk" so they
// can never collide with the volleyball roster's "b01"/"g01"-style IDs in
// the shared Supabase "attendance" table (same table, keyed by player_id).
const ROSTER_BASKETBALL = [
  { id: "bk01", name: "Abuloc, Clayd", gender: "Boy", grade: 11, section: "Acacia", birthday: "11/14/2009" },
  { id: "bk02", name: "Agustin, Jonas Vince Antoy", gender: "Boy", grade: 11, section: "Yakal", birthday: "01/25/2010" },
  { id: "bk03", name: "Balsomo, Jobert Armeña", gender: "Boy", grade: 10, section: "Banahaw", birthday: "10/06/2010" },
  { id: "bk04", name: "Bayos, John Michael Mendoza", gender: "Boy", grade: 10, section: "Makiling", birthday: "09/18/2009" },
  { id: "bk05", name: "De Los Santos, Ronald Cervantes", gender: "Boy", grade: 11, section: "Yakal", birthday: "05/18/2010" },
  { id: "bk06", name: "De Quiros, Nathan James Bornidor", gender: "Boy", grade: 11, section: "Acacia", birthday: "09/20/2010" },
  { id: "bk07", name: "Dela Cruz, Juan Miguel Kyle Marasigan", gender: "Boy", grade: 12, section: "Mirasol", birthday: "10/08/2009" },
  { id: "bk09", name: "Elbao, Paul Jade Lisas", gender: "Boy", grade: 9, section: "Matatag", birthday: "06/21/2010" },
  { id: "bk10", name: "Estares, Vince Kenneth Daguinod", gender: "Boy", grade: 11, section: "Yakal", birthday: "01/31/2010" },
  { id: "bk11", name: "Estrella, John Lee Sarcol", gender: "Boy", grade: 11, section: "Yakal", birthday: "10/16/2009" },
  { id: "bk12", name: "Evardo, Kian Josh Palicpic", gender: "Boy", grade: 10, section: "Pulag", birthday: "12/09/2010" },
  { id: "bk13", name: "Fruta, Fritz Cyrenz Eugene Rubio", gender: "Boy", grade: 12, section: "Rosas", birthday: "05/20/2009" },
  { id: "bk14", name: "Garcia, Johnray Solis", gender: "Boy", grade: 11, section: "Acacia", birthday: "06/22/2010" },
  { id: "bk15", name: "Lumactud, John Mark Domingo", gender: "Boy", grade: 10, section: "Sierra Madre", birthday: "02/24/2011" },
  { id: "bk16", name: "Makilan, Jade Titong", gender: "Boy", grade: 11, section: "Yakal", birthday: "04/14/2010" },
  { id: "bk17", name: "Nacalaban, Joseph Ryan Grave", gender: "Boy", grade: 11, section: "Molave", birthday: "10/11/2009" },
  { id: "bk18", name: "Ona, Nhaz Gabriel Sarmiento", gender: "Boy", grade: 11, section: "Acacia", birthday: "01/22/2010" },
  { id: "bk19", name: "Paje, John Joel Binamira", gender: "Boy", grade: 11, section: "Yakal", birthday: "08/20/2010" },
  { id: "bk20", name: "Pugayan, Rhiniel Iann", gender: "Boy", grade: 10, section: "Makiling", birthday: "06/20/2011" },
  { id: "bk21", name: "Redondo, Johan Zander Mendoza", gender: "Boy", grade: 10, section: "Makiling", birthday: "02/27/2011" },
  { id: "bk22", name: "Riosa, Miel Xander Cedric Singcay", gender: "Boy", grade: 12, section: "HUMSS 1 Mirasol", birthday: "03/25/2009" },
  { id: "bk23", name: "Siga, Gabriel Trazona", gender: "Boy", grade: 10, section: "Makiling", birthday: "12/14/2010" },
  { id: "bk24", name: "Tamba, Kenneth Angelo", gender: "Boy", grade: 10, section: "Mayon", birthday: "09/24/2010" },
  { id: "bk25", name: "Tan, John Khaizzer Avila", gender: "Boy", grade: 10, section: "Sierra Madre", birthday: "01/11/2011" },
  { id: "bk26", name: "Torres, Romiell Dela Ysla", gender: "Boy", grade: 12, section: "Mirasol", birthday: "06/25/2009" },
  { id: "bk27", name: "Villanueva, Joshua Senoto", gender: "Boy", grade: 10, section: "Pulag", birthday: "06/27/2011" },

  // ---- New players added — grade/section/birthday left blank until
  // that info is provided. ----
  { id: "bk28", name: "Anipot, Ralph Dominique", gender: "Boy", grade: "", section: "", birthday: null },
  { id: "bk29", name: "Brutal, Zach Anthony", gender: "Boy", grade: "", section: "", birthday: null },
  { id: "bk30", name: "Concha, Denmark B.", gender: "Boy", grade: "", section: "", birthday: null },
  { id: "bk31", name: "Desder, Don Ryan", gender: "Boy", grade: "", section: "", birthday: null },
  { id: "bk32", name: "Desepeda, John Uno", gender: "Boy", grade: "", section: "", birthday: null },
  { id: "bk33", name: "Gange, Christian", gender: "Boy", grade: "", section: "", birthday: null },
  { id: "bk34", name: "Rosario, John Matthew", gender: "Boy", grade: "", section: "", birthday: null },
  { id: "bk35", name: "Pakinggan, John Christian", gender: "Boy", grade: 8, section: "Exodus", birthday: null },
  { id: "bk36", name: "Villanueva, Christopher", gender: "Boy", grade: "", section: "", birthday: null },
];

// Every roster in the system, keyed by the same sport names used in
// data-page / state.piSport. Add a new entry here whenever another sport
// gets its own roster of players.
const ROSTERS_BY_SPORT = {
  volleyball: ROSTER,
  basketball: ROSTER_BASKETBALL,
};

function getRosterForSport(sport) {
  return ROSTERS_BY_SPORT[sport] || [];
}

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

// "Jul 16, 2026" — compact form used on the Page 2–4 date badge, since the
// full header (with the long weekday name) only shows on Page 1.
function formatDateShort(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
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
  reportPage: "page1",          // which report page is on screen: "page1" | "page2"
  unlocked: false,              // coach edit privileges for this session
  piSport: "",                  // Player Information: selected sport
  piSearchTerm: "",
  piGenderFilter: "all",
  piGradeFilter: "all",
  piSectionFilter: "all",

  // Basketball page — mirrors the volleyball fields above, kept separate
  // so navigating one sport never disturbs the other's filters/date/view.
  bbViewingDateKey: todayKey(),
  bbSearchTerm: "",
  bbGradeFilter: "all",
  bbSectionFilter: "all",
  bbSortBy: "name-asc",
  bbReportMode: false,
  bbReportPage: "page1",         // which report page is on screen: "page1" | "page2"
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
  dateWrap: document.getElementById("dateWrap"),
  calendarTriggerBtn: document.getElementById("calendarTriggerBtn"),
  calendarPopover: document.getElementById("calendarPopover"),
  calendarPrevBtn: document.getElementById("calendarPrevBtn"),
  calendarNextBtn: document.getElementById("calendarNextBtn"),
  calendarMonthLabel: document.getElementById("calendarMonthLabel"),
  calendarDays: document.getElementById("calendarDays"),
  calendarCloseBtn: document.getElementById("calendarCloseBtn"),
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
  reportHeader: document.getElementById("reportHeader"),
  reportLegend: document.getElementById("reportLegend"),
  reportTotals: document.getElementById("reportTotals"),
  reportTabSubP1: document.getElementById("reportTabSubP1"),
  reportTabSubP2: document.getElementById("reportTabSubP2"),
  reportTabSubP3: document.getElementById("reportTabSubP3"),
  reportTabSubP4: document.getElementById("reportTabSubP4"),
  reportPageOne: document.getElementById("reportPageOne"),
  reportPageTwo: document.getElementById("reportPageTwo"),
  reportPageThree: document.getElementById("reportPageThree"),
  reportPageFour: document.getElementById("reportPageFour"),
  reportPageLabelP1Text: document.getElementById("reportPageLabelP1Text"),
  reportPageLabelP1Date: document.getElementById("reportPageLabelP1Date"),
  reportPageLabelP2Text: document.getElementById("reportPageLabelP2Text"),
  reportPageLabelP2Date: document.getElementById("reportPageLabelP2Date"),
  reportPageLabelP3Text: document.getElementById("reportPageLabelP3Text"),
  reportPageLabelP3Date: document.getElementById("reportPageLabelP3Date"),
  reportPageLabelP4Text: document.getElementById("reportPageLabelP4Text"),
  reportPageLabelP4Date: document.getElementById("reportPageLabelP4Date"),
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
  downloadCurrentPageBtn: document.getElementById("downloadCurrentPageBtn"),

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

  // Basketball page
  bbCurrentDate: document.getElementById("bbCurrentDate"),
  bbCurrentTime: document.getElementById("bbCurrentTime"),
  bbStatTotal: document.getElementById("bbStatTotal"),
  bbStatPresent: document.getElementById("bbStatPresent"),
  bbStatAbsent: document.getElementById("bbStatAbsent"),
  bbFilterSummary: document.getElementById("bbFilterSummary"),

  bbHistoryBanner: document.getElementById("bbHistoryBanner"),
  bbHistoryBannerText: document.getElementById("bbHistoryBannerText"),
  bbBackToTodayBtn: document.getElementById("bbBackToTodayBtn"),

  bbControlsSection: document.getElementById("bbControlsSection"),
  bbSearchInput: document.getElementById("bbSearchInput"),
  bbDateSelect: document.getElementById("bbDateSelect"),
  bbDateWrap: document.getElementById("bbDateWrap"),
  bbCalendarTriggerBtn: document.getElementById("bbCalendarTriggerBtn"),
  bbCalendarPopover: document.getElementById("bbCalendarPopover"),
  bbCalendarPrevBtn: document.getElementById("bbCalendarPrevBtn"),
  bbCalendarNextBtn: document.getElementById("bbCalendarNextBtn"),
  bbCalendarMonthLabel: document.getElementById("bbCalendarMonthLabel"),
  bbCalendarDays: document.getElementById("bbCalendarDays"),
  bbCalendarCloseBtn: document.getElementById("bbCalendarCloseBtn"),
  bbLockToggleBtn: document.getElementById("bbLockToggleBtn"),
  bbReportModeBtn: document.getElementById("bbReportModeBtn"),
  bbGradeFilter: document.getElementById("bbGradeFilter"),
  bbSectionFilter: document.getElementById("bbSectionFilter"),
  bbSortSelect: document.getElementById("bbSortSelect"),

  bbMainView: document.getElementById("bbMainView"),
  bbStudentGrid: document.getElementById("bbStudentGrid"),
  bbEmptyState: document.getElementById("bbEmptyState"),

  bbReportView: document.getElementById("bbReportView"),
  bbReportDate: document.getElementById("bbReportDate"),
  bbReportTime: document.getElementById("bbReportTime"),
  bbReportTotalAll: document.getElementById("bbReportTotalAll"),
  bbReportTotalPresent: document.getElementById("bbReportTotalPresent"),
  bbReportTotalAbsent: document.getElementById("bbReportTotalAbsent"),
  bbReportPageTabs: document.getElementById("bbReportPageTabs"),
  bbReportHeader: document.getElementById("bbReportHeader"),
  bbReportTotals: document.getElementById("bbReportTotals"),
  bbTabSubP1: document.getElementById("bbTabSubP1"),
  bbTabSubP2: document.getElementById("bbTabSubP2"),
  bbTabSubP3: document.getElementById("bbTabSubP3"),
  bbTabSubP4: document.getElementById("bbTabSubP4"),
  bbReportPageOne: document.getElementById("bbReportPageOne"),
  bbReportPageTwo: document.getElementById("bbReportPageTwo"),
  bbReportPageThree: document.getElementById("bbReportPageThree"),
  bbReportPageFour: document.getElementById("bbReportPageFour"),
  bbReportPageLabelP1Text: document.getElementById("bbReportPageLabelP1Text"),
  bbReportPageLabelP1Date: document.getElementById("bbReportPageLabelP1Date"),
  bbReportPageLabelP2Text: document.getElementById("bbReportPageLabelP2Text"),
  bbReportPageLabelP2Date: document.getElementById("bbReportPageLabelP2Date"),
  bbReportPageLabelP3Text: document.getElementById("bbReportPageLabelP3Text"),
  bbReportPageLabelP3Date: document.getElementById("bbReportPageLabelP3Date"),
  bbReportPageLabelP4Text: document.getElementById("bbReportPageLabelP4Text"),
  bbReportPageLabelP4Date: document.getElementById("bbReportPageLabelP4Date"),
  bbReportCountP1: document.getElementById("bbReportCountP1"),
  bbReportListP1: document.getElementById("bbReportListP1"),
  bbReportCountP2: document.getElementById("bbReportCountP2"),
  bbReportListP2: document.getElementById("bbReportListP2"),
  bbReportCountP3: document.getElementById("bbReportCountP3"),
  bbReportListP3: document.getElementById("bbReportListP3"),
  bbReportCountP4: document.getElementById("bbReportCountP4"),
  bbReportListP4: document.getElementById("bbReportListP4"),
  bbExitReportBtn: document.getElementById("bbExitReportBtn"),
  bbDownloadReportBtn: document.getElementById("bbDownloadReportBtn"),
  bbDownloadCurrentPageBtn: document.getElementById("bbDownloadCurrentPageBtn"),

  // Password modal (styled replacement for window.prompt())
  passwordModalOverlay: document.getElementById("passwordModalOverlay"),
  passwordModal: document.getElementById("passwordModal"),
  passwordModalIcon: document.getElementById("passwordModalIcon"),
  passwordModalTitle: document.getElementById("passwordModalTitle"),
  passwordModalMessage: document.getElementById("passwordModalMessage"),
  passwordModalForm: document.getElementById("passwordModalForm"),
  passwordModalInput: document.getElementById("passwordModalInput"),
  passwordModalError: document.getElementById("passwordModalError"),
  passwordModalCancelBtn: document.getElementById("passwordModalCancelBtn"),
  passwordModalOkBtn: document.getElementById("passwordModalOkBtn"),

  // Hidden timestamp editor modal
  secretEditorOverlay: document.getElementById("secretEditorOverlay"),
  secretCloseBtn: document.getElementById("secretCloseBtn"),
  secretDateInput: document.getElementById("secretDateInput"),
  secretSportToggle: document.getElementById("secretSportToggle"),
  secretGenderToggle: document.getElementById("secretGenderToggle"),
  secretBrowseList: document.getElementById("secretBrowseList"),
  secretCommonTime: document.getElementById("secretCommonTime"),
  secretApplyCommonBtn: document.getElementById("secretApplyCommonBtn"),
  secretPlayerList: document.getElementById("secretPlayerList"),
  secretEmptyList: document.getElementById("secretEmptyList"),
  secretSaveBtn: document.getElementById("secretSaveBtn"),
  secretCancelBtn: document.getElementById("secretCancelBtn"),
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
  if (pageName !== "basketball" && state.bbReportMode) {
    exitBbReportMode();
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
  dom.bbCurrentDate.textContent = formatDateLong(now);
  dom.bbCurrentTime.textContent = formatTime(now);

  const liveTodayKey = toDateKey(now);
  const wasViewingToday = state.viewingDateKey === state.lastKnownToday;
  const wasViewingBbToday = state.bbViewingDateKey === state.lastKnownToday;

  if (state.lastKnownToday && liveTodayKey !== state.lastKnownToday) {
    // Midnight passed — follow it forward on whichever sport page(s) were
    // actively viewing "today" (a coach looking at last week's basketball
    // sheet shouldn't get yanked to today just because volleyball rolled
    // over).
    if (wasViewingToday) {
      state.viewingDateKey = liveTodayKey;
      dom.dateSelect.value = liveTodayKey;
    }
    if (wasViewingBbToday) {
      state.bbViewingDateKey = liveTodayKey;
      dom.bbDateSelect.value = liveTodayKey;
    }
    dom.dateSelect.max = liveTodayKey;
    dom.bbDateSelect.max = liveTodayKey;
    if (wasViewingToday || wasViewingBbToday) refreshAll();
  }

  state.lastKnownToday = liveTodayKey;
  dom.dateSelect.max = liveTodayKey;
  dom.bbDateSelect.max = liveTodayKey;
}

// Whether the date currently being viewed is today.
function isViewingToday() {
  return state.viewingDateKey === todayKey();
}

function isViewingBbToday() {
  return state.bbViewingDateKey === todayKey();
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

/* ==========================================================================
   8b. BASKETBALL PAGE
   Mirrors the Volleyball page above (same student-card / report-row markup
   and CSS classes are reused directly), but kept as its own set of
   functions and state fields so browsing/editing one sport never disturbs
   the other's filters, viewed date, or report mode. There's no gender
   filter here since the basketball roster is all boys.
   ========================================================================== */

function getFilteredSortedBbRoster() {
  let players = ROSTER_BASKETBALL.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(state.bbSearchTerm.toLowerCase());
    const matchesGrade = state.bbGradeFilter === "all" || String(p.grade) === state.bbGradeFilter;
    const matchesSection = state.bbSectionFilter === "all" || p.section === state.bbSectionFilter;
    return matchesSearch && matchesGrade && matchesSection;
  });

  switch (state.bbSortBy) {
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

function buildBbFilterSummaryText(count) {
  const parts = [];
  if (state.bbGradeFilter !== "all") parts.push(`Grade ${state.bbGradeFilter}`);
  if (state.bbSectionFilter !== "all") parts.push(state.bbSectionFilter);
  if (state.bbSearchTerm.trim()) parts.push(`matching "${state.bbSearchTerm.trim()}"`);

  if (parts.length === 0) {
    return `Showing all ${ROSTER_BASKETBALL.length} players`;
  }
  return `Showing ${count} player${count === 1 ? "" : "s"} — ${parts.join(" · ")}`;
}

function updateBbStats() {
  const record = getRecordForDate(state.bbViewingDateKey);
  const filtered = getFilteredSortedBbRoster();
  const presentCount = filtered.filter((p) => record[p.id] && record[p.id].present).length;

  dom.bbStatTotal.textContent = filtered.length;
  dom.bbStatPresent.textContent = presentCount;
  dom.bbStatAbsent.textContent = filtered.length - presentCount;

  dom.bbFilterSummary.textContent = buildBbFilterSummaryText(filtered.length);
}

function updateBbHistoryBanner() {
  if (isViewingBbToday()) {
    if (state.unlocked) {
      dom.bbHistoryBanner.classList.add("hidden");
    } else {
      dom.bbHistoryBannerText.textContent =
        "This attendance sheet is locked. Unlock with the coach password to mark players present.";
      dom.bbBackToTodayBtn.classList.add("hidden");
      dom.bbHistoryBanner.classList.remove("hidden");
    }
    return;
  }
  const niceDate = formatDateLong(new Date(state.bbViewingDateKey + "T00:00:00"));
  dom.bbHistoryBannerText.textContent = state.unlocked
    ? `Viewing ${niceDate} — unlocked for editing (coach mode).`
    : `Viewing ${niceDate} — this attendance sheet is read-only. Unlock to edit.`;
  dom.bbBackToTodayBtn.classList.remove("hidden");
  dom.bbHistoryBanner.classList.remove("hidden");
}

function renderBbGrid() {
  const record = getRecordForDate(state.bbViewingDateKey);
  const seasonStats = computeAllSeasonStats(ROSTER_BASKETBALL);
  const players = getFilteredSortedBbRoster();

  dom.bbStudentGrid.innerHTML = "";

  if (players.length === 0) {
    dom.bbEmptyState.classList.remove("hidden");
  } else {
    dom.bbEmptyState.classList.add("hidden");
    const fragment = document.createDocumentFragment();
    players.forEach((player) => {
      fragment.appendChild(buildStudentCard(player, record, seasonStats));
    });
    dom.bbStudentGrid.appendChild(fragment);
  }
}

function handleBbPresentToggle(playerId) {
  if (!canEdit()) return;

  const record = getRecordForDate(state.bbViewingDateKey);
  const entry = record[playerId];
  const currentlyPresent = !!(entry && entry.present);

  const now = new Date();
  setPlayerAttendance(state.bbViewingDateKey, playerId, !currentlyPresent, formatTime(now));

  refreshAll();
}

function onBbGridClick(e) {
  const btn = e.target.closest(".btn-present");
  if (!btn) return;
  handleBbPresentToggle(btn.dataset.playerId);
}

function onBbSearchInput(e) {
  state.bbSearchTerm = e.target.value;
  renderBbGrid();
  updateBbStats();
}

function onBbGradeFilterChange(e) {
  state.bbGradeFilter = e.target.value;
  state.bbSectionFilter = "all";
  populateBbSectionOptions(e.target.value);
  renderBbGrid();
  updateBbStats();
}

function onBbSectionFilterChange(e) {
  state.bbSectionFilter = e.target.value;
  renderBbGrid();
  updateBbStats();
}

function onBbSortChange(e) {
  state.bbSortBy = e.target.value;
  renderBbGrid();
}

function onBbDateSelectChange(e) {
  state.bbViewingDateKey = e.target.value;
  refreshAll();
}

function onBbBackToToday() {
  state.bbViewingDateKey = todayKey();
  dom.bbDateSelect.value = state.bbViewingDateKey;
  refreshAll();
}

function populateBbFilterOptions() {
  const map = getGradeSectionMapForSport("basketball");
  Object.keys(map).forEach((grade) => {
    const opt = document.createElement("option");
    opt.value = grade;
    opt.textContent = `Grade ${grade}`;
    dom.bbGradeFilter.appendChild(opt);
  });

  populateBbSectionOptions("all");
}

function populateBbSectionOptions(gradeValue) {
  dom.bbSectionFilter.innerHTML = '<option value="all">All Sections</option>';

  const map = getGradeSectionMapForSport("basketball");
  const sections = gradeValue === "all"
    ? [...new Set(ROSTER_BASKETBALL.map((p) => p.section))].sort((a, b) => a.localeCompare(b))
    : (map[gradeValue] || []);

  sections.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    dom.bbSectionFilter.appendChild(opt);
  });
}

/* ---- Basketball Report Mode (two pages, one full-width team list each) ---- */

function renderBbReport() {
  const now = new Date();
  const viewingDate = new Date(state.bbViewingDateKey + "T00:00:00");
  const record = getRecordForDate(state.bbViewingDateKey);

  dom.bbReportDate.textContent = formatDateLong(viewingDate);
  dom.bbReportTime.textContent = isViewingBbToday() ? formatTime(now) : "Historical record";

  const players = [...ROSTER_BASKETBALL].sort((a, b) => a.name.localeCompare(b.name));
  const presentTotal = players.filter((p) => record[p.id] && record[p.id].present).length;

  dom.bbReportTotalAll.textContent = players.length;
  dom.bbReportTotalPresent.textContent = presentTotal;
  dom.bbReportTotalAbsent.textContent = players.length - presentTotal;

  // FOUR pages instead of two — each a quarter of the roster, full width,
  // single column — so rows can print big and legible on long bond paper
  // instead of a long, cramped single list.
  const quarter = Math.ceil(players.length / 4);
  const q1 = players.slice(0, quarter);
  const q2 = players.slice(quarter, quarter * 2);
  const q3 = players.slice(quarter * 2, quarter * 3);
  const q4 = players.slice(quarter * 3);

  renderReportHalf(q1, record, dom.bbReportListP1, dom.bbReportCountP1, 0, presentTotal, players.length);
  renderReportHalf(q2, record, dom.bbReportListP2, dom.bbReportCountP2, quarter, presentTotal, players.length);
  renderReportHalf(q3, record, dom.bbReportListP3, dom.bbReportCountP3, quarter * 2, presentTotal, players.length);
  renderReportHalf(q4, record, dom.bbReportListP4, dom.bbReportCountP4, quarter * 3, presentTotal, players.length);

  const bbPageDateText = formatDateShort(viewingDate);
  setReportPageMeta(dom.bbReportPageLabelP1Text, dom.bbReportPageLabelP1Date, dom.bbTabSubP1, "Team", 1, q1.length, bbPageDateText);
  setReportPageMeta(dom.bbReportPageLabelP2Text, dom.bbReportPageLabelP2Date, dom.bbTabSubP2, "Team", quarter + 1, quarter + q2.length, bbPageDateText);
  setReportPageMeta(dom.bbReportPageLabelP3Text, dom.bbReportPageLabelP3Date, dom.bbTabSubP3, "Team", quarter * 2 + 1, quarter * 2 + q3.length, bbPageDateText);
  setReportPageMeta(dom.bbReportPageLabelP4Text, dom.bbReportPageLabelP4Date, dom.bbTabSubP4, "Team", quarter * 3 + 1, players.length, bbPageDateText);
}

function enterBbReportMode() {
  state.bbReportMode = true;
  dom.bbControlsSection.classList.add("hidden");
  dom.bbMainView.classList.add("hidden");
  dom.bbHistoryBanner.classList.add("hidden");
  dom.bbReportView.classList.remove("hidden");
  switchBbReportPage("page1");
  renderBbReport();
}

function exitBbReportMode() {
  state.bbReportMode = false;
  dom.bbControlsSection.classList.remove("hidden");
  dom.bbMainView.classList.remove("hidden");
  dom.bbReportView.classList.add("hidden");
  updateBbHistoryBanner();
}

// Show only the chosen page (Page 1–4) on screen — full width, one at a
// time. The header and total counts only appear on Page 1; Pages 2–4 go
// straight into the player list. The download always produces four
// separate images, one per page, regardless of which one is currently
// showing (see downloadBbReportImage).
function switchBbReportPage(page) {
  state.bbReportPage = page;
  const isPageOne = page === "page1";

  dom.bbReportHeader.classList.toggle("hidden", !isPageOne);
  dom.bbReportTotals.classList.toggle("hidden", !isPageOne);

  dom.bbReportPageOne.classList.toggle("hidden", page !== "page1");
  dom.bbReportPageTwo.classList.toggle("hidden", page !== "page2");
  dom.bbReportPageThree.classList.toggle("hidden", page !== "page3");
  dom.bbReportPageFour.classList.toggle("hidden", page !== "page4");

  dom.bbReportPageTabs.querySelectorAll(".report-page-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
}

function onBbReportPageTabClick(e) {
  const btn = e.target.closest(".report-page-tab");
  if (!btn) return;
  switchBbReportPage(btn.dataset.page);
}

// Capture just ONE basketball report page as its own canvas — same
// approach as captureReportPage() for volleyball, just scoped to the
// basketball page's DOM.
function captureBbReportPage(target, page) {
  return html2canvas(target, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    onclone: (clonedDoc) => {
      const nav = clonedDoc.querySelector(".main-nav");
      if (nav) nav.style.display = "none";

      const actions = clonedDoc.querySelector("#page-basketball .report-actions");
      if (actions) actions.style.display = "none";

      const tabs = clonedDoc.querySelector("#bbReportPageTabs");
      if (tabs) tabs.style.display = "none";

      // Header and totals only belong on Page 1 — every other page goes
      // straight into the player list to maximize how many players fit on
      // each printed sheet.
      const isPageOne = page === "page1";
      const header = clonedDoc.querySelector("#bbReportHeader");
      const totals = clonedDoc.querySelector("#bbReportTotals");
      if (header) header.classList.toggle("hidden", !isPageOne);
      if (totals) totals.classList.toggle("hidden", !isPageOne);

      ["bbReportPageOne", "bbReportPageTwo", "bbReportPageThree", "bbReportPageFour"].forEach((id, i) => {
        const el = clonedDoc.querySelector(`#${id}`);
        if (el) el.classList.toggle("hidden", page !== `page${i + 1}`);
      });
    },
  });
}

// One click downloads FOUR separate PNGs — Page 1 through Page 4 — the same
// way the volleyball report does, regardless of which page is on screen.
async function downloadBbReportImage() {
  const target = document.querySelector("#page-basketball .report-card");
  const btn = dom.bbDownloadReportBtn;

  if (typeof html2canvas !== "function") {
    window.alert("Image export isn't available right now — check your internet connection and try again.");
    return;
  }

  const originalLabel = btn.textContent;
  const originalPage = state.bbReportPage;
  btn.disabled = true;

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  window.scrollTo(0, 0);

  try {
    for (let i = 1; i <= 4; i++) {
      btn.textContent = `Generating page ${i} of 4…`;
      const canvas = await captureBbReportPage(target, `page${i}`);
      downloadCanvasAsPng(canvas, `basketball-report-page${i}-${state.bbViewingDateKey}.png`);
      if (i < 4) await wait(400);
    }
  } catch (err) {
    console.error("Could not generate basketball report images:", err);
    window.alert("Something went wrong generating the images. Please try again.");
  } finally {
    switchBbReportPage(originalPage);
    window.scrollTo(scrollX, scrollY);
    btn.textContent = originalLabel;
    btn.disabled = false;
  }
}

// Downloads just whichever single basketball page is currently showing on
// screen — same idea as downloadCurrentReportPage() for volleyball.
async function downloadCurrentBbReportPage() {
  const target = document.querySelector("#page-basketball .report-card");
  const btn = dom.bbDownloadCurrentPageBtn;

  if (typeof html2canvas !== "function") {
    window.alert("Image export isn't available right now — check your internet connection and try again.");
    return;
  }

  const page = state.bbReportPage;
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Generating…";

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  window.scrollTo(0, 0);

  try {
    const canvas = await captureBbReportPage(target, page);
    const pageNumber = page.replace("page", "");
    downloadCanvasAsPng(canvas, `basketball-report-page${pageNumber}-${state.bbViewingDateKey}.png`);
  } catch (err) {
    console.error("Could not generate basketball report image:", err);
    window.alert("Something went wrong generating the image. Please try again.");
  } finally {
    window.scrollTo(scrollX, scrollY);
    btn.textContent = originalLabel;
    btn.disabled = false;
  }
}

/* ---- Report Mode rendering ---- */

// Fills in a page's label (shown on the page itself) and its tab subtitle
// (shown in the tab strip) from the actual current roster counts, so these
// never go stale the way hardcoded HTML text would when players are
// added/removed. Also stamps the page with the attendance date it belongs
// to (as a small badge) so a page printed and handed out on its own never
// gets mixed up with a different day's sheet.
function setReportPageMeta(labelTextEl, labelDateEl, subEl, groupName, startNum, endNum, dateText) {
  const range = endNum < startNum ? "—" : startNum === endNum ? `${startNum}` : `${startNum}–${endNum}`;
  labelTextEl.textContent = `${groupName} · Players ${range}`;
  labelDateEl.textContent = dateText;
  subEl.textContent = ` (${groupName} ${range})`;
}

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

  // Whole-roster present counts per gender (not just this page's half) —
  // the header next to "Girls Attendance" / "Boys Attendance" shows this,
  // e.g. "8/26", so it always reflects the full team regardless of which
  // page you're looking at.
  const girlsPresentTotal = girls.filter((p) => record[p.id] && record[p.id].present).length;
  const boysPresentTotal = boys.filter((p) => record[p.id] && record[p.id].present).length;

  // FOUR pages total, one gender-half per page (Page 1: Girls A, Page 2:
  // Girls B, Page 3: Boys A, Page 4: Boys B) — each a single full-width
  // list rather than two half-width columns, so rows print big and legible
  // on long bond paper.
  const girlsHalf = Math.ceil(girls.length / 2);
  const boysHalf = Math.ceil(boys.length / 2);

  const girlsP1 = girls.slice(0, girlsHalf);
  const girlsP2 = girls.slice(girlsHalf);
  const boysP1 = boys.slice(0, boysHalf);
  const boysP2 = boys.slice(boysHalf);

  renderReportHalf(girlsP1, record, dom.reportGirlsListP1, dom.reportGirlsCountP1, 0, girlsPresentTotal, girls.length);
  renderReportHalf(girlsP2, record, dom.reportGirlsListP2, dom.reportGirlsCountP2, girlsHalf, girlsPresentTotal, girls.length);
  renderReportHalf(boysP1, record, dom.reportBoysListP1, dom.reportBoysCountP1, 0, boysPresentTotal, boys.length);
  renderReportHalf(boysP2, record, dom.reportBoysListP2, dom.reportBoysCountP2, boysHalf, boysPresentTotal, boys.length);

  const pageDateText = formatDateShort(viewingDate);
  setReportPageMeta(dom.reportPageLabelP1Text, dom.reportPageLabelP1Date, dom.reportTabSubP1, "Girls", 1, girlsP1.length, pageDateText);
  setReportPageMeta(dom.reportPageLabelP2Text, dom.reportPageLabelP2Date, dom.reportTabSubP2, "Girls", girlsHalf + 1, girls.length, pageDateText);
  setReportPageMeta(dom.reportPageLabelP3Text, dom.reportPageLabelP3Date, dom.reportTabSubP3, "Boys", 1, boysP1.length, pageDateText);
  setReportPageMeta(dom.reportPageLabelP4Text, dom.reportPageLabelP4Date, dom.reportTabSubP4, "Boys", boysHalf + 1, boys.length, pageDateText);
}

// Renders one gender's half-list into one page, with row numbers continuing
// on from the first half (e.g. Page 2 starts at 14, not back at 1). The
// count shown next to the group heading is the WHOLE team's present count
// (wholePresent/wholeTotal, e.g. "8/26") — the same on both pages — not
// just how many of this half are present, since that's what's actually
// useful to see at a glance.
function renderReportHalf(players, record, listEl, countEl, startIndex, wholePresent, wholeTotal) {
  countEl.textContent = `${wholePresent}/${wholeTotal}`;
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
// the first half left off (e.g. 1–26 on Page 1, 27–52 on Page 2), since
// "players" here is already just that page's slice of the full list. Each
// row is tinted gold (girls) or blue (boys) via its "gender-*" class so
// gender reads at a glance without needing separate sections.
function buildReportRows(players, record, startIndex = 0) {
  return players
    .map((p, index) => {
      const entry = record[p.id];
      const isPresent = !!(entry && entry.present);
      const { time, meridiem } = isPresent ? splitTimestampForReport(entry.timestamp) : { time: "", meridiem: "" };
      const genderClass = p.gender === "Girl" ? "gender-girl" : "gender-boy";

      return `
        <div class="report-row ${genderClass} ${isPresent ? "present" : ""}">
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
// built straight from a roster so it always matches the real data.
function buildGradeSectionMap(roster) {
  const map = {};
  roster.forEach((p) => {
    if (!map[p.grade]) map[p.grade] = new Set();
    map[p.grade].add(p.section);
  });
  const sorted = {};
  Object.keys(map).sort((a, b) => a - b).forEach((grade) => {
    sorted[grade] = [...map[grade]].sort((a, b) => a.localeCompare(b));
  });
  return sorted;
}

const GRADE_SECTION_MAP = buildGradeSectionMap(ROSTER);

// Same idea as GRADE_SECTION_MAP above, but one per sport, so the Player
// Information filters always show grades/sections that actually exist for
// whichever sport is currently selected there.
const GRADE_SECTION_MAPS_BY_SPORT = {
  volleyball: GRADE_SECTION_MAP,
  basketball: buildGradeSectionMap(ROSTER_BASKETBALL),
};

function getGradeSectionMapForSport(sport) {
  return GRADE_SECTION_MAPS_BY_SPORT[sport] || {};
}

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

// Populate the Player Information Grade dropdown for whichever sport is
// currently selected there, then keep Section in sync with it. Called every
// time the PI sport dropdown changes, since different sports have different
// grades/sections in their rosters.
function populatePiFilterOptions(sport) {
  const map = getGradeSectionMapForSport(sport);
  dom.piGradeFilter.innerHTML = '<option value="all">All Grades</option>';

  Object.keys(map).forEach((grade) => {
    const opt = document.createElement("option");
    opt.value = grade;
    opt.textContent = `Grade ${grade}`;
    dom.piGradeFilter.appendChild(opt);
  });

  populatePiSectionOptions(sport, "all");
}

function populatePiSectionOptions(sport, gradeValue) {
  dom.piSectionFilter.innerHTML = '<option value="all">All Sections</option>';

  const roster = getRosterForSport(sport);
  const map = getGradeSectionMapForSport(sport);

  const sections = gradeValue === "all"
    ? [...new Set(roster.map((p) => p.section))].sort((a, b) => a.localeCompare(b))
    : (map[gradeValue] || []);

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

// Dates (as a Set of "YYYY-MM-DD" keys) where at least one player FROM THIS
// ROSTER was marked present — scoped per sport, so a volleyball training
// day doesn't count as one for basketball, and vice versa. Shared by the
// season-stats calculator and the calendar's "highlight training days"
// feature below.
function getTrainingDateSet(roster) {
  const allRecords = getAllRecords();
  const rosterIds = new Set(roster.map((p) => p.id));
  return new Set(
    Object.keys(allRecords).filter((date) =>
      Object.entries(allRecords[date]).some(([playerId, entry]) => rosterIds.has(playerId) && entry && entry.present)
    )
  );
}

function computeAllSeasonStats(roster = ROSTER) {
  const allRecords = getAllRecords();
  const trainingDates = getTrainingDateSet(roster);

  const stats = {};

  roster.forEach((p) => {
    let present = 0;
    trainingDates.forEach((date) => {
      if (allRecords[date][p.id] && allRecords[date][p.id].present) present += 1;
    });
    stats[p.id] = {
      present: present,
      absent: trainingDates.size - present,
      trainings: trainingDates.size,
    };
  });

  return stats;
}

/* ==========================================================================
   10b. CALENDAR — date picker with training days highlighted
   Native <input type="date"> calendars are rendered by the OS/browser and
   can't be styled or annotated from the page — there's no way to put a dot
   on specific dates inside one. This is a small custom calendar that opens
   on top of it instead: picking a day here just sets the native input's
   value and fires a "change" event, so every existing date-handling
   function keeps working untouched. One config per sport, since each has
   its own date field and its own roster's training days.
   ========================================================================== */

const calendarConfigs = {
  volleyball: {
    wrap: () => dom.dateWrap,
    trigger: () => dom.calendarTriggerBtn,
    overlay: () => dom.calendarPopover,
    prevBtn: () => dom.calendarPrevBtn,
    nextBtn: () => dom.calendarNextBtn,
    monthLabel: () => dom.calendarMonthLabel,
    daysEl: () => dom.calendarDays,
    closeBtn: () => dom.calendarCloseBtn,
    dateInput: () => dom.dateSelect,
    roster: () => ROSTER,
    getViewingDateKey: () => state.viewingDateKey,
    viewMonth: null,
  },
  basketball: {
    wrap: () => dom.bbDateWrap,
    trigger: () => dom.bbCalendarTriggerBtn,
    overlay: () => dom.bbCalendarPopover,
    prevBtn: () => dom.bbCalendarPrevBtn,
    nextBtn: () => dom.bbCalendarNextBtn,
    monthLabel: () => dom.bbCalendarMonthLabel,
    daysEl: () => dom.bbCalendarDays,
    closeBtn: () => dom.bbCalendarCloseBtn,
    dateInput: () => dom.bbDateSelect,
    roster: () => ROSTER_BASKETBALL,
    getViewingDateKey: () => state.bbViewingDateKey,
    viewMonth: null,
  },
};

function openCalendar(key) {
  const cfg = calendarConfigs[key];
  const viewingDateKey = cfg.getViewingDateKey();
  cfg.viewMonth = new Date(viewingDateKey + "T00:00:00");
  cfg.viewMonth.setDate(1);
  renderCalendar(key);
  cfg.overlay().classList.remove("hidden");
}

function closeCalendar(key) {
  calendarConfigs[key].overlay().classList.add("hidden");
}

function renderCalendar(key) {
  const cfg = calendarConfigs[key];
  const monthDate = cfg.viewMonth;
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  cfg.monthLabel().textContent = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const trainingDates = getTrainingDateSet(cfg.roster());
  const selectedKey = cfg.getViewingDateKey();
  const todayK = todayKey();

  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = "";
  for (let i = 0; i < firstWeekday; i++) {
    html += `<span class="calendar-day calendar-day-empty"></span>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dKey = toDateKey(new Date(year, month, d));
    const isFuture = dKey > todayK;
    const classes = ["calendar-day"];
    if (dKey === todayK) classes.push("is-today");
    if (dKey === selectedKey) classes.push("is-selected");
    if (trainingDates.has(dKey)) classes.push("has-training");

    html += `<button type="button" class="${classes.join(" ")}" data-date="${dKey}" ${isFuture ? "disabled" : ""}>${d}</button>`;
  }

  cfg.daysEl().innerHTML = html;

  // Can't navigate into future months.
  const now = new Date();
  cfg.nextBtn().disabled = year === now.getFullYear() && month === now.getMonth();
}

function onCalendarDaysClick(key, e) {
  const btn = e.target.closest(".calendar-day");
  if (!btn || btn.disabled || !btn.dataset.date) return;

  const input = calendarConfigs[key].dateInput();
  input.value = btn.dataset.date;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  closeCalendar(key);
}

function bindCalendarEvents(key) {
  const cfg = calendarConfigs[key];

  // Anywhere in the date field opens the custom calendar — the button click
  // bubbles up to this same listener, so there's only one date picker in
  // the whole app, not a native one AND a custom one.
  cfg.wrap().addEventListener("click", () => openCalendar(key));

  cfg.closeBtn().addEventListener("click", () => closeCalendar(key));
  cfg.overlay().addEventListener("click", (e) => {
    if (e.target === cfg.overlay()) closeCalendar(key); // click on backdrop closes it
  });
  cfg.prevBtn().addEventListener("click", () => {
    cfg.viewMonth.setMonth(cfg.viewMonth.getMonth() - 1);
    renderCalendar(key);
  });
  cfg.nextBtn().addEventListener("click", () => {
    cfg.viewMonth.setMonth(cfg.viewMonth.getMonth() + 1);
    renderCalendar(key);
  });
  cfg.daysEl().addEventListener("click", (e) => onCalendarDaysClick(key, e));
}

/* ==========================================================================
   11. COACH LOCK / UNLOCK
   The site loads locked by default so visitors can only view. Entering the
   coach password unlocks marking attendance today AND editing/correcting
   past, otherwise read-only, attendance sheets. It re-locks on refresh.
   ========================================================================== */

// Currently-pending submit handler for the password modal. Set by
// showPasswordPrompt(), called by handlePasswordModalSubmit(), and cleared
// once the modal closes (success or cancel).
let passwordModalSubmitHandler = null;

// Styled stand-in for window.prompt(), shared by coach lock/unlock and the
// hidden time editor's access code screen. onSubmit receives the entered
// text and should return true to close the modal, or false/falsy to show
// an inline "incorrect" error and let the person try again.
function showPasswordPrompt({ title, message, buttonLabel = "Unlock", icon = "🔒", onSubmit }) {
  dom.passwordModalIcon.textContent = icon;
  dom.passwordModalTitle.textContent = title;
  dom.passwordModalMessage.textContent = message;
  dom.passwordModalOkBtn.textContent = buttonLabel;
  dom.passwordModalInput.value = "";
  dom.passwordModalError.classList.add("hidden");
  dom.passwordModalOverlay.classList.remove("hidden");
  passwordModalSubmitHandler = onSubmit;
  setTimeout(() => dom.passwordModalInput.focus(), 50);
}

function closePasswordPrompt() {
  dom.passwordModalOverlay.classList.add("hidden");
  passwordModalSubmitHandler = null;
}

function handlePasswordModalSubmit(e) {
  e.preventDefault();
  if (!passwordModalSubmitHandler) return;

  const value = dom.passwordModalInput.value;
  const ok = passwordModalSubmitHandler(value);

  if (ok) {
    closePasswordPrompt();
    return;
  }

  dom.passwordModalError.classList.remove("hidden");
  dom.passwordModalInput.value = "";
  dom.passwordModalInput.focus();
  dom.passwordModal.classList.remove("shake");
  void dom.passwordModal.offsetWidth; // restart the shake animation
  dom.passwordModal.classList.add("shake");
}

function bindPasswordModalEvents() {
  dom.passwordModalForm.addEventListener("submit", handlePasswordModalSubmit);
  dom.passwordModalCancelBtn.addEventListener("click", closePasswordPrompt);
  dom.passwordModalOverlay.addEventListener("click", (e) => {
    if (e.target === dom.passwordModalOverlay) closePasswordPrompt();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dom.passwordModalOverlay.classList.contains("hidden")) {
      closePasswordPrompt();
    }
  });
}

function updateLockButton() {
  const buttons = [dom.lockToggleBtn, dom.bbLockToggleBtn];
  buttons.forEach((btn) => {
    if (state.unlocked) {
      btn.textContent = "🔓 Unlocked (Coach)";
      btn.classList.remove("locked");
      btn.classList.add("unlocked");
    } else {
      btn.textContent = "🔒 Locked";
      btn.classList.remove("unlocked");
      btn.classList.add("locked");
    }
  });
}

function toggleLock() {
  if (state.unlocked) {
    // Re-locking never requires a password.
    state.unlocked = false;
    updateLockButton();
    refreshAll();
    return;
  }

  showPasswordPrompt({
    title: "Coach Access",
    message: "Enter the coach password to unlock editing.",
    buttonLabel: "Unlock",
    icon: "🔒",
    onSubmit: (entered) => {
      if (entered === COACH_PASSWORD) {
        state.unlocked = true;
        updateLockButton();
        refreshAll();
        return true;
      }
      return false;
    },
  });
}

/* ==========================================================================
   12. PLAYER INFORMATION TAB
   Gated by a sport filter: nothing shows until a sport is chosen. Only
   Volleyball has real roster + attendance data right now.
   ========================================================================== */

function onPiSportChange(e) {
  state.piSport = e.target.value;
  state.piGenderFilter = "all";
  state.piGradeFilter = "all";
  state.piSectionFilter = "all";
  populatePiFilterOptions(state.piSport);
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
  populatePiSectionOptions(state.piSport, state.piGradeFilter);
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

  const roster = getRosterForSport(sport);

  if (roster.length === 0) {
    const labels = { athletics: "Athletics", dance: "Cultural Dance Group" };
    dom.piPlaceholder.classList.add("hidden");
    dom.piSearchWrap.classList.add("hidden");
    dom.piFiltersRow.classList.add("hidden");
    dom.piListWrap.classList.add("hidden");
    dom.piEmptySport.textContent = `No player data yet for ${labels[sport] || sport} — it doesn't have a roster or attendance sheet set up.`;
    dom.piEmptySport.classList.remove("hidden");
    return;
  }

  // This sport has a roster (volleyball, basketball, ...): show the
  // searchable, filterable list with season totals.
  dom.piPlaceholder.classList.add("hidden");
  dom.piEmptySport.classList.add("hidden");
  dom.piSearchWrap.classList.remove("hidden");
  dom.piFiltersRow.classList.remove("hidden");
  dom.piListWrap.classList.remove("hidden");

  const seasonStats = computeAllSeasonStats(roster);
  const term = state.piSearchTerm.toLowerCase();
  const players = roster
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

// Show only the chosen page (Page 1–4) on screen — each page is now a
// single full-width gender-half list. The header, total counts, and legend
// only appear on Page 1; Pages 2–4 go straight into the player list so
// every page is as full of players as possible when printed. The download
// always produces four separate images, one per page, regardless of which
// one is currently showing (see downloadReportImage).
function switchReportPage(page) {
  state.reportPage = page;
  const isPageOne = page === "page1";

  dom.reportHeader.classList.toggle("hidden", !isPageOne);
  dom.reportTotals.classList.toggle("hidden", !isPageOne);
  dom.reportLegend.classList.toggle("hidden", !isPageOne);

  dom.reportPageOne.classList.toggle("hidden", page !== "page1");
  dom.reportPageTwo.classList.toggle("hidden", page !== "page2");
  dom.reportPageThree.classList.toggle("hidden", page !== "page3");
  dom.reportPageFour.classList.toggle("hidden", page !== "page4");

  dom.reportPageTabs.querySelectorAll(".report-page-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });
}

function onReportPageTabClick(e) {
  const btn = e.target.closest(".report-page-tab");
  if (!btn) return;
  switchReportPage(btn.dataset.page);
}

// Capture just ONE report page (page1–page4) as its own canvas. Everything
// outside the report card — sticky nav, action buttons, the page tabs — is
// hidden in the cloned document so it can never bleed into the image, and
// only the requested page is shown while the others stay hidden.
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

      // Header, totals, and legend only belong on Page 1 — every other
      // page goes straight into the player list to maximize how many
      // players fit on each printed sheet.
      const isPageOne = page === "page1";
      const header = clonedDoc.querySelector("#reportHeader");
      const totals = clonedDoc.querySelector("#reportTotals");
      const legend = clonedDoc.querySelector("#reportLegend");
      if (header) header.classList.toggle("hidden", !isPageOne);
      if (totals) totals.classList.toggle("hidden", !isPageOne);
      if (legend) legend.classList.toggle("hidden", !isPageOne);

      ["reportPageOne", "reportPageTwo", "reportPageThree", "reportPageFour"].forEach((id, i) => {
        const el = clonedDoc.querySelector(`#${id}`);
        if (el) el.classList.toggle("hidden", page !== `page${i + 1}`);
      });
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

// One click of the download button produces FOUR separate PNGs — one photo
// per page — regardless of which page happens to be showing on screen. The
// coach never has to switch tabs and download four times by hand.
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
    for (let i = 1; i <= 4; i++) {
      btn.textContent = `Generating page ${i} of 4…`;
      const canvas = await captureReportPage(target, `page${i}`);
      downloadCanvasAsPng(canvas, `attendance-report-page${i}-${state.viewingDateKey}.png`);
      if (i < 4) await wait(400);
    }
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

// Downloads just whichever single page is currently showing on screen —
// for when the coach only needs to reprint one page instead of all four.
async function downloadCurrentReportPage() {
  const target = document.querySelector(".report-card");
  const btn = dom.downloadCurrentPageBtn;

  if (typeof html2canvas !== "function") {
    window.alert("Image export isn't available right now — check your internet connection and try again.");
    return;
  }

  const page = state.reportPage;
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Generating…";

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  window.scrollTo(0, 0);

  try {
    const canvas = await captureReportPage(target, page);
    const pageNumber = page.replace("page", "");
    downloadCanvasAsPng(canvas, `attendance-report-page${pageNumber}-${state.viewingDateKey}.png`);
  } catch (err) {
    console.error("Could not generate report image:", err);
    window.alert("Something went wrong generating the image. Please try again.");
  } finally {
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

  updateBbStats();
  updateBbHistoryBanner();
  if (state.bbReportMode) {
    renderBbReport();
  } else {
    renderBbGrid();
  }

  if (state.activePage === "playerinfo") {
    renderPlayerInfo();
  }
}

/* ==========================================================================
   14b. SECRET TIMESTAMP EDITOR
   Hidden on purpose: there is no visible button or menu entry anywhere in
   the UI for this. It's reached only by clicking the volleyball emoji next
   to the page title 7 times in a row (within ~2 seconds), and it asks for
   its OWN password (TIME_EDIT_PASSWORD, defined in section 2b) — separate
   from the coach lock password and independent of whether the app is
   currently locked or unlocked. Once unlocked, it opens a small modal
   where you can add one or many players (from any sport) and set their
   attendance time for any date, past or present.
   ========================================================================== */

let secretClickCount = 0;
let secretClickResetTimer = null;
const SECRET_CLICKS_REQUIRED = 7;
const SECRET_CLICK_WINDOW_MS = 2000;

// Players currently added to the editor, in the order they were picked.
// Order matters: it's the stacking order used by "Apply to all".
let secretEditorPlayers = [];

// Which sport + gender the browsable player list is currently showing.
let secretBrowseSport = "volleyball";
let secretBrowseGender = "Boy";

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
  showPasswordPrompt({
    title: "Time Editor Access",
    message: "Enter the access code to edit attendance times.",
    buttonLabel: "Continue",
    icon: "🕒",
    onSubmit: (code) => {
      if (code === TIME_EDIT_PASSWORD) {
        openSecretEditorModal();
        return true;
      }
      return false;
    },
  });
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

// Adds secondsToAdd to a canonical "h:mm:ss AM/PM" time, wrapping correctly
// across the 12-hour boundary (11:59:58 AM + 5s -> 12:00:03 PM, etc.).
function addSecondsToTimeString(timeStr, secondsToAdd) {
  const match = timeStr.match(/^(\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/);
  if (!match) return timeStr;

  let hour12 = parseInt(match[1], 10) % 12; // 12 -> 0 for easy math
  const minute = parseInt(match[2], 10);
  const second = parseInt(match[3], 10);
  const meridiem = match[4];

  let totalSeconds = hour12 * 3600 + minute * 60 + second;
  if (meridiem === "PM") totalSeconds += 12 * 3600;

  totalSeconds = (totalSeconds + secondsToAdd) % (24 * 3600);

  const h24 = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const newMeridiem = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  return `${h12}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${newMeridiem}`;
}

// A random whole number of seconds in [5, 10], inclusive.
function randomStackSeconds() {
  return Math.floor(Math.random() * 6) + 5;
}

// Every player, from every sport, tagged with which sport they belong to —
// used for search and for the sport label shown next to each name.
function getAllPlayersWithSport() {
  return Object.entries(ROSTERS_BY_SPORT).flatMap(([sport, roster]) =>
    roster.map((p) => ({ ...p, sport }))
  );
}

function sportLabel(sport) {
  const labels = { volleyball: "Volleyball", basketball: "Basketball", athletics: "Athletics", dance: "Cultural Dance" };
  return labels[sport] || sport;
}

function openSecretEditorModal() {
  secretEditorPlayers = [];
  secretBrowseSport = "volleyball";
  secretBrowseGender = "Boy";

  dom.secretDateInput.value = state.activePage === "basketball" ? state.bbViewingDateKey : state.viewingDateKey;
  dom.secretCommonTime.value = "";

  dom.secretSportToggle.querySelectorAll(".secret-toggle-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.sport === secretBrowseSport);
  });
  dom.secretGenderToggle.querySelectorAll(".secret-toggle-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.gender === secretBrowseGender);
  });

  renderSecretPlayerList();
  renderSecretBrowseList();
  dom.secretEditorOverlay.classList.remove("hidden");
}

function closeSecretEditorModal() {
  dom.secretEditorOverlay.classList.add("hidden");
  secretEditorPlayers = [];
}

// Look up each added player's current timestamp for whatever date is in
// the date field right now, so the row starts prefilled with reality.
function getSecretDateKey() {
  return dom.secretDateInput.value || todayKey();
}

function renderSecretPlayerList() {
  const dateKey = getSecretDateKey();
  const record = getRecordForDate(dateKey);

  dom.secretEmptyList.classList.toggle("hidden", secretEditorPlayers.length > 0);

  dom.secretPlayerList.innerHTML = secretEditorPlayers
    .map((p) => {
      const entry = record[p.id];
      const existing = entry && entry.present ? entry.timestamp : "";
      return `
        <div class="secret-player-row" data-player-id="${p.id}">
          <span class="secret-player-name">
            ${escapeHtml(p.name)}
            <small>${sportLabel(p.sport)}</small>
          </span>
          <input type="text" class="secret-player-time" value="${escapeHtml(existing)}" placeholder="e.g. 8:45 AM">
          <button class="secret-remove-btn" type="button" data-remove-id="${p.id}" aria-label="Remove">✕</button>
        </div>
      `;
    })
    .join("");
}

function addPlayerToSecretEditor(player) {
  if (secretEditorPlayers.some((p) => p.id === player.id)) return;
  secretEditorPlayers.push(player);
  renderSecretPlayerList();
  renderSecretBrowseList();
}

function removePlayerFromSecretEditor(playerId) {
  secretEditorPlayers = secretEditorPlayers.filter((p) => p.id !== playerId);
  renderSecretPlayerList();
  renderSecretBrowseList();
}

// The full roster for whichever sport + gender toggle is currently active,
// each row showing that player's existing time for the selected date (or
// "Not marked"). Tapping a row adds the player; tapping it again removes
// them — no typing required.
function renderSecretBrowseList() {
  const dateKey = getSecretDateKey();
  const record = getRecordForDate(dateKey);
  const roster = getRosterForSport(secretBrowseSport).filter((p) => p.gender === secretBrowseGender);
  const sorted = [...roster].sort((a, b) => a.name.localeCompare(b.name));

  if (sorted.length === 0) {
    const genderWord = secretBrowseGender === "Girl" ? "girls" : "boys";
    dom.secretBrowseList.innerHTML = `<p class="secret-browse-empty">No ${genderWord} on this roster.</p>`;
    return;
  }

  dom.secretBrowseList.innerHTML = sorted
    .map((p) => {
      const entry = record[p.id];
      const isSelected = secretEditorPlayers.some((sp) => sp.id === p.id);
      const timeLabel = entry && entry.present ? entry.timestamp : "Not marked";
      return `
        <div class="secret-browse-row ${isSelected ? "selected" : ""}" data-player-id="${p.id}">
          <span class="secret-browse-row-name">${isSelected ? "✓ " : ""}${escapeHtml(p.name)}</span>
          <span class="secret-browse-row-time">${timeLabel}</span>
        </div>
      `;
    })
    .join("");
}

function onSecretBrowseListClick(e) {
  const row = e.target.closest(".secret-browse-row");
  if (!row || !row.dataset.playerId) return;

  const playerId = row.dataset.playerId;
  if (secretEditorPlayers.some((p) => p.id === playerId)) {
    removePlayerFromSecretEditor(playerId);
    return;
  }

  const player = getRosterForSport(secretBrowseSport).find((p) => p.id === playerId);
  if (!player) return;
  addPlayerToSecretEditor({ ...player, sport: secretBrowseSport });
}

function onSecretSportToggleClick(e) {
  const btn = e.target.closest(".secret-toggle-btn");
  if (!btn || !btn.dataset.sport) return;

  secretBrowseSport = btn.dataset.sport;
  dom.secretSportToggle.querySelectorAll(".secret-toggle-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.sport === secretBrowseSport);
  });
  renderSecretBrowseList();
}

function onSecretGenderToggleClick(e) {
  const btn = e.target.closest(".secret-toggle-btn");
  if (!btn || !btn.dataset.gender) return;

  secretBrowseGender = btn.dataset.gender;
  dom.secretGenderToggle.querySelectorAll(".secret-toggle-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.gender === secretBrowseGender);
  });
  renderSecretBrowseList();
}

function onSecretPlayerListClick(e) {
  const btn = e.target.closest(".secret-remove-btn");
  if (!btn) return;
  removePlayerFromSecretEditor(btn.dataset.removeId);
}

function onSecretDateChange() {
  renderSecretPlayerList();
  renderSecretBrowseList();
}

// The stacking rule: the first player added gets exactly the typed time.
// Each player after that gets the PREVIOUS player's (already-stacked) time
// plus a fresh random 5–10 seconds — so typing one common time never
// produces two identical timestamps.
function onSecretApplyCommonBtnClick() {
  const normalized = normalizeTimeInput(dom.secretCommonTime.value);
  if (!normalized) {
    window.alert("Couldn't understand that time — use a format like 8:45 AM.");
    return;
  }
  if (secretEditorPlayers.length === 0) {
    window.alert("Add at least one player first.");
    return;
  }

  const rows = dom.secretPlayerList.querySelectorAll(".secret-player-row");
  let runningTime = normalized;

  secretEditorPlayers.forEach((p, index) => {
    if (index > 0) {
      runningTime = addSecondsToTimeString(runningTime, randomStackSeconds());
    }
    const row = [...rows].find((r) => r.dataset.playerId === p.id);
    if (row) {
      row.querySelector(".secret-player-time").value = runningTime;
    }
  });
}

async function onSecretSaveBtnClick() {
  const dateKey = getSecretDateKey();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    window.alert("That doesn't look like a valid date.");
    return;
  }
  if (secretEditorPlayers.length === 0) {
    window.alert("Add at least one player first.");
    return;
  }

  const rows = dom.secretPlayerList.querySelectorAll(".secret-player-row");
  const updates = [];

  for (const row of rows) {
    const playerId = row.dataset.playerId;
    const raw = row.querySelector(".secret-player-time").value;
    const normalized = normalizeTimeInput(raw);
    if (!normalized) {
      const player = secretEditorPlayers.find((p) => p.id === playerId);
      window.alert(`Couldn't understand the time for ${player ? player.name : playerId} — use a format like 8:45 AM.`);
      return;
    }
    updates.push({ playerId, time: normalized });
  }

  const btn = dom.secretSaveBtn;
  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    for (const u of updates) {
      await setPlayerAttendance(dateKey, u.playerId, true, u.time);
    }
    refreshAll();
    closeSecretEditorModal();
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

function bindSecretEditorModalEvents() {
  dom.secretCloseBtn.addEventListener("click", closeSecretEditorModal);
  dom.secretCancelBtn.addEventListener("click", closeSecretEditorModal);
  dom.secretBrowseList.addEventListener("click", onSecretBrowseListClick);
  dom.secretSportToggle.addEventListener("click", onSecretSportToggleClick);
  dom.secretGenderToggle.addEventListener("click", onSecretGenderToggleClick);
  dom.secretPlayerList.addEventListener("click", onSecretPlayerListClick);
  dom.secretDateInput.addEventListener("change", onSecretDateChange);
  dom.secretApplyCommonBtn.addEventListener("click", onSecretApplyCommonBtnClick);
  dom.secretSaveBtn.addEventListener("click", onSecretSaveBtnClick);
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
  dom.downloadCurrentPageBtn.addEventListener("click", downloadCurrentReportPage);
  dom.reportPageTabs.addEventListener("click", onReportPageTabClick);

  dom.piSportSelect.addEventListener("change", onPiSportChange);
  dom.piSearchInput.addEventListener("input", onPiSearchInput);
  dom.piGenderFilter.addEventListener("change", onPiGenderFilterChange);
  dom.piGradeFilter.addEventListener("change", onPiGradeFilterChange);
  dom.piSectionFilter.addEventListener("change", onPiSectionFilterChange);

  dom.bbStudentGrid.addEventListener("click", onBbGridClick);
  dom.bbSearchInput.addEventListener("input", onBbSearchInput);
  dom.bbGradeFilter.addEventListener("change", onBbGradeFilterChange);
  dom.bbSectionFilter.addEventListener("change", onBbSectionFilterChange);
  dom.bbSortSelect.addEventListener("change", onBbSortChange);
  dom.bbDateSelect.addEventListener("change", onBbDateSelectChange);
  dom.bbBackToTodayBtn.addEventListener("click", onBbBackToToday);
  dom.bbLockToggleBtn.addEventListener("click", toggleLock);
  dom.bbReportModeBtn.addEventListener("click", enterBbReportMode);
  dom.bbExitReportBtn.addEventListener("click", exitBbReportMode);
  dom.bbDownloadReportBtn.addEventListener("click", downloadBbReportImage);
  dom.bbDownloadCurrentPageBtn.addEventListener("click", downloadCurrentBbReportPage);
  dom.bbReportPageTabs.addEventListener("click", onBbReportPageTabClick);

  bindSecretTimeEditorTrigger();
  bindSecretEditorModalEvents();
  bindPasswordModalEvents();

  bindCalendarEvents("volleyball");
  bindCalendarEvents("basketball");
}

async function init() {
  state.lastKnownToday = todayKey();

  populateFilterOptions();
  populateBbFilterOptions();
  // Player Information's grade/section options are populated per-sport,
  // once a sport is actually chosen there (see onPiSportChange).

  dom.dateSelect.max = state.lastKnownToday;
  dom.dateSelect.value = state.viewingDateKey;
  dom.bbDateSelect.max = state.lastKnownToday;
  dom.bbDateSelect.value = state.bbViewingDateKey;

  updateLockButton();
  bindEvents();
  updateClock();

  // Show a lightweight loading state while the initial fetch from
  // Supabase is in flight, so the grid doesn't briefly flash "all absent".
  dom.studentGrid.innerHTML = '<p class="empty-state">Loading attendance data…</p>';
  dom.bbStudentGrid.innerHTML = '<p class="empty-state">Loading attendance data…</p>';

  await loadAllRecordsFromSupabase();
  refreshAll();

  // Stay in sync with every other device from now on.
  subscribeToRealtimeUpdates();

  // Live clock, ticking every second; also drives midnight rollover checks.
  setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", init);
