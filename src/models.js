const CODE_PATTERN = /^[A-Z0-9][A-Z0-9-_]*$/;
const UNIT_ALIASES = new Map([
  ["kg", "kg"],
  ["kgs", "kg"],
  ["k g", "kg"],
  ["kilogram", "kg"],
  ["kilograms", "kg"],
  ["l", "L"],
  ["lt", "L"],
  ["ltr", "L"],
  ["liter", "L"],
  ["litre", "L"],
  ["liters", "L"],
  ["litres", "L"],
  ["l.", "L"],
]);

export function nowISO() {
  return new Date().toISOString();
}

export function normalizeCode(value) {
  return String(value ?? "").trim().toUpperCase();
}

export function normalizeName(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

export function normalizeUnit(value) {
  const raw = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (!raw) return "";
  return UNIT_ALIASES.get(raw) || "";
}

export function parseNumber(value) {
  if (value === null || value === undefined) return NaN;
  const raw = String(value)
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");
  if (!raw) return NaN;
  const num = Number(raw);
  return Number.isFinite(num) ? num : NaN;
}

export function formatNumber(value, decimals = 3) {
  if (!Number.isFinite(value)) return "-";
  const fixed = value.toFixed(decimals);
  return fixed.replace(/\.?0+$/, "");
}

export function isValidCode(code) {
  return CODE_PATTERN.test(code);
}

export function normalizeConsumptionRows(rows) {
  const normalized = [];
  const warnings = [];

  rows.forEach((row, index) => {
    const code = normalizeCode(row.code);
    const times = parseNumber(row.times);

    if (!code && !row.times) return;

    if (!code) {
      warnings.push(`Row ${index + 1}: program code is required.`);
      return;
    }

    if (!Number.isFinite(times) || times <= 0) {
      warnings.push(`Row ${index + 1}: times must be a positive number.`);
      return;
    }

    normalized.push({ code, times });
  });

  return { normalized, warnings };
}

export function parseFertilizerRows(rows) {
  const items = [];
  const errors = [];
  const seen = new Map();
  const duplicates = new Set();

  rows.forEach((row, index) => {
    const rawName = String(row.name ?? "").trim();
    const rawValue = String(row.value ?? "").trim();
    const rawUnit = String(row.unit ?? "").trim();

    if (!rawName && !rawValue && !rawUnit) return;

    const name = normalizeName(rawName);
    const unit = normalizeUnit(rawUnit);
    const value = parseNumber(rawValue);

    if (!name) {
      errors.push(`Row ${index + 1}: fertilizer name is required.`);
    }

    if (!Number.isFinite(value) || value <= 0) {
      errors.push(`Row ${index + 1}: value must be greater than 0.`);
    }

    if (!unit) {
      errors.push(`Row ${index + 1}: unit must be kg or L.`);
    }

    if (name) {
      if (seen.has(name)) {
        duplicates.add(name);
      } else {
        seen.set(name, true);
      }
    }

    items.push({ name, value, unit });
  });

  if (duplicates.size) {
    errors.push(
      `Duplicate fertilizer names: ${[...duplicates].sort().join(", ")}.`
    );
  }

  const validItems = items.filter(
    (item) => item.name && Number.isFinite(item.value) && item.value > 0 && item.unit
  );

  return { items: validItems, errors };
}

export function buildProgram(raw) {
  const code = normalizeCode(raw.code);
  const notes = String(raw.notes ?? "").trim();
  const { items, errors } = parseFertilizerRows(raw.fertilizers || []);

  if (!code) {
    errors.unshift("Program code is required.");
  } else if (!isValidCode(code)) {
    errors.unshift(
      "Program code can only use letters, numbers, hyphen, or underscore."
    );
  }

  if (items.length === 0) {
    errors.push("Add at least one fertilizer.");
  }

  return {
    program: {
      code,
      notes,
      fertilizers: items,
      updatedAt: nowISO(),
    },
    errors,
  };
}
