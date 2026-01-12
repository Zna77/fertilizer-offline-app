import { formatNumber } from "./models.js";
import { getLanguage, t } from "./i18n.js";

const $ = (id) => document.getElementById(id);
const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;

export const els = {
  consumptionRows: $("consumptionRows"),
  addConsumptionRowBtn: $("addConsumptionRowBtn"),
  calcBtn: $("calcBtn"),
  calcMessage: $("calcMessage"),
  summaryBody: $("summaryBody"),
  summaryPrograms: $("summaryPrograms"),
  summaryCount: $("summaryCount"),

  programsBody: $("programsBody"),
  searchInput: $("searchInput"),
  newProgramBtn: $("newProgramBtn"),
  seedBtn: $("seedBtn"),
  languageSelect: $("languageSelect"),

  modalBackdrop: $("modalBackdrop"),
  modalTitle: $("modalTitle"),
  closeModalBtn: $("closeModalBtn"),
  programForm: $("programForm"),
  programCode: $("programCode"),
  programNotes: $("programNotes"),
  fertRows: $("fertRows"),
  addFertRowBtn: $("addFertRowBtn"),
  deleteProgramBtn: $("deleteProgramBtn"),
  formMessage: $("formMessage"),

  dbStatus: $("dbStatus"),
  netStatus: $("netStatus"),

  templatesBody: $("templatesBody"),
  historyBody: $("historyBody"),
  exportHistoryBtn: $("exportHistoryBtn"),
  clearHistoryBtn: $("clearHistoryBtn"),
  printReportBtn: $("printReportBtn"),
  reportTimestamp: $("reportTimestamp"),

  historySheetBackdrop: $("historySheetBackdrop"),
  historySheetCloseBtn: $("historySheetCloseBtn"),
  sheetSummaryBody: $("sheetSummaryBody"),
  sheetSummaryPrograms: $("sheetSummaryPrograms"),
  sheetSummaryCount: $("sheetSummaryCount"),
  sheetMessage: $("sheetMessage"),
  sheetTimestamp: $("sheetTimestamp"),
};

const dateFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

function formatDate(value) {
  const formatter = new Intl.DateTimeFormat(getLanguage(), dateFormatOptions);
  return formatter.format(new Date(value));
}

export function setNotice(el, text, tone = "info") {
  el.textContent = text || "";
  el.dataset.tone = tone;
}

export function setDbStatus(text, tone = "info") {
  if (!els.dbStatus) return;
  els.dbStatus.textContent = text;
  els.dbStatus.dataset.tone = tone;
}

export function setNetworkStatus(isOnline) {
  if (!els.netStatus) return;
  els.netStatus.textContent = isOnline
    ? t("status.online")
    : t("status.offline");
  els.netStatus.dataset.tone = isOnline ? "info" : "warn";
}

export function renderProgramsState({ loading, error, programs, query }) {
  if (loading) {
    els.programsBody.innerHTML = `<tr><td colspan="4" class="muted">${t(
      "table.loadingPrograms"
    )}</td></tr>`;
    return;
  }

  if (error) {
    els.programsBody.innerHTML = `<tr><td colspan="4" class="muted">${error}</td></tr>`;
    return;
  }

  renderProgramsTable(programs, query);
}

export function renderProgramsTable(programs, query) {
  const filtered = programs
    .filter((program) => !query || program.code.includes(query))
    .sort((a, b) => a.code.localeCompare(b.code));

  if (!filtered.length) {
    els.programsBody.innerHTML = `<tr><td colspan="4" class="muted">${t(
      "table.noPrograms"
    )}</td></tr>`;
    return;
  }

  els.programsBody.innerHTML = filtered
    .map((program) => {
      const updated = program.updatedAt
        ? formatDate(program.updatedAt)
        : "-";
      const fertCount = Array.isArray(program.fertilizers)
        ? program.fertilizers.length
        : 0;
      return `
      <tr>
        <td><span class="pill">${program.code}</span></td>
        <td class="right">${fertCount}</td>
        <td class="right">${updated}</td>
        <td class="right">
          <div class="row actions">
            <button class="btn btn-secondary" data-action="edit" data-code="${program.code}">${t(
              "actions.edit"
            )}</button>
            <button class="btn btn-secondary" data-action="duplicate" data-code="${program.code}">${t(
              "actions.duplicate"
            )}</button>
            <button class="btn btn-secondary" data-action="template" data-code="${program.code}">${t(
              "actions.template"
            )}</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

export function makeConsumptionRow({ code = "", times = 1 } = {}) {
  const rowId = makeId();
  const row = document.createElement("div");
  row.className = "row";
  row.dataset.rowId = rowId;

  row.innerHTML = `
    <div class="field">
      <label class="label" for="consumption-code-${rowId}">${t(
        "labels.programCode"
      )}</label>
      <input class="input" id="consumption-code-${rowId}" data-role="code" placeholder="${t(
        "placeholders.programCode"
      )}" value="${code}" autocomplete="off">
    </div>
    <div class="field">
      <label class="label" for="consumption-times-${rowId}">${t(
        "labels.times"
      )}</label>
      <input class="input" id="consumption-times-${rowId}" data-role="times" type="number" inputmode="decimal" min="0" step="0.1" placeholder="${t(
        "placeholders.times"
      )}" value="${times}">
    </div>
    <div class="field compact">
      <label class="label" aria-hidden="true">${t("labels.remove")}</label>
      <button class="icon-btn" data-role="remove" type="button" title="${t(
        "labels.remove"
      )}">${t("labels.remove")}</button>
    </div>
  `;

  row.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-role='remove']");
    if (!btn) return;
    row.remove();
  });

  els.consumptionRows.appendChild(row);
}

export function getConsumptionInputRows() {
  const rows = [...els.consumptionRows.querySelectorAll("[data-row-id]")];
  return rows.map((row) => ({
    code: row.querySelector("[data-role='code']").value,
    times: row.querySelector("[data-role='times']").value,
  }));
}

export function rebuildConsumptionRows(rows) {
  els.consumptionRows.innerHTML = "";
  rows.forEach((row) => makeConsumptionRow(row));
}

function applySummaryView(view, { totals, used, missing, warnings, errors, timestamp }) {
  if (!view?.summaryPrograms || !view?.summaryBody || !view?.summaryCount) return;

  const usedText = used.length
    ? used.map((item) => `${item.code}x${item.times}`).join(", ")
    : "-";

  view.summaryPrograms.textContent = usedText;
  view.summaryCount.textContent = totals.length ? String(totals.length) : "-";
  if (view.timestampEl) {
    view.timestampEl.textContent = timestamp ? formatDate(timestamp) : "-";
  }

  if (!totals.length) {
    view.summaryBody.removeAttribute("data-state");
    view.summaryBody.innerHTML = `<tr><td colspan="3" class="muted">${t(
      "table.noResults"
    )}</td></tr>`;
  } else {
    view.summaryBody.dataset.state = "ready";
    const rows = totals
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td class="right">${formatNumber(item.value)}</td>
          <td>${item.unit}</td>
        </tr>`
      )
      .join("");
    view.summaryBody.innerHTML = rows;
  }

  const messages = [];
  if (missing.length) {
    messages.push(t("messages.missingPrograms", { codes: missing.join(", ") }));
  }
  if (warnings.length) {
    messages.push(warnings.join(" "));
  }
  if (errors.length) {
    messages.push(errors.join(" "));
  }

  if (view.messageEl) {
    const tone = errors.length ? "error" : warnings.length ? "warn" : "info";
    setNotice(view.messageEl, messages.join(" "), tone);
  }
}

export function renderSummary(summary) {
  const summaryView = {
    summaryPrograms: els.summaryPrograms,
    summaryCount: els.summaryCount,
    summaryBody: els.summaryBody,
    messageEl: els.calcMessage,
    timestampEl: els.reportTimestamp,
  };
  applySummaryView(summaryView, summary);
}

export function renderHistorySheet(summary) {
  const sheetView = {
    summaryPrograms: els.sheetSummaryPrograms,
    summaryCount: els.sheetSummaryCount,
    summaryBody: els.sheetSummaryBody,
    messageEl: els.sheetMessage,
    timestampEl: els.sheetTimestamp,
  };
  applySummaryView(sheetView, summary);
  openHistorySheet();
}

export function updateHistorySheet(summary) {
  const sheetView = {
    summaryPrograms: els.sheetSummaryPrograms,
    summaryCount: els.sheetSummaryCount,
    summaryBody: els.sheetSummaryBody,
    messageEl: els.sheetMessage,
    timestampEl: els.sheetTimestamp,
  };
  applySummaryView(sheetView, summary);
}

export function renderTemplatesTable(templates) {
  if (!templates.length) {
    els.templatesBody.innerHTML = `<tr><td colspan="3" class="muted">${t(
      "table.noTemplates"
    )}</td></tr>`;
    return;
  }

  els.templatesBody.innerHTML = templates
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((template) => {
      const count = Array.isArray(template.fertilizers)
        ? template.fertilizers.length
        : 0;
      return `
      <tr>
        <td>${template.name}</td>
        <td class="right">${count}</td>
        <td class="right">
          <div class="row actions">
            <button class="btn btn-secondary" data-action="use" data-id="${template.id}">${t(
              "actions.use"
            )}</button>
            <button class="btn btn-secondary" data-action="delete" data-id="${template.id}">${t(
              "actions.delete"
            )}</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

export function renderHistoryTable(entries) {
  if (!entries.length) {
    els.historyBody.innerHTML = `<tr><td colspan="4" class="muted">${t(
      "table.noHistory"
    )}</td></tr>`;
    return;
  }

  els.historyBody.innerHTML = entries
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((entry) => {
      const when = entry.createdAt
        ? formatDate(entry.createdAt)
        : "-";
      const used = entry.used?.length
        ? entry.used.map((item) => `${item.code}x${item.times}`).join(", ")
        : "-";
      const missing = entry.missing?.length
        ? t("messages.missingShort", { codes: entry.missing.join(", ") })
        : "";
      const count = entry.totals?.length ? entry.totals.length : 0;
      return `
      <tr>
        <td>${when}</td>
        <td>${used}${missing}</td>
        <td class="right">${count}</td>
        <td class="right">
          <div class="row actions">
            <button class="btn btn-secondary" data-action="view" data-id="${entry.id}">${t(
              "actions.view"
            )}</button>
            <button class="btn btn-secondary" data-action="export" data-id="${entry.id}">${t(
              "actions.export"
            )}</button>
            <button class="btn btn-secondary" data-action="delete" data-id="${entry.id}">${t(
              "actions.delete"
            )}</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

export function openModal({ title, program }) {
  els.modalTitle.textContent = title;
  els.modalBackdrop.classList.remove("hidden");
  setNotice(els.formMessage, "");

  els.fertRows.innerHTML = "";

  if (program) {
    const allowCodeEdit = !!program.allowCodeEdit;
    els.programCode.value = program.code;
    els.programCode.disabled = !allowCodeEdit;
    els.programNotes.value = program.notes || "";

    (program.fertilizers || []).forEach((fertilizer) =>
      addFertilizerRow(fertilizer)
    );

    if (allowCodeEdit) {
      els.deleteProgramBtn.classList.add("hidden");
    } else {
      els.deleteProgramBtn.classList.remove("hidden");
    }
  } else {
    els.programCode.value = "";
    els.programCode.disabled = false;
    els.programNotes.value = "";
    addFertilizerRow();
    els.deleteProgramBtn.classList.add("hidden");
  }
}

export function closeModal() {
  els.modalBackdrop.classList.add("hidden");
}

export function openHistorySheet() {
  if (!els.historySheetBackdrop) return;
  els.historySheetBackdrop.classList.add("open");
  els.historySheetBackdrop.setAttribute("aria-hidden", "false");
  document.body.classList.add("sheet-open");
}

export function closeHistorySheet() {
  if (!els.historySheetBackdrop) return;
  els.historySheetBackdrop.classList.remove("open");
  els.historySheetBackdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("sheet-open");
}

export function isHistorySheetOpen() {
  return !!els.historySheetBackdrop?.classList.contains("open");
}

export function addFertilizerRow(data = {}) {
  const rowId = makeId();
  const name = data.name ?? "";
  const value = data.value ?? "";
  const unit = data.unit ?? "kg";

  const row = document.createElement("div");
  row.className = "row";
  row.dataset.rowId = rowId;

  row.innerHTML = `
    <div class="field">
      <label class="label" for="fert-name-${rowId}">${t(
        "labels.fertilizer"
      )}</label>
      <input class="input" id="fert-name-${rowId}" data-role="name" placeholder="${t(
        "placeholders.fertilizerName"
      )}" value="${name}">
    </div>
    <div class="field">
      <label class="label" for="fert-value-${rowId}">${t(
        "labels.value"
      )}</label>
      <input class="input" id="fert-value-${rowId}" data-role="value" placeholder="${t(
        "placeholders.fertilizerValue"
      )}" inputmode="decimal" value="${value}">
    </div>
    <div class="field compact">
      <label class="label" for="fert-unit-${rowId}">${t("labels.unit")}</label>
      <select class="select" id="fert-unit-${rowId}" data-role="unit">
        <option value="kg" ${unit === "kg" ? "selected" : ""}>kg</option>
        <option value="L" ${unit === "L" ? "selected" : ""}>L</option>
      </select>
    </div>
    <div class="field compact">
      <label class="label" aria-hidden="true">${t("labels.remove")}</label>
      <button type="button" class="icon-btn" data-role="remove" title="${t(
        "labels.remove"
      )}">${t("labels.remove")}</button>
    </div>
  `;

  row.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-role='remove']");
    if (!btn) return;
    row.remove();
  });

  els.fertRows.appendChild(row);
}

export function getProgramFormInput() {
  const rows = [...els.fertRows.querySelectorAll("[data-row-id]")];

  return {
    code: els.programCode.value,
    notes: els.programNotes.value,
    fertilizers: rows.map((row) => ({
      name: row.querySelector("[data-role='name']").value,
      value: row.querySelector("[data-role='value']").value,
      unit: row.querySelector("[data-role='unit']").value,
    })),
  };
}

export function initUI(handlers) {
  els.addConsumptionRowBtn.addEventListener("click", handlers.onAddConsumptionRow);
  els.calcBtn.addEventListener("click", handlers.onCalculate);

  els.searchInput.addEventListener("input", handlers.onSearch);
  els.programsBody.addEventListener("click", handlers.onProgramAction);
  if (els.templatesBody) {
    els.templatesBody.addEventListener("click", handlers.onTemplateAction);
  }
  if (els.historyBody) {
    els.historyBody.addEventListener("click", handlers.onHistoryAction);
  }
  if (els.languageSelect && handlers.onLanguageChange) {
    els.languageSelect.addEventListener("change", handlers.onLanguageChange);
  }

  els.newProgramBtn.addEventListener("click", handlers.onNewProgram);
  els.seedBtn.addEventListener("click", handlers.onSeed);

  els.closeModalBtn.addEventListener("click", closeModal);
  els.modalBackdrop.addEventListener("click", (event) => {
    if (event.target === els.modalBackdrop) closeModal();
  });

  els.addFertRowBtn.addEventListener("click", () => addFertilizerRow());

  els.programForm.addEventListener("submit", handlers.onSaveProgram);
  els.deleteProgramBtn.addEventListener("click", handlers.onDeleteProgram);
  if (els.exportHistoryBtn) {
    els.exportHistoryBtn.addEventListener("click", handlers.onExportHistory);
  }
  if (els.clearHistoryBtn) {
    els.clearHistoryBtn.addEventListener("click", handlers.onClearHistory);
  }
  if (els.printReportBtn) {
    els.printReportBtn.addEventListener("click", handlers.onPrintReport);
  }

  if (els.historySheetCloseBtn) {
    els.historySheetCloseBtn.addEventListener("click", closeHistorySheet);
  }
  if (els.historySheetBackdrop) {
    els.historySheetBackdrop.addEventListener("click", (event) => {
      if (event.target === els.historySheetBackdrop) closeHistorySheet();
    });
  }
}
