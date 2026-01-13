"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    let active = true;

    import("../src/app.js").then((module) => {
      if (!active) return;
      if (typeof module.initApp === "function") {
        module.initApp();
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo" aria-hidden="true">
            F
          </div>
          <div>
            <p className="kicker" data-i18n="app.kicker">
              Fertilizer Programs
            </p>
            <h1 data-i18n="app.title">Offline Program Manager</h1>
          </div>
        </div>

        <div className="status">
          <span
            id="dbStatus"
            className="status-chip"
            data-tone="info"
            data-i18n="status.dbLoading"
          >
            DB Loading
          </span>
          <span
            id="netStatus"
            className="status-chip"
            data-tone="info"
            data-i18n="status.online"
          >
            Online
          </span>
        </div>

        <div className="topbar-actions">
          <div className="lang-select">
            <label className="sr-only" htmlFor="languageSelect" data-i18n="labels.language">
              Language
            </label>
            <select id="languageSelect" className="select select-small">
              <option value="en" data-i18n="language.english">
                English
              </option>
              <option value="fr" data-i18n="language.french">
                Francais
              </option>
              <option value="ar" data-i18n="language.arabic">
                العربية
              </option>
            </select>
          </div>
          <button
            id="seedBtn"
            className="btn btn-secondary"
            type="button"
            data-i18n="actions.seed"
          >
            Seed
          </button>
          <button
            id="newProgramBtn"
            className="btn btn-primary"
            type="button"
            data-i18n="actions.newProgram"
          >
            New Program
          </button>
        </div>
      </header>

      <main className="container">
        <div className="banner-stack">
          <div
            id="offlineBanner"
            className="banner hidden"
            data-tone="warn"
            role="status"
            aria-live="polite"
            data-i18n="messages.offlineBanner"
          >
            You are offline. Some actions may be unavailable.
          </div>
          <div
            id="updateBanner"
            className="banner hidden"
            data-tone="info"
            role="status"
            aria-live="polite"
          >
            <span data-i18n="messages.updateAvailable">
              Update available. Refresh to apply the latest version.
            </span>
            <button
              id="reloadAppBtn"
              className="btn btn-primary btn-compact"
              type="button"
              data-i18n="actions.reload"
            >
              Refresh
            </button>
          </div>
        </div>
        <section className="panel print-panel" id="summaryPanel">
          <div className="panel-head">
            <div>
              <h2 data-i18n="titles.dailyConsumption">Daily Consumption</h2>
              <p className="muted" data-i18n="help.dailyConsumption">
                Add program codes and times. Example: N02 x 3, N03 x 1.
              </p>
            </div>
          </div>

          <div className="panel-grid">
            <div className="panel-col print-hidden">
              <div className="stack" id="consumptionRows"></div>

              <div className="row">
                <button
                  id="addConsumptionRowBtn"
                  className="btn btn-secondary"
                  type="button"
                  data-i18n="actions.addProgram"
                >
                  Add program
                </button>
                <button
                  id="calcBtn"
                  className="btn btn-primary"
                  type="button"
                  data-i18n="actions.calculate"
                >
                  Calculate
                </button>
              </div>

              <div id="calcMessage" className="notice" role="status" aria-live="polite"></div>
            </div>

            <div className="panel-col print-report">
              <div className="summary">
                <div className="summary-item">
                  <div className="muted" data-i18n="labels.programsUsed">
                    Programs used
                  </div>
                  <div id="summaryPrograms" className="summary-value">
                    -
                  </div>
                </div>
                <div className="summary-item">
                  <div className="muted" data-i18n="labels.totalItems">
                    Total items
                  </div>
                  <div id="summaryCount" className="summary-value">
                    -
                  </div>
                </div>
              </div>

              <div className="row between report-actions">
                <div id="reportMeta" className="report-meta muted">
                  <span data-i18n="report.lastCalculation">Last calculation</span>:{" "}
                  <span id="reportTimestamp">-</span>
                </div>
                <button
                  id="printReportBtn"
                  className="btn btn-secondary"
                  type="button"
                  data-i18n="actions.printReport"
                >
                  Print report
                </button>
              </div>

              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th data-i18n="labels.fertilizer">Fertilizer</th>
                      <th className="right" data-i18n="labels.total">
                        Total
                      </th>
                      <th data-i18n="labels.unit">Unit</th>
                    </tr>
                  </thead>
                  <tbody id="summaryBody">
                    <tr>
                      <td colSpan="3" className="muted" data-i18n="table.noResults">
                        No results yet.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="panel print-hidden">
          <div className="panel-head between">
            <div>
              <h2 data-i18n="titles.programs">Programs</h2>
              <p className="muted" data-i18n="help.programs">
                Create, edit, and delete fertilizer recipes stored offline.
              </p>
            </div>
            <div className="row">
              <label className="sr-only" htmlFor="searchInput" data-i18n="labels.searchPrograms">
                Search programs
              </label>
              <input
                id="searchInput"
                className="input"
                type="search"
                placeholder="Search program code"
                data-i18n-placeholder="placeholders.searchProgram"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th data-i18n="labels.programCode">Code</th>
                  <th className="right" data-i18n="labels.fertilizers">
                    Fertilizers
                  </th>
                  <th className="right" data-i18n="labels.updated">
                    Updated
                  </th>
                  <th className="right" data-i18n="labels.actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="programsBody">
                <tr>
                  <td colSpan="4" className="muted" data-i18n="table.loadingPrograms">
                    Loading programs...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel print-hidden">
          <div className="panel-head between">
            <div>
              <h2 data-i18n="titles.templates">Templates</h2>
              <p className="muted" data-i18n="help.templates">
                Save programs as templates and reuse them for new programs.
              </p>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th data-i18n="labels.name">Name</th>
                  <th className="right" data-i18n="labels.fertilizers">
                    Fertilizers
                  </th>
                  <th className="right" data-i18n="labels.actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="templatesBody">
                <tr>
                  <td colSpan="3" className="muted" data-i18n="table.noTemplates">
                    No templates yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel print-hidden">
          <div className="panel-head between">
            <div>
              <h2 data-i18n="titles.history">History</h2>
              <p className="muted" data-i18n="help.history">
                Recent calculations with timestamps.
              </p>
            </div>
            <div className="row">
              <button
                id="exportHistoryBtn"
                className="btn btn-secondary"
                type="button"
                data-i18n="actions.exportJson"
              >
                Export JSON
              </button>
              <button
                id="clearHistoryBtn"
                className="btn btn-danger"
                type="button"
                data-i18n="actions.clear"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th data-i18n="labels.when">When</th>
                  <th data-i18n="labels.programs">Programs</th>
                  <th className="right" data-i18n="labels.items">
                    Items
                  </th>
                  <th className="right" data-i18n="labels.actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="historyBody">
                <tr>
                  <td colSpan="4" className="muted" data-i18n="table.noHistory">
                    No history yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <div
        id="modalBackdrop"
        className="modal-backdrop hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        <div className="modal">
          <div className="modal-head row between">
            <h3 id="modalTitle" data-i18n="titles.newProgram">
              New Program
            </h3>
            <button
              id="closeModalBtn"
              className="icon-btn"
              type="button"
              title="Close"
              data-i18n="actions.close"
              data-i18n-title="actions.close"
            >
              Close
            </button>
          </div>

          <form id="programForm" className="modal-body" autoComplete="off">
            <div className="grid grid-2">
              <div className="field">
                <label className="label" htmlFor="programCode" data-i18n="labels.programCode">
                  Program code
                </label>
                <input
                  id="programCode"
                  className="input"
                  placeholder="N02"
                  data-i18n-placeholder="placeholders.programCode"
                  required
                />
                <div className="help muted" data-i18n="help.uniqueCode">
                  Unique code. Example: N01, N02.
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="programNotes" data-i18n="labels.notesOptional">
                  Notes (optional)
                </label>
                <input
                  id="programNotes"
                  className="input"
                  placeholder="e.g. Winter mix"
                  data-i18n-placeholder="placeholders.programNotes"
                />
              </div>
            </div>

            <div className="row between">
              <label className="label" data-i18n="labels.fertilizers">
                Fertilizers
              </label>
              <button
                type="button"
                id="addFertRowBtn"
                className="btn btn-secondary"
                data-i18n="actions.addFertilizer"
              >
                Add fertilizer
              </button>
            </div>

            <div id="fertRows" className="stack"></div>

            <div className="modal-foot row between">
              <div id="formMessage" className="notice" role="status" aria-live="polite"></div>
              <div className="row">
                <button
                  type="button"
                  id="deleteProgramBtn"
                  className="btn btn-danger hidden"
                  data-i18n="actions.delete"
                >
                  Delete
                </button>
                <button type="submit" className="btn btn-primary" data-i18n="actions.save">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div
        id="historySheetBackdrop"
        className="sheet-backdrop"
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
        aria-labelledby="historySheetTitle"
      >
        <div className="sheet">
          <div className="sheet-head row between">
            <h3 id="historySheetTitle" data-i18n="titles.historyDetails">
              History details
            </h3>
            <button
              id="historySheetCloseBtn"
              className="icon-btn"
              type="button"
              title="Close"
              data-i18n="actions.close"
              data-i18n-title="actions.close"
            >
              Close
            </button>
          </div>

          <div className="sheet-body">
            <div className="summary">
              <div className="summary-item">
                <div className="muted" data-i18n="labels.programsUsed">
                  Programs used
                </div>
                <div id="sheetSummaryPrograms" className="summary-value">
                  -
                </div>
              </div>
              <div className="summary-item">
                <div className="muted" data-i18n="labels.totalItems">
                  Total items
                </div>
                <div id="sheetSummaryCount" className="summary-value">
                  -
                </div>
              </div>
            </div>

            <div className="report-meta muted">
              <span data-i18n="report.lastCalculation">Last calculation</span>:{" "}
              <span id="sheetTimestamp">-</span>
            </div>

            <div id="sheetMessage" className="notice" role="status" aria-live="polite"></div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th data-i18n="labels.fertilizer">Fertilizer</th>
                    <th className="right" data-i18n="labels.total">
                      Total
                    </th>
                    <th data-i18n="labels.unit">Unit</th>
                  </tr>
                </thead>
                <tbody id="sheetSummaryBody">
                  <tr>
                    <td colSpan="3" className="muted" data-i18n="table.noResults">
                      No results yet.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
