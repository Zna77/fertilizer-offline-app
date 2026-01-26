import { formatNumber } from "./models.js";

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
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

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
  els.netStatus.textContent = isOnline ? "Online" : "Offline";
  els.netStatus.dataset.tone = isOnline ? "info" : "warn";
}

export function renderProgramsState({ loading, error, programs, query }) {
  if (loading) {
    els.programsBody.innerHTML =
      '<tr><td colspan="4" class="muted">Loading programs...</td></tr>';
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
    els.programsBody.innerHTML =
      '<tr><td colspan="4" class="muted">No programs yet. Click "New Program".</td></tr>';
    return;
  }

  els.programsBody.innerHTML = filtered
    .map((program) => {
      const updated = program.updatedAt
        ? dateFormatter.format(new Date(program.updatedAt))
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
            <button class="btn btn-secondary" data-action="edit" data-code="${program.code}">Edit</button>
            <button class="btn btn-secondary" data-action="duplicate" data-code="${program.code}">Duplicate</button>
            <button class="btn btn-secondary" data-action="template" data-code="${program.code}">Template</button>
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
      <label class="label" for="consumption-code-${rowId}">Program code</label>
      <input class="input" id="consumption-code-${rowId}" data-role="code" placeholder="N02" value="${code}" autocomplete="off">
    </div>
    <div class="field">
      <label class="label" for="consumption-times-${rowId}">Times</label>
      <input class="input" id="consumption-times-${rowId}" data-role="times" type="number" inputmode="decimal" min="0" step="0.1" placeholder="1" value="${times}">
    </div>
    <div class="field compact">
      <label class="label" aria-hidden="true">Remove</label>
      <button class="icon-btn" data-role="remove" type="button" title="Remove row">Remove</button>
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

export function renderSummary({ totals, used, missing, warnings, errors, timestamp }) {
  const usedText = used.length
    ? used.map((item) => `${item.code}x${item.times}`).join(", ")
    : "-";

  els.summaryPrograms.textContent = usedText;
  els.summaryCount.textContent = totals.length ? String(totals.length) : "-";
  if (els.reportTimestamp) {
    els.reportTimestamp.textContent = timestamp
      ? dateFormatter.format(new Date(timestamp))
      : "-";
  }

  if (!totals.length) {
    els.summaryBody.removeAttribute("data-state");
    els.summaryBody.innerHTML =
      '<tr><td colspan="3" class="muted">No results yet.</td></tr>';
  } else {
    els.summaryBody.dataset.state = "ready";
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
    els.summaryBody.innerHTML = rows;
  }

  const messages = [];
  if (missing.length) {
    messages.push(`Missing program(s): ${missing.join(", ")}.`);
  }
  if (warnings.length) {
    messages.push(warnings.join(" "));
  }
  if (errors.length) {
    messages.push(errors.join(" "));
  }

  const tone = errors.length ? "error" : warnings.length ? "warn" : "info";
  setNotice(els.calcMessage, messages.join(" "), tone);
}

export function renderTemplatesTable(templates) {
  if (!templates.length) {
    els.templatesBody.innerHTML =
      '<tr><td colspan="3" class="muted">No templates yet.</td></tr>';
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
            <button class="btn btn-secondary" data-action="use" data-id="${template.id}">Use</button>
            <button class="btn btn-secondary" data-action="delete" data-id="${template.id}">Delete</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

export function renderHistoryTable(entries) {
  if (!entries.length) {
    els.historyBody.innerHTML =
      '<tr><td colspan="4" class="muted">No history yet.</td></tr>';
    return;
  }

  els.historyBody.innerHTML = entries
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((entry) => {
      const when = entry.createdAt
        ? dateFormatter.format(new Date(entry.createdAt))
        : "-";
      const used = entry.used?.length
        ? entry.used.map((item) => `${item.code}x${item.times}`).join(", ")
        : "-";
      const missing = entry.missing?.length
        ? ` (missing: ${entry.missing.join(", ")})`
        : "";
      const count = entry.totals?.length ? entry.totals.length : 0;
      return `
      <tr>
        <td>${when}</td>
        <td>${used}${missing}</td>
        <td class="right">${count}</td>
        <td class="right">
          <div class="row actions">
            <button class="btn btn-secondary" data-action="view" data-id="${entry.id}">View</button>
            <button class="btn btn-secondary" data-action="export" data-id="${entry.id}">Export</button>
            <button class="btn btn-secondary" data-action="delete" data-id="${entry.id}">Delete</button>
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
      <label class="label" for="fert-name-${rowId}">Fertilizer</label>
      <input class="input" id="fert-name-${rowId}" data-role="name" placeholder="NITRATE CALCIUM" value="${name}">
    </div>
    <div class="field">
      <label class="label" for="fert-value-${rowId}">Value</label>
      <input class="input" id="fert-value-${rowId}" data-role="value" placeholder="0.35" inputmode="decimal" value="${value}">
    </div>
    <div class="field compact">
      <label class="label" for="fert-unit-${rowId}">Unit</label>
      <select class="select" id="fert-unit-${rowId}" data-role="unit">
        <option value="kg" ${unit === "kg" ? "selected" : ""}>kg</option>
        <option value="L" ${unit === "L" ? "selected" : ""}>L</option>
      </select>
    </div>
    <div class="field compact">
      <label class="label" aria-hidden="true">Remove</label>
      <button type="button" class="icon-btn" data-role="remove" title="Remove fertilizer">Remove</button>
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
}
