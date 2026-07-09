

/* ==========================================================================
   VOLLEYBALL TRAINING ATTENDANCE — STYLESHEET
   Design tokens: navy court blue + volleyball gold, scoreboard accents.
   ========================================================================== */

:root {
  /* --- Color tokens --- */
  --navy: #0F2A47;
  --navy-light: #173A5E;
  --navy-lighter: #21496F;
  --blue: #1E56A0;
  --blue-light: #EAF1FB;
  --gold: #F2B705;
  --gold-dark: #C99A04;
  --gold-soft: #FDF3D4;
  --bg: #F5F6F8;
  --card-bg: #FFFFFF;
  --ink: #16233A;
  --ink-soft: #4B5D75;
  --gray: #718096;
  --gray-light: #E3E7ED;
  --success: #1C7C3C;
  --success-bg: #E5F5EA;
  --danger: #C23B3B;
  --danger-bg: #FBEAEA;

  /* --- Type --- */
  --font-display: 'Barlow Condensed', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* --- Shape / shadow --- */
  --radius-lg: 18px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --shadow-card: 0 1px 2px rgba(15, 42, 71, 0.06), 0 6px 16px rgba(15, 42, 71, 0.08);
  --shadow-header: 0 8px 24px rgba(15, 42, 71, 0.18);
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 0 48px;
}

/* ==========================================================================
   MAIN NAVIGATION — sport tabs + player information
   ========================================================================== */

.main-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--navy);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  flex-wrap: wrap;
}

.nav-sports {
  display: flex;
  flex-wrap: wrap;
}

.nav-btn {
  background: transparent;
  border: none;
  color: #C9D6E8;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.nav-btn:hover {
  color: #fff;
}

.nav-btn.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

.nav-player-info {
  margin-left: auto;
}

button, select, input {
  font-family: inherit;
}

button:focus-visible,
select:focus-visible,
input:focus-visible {
  outline: 3px solid var(--gold);
  outline-offset: 2px;
}

/* ==========================================================================
   HEADER
   ========================================================================== */

.app-header {
  background: linear-gradient(160deg, var(--navy) 0%, var(--navy-light) 100%);
  color: #fff;
  padding: 22px 24px 20px;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  box-shadow: var(--shadow-header);
}

.header-top {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 18px;
}

.app-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 28px;
  letter-spacing: 0.3px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ball {
  font-size: 26px;
}

.datetime {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-family: var(--font-mono);
  color: var(--gold-soft);
}

.current-date {
  font-size: 13px;
  color: #C9D6E8;
  letter-spacing: 0.3px;
}

.current-time {
  font-size: 17px;
  font-weight: 600;
  color: var(--gold);
  letter-spacing: 0.5px;
}

/* --- Scoreboard stat bar --- */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(242, 183, 5, 0.25);
  border-radius: var(--radius-md);
  padding: 12px 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 84px;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 26px;
  font-weight: 600;
  color: var(--gold);
  line-height: 1.1;
}

.stat-present .stat-value {
  color: #6FE39C;
}

.stat-absent .stat-value {
  color: #F08A8A;
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #B9C6DA;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  align-self: stretch;
  background: rgba(255, 255, 255, 0.15);
}

.filter-summary {
  text-align: center;
  color: #B9C6DA;
  font-size: 12.5px;
  margin: 10px 0 0;
  letter-spacing: 0.2px;
}

/* ==========================================================================
   HISTORY BANNER (read-only past dates)
   ========================================================================== */

.history-banner {
  margin: 16px 24px 0;
  background: var(--gold-soft);
  border: 1px solid #EAD48A;
  color: #6B5300;
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.btn-link {
  background: none;
  border: none;
  color: var(--navy);
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
  padding: 4px;
}

/* ==========================================================================
   CONTROLS
   ========================================================================== */

.controls {
  padding: 18px 24px 4px;
}

.controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.search-wrap {
  position: relative;
  flex: 1 1 220px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  opacity: 0.5;
}

#searchInput {
  width: 100%;
  padding: 11px 14px 11px 38px;
  border: 1px solid var(--gray-light);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--card-bg);
  color: var(--ink);
}

.date-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card-bg);
  border: 1px solid var(--gray-light);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
}

.date-label {
  font-size: 12px;
  color: var(--gray);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

#dateSelect {
  border: none;
  font-size: 14px;
  color: var(--ink);
  background: transparent;
}

select {
  padding: 10px 12px;
  border: 1px solid var(--gray-light);
  border-radius: var(--radius-sm);
  background: var(--card-bg);
  font-size: 14px;
  color: var(--ink-soft);
  flex: 1 1 140px;
}

.btn-primary {
  background: var(--gold);
  color: var(--navy);
  border: none;
  font-weight: 700;
  font-size: 14px;
  padding: 11px 20px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, transform 0.1s ease;
}

.btn-primary:hover {
  background: var(--gold-dark);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: var(--navy);
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 14px;
  padding: 11px 20px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--navy-light);
}

/* --- Coach lock toggle --- */
.btn-lock {
  border: none;
  font-weight: 700;
  font-size: 13px;
  padding: 11px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
}

.btn-lock.locked {
  background: var(--gray-light);
  color: var(--ink-soft);
}

.btn-lock.locked:hover {
  background: #D4D9E1;
}

.btn-lock.unlocked {
  background: var(--success);
  color: #fff;
}

.btn-lock.unlocked:hover {
  background: #166030;
}

/* ==========================================================================
   STUDENT GRID + CARDS
   ========================================================================== */

main {
  padding: 12px 24px 0;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.empty-state {
  text-align: center;
  color: var(--gray);
  padding: 40px 10px;
  font-size: 15px;
}

.hidden {
  display: none !important;
}

.student-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 16px 16px 14px 18px;
  position: relative;
  border-left: 5px solid var(--blue);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: box-shadow 0.15s ease;
}

.student-card.gender-girl {
  border-left-color: var(--gold);
}

.student-card.is-present {
  background: linear-gradient(180deg, var(--success-bg) 0%, var(--card-bg) 60px);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.card-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 19px;
  color: var(--ink);
  line-height: 1.2;
}

.status-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid var(--gray-light);
  background: #fff;
  flex-shrink: 0;
  margin-top: 4px;
}

.student-card.is-present .status-dot {
  background: var(--success);
  border-color: var(--success);
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  font-size: 12.5px;
  color: var(--ink-soft);
}

.card-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag {
  background: var(--blue-light);
  color: var(--blue);
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 11.5px;
}

.tag.tag-girl {
  background: var(--gold-soft);
  color: var(--gold-dark);
}

.card-status-row {
  margin-top: 2px;
  padding-top: 10px;
  border-top: 1px dashed var(--gray-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.status-text {
  font-weight: 700;
  font-size: 13.5px;
  color: var(--gray);
}

.status-text.present {
  color: var(--success);
}

.status-timestamp {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-soft);
}

.btn-present {
  border: none;
  border-radius: var(--radius-sm);
  padding: 10px 16px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  background: var(--navy);
  color: #fff;
  white-space: nowrap;
  transition: background 0.15s ease, transform 0.1s ease;
}

.btn-present:hover {
  background: var(--navy-light);
}

.btn-present:active {
  transform: scale(0.97);
}

.btn-present.marked {
  background: var(--success);
}

.btn-present.marked:hover {
  background: #166030;
}

.readonly-note {
  font-size: 11.5px;
  color: var(--gray);
  font-style: italic;
}

/* --- Season-long per-player counter --- */
.season-counter {
  display: flex;
  gap: 10px;
  font-size: 11.5px;
  color: var(--ink-soft);
  padding-top: 8px;
  border-top: 1px dashed var(--gray-light);
  font-family: var(--font-mono);
}

.season-counter .sc-present {
  color: var(--success);
  font-weight: 600;
}

.season-counter .sc-absent {
  color: var(--danger);
  font-weight: 600;
}

/* ==========================================================================
   PLACEHOLDER SPORT PAGES
   ========================================================================== */

.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 24px;
}

.placeholder-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 48px 40px;
  text-align: center;
  max-width: 420px;
}

.placeholder-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 14px;
}

.placeholder-card h2 {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--navy);
  margin: 0 0 10px;
}

.placeholder-card p {
  color: var(--ink-soft);
  font-size: 14.5px;
  line-height: 1.5;
  margin: 0;
}

/* ==========================================================================
   PLAYER INFORMATION PAGE
   ========================================================================== */

.playerinfo-page {
  padding: 26px 24px 48px;
}

.playerinfo-panel {
  max-width: 900px;
  margin: 0 auto;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 26px 28px 30px;
}

.playerinfo-title {
  font-family: var(--font-display);
  font-size: 26px;
  color: var(--navy);
  margin: 0 0 4px;
}

.playerinfo-sub {
  color: var(--gray);
  font-size: 13.5px;
  margin: 0 0 18px;
}

.pi-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.pi-controls select {
  flex: 0 1 220px;
}

.pi-search-wrap {
  flex: 1 1 220px;
}

.pi-placeholder {
  text-align: center;
  color: var(--gray);
  padding: 30px 10px;
  font-size: 14.5px;
}

.pi-list-wrap {
  border-top: 1px solid var(--gray-light);
  padding-top: 12px;
}

.pi-list-header {
  display: grid;
  grid-template-columns: 2.4fr 1fr 1fr 1.2fr;
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gray);
  padding: 0 12px 8px;
  font-weight: 600;
}

.pi-row {
  display: grid;
  grid-template-columns: 2.4fr 1fr 1fr 1.2fr;
  align-items: center;
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  margin-bottom: 6px;
  font-size: 13.5px;
}

.pi-row-name {
  display: flex;
  flex-direction: column;
}

.pi-row-name strong {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}

.pi-row-name small {
  color: var(--gray);
  font-size: 11.5px;
}

.pi-present {
  color: var(--success);
  font-family: var(--font-mono);
  font-weight: 600;
}

.pi-absent {
  color: var(--danger);
  font-family: var(--font-mono);
  font-weight: 600;
}

.pi-total {
  color: var(--ink-soft);
  font-family: var(--font-mono);
}

/* ==========================================================================
   REPORT MODE
   ========================================================================== */

.report-view {
  padding: 20px 24px 40px;
}

.report-card {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 28px 30px;
  max-width: 900px;
  margin: 0 auto;
}

.report-header {
  text-align: center;
  border-bottom: 2px solid var(--navy);
  padding-bottom: 16px;
  margin-bottom: 20px;
}

.report-title {
  font-family: var(--font-display);
  font-size: 30px;
  color: var(--navy);
  margin: 0 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.report-meta {
  font-family: var(--font-mono);
  color: var(--ink-soft);
  font-size: 14px;
}

.report-meta-dot {
  margin: 0 8px;
  color: var(--gray-light);
}

.report-totals {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 26px;
  flex-wrap: wrap;
}

.report-total-box {
  background: var(--bg);
  border-radius: var(--radius-md);
  padding: 14px 26px;
  text-align: center;
  min-width: 110px;
}

.report-total-value {
  display: block;
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 600;
  color: var(--navy);
}

.report-total-present .report-total-value {
  color: var(--success);
}

.report-total-absent .report-total-value {
  color: var(--danger);
}

.report-total-label {
  font-size: 11.5px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--gray);
}

.report-groups {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.report-group-title {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--navy);
  border-bottom: 1px solid var(--gray-light);
  padding-bottom: 8px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.report-group-count {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--gray);
  font-weight: 400;
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.report-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg);
}

.report-row-index {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--gray);
  min-width: 20px;
  text-align: right;
  flex-shrink: 0;
}

.report-row.present .report-row-index {
  color: var(--success);
}

.report-row.present {
  background: var(--success-bg);
}

.report-row-name {
  font-weight: 600;
  color: var(--ink);
  flex: 1 1 auto;
}

.report-row-time {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-soft);
}

.report-row-status {
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--gray);
}

.report-row.present .report-row-status {
  color: var(--success);
}

.report-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 24px auto 0;
  flex-wrap: wrap;
}

/* ==========================================================================
   RESPONSIVE
   ========================================================================== */

@media (max-width: 720px) {
  .app-title {
    font-size: 22px;
  }

  .stats-bar {
    gap: 10px;
  }

  .stat-item {
    min-width: 70px;
  }

  .stat-value {
    font-size: 21px;
  }

  .controls-row {
    flex-direction: column;
  }

  select {
    flex: 1 1 auto;
    width: 100%;
  }

  .student-grid {
    grid-template-columns: 1fr;
  }

  .btn-present {
    padding: 13px 16px;
    font-size: 14px;
  }

  .report-card {
    padding: 20px 16px;
  }

  .report-groups {
    gap: 12px;
  }

  .report-group-title {
    font-size: 15px;
  }

  .report-row {
    font-size: 11.5px;
    padding: 6px 8px;
    gap: 6px;
  }

  .report-row-time,
  .report-row-status {
    font-size: 10px;
  }

  .report-totals {
    gap: 10px;
  }

  .report-total-box {
    padding: 12px 18px;
    min-width: 90px;
  }

  .nav-btn {
    padding: 12px 10px;
    font-size: 12.5px;
  }

  .nav-player-info {
    margin-left: 0;
  }

  .pi-list-header {
    display: none;
  }

  .pi-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .pi-row span::before {
    content: attr(data-label) ": ";
    color: var(--gray);
    font-family: var(--font-body);
    font-weight: 600;
  }

  .playerinfo-panel {
    padding: 20px 16px;
  }
}

@media (max-width: 420px) {
  .datetime {
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .header-top {
    flex-wrap: nowrap;
  }
}