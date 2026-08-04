/* ==========================================================================
   INTRAMS T-SHIRT ORDERS — completely standalone from script.js/index.html.
   Its own page, its own Supabase table ("tshirt_orders"), its own coach
   password gate. Nothing here reads or writes the "attendance" table, and
   nothing in script.js knows this page exists. Safe to delete this file,
   tshirts.html, and tshirts.css (and the tshirt_orders table) once intrams
   is over, with zero effect on the attendance app.
   ========================================================================== */

// Same coach password concept as the main app — change this if you want a
// different password for this page specifically.
const TSHIRT_PASSWORD = "spike7";

// Whole-school grade/section list for intrams (not tied to any one sport's
// roster) — used to populate the Grade/Section dropdowns in the order form
// and filters.
const GRADE_SECTIONS = {
  "7": ["Aguinaldo", "Magsaysay", "Marcos", "Garcia", "Quezon", "Aquino"],
  "8": ["Exodus", "Psalms", "Corinthians", "Ephesians", "Chronicles", "Colossians", "Hebrews"],
  "9": ["Mabait", "Masipag", "Matapat", "Mapagmahal", "Magalang", "Matipid", "Matatag"],
  "10": ["Halcon", "Banahaw", "Sierra", "Mayon", "Makiling", "Kanlaon", "Pulag"],
  "11": ["Acacia", "Yakal", "ICT Narra", "EPAS Molave"],
  "12": ["Mirasol", "Orkidyas", "Sampaguita", "Rosas"],
};

// Intrams pricing.
const PRINT_ONLY_PRICE = 75;
const SIZE_PRICES = { XS: 150, S: 150, M: 150, L: 170, XL: 170, "2XL": 170 };
const ADDON_PRICES = { none: 0, name: 20, number: 30, both: 50 };
const ADDON_LABELS = { none: null, name: "With Name", number: "With Number", both: "Name & Number" };

const state = {
  unlocked: false,
  searchTerm: "",
  gradeFilter: "all",
  sectionFilter: "all",
  paidFilter: "all",
  sizeFilter: "all",
};

let ordersCache = [];

const dom = {
  currentDate: document.getElementById("currentDate"),
  currentTime: document.getElementById("currentTime"),

  statTotalOrders: document.getElementById("statTotalOrders"),
  statPaid: document.getElementById("statPaid"),
  statUnpaid: document.getElementById("statUnpaid"),
  statAmount: document.getElementById("statAmount"),
  filterSummary: document.getElementById("filterSummary"),

  searchInput: document.getElementById("searchInput"),
  lockToggleBtn: document.getElementById("lockToggleBtn"),
  gradeFilter: document.getElementById("gradeFilter"),
  sectionFilter: document.getElementById("sectionFilter"),
  paidFilter: document.getElementById("paidFilter"),
  sizeFilter: document.getElementById("sizeFilter"),

  orderFormCard: document.getElementById("orderFormCard"),
  orderForm: document.getElementById("orderForm"),
  fieldName: document.getElementById("fieldName"),
  fieldGrade: document.getElementById("fieldGrade"),
  fieldSection: document.getElementById("fieldSection"),
  sectionFieldWrap: document.getElementById("sectionFieldWrap"),
  sizeChoiceRow: document.getElementById("sizeChoiceRow"),
  addonChoiceRow: document.getElementById("addonChoiceRow"),
  fieldAmount: document.getElementById("fieldAmount"),
  fieldAmountGiven: document.getElementById("fieldAmountGiven"),
  changeDisplay: document.getElementById("changeDisplay"),
  changeValue: document.getElementById("changeValue"),
  fieldPaid: document.getElementById("fieldPaid"),
  addOrderBtn: document.getElementById("addOrderBtn"),

  orderListWrap: document.getElementById("orderListWrap"),
  orderList: document.getElementById("orderList"),
  emptyState: document.getElementById("emptyState"),

  passwordModalOverlay: document.getElementById("passwordModalOverlay"),
  passwordModal: document.getElementById("passwordModal"),
  passwordModalMessage: document.getElementById("passwordModalMessage"),
  passwordModalForm: document.getElementById("passwordModalForm"),
  passwordModalInput: document.getElementById("passwordModalInput"),
  passwordModalError: document.getElementById("passwordModalError"),
  passwordModalCancelBtn: document.getElementById("passwordModalCancelBtn"),
  passwordModalOkBtn: document.getElementById("passwordModalOkBtn"),
};

/* ---- Grade/Section dropdowns ---- */

// Populates the Grade dropdown once (form + filter share the same list).
function populateGradeOptions(selectEl, includeAllOption) {
  const options = includeAllOption ? ['<option value="all">All Grades</option>'] : ['<option value="">Select grade…</option>'];
  Object.keys(GRADE_SECTIONS).forEach((grade) => {
    options.push(`<option value="${grade}">Grade ${grade}</option>`);
  });
  selectEl.innerHTML = options.join("");
}

// Rebuilds a Section dropdown to match whichever grade is selected.
// gradeValue "all" (filter) or "" (form, nothing chosen yet) shows every
// section across all grades.
function populateSectionOptions(selectEl, gradeValue, includeAllOption) {
  const sections = GRADE_SECTIONS[gradeValue] || Object.values(GRADE_SECTIONS).flat();
  const uniqueSorted = [...new Set(sections)].sort((a, b) => a.localeCompare(b));
  const options = includeAllOption ? ['<option value="all">All Sections</option>'] : ['<option value="">Select section…</option>'];
  uniqueSorted.forEach((s) => options.push(`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`));
  selectEl.innerHTML = options.join("");
}

function onFormGradeChange() {
  const hasGrade = !!dom.fieldGrade.value;
  dom.sectionFieldWrap.classList.toggle("hidden", !hasGrade);
  if (hasGrade) {
    populateSectionOptions(dom.fieldSection, dom.fieldGrade.value, false);
  } else {
    dom.fieldSection.innerHTML = '<option value="">Select section…</option>';
  }
}

/* ---- Order type / size / add-on pricing ---- */

function getSelectedOrderType() {
  return document.querySelector('input[name="orderType"]:checked').value;
}

function getSelectedSize() {
  const checked = document.querySelector('input[name="sizeChoice"]:checked');
  return checked ? checked.value : null;
}

function getSelectedAddon() {
  const checked = document.querySelector('input[name="addonChoice"]:checked');
  return checked ? checked.value : "none";
}

// Builds the human-readable description saved as shirt_type, and computes
// the price for whatever's currently selected.
function computeOrderPricing() {
  const orderType = getSelectedOrderType();
  const addon = getSelectedAddon();
  const addonPrice = ADDON_PRICES[addon] || 0;
  const addonLabel = ADDON_LABELS[addon];

  if (orderType === "print_only") {
    return {
      description: `Print Only${addonLabel ? " — " + addonLabel : ""}`,
      amount: PRINT_ONLY_PRICE + addonPrice,
    };
  }

  const size = getSelectedSize();
  const base = SIZE_PRICES[size] || 0;

  return {
    description: `Print + T-Shirt (${size})${addonLabel ? " — " + addonLabel : ""}`,
    amount: base + addonPrice,
  };
}

// Show/hide the Size and Add-Ons rows based on order type, and refresh the
// auto-filled amount whenever any of these choices change.
function onOrderTypeChange() {
  const isShirt = getSelectedOrderType() === "print_shirt";
  dom.sizeChoiceRow.classList.toggle("hidden", !isShirt);
  refreshComputedAmount();
}

function refreshComputedAmount() {
  const { amount } = computeOrderPricing();
  dom.fieldAmount.value = amount;
  updateChangeDisplay();
}

// Live cash calculator: Amount Given minus the final Amount. Auto-checks
// "Paid already" once enough cash has been entered (still manually
// toggleable either way).
function updateChangeDisplay() {
  const amount = Number(dom.fieldAmount.value) || 0;
  const givenRaw = dom.fieldAmountGiven.value;

  if (givenRaw === "") {
    dom.changeValue.textContent = "—";
    dom.changeDisplay.classList.remove("ok", "short");
    return;
  }

  const given = Number(givenRaw) || 0;
  const diff = given - amount;

  if (diff >= 0) {
    dom.changeValue.textContent = formatPeso(diff);
    dom.changeDisplay.classList.add("ok");
    dom.changeDisplay.classList.remove("short");
    if (given > 0) dom.fieldPaid.checked = true;
  } else {
    dom.changeValue.textContent = `Short ${formatPeso(Math.abs(diff))}`;
    dom.changeDisplay.classList.add("short");
    dom.changeDisplay.classList.remove("ok");
  }
}

function onFilterGradeChange(e) {
  state.gradeFilter = e.target.value;
  state.sectionFilter = "all";
  populateSectionOptions(dom.sectionFilter, e.target.value, true);
  updateStats();
  renderOrderList();
}

function onFilterSectionChange(e) {
  state.sectionFilter = e.target.value;
  updateStats();
  renderOrderList();
}

/* ---- Helpers ---- */

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}

function formatPeso(amount) {
  const n = Number(amount) || 0;
  return `₱${n.toLocaleString("en-PH")}`;
}

function formatDateLong(date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
}

function updateClock() {
  const now = new Date();
  dom.currentDate.textContent = formatDateLong(now);
  dom.currentTime.textContent = formatTime(now);
}

/* ---- Supabase ---- */

async function loadOrders() {
  const { data, error } = await supabaseClient
    .from("tshirt_orders")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Could not load t-shirt orders:", error);
    window.alert("Could not load orders — check your internet connection and try again.");
    return;
  }
  ordersCache = data || [];
}

async function insertOrder(order) {
  const { data, error } = await supabaseClient
    .from("tshirt_orders")
    .insert(order)
    .select()
    .single();

  if (error) {
    console.error("Could not add order:", error);
    window.alert("Could not save that order — check your internet connection and try again.");
    return null;
  }
  return data;
}

async function updateOrderPaid(id, paid) {
  const { error } = await supabaseClient
    .from("tshirt_orders")
    .update({ paid })
    .eq("id", id);

  if (error) {
    console.error("Could not update payment status:", error);
    window.alert("Could not update that order — check your internet connection and try again.");
  }
}

async function deleteOrder(id) {
  const { error } = await supabaseClient
    .from("tshirt_orders")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Could not delete order:", error);
    window.alert("Could not delete that order — check your internet connection and try again.");
  }
}

function subscribeToRealtimeUpdates() {
  supabaseClient
    .channel("tshirt_orders_changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "tshirt_orders" }, async () => {
      await loadOrders();
      renderAll();
    })
    .subscribe();
}

/* ---- Filtering / stats ---- */

function getFilteredOrders() {
  const term = state.searchTerm.toLowerCase();
  return ordersCache.filter((o) => {
    const matchesSearch = (o.student_name || "").toLowerCase().includes(term);
    const matchesGrade = state.gradeFilter === "all" || o.grade === state.gradeFilter;
    const matchesSection = state.sectionFilter === "all" || o.section === state.sectionFilter;
    const matchesPaid =
      state.paidFilter === "all" ||
      (state.paidFilter === "paid" && o.paid) ||
      (state.paidFilter === "unpaid" && !o.paid);
    const matchesSize = state.sizeFilter === "all" || o.size === state.sizeFilter;
    return matchesSearch && matchesGrade && matchesSection && matchesPaid && matchesSize;
  });
}

function updateStats() {
  const filtered = getFilteredOrders();
  const paidCount = ordersCache.filter((o) => o.paid).length;
  const totalAmount = ordersCache.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  dom.statTotalOrders.textContent = ordersCache.length;
  dom.statPaid.textContent = paidCount;
  dom.statUnpaid.textContent = ordersCache.length - paidCount;
  dom.statAmount.textContent = formatPeso(totalAmount);

  const parts = [];
  if (state.paidFilter !== "all") parts.push(state.paidFilter === "paid" ? "Paid only" : "Unpaid only");
  if (state.sizeFilter !== "all") parts.push(`Size ${state.sizeFilter}`);
  if (state.searchTerm.trim()) parts.push(`matching "${state.searchTerm.trim()}"`);

  dom.filterSummary.textContent = parts.length === 0
    ? `Showing all ${ordersCache.length} orders`
    : `Showing ${filtered.length} order${filtered.length === 1 ? "" : "s"} — ${parts.join(" · ")}`;
}

function populateSizeFilterOptions() {
  const sizes = [...new Set(ordersCache.map((o) => o.size).filter(Boolean))].sort();
  const current = dom.sizeFilter.value;
  dom.sizeFilter.innerHTML = '<option value="all">All Sizes</option>' +
    sizes.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
  if (sizes.includes(current)) dom.sizeFilter.value = current;
}

/* ---- Rendering ---- */

function renderOrderList() {
  const orders = getFilteredOrders();

  dom.emptyState.classList.toggle("hidden", orders.length > 0);

  dom.orderList.innerHTML = orders
    .map((o) => `
      <div class="order-row">
        <span class="order-row-name">${escapeHtml(o.student_name)}</span>
        <span class="order-row-meta">${escapeHtml([o.grade, o.section].filter(Boolean).join(" · ") || "—")}</span>
        <span class="order-row-type order-row-meta">${escapeHtml(o.shirt_type || "—")}</span>
        <span class="order-row-size">${escapeHtml(o.size || "—")}</span>
        <span class="order-row-amount">${formatPeso(o.amount)}</span>
        <button
          type="button"
          class="order-status ${o.paid ? "paid" : "unpaid"}"
          data-toggle-paid="${o.id}"
          ${state.unlocked ? "" : "disabled"}
          title="${state.unlocked ? "Tap to toggle paid/unpaid" : ""}"
        >${o.paid ? "PAID" : "UNPAID"}</button>
        <button type="button" class="order-row-delete" data-delete="${o.id}" ${state.unlocked ? "" : "disabled"} aria-label="Delete order">✕</button>
      </div>
    `)
    .join("");
}

function renderAll() {
  populateSizeFilterOptions();
  updateStats();
  renderOrderList();
}

/* ---- Lock / password ---- */

function updateLockButton() {
  const btn = dom.lockToggleBtn;
  if (state.unlocked) {
    btn.textContent = "🔓 Unlocked (Coach)";
    btn.classList.remove("locked");
    btn.classList.add("unlocked");
  } else {
    btn.textContent = "🔒 Locked";
    btn.classList.remove("unlocked");
    btn.classList.add("locked");
  }
  dom.orderFormCard.classList.toggle("is-locked", !state.unlocked);
}

function toggleLock() {
  if (state.unlocked) {
    state.unlocked = false;
    updateLockButton();
    renderOrderList();
    return;
  }
  openPasswordModal();
}

function openPasswordModal() {
  dom.passwordModalInput.value = "";
  dom.passwordModalError.classList.add("hidden");
  dom.passwordModalOverlay.classList.remove("hidden");
  dom.passwordModalInput.focus();
}

function closePasswordModal() {
  dom.passwordModalOverlay.classList.add("hidden");
}

function onPasswordModalSubmit(e) {
  e.preventDefault();
  if (dom.passwordModalInput.value === TSHIRT_PASSWORD) {
    state.unlocked = true;
    updateLockButton();
    renderOrderList();
    closePasswordModal();
  } else {
    dom.passwordModalError.classList.remove("hidden");
    dom.passwordModal.classList.add("shake");
    setTimeout(() => dom.passwordModal.classList.remove("shake"), 400);
  }
}

/* ---- Event handlers ---- */

function onSearchInput(e) {
  state.searchTerm = e.target.value;
  updateStats();
  renderOrderList();
}

function onPaidFilterChange(e) {
  state.paidFilter = e.target.value;
  updateStats();
  renderOrderList();
}

function onSizeFilterChange(e) {
  state.sizeFilter = e.target.value;
  updateStats();
  renderOrderList();
}

async function onOrderFormSubmit(e) {
  e.preventDefault();
  if (!state.unlocked) return;

  const name = dom.fieldName.value.trim();
  if (!name) {
    window.alert("Student name is required.");
    return;
  }

  dom.addOrderBtn.disabled = true;
  dom.addOrderBtn.textContent = "Adding…";

  const orderType = getSelectedOrderType();
  const { description } = computeOrderPricing();
  const amount = dom.fieldAmount.value ? Number(dom.fieldAmount.value) : 0;
  const amountGiven = dom.fieldAmountGiven.value ? Number(dom.fieldAmountGiven.value) : null;

  const newOrder = {
    student_name: name,
    grade: dom.fieldGrade.value.trim(),
    section: dom.fieldSection.value.trim(),
    shirt_type: description,
    size: orderType === "print_shirt" ? getSelectedSize() : null,
    amount: amount,
    amount_given: amountGiven,
    change_given: amountGiven !== null ? Math.max(amountGiven - amount, 0) : null,
    paid: dom.fieldPaid.checked,
  };

  const saved = await insertOrder(newOrder);
  if (saved) {
    ordersCache.push(saved);
    renderAll();
    dom.orderForm.reset();
    dom.sectionFieldWrap.classList.add("hidden");
    dom.sizeChoiceRow.classList.add("hidden");
    populateSectionOptions(dom.fieldSection, "", false); // grade reset to "" clears section list too
    refreshComputedAmount();
    dom.fieldName.focus();
  }

  dom.addOrderBtn.disabled = false;
  dom.addOrderBtn.textContent = "+ Add Order";
}

async function onOrderListClick(e) {
  const toggleBtn = e.target.closest("[data-toggle-paid]");
  if (toggleBtn && state.unlocked) {
    const id = toggleBtn.dataset.togglePaid;
    const order = ordersCache.find((o) => o.id === id);
    if (!order) return;
    order.paid = !order.paid; // optimistic
    renderAll();
    await updateOrderPaid(id, order.paid);
    return;
  }

  const deleteBtn = e.target.closest("[data-delete]");
  if (deleteBtn && state.unlocked) {
    const id = deleteBtn.dataset.delete;
    const order = ordersCache.find((o) => o.id === id);
    if (!order) return;
    if (!window.confirm(`Delete the order for ${order.student_name}? This can't be undone.`)) return;
    ordersCache = ordersCache.filter((o) => o.id !== id);
    renderAll();
    await deleteOrder(id);
  }
}

function bindEvents() {
  dom.searchInput.addEventListener("input", onSearchInput);
  dom.gradeFilter.addEventListener("change", onFilterGradeChange);
  dom.sectionFilter.addEventListener("change", onFilterSectionChange);
  dom.paidFilter.addEventListener("change", onPaidFilterChange);
  dom.sizeFilter.addEventListener("change", onSizeFilterChange);
  dom.lockToggleBtn.addEventListener("click", toggleLock);
  dom.fieldGrade.addEventListener("change", onFormGradeChange);
  document.querySelectorAll('input[name="orderType"]').forEach((el) => el.addEventListener("change", onOrderTypeChange));
  document.querySelectorAll('input[name="sizeChoice"]').forEach((el) => el.addEventListener("change", refreshComputedAmount));
  document.querySelectorAll('input[name="addonChoice"]').forEach((el) => el.addEventListener("change", refreshComputedAmount));
  dom.fieldAmount.addEventListener("input", updateChangeDisplay);
  dom.fieldAmountGiven.addEventListener("input", updateChangeDisplay);
  dom.orderForm.addEventListener("submit", onOrderFormSubmit);
  dom.orderList.addEventListener("click", onOrderListClick);

  dom.passwordModalForm.addEventListener("submit", onPasswordModalSubmit);
  dom.passwordModalCancelBtn.addEventListener("click", closePasswordModal);
  dom.passwordModalOverlay.addEventListener("click", (e) => {
    if (e.target === dom.passwordModalOverlay) closePasswordModal();
  });
}

async function init() {
  populateGradeOptions(dom.fieldGrade, false);
  populateSectionOptions(dom.fieldSection, "", false);
  populateGradeOptions(dom.gradeFilter, true);
  populateSectionOptions(dom.sectionFilter, "all", true);
  refreshComputedAmount();

  bindEvents();
  updateLockButton();
  updateClock();
  setInterval(updateClock, 1000);

  dom.orderList.innerHTML = '<p class="empty-state">Loading orders…</p>';
  await loadOrders();
  renderAll();

  subscribeToRealtimeUpdates();
}

document.addEventListener("DOMContentLoaded", init);
