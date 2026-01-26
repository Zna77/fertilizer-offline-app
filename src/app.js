import {
  openDb,
  getAllPrograms,
  getProgram,
  putProgram,
  deleteProgram,
  getAllTemplates,
  putTemplate,
  deleteTemplate,
  getAllHistory,
  putHistoryEntry,
  deleteHistoryEntry,
  clearHistory,
} from "./db.js";
import { state, setState } from "./state.js";
import {
  buildProgram,
  normalizeCode,
  normalizeConsumptionRows,
  normalizeName,
  normalizeUnit,
  nowISO,
  parseNumber,
} from "./models.js";
import { aggregateConsumption } from "./calc.js";
import * as UI from "./ui.js";

const makeId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;

const SEED_PROGRAMS = [
  {
    code: "N02",
    notes: "Full program N02 (editable by stage updates)",
    fertilizers: [
      { name: "NITRATE CALCIUM", value: 50, unit: "kg" },
      { name: "AMONITRATE", value: 6, unit: "kg" },
      { name: "NITRATE POTASSE", value: 22, unit: "kg" },
      { name: "UREE", value: 2, unit: "kg" },
      { name: "MKP", value: 12, unit: "kg" },
      { name: "S.MGO", value: 12, unit: "kg" },
      { name: "N.MGO", value: 13, unit: "kg" },
      { name: "SULPHATE POTASSE", value: 2, unit: "kg" },
      { name: "SULPHATE CUIVRE", value: 0.03, unit: "kg" },
      { name: "SULPHATE ZINC", value: 0.35, unit: "kg" },
      { name: "SULPHATE MANGANESE", value: 0.6, unit: "kg" },
      { name: "MOLYBDENE", value: 0.05, unit: "L" },
    ],
  },
  {
    code: "N03",
    notes: "Full program N03 (editable by stage updates)",
    fertilizers: [
      { name: "NITRATE CALCIUM", value: 20, unit: "kg" },
      { name: "AMONITRATE", value: 4, unit: "kg" },
      { name: "NITRATE POTASSE", value: 19, unit: "kg" },
      { name: "UREE", value: 2, unit: "kg" },
      { name: "MKP", value: 12, unit: "kg" },
      { name: "S.MGO", value: 11, unit: "kg" },
      { name: "N.MGO", value: 12, unit: "kg" },
      { name: "SULPHATE POTASSE", value: 18, unit: "kg" },
      { name: "SULPHATE CUIVRE", value: 0.03, unit: "kg" },
      { name: "SULPHATE ZINC", value: 0.4, unit: "kg" },
      { name: "SULPHATE MANGANESE", value: 0.65, unit: "kg" },
      { name: "MOLYBDENE", value: 0.07, unit: "L" },
    ],
  },
];

function buildProgramsMap(programs) {
  return new Map(programs.map((program) => [program.code, program]));
}

async function refreshPrograms() {
  try {
    const programs = await getAllPrograms();
    setState({
      programs,
      programsByCode: buildProgramsMap(programs),
      loading: false,
      dbError: "",
    });

    UI.renderProgramsState({
      loading: false,
      error: "",
      programs,
      query: normalizeCode(UI.els.searchInput.value),
    });
  } catch (error) {
    const message = error.message || "Unable to load programs.";
    setState({ loading: false, dbError: message });
    UI.renderProgramsState({
      loading: false,
      error: message,
      programs: [],
      query: "",
    });
  }
}

async function refreshTemplates() {
  try {
    const templates = await getAllTemplates();
    setState({ templates });
    UI.renderTemplatesTable(templates);
  } catch (error) {
    UI.renderTemplatesTable([]);
  }
}

async function refreshHistory() {
  try {
    const history = await getAllHistory();
    setState({ history });
    UI.renderHistoryTable(history);
  } catch (error) {
    UI.renderHistoryTable([]);
  }
}

async function handleCalculate() {
  const rawRows = UI.getConsumptionInputRows();
  const { normalized, warnings } = normalizeConsumptionRows(rawRows);
  if (!normalized.length) {
    warnings.push("Add at least one program row to calculate.");
  }
  const result = aggregateConsumption(normalized, state.programsByCode);
  result.warnings = [...warnings, ...result.warnings];
  const timestamp = normalized.length ? nowISO() : "";
  UI.renderSummary({ ...result, timestamp });

  if (normalized.length) {
    const entry = {
      id: makeId(),
      createdAt: timestamp,
      used: result.used,
      missing: result.missing,
      totals: result.totals,
      warnings: result.warnings,
      errors: result.errors,
    };
    try {
      await putHistoryEntry(entry);
      await refreshHistory();
    } catch (error) {
      UI.setNotice(
        UI.els.calcMessage,
        error.message || "Unable to save history.",
        "warn"
      );
    }
  }
}

async function handleProgramAction(event) {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;

  const { action, code } = btn.dataset;
  if (!code) return;

  if (action === "edit") {
    try {
      const program = await getProgram(code);
      if (!program) return;
      setState({ editingCode: code });
      UI.openModal({ title: `Edit Program ${code}`, program });
    } catch (error) {
      UI.setNotice(
        UI.els.calcMessage,
        error.message || "Load failed.",
        "error"
      );
    }
    return;
  }

  if (action === "duplicate") {
    const source = state.programsByCode.get(code);
    if (!source) return;
    const duplicate = {
      ...source,
      code: `${source.code}-COPY`,
      allowCodeEdit: true,
    };
    setState({ editingCode: null });
    UI.openModal({ title: `Duplicate ${code}`, program: duplicate });
    return;
  }

  if (action === "template") {
    const source = state.programsByCode.get(code);
    if (!source) return;
    const name = window.prompt("Template name", source.code);
    if (!name) return;
    const template = {
      id: makeId(),
      name: String(name).trim() || source.code,
      notes: source.notes || "",
      fertilizers: source.fertilizers || [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    try {
      await putTemplate(template);
      await refreshTemplates();
    } catch (error) {
      UI.setNotice(
        UI.els.calcMessage,
        error.message || "Template save failed.",
        "error"
      );
    }
  }
}

function handleNewProgram() {
  setState({ editingCode: null });
  UI.openModal({ title: "New Program" });
}

async function handleSaveProgram(event) {
  event.preventDefault();

  if (!state.dbReady) {
    UI.setNotice(
      UI.els.formMessage,
      "Database unavailable. Cannot save programs.",
      "error"
    );
    return;
  }

  const rawInput = UI.getProgramFormInput();
  const { program, errors } = buildProgram(rawInput);

  if (!state.editingCode && state.programsByCode.has(program.code)) {
    errors.unshift("Program code already exists.");
  }

  if (errors.length) {
    UI.setNotice(UI.els.formMessage, errors.join(" "), "error");
    return;
  }

  const existing = state.programsByCode.get(program.code);
  if (existing?.createdAt) {
    program.createdAt = existing.createdAt;
  } else if (!existing) {
    program.createdAt = nowISO();
  }

  try {
    await putProgram(program);
    await refreshPrograms();
    UI.closeModal();
  } catch (error) {
    UI.setNotice(
      UI.els.formMessage,
      error.message || "Save failed.",
      "error"
    );
  }
}

async function handleDeleteProgram() {
  if (!state.editingCode) return;

  if (!window.confirm(`Delete program ${state.editingCode}?`)) {
    return;
  }

  try {
    await deleteProgram(state.editingCode);
    await refreshPrograms();
    UI.closeModal();
  } catch (error) {
    UI.setNotice(
      UI.els.formMessage,
      error.message || "Delete failed.",
      "error"
    );
  }
}

async function handleSeed() {
  if (!state.dbReady) {
    UI.setNotice(
      UI.els.calcMessage,
      "Database unavailable. Cannot seed data.",
      "error"
    );
    return;
  }

  if (!window.confirm("Seed sample programs? This will overwrite N02/N03.")) {
    return;
  }

  try {
    for (const raw of SEED_PROGRAMS) {
      const program = {
        code: normalizeCode(raw.code),
        notes: raw.notes,
        fertilizers: raw.fertilizers.map((fertilizer) => ({
          name: normalizeName(fertilizer.name),
          value: parseNumber(fertilizer.value),
          unit: normalizeUnit(fertilizer.unit),
        })),
        updatedAt: nowISO(),
      };

      await putProgram(program);
    }

    await refreshPrograms();
  } catch (error) {
    UI.setNotice(UI.els.calcMessage, error.message || "Seed failed.", "error");
  }
}

function handleSearch() {
  UI.renderProgramsTable(state.programs, normalizeCode(UI.els.searchInput.value));
}

function handleAddConsumptionRow() {
  UI.makeConsumptionRow();
}

async function handleTemplateAction(event) {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (!id) return;

  if (action === "use") {
    const template = state.templates.find((item) => item.id === id);
    if (!template) return;
    setState({ editingCode: null });
    UI.openModal({
      title: `New from template: ${template.name}`,
      program: {
        code: "",
        notes: template.notes || "",
        fertilizers: template.fertilizers || [],
        allowCodeEdit: true,
      },
    });
    return;
  }

  if (action === "delete") {
    if (!window.confirm("Delete this template?")) return;
    try {
      await deleteTemplate(id);
      await refreshTemplates();
    } catch (error) {
      UI.setNotice(
        UI.els.calcMessage,
        error.message || "Template delete failed.",
        "error"
      );
    }
  }
}

async function handleHistoryAction(event) {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (!id) return;

  const entry = state.history.find((item) => item.id === id);
  if (!entry) return;

  if (action === "view") {
    UI.renderSummary({
      totals: entry.totals || [],
      used: entry.used || [],
      missing: entry.missing || [],
      warnings: entry.warnings || [],
      errors: entry.errors || [],
      timestamp: entry.createdAt,
    });
    return;
  }

  if (action === "export") {
    exportJson(entry, `fertilizer-history-${id}.json`);
    return;
  }

  if (action === "delete") {
    if (!window.confirm("Delete this history entry?")) return;
    try {
      await deleteHistoryEntry(id);
      await refreshHistory();
    } catch (error) {
      UI.setNotice(
        UI.els.calcMessage,
        error.message || "History delete failed.",
        "error"
      );
    }
  }
}

function exportJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function handleExportHistory() {
  if (!state.history.length) {
    UI.setNotice(UI.els.calcMessage, "No history to export.", "warn");
    return;
  }
  exportJson(state.history, "fertilizer-history.json");
}

async function handleClearHistory() {
  if (!state.history.length) return;
  if (!window.confirm("Clear all history entries?")) return;
  try {
    await clearHistory();
    await refreshHistory();
  } catch (error) {
    UI.setNotice(
      UI.els.calcMessage,
      error.message || "History clear failed.",
      "error"
    );
  }
}

function handlePrintReport() {
  window.print();
}

function wireEvents() {
  UI.initUI({
    onAddConsumptionRow: handleAddConsumptionRow,
    onCalculate: handleCalculate,
    onSearch: handleSearch,
    onProgramAction: handleProgramAction,
    onNewProgram: handleNewProgram,
    onSaveProgram: handleSaveProgram,
    onDeleteProgram: handleDeleteProgram,
    onSeed: handleSeed,
    onTemplateAction: handleTemplateAction,
    onHistoryAction: handleHistoryAction,
    onExportHistory: handleExportHistory,
    onClearHistory: handleClearHistory,
    onPrintReport: handlePrintReport,
  });
}

async function init() {
  UI.setNetworkStatus(navigator.onLine);
  window.addEventListener("online", () => UI.setNetworkStatus(true));
  window.addEventListener("offline", () => UI.setNetworkStatus(false));

  wireEvents();

  UI.renderProgramsState({
    loading: true,
    error: "",
    programs: [],
    query: "",
  });

  try {
    await openDb();
    setState({ dbReady: true });
    UI.setDbStatus("DB Ready", "success");
    await refreshPrograms();
    await refreshTemplates();
    await refreshHistory();
  } catch (error) {
    const message = error.message || "Database unavailable.";
    setState({ dbReady: false, dbError: message, loading: false });
    UI.setDbStatus("DB Error", "error");
    UI.renderProgramsState({
      loading: false,
      error: message,
      programs: [],
      query: "",
    });
  }

  UI.makeConsumptionRow({ code: "N02", times: 1 });
  UI.makeConsumptionRow({ code: "N03", times: 1 });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" });
  }
}

init();
