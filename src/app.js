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
import { applyTranslations, getLanguage, setLanguage, t } from "./i18n.js";

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
    const message = error.message || t("messages.programsLoadFailed");
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
    warnings.push(t("messages.addProgramRow"));
  }
  const result = aggregateConsumption(normalized, state.programsByCode);
  result.warnings = [...warnings, ...result.warnings];
  const timestamp = normalized.length ? nowISO() : "";
  const summary = { ...result, timestamp };
  setState({ lastSummary: summary });
  UI.renderSummary(summary);

  if (normalized.length) {
    const entry = {
      id: makeId(),
      createdAt: timestamp,
      inputs: normalized,
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
        error.message || t("messages.historySaveFailed"),
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
      setState({
        editingCode: code,
        modalContext: { type: "edit", code, allowCodeEdit: false },
      });
      UI.openModal({ title: t("titles.editProgram", { code }), program });
    } catch (error) {
      UI.setNotice(
        UI.els.calcMessage,
        error.message || t("messages.loadFailed"),
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
    setState({
      editingCode: null,
      modalContext: { type: "duplicate", code, allowCodeEdit: true },
    });
    UI.openModal({ title: t("titles.duplicateProgram", { code }), program: duplicate });
    return;
  }

  if (action === "template") {
    const source = state.programsByCode.get(code);
    if (!source) return;
    const name = window.prompt(t("messages.templateNamePrompt"), source.code);
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
        error.message || t("messages.templateSaveFailed"),
        "error"
      );
    }
  }
}

function handleNewProgram() {
  setState({ editingCode: null, modalContext: { type: "new", allowCodeEdit: true } });
  UI.openModal({ title: t("titles.newProgram") });
}

async function handleSaveProgram(event) {
  event.preventDefault();

  if (!state.dbReady) {
    UI.setNotice(
      UI.els.formMessage,
      t("messages.dbUnavailableSave"),
      "error"
    );
    return;
  }

  const rawInput = UI.getProgramFormInput();
  const { program, errors } = buildProgram(rawInput);

  if (!state.editingCode && state.programsByCode.has(program.code)) {
    errors.unshift(t("messages.programExists"));
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
      error.message || t("messages.saveFailed"),
      "error"
    );
  }
}

async function handleDeleteProgram() {
  if (!state.editingCode) return;

  if (
    !window.confirm(
      t("messages.deleteProgramConfirm", { code: state.editingCode })
    )
  ) {
    return;
  }

  try {
    await deleteProgram(state.editingCode);
    await refreshPrograms();
    UI.closeModal();
  } catch (error) {
    UI.setNotice(
      UI.els.formMessage,
      error.message || t("messages.deleteFailed"),
      "error"
    );
  }
}

async function handleSeed() {
  if (!state.dbReady) {
    UI.setNotice(
      UI.els.calcMessage,
      t("messages.dbUnavailableSeed"),
      "error"
    );
    return;
  }

  if (!window.confirm(t("messages.seedConfirm"))) {
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
    UI.setNotice(
      UI.els.calcMessage,
      error.message || t("messages.seedFailed"),
      "error"
    );
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
    setState({
      editingCode: null,
      modalContext: { type: "template", name: template.name, allowCodeEdit: true },
    });
    UI.openModal({
      title: t("titles.templateFrom", { name: template.name }),
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
    if (!window.confirm(t("messages.templateDeleteConfirm"))) return;
    try {
      await deleteTemplate(id);
      await refreshTemplates();
    } catch (error) {
      UI.setNotice(
        UI.els.calcMessage,
        error.message || t("messages.templateDeleteFailed"),
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
    const summary = {
      totals: entry.totals || [],
      used: entry.used || [],
      missing: entry.missing || [],
      warnings: entry.warnings || [],
      errors: entry.errors || [],
      timestamp: entry.createdAt,
    };
    setState({ lastSummary: summary });
    UI.renderSummary(summary);
    const rows = entry.inputs?.length ? entry.inputs : entry.used || [];
    if (rows.length) {
      UI.rebuildConsumptionRows(
        rows.map((item) => ({ code: item.code, times: item.times }))
      );
    }
    UI.setNotice(
      UI.els.calcMessage,
      t("messages.viewingHistory", {
        date: entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "-",
      }),
      "info"
    );
    const panel = document.getElementById("summaryPanel");
    if (panel) {
      panel.classList.remove("flash");
      void panel.offsetWidth;
      panel.classList.add("flash");
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  if (action === "export") {
    exportJson(entry, `fertilizer-history-${id}.json`);
    return;
  }

  if (action === "delete") {
    if (!window.confirm(t("messages.historyDeleteConfirm"))) return;
    try {
      await deleteHistoryEntry(id);
      await refreshHistory();
    } catch (error) {
      UI.setNotice(
        UI.els.calcMessage,
        error.message || t("messages.historyDeleteFailed"),
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

function getModalTitle(context) {
  if (!context || !context.type) return t("titles.newProgram");
  if (context.type === "edit") {
    return t("titles.editProgram", { code: context.code });
  }
  if (context.type === "duplicate") {
    return t("titles.duplicateProgram", { code: context.code });
  }
  if (context.type === "template") {
    return t("titles.templateFrom", { name: context.name });
  }
  return t("titles.newProgram");
}

function updateLanguage(nextLang) {
  setLanguage(nextLang);
  applyTranslations();
  UI.setNetworkStatus(navigator.onLine);

  if (state.dbReady) {
    UI.setDbStatus(t("status.dbReady"), "success");
  } else if (state.dbError) {
    UI.setDbStatus(t("status.dbError"), "error");
  } else {
    UI.setDbStatus(t("status.dbLoading"), "info");
  }

  UI.renderProgramsState({
    loading: state.loading,
    error: state.dbError,
    programs: state.programs,
    query: normalizeCode(UI.els.searchInput.value),
  });
  UI.renderTemplatesTable(state.templates || []);
  UI.renderHistoryTable(state.history || []);

  if (state.lastSummary) {
    UI.renderSummary(state.lastSummary);
  } else {
    UI.renderSummary({
      totals: [],
      used: [],
      missing: [],
      warnings: [],
      errors: [],
      timestamp: "",
    });
  }

  const rows = UI.getConsumptionInputRows();
  UI.rebuildConsumptionRows(rows);

  if (!UI.els.modalBackdrop.classList.contains("hidden")) {
    const input = UI.getProgramFormInput();
    const context = state.modalContext || { type: "new", allowCodeEdit: true };
    const title = getModalTitle(context);
    UI.openModal({
      title,
      program: {
        ...input,
        allowCodeEdit: context.allowCodeEdit,
      },
    });
  }
}

function handleExportHistory() {
  if (!state.history.length) {
    UI.setNotice(UI.els.calcMessage, t("messages.noHistoryExport"), "warn");
    return;
  }
  exportJson(state.history, t("messages.historyExportName"));
}

async function handleClearHistory() {
  if (!state.history.length) return;
  if (!window.confirm(t("messages.historyClearConfirm"))) return;
  try {
    await clearHistory();
    await refreshHistory();
  } catch (error) {
    UI.setNotice(
      UI.els.calcMessage,
      error.message || t("messages.historyClearFailed"),
      "error"
    );
  }
}

function handlePrintReport() {
  window.print();
}

function handleLanguageChange() {
  if (!UI.els.languageSelect) return;
  updateLanguage(UI.els.languageSelect.value);
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
    onLanguageChange: handleLanguageChange,
  });
}

async function init() {
  if (UI.els.languageSelect) {
    UI.els.languageSelect.value = getLanguage();
  }
  applyTranslations();
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
    UI.setDbStatus(t("status.dbReady"), "success");
    await refreshPrograms();
    await refreshTemplates();
    await refreshHistory();
  } catch (error) {
    const message = error.message || t("messages.dbUnavailable");
    setState({ dbReady: false, dbError: message, loading: false });
    UI.setDbStatus(t("status.dbError"), "error");
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
