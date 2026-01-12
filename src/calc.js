import { normalizeName, normalizeUnit, parseNumber } from "./models.js";
import { t } from "./i18n.js";

function mergeFertilizers(programCode, fertilizers) {
  const combined = new Map();
  const warnings = [];
  const errors = [];

  fertilizers.forEach((fertilizer) => {
    const name = normalizeName(fertilizer.name);
    const unit = normalizeUnit(fertilizer.unit);
    const value = parseNumber(fertilizer.value);

    if (!name) {
      warnings.push(t("calc.skippedUnnamed", { code: programCode }));
      return;
    }

    if (!unit) {
      warnings.push(t("calc.skippedUnit", { name, code: programCode }));
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      warnings.push(
        t("calc.skippedValue", { name, code: programCode })
      );
      return;
    }

    const key = name;
    if (!combined.has(key)) {
      combined.set(key, { name, unit, value });
      return;
    }

    const existing = combined.get(key);
    if (existing.unit !== unit) {
      errors.push(
        t("calc.unitMismatchProgram", {
          code: programCode,
          name,
          unitA: existing.unit,
          unitB: unit,
        })
      );
      return;
    }

    existing.value += value;
    warnings.push(
      t("calc.duplicateCombined", { name, code: programCode })
    );
  });

  return { combined: [...combined.values()], warnings, errors };
}

export function aggregateConsumption(consumptionRows, programsByCode) {
  const totals = new Map();
  const used = [];
  const missing = new Set();
  const warnings = [];
  const errors = [];

  consumptionRows.forEach((row) => {
    const program = programsByCode.get(row.code);
    if (!program) {
      missing.add(row.code);
      return;
    }

    used.push({ code: row.code, times: row.times });

    const merged = mergeFertilizers(row.code, program.fertilizers || []);
    warnings.push(...merged.warnings);
    errors.push(...merged.errors);

    merged.combined.forEach((fertilizer) => {
      const key = fertilizer.name;
      const value = fertilizer.value * row.times;

      if (!totals.has(key)) {
        totals.set(key, { name: key, unit: fertilizer.unit, value });
        return;
      }

      const existing = totals.get(key);
      if (existing.unit !== fertilizer.unit) {
        errors.push(
          t("calc.unitMismatchTotals", {
            name: key,
            unitA: existing.unit,
            unitB: fertilizer.unit,
          })
        );
        return;
      }

      existing.value += value;
    });
  });

  return { totals: [...totals.values()], used, missing: [...missing], warnings, errors };
}
