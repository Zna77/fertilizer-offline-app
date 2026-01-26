import { normalizeName, normalizeUnit, parseNumber } from "./models.js";

function mergeFertilizers(programCode, fertilizers) {
  const combined = new Map();
  const warnings = [];
  const errors = [];

  fertilizers.forEach((fertilizer) => {
    const name = normalizeName(fertilizer.name);
    const unit = normalizeUnit(fertilizer.unit);
    const value = parseNumber(fertilizer.value);

    if (!name) {
      warnings.push(`Skipped unnamed fertilizer in program ${programCode}.`);
      return;
    }

    if (!unit) {
      warnings.push(`Skipped ${name} in ${programCode}: unit must be kg or L.`);
      return;
    }

    if (!Number.isFinite(value) || value <= 0) {
      warnings.push(
        `Skipped ${name} in ${programCode}: value must be greater than 0.`
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
        `Unit mismatch inside program ${programCode} for ${name}: ${existing.unit} vs ${unit}.`
      );
      return;
    }

    existing.value += value;
    warnings.push(
      `Duplicate fertilizer ${name} in program ${programCode}; values combined.`
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
          `Unit mismatch for ${key}: ${existing.unit} vs ${fertilizer.unit}.`
        );
        return;
      }

      existing.value += value;
    });
  });

  return { totals: [...totals.values()], used, missing: [...missing], warnings, errors };
}
