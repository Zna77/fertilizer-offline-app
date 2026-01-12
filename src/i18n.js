const STORAGE_KEY = "fertilizer_lang";
const SUPPORTED_LANGS = ["en", "fr", "ar"];
const RTL_LANGS = new Set(["ar"]);

const translations = {
  en: {
    app: {
      kicker: "Fertilizer Programs",
      title: "Offline Program Manager",
      documentTitle: "Fertilizer Programs Offline",
    },
    language: {
      english: "English",
      french: "Francais",
      arabic: "Arabic",
    },
    status: {
      dbLoading: "DB Loading",
      dbReady: "DB Ready",
      dbError: "DB Error",
      online: "Online",
      offline: "Offline",
    },
    actions: {
      seed: "Seed",
      newProgram: "New Program",
      addProgram: "Add program",
      calculate: "Calculate",
      addFertilizer: "Add fertilizer",
      save: "Save",
      delete: "Delete",
      close: "Close",
      edit: "Edit",
      duplicate: "Duplicate",
      template: "Template",
      use: "Use",
      view: "View",
      export: "Export",
      exportJson: "Export JSON",
      clear: "Clear",
      printReport: "Print report",
    },
    titles: {
      dailyConsumption: "Daily Consumption",
      programs: "Programs",
      templates: "Templates",
      history: "History",
      historyDetails: "History details",
      newProgram: "New Program",
      editProgram: "Edit Program {code}",
      duplicateProgram: "Duplicate {code}",
      templateFrom: "New from template: {name}",
    },
    labels: {
      programsUsed: "Programs used",
      totalItems: "Total items",
      fertilizer: "Fertilizer",
      total: "Total",
      unit: "Unit",
      programCode: "Program code",
      notesOptional: "Notes (optional)",
      fertilizers: "Fertilizers",
      searchPrograms: "Search programs",
      name: "Name",
      updated: "Updated",
      actions: "Actions",
      when: "When",
      programs: "Programs",
      items: "Items",
      templates: "Templates",
      history: "History",
      lastCalculation: "Last calculation",
      times: "Times",
      remove: "Remove",
      language: "Language",
      value: "Value",
    },
    help: {
      dailyConsumption:
        "Add program codes and times. Example: N02 x 3, N03 x 1.",
      programs: "Create, edit, and delete fertilizer recipes stored offline.",
      templates: "Save programs as templates and reuse them for new programs.",
      history: "Recent calculations with timestamps.",
      uniqueCode: "Unique code. Example: N01, N02.",
    },
    placeholders: {
      searchProgram: "Search program code",
      programCode: "N02",
      programNotes: "e.g. Winter mix",
      fertilizerName: "NITRATE CALCIUM",
      fertilizerValue: "0.35",
      times: "1",
    },
    table: {
      noResults: "No results yet.",
      loadingPrograms: "Loading programs...",
      noPrograms: 'No programs yet. Click "New Program".',
      noTemplates: "No templates yet.",
      noHistory: "No history yet.",
    },
    report: {
      lastCalculation: "Last calculation",
    },
    messages: {
      missingPrograms: "Missing program(s): {codes}.",
      missingShort: " (missing: {codes})",
      addProgramRow: "Add at least one program row to calculate.",
      programsLoadFailed: "Unable to load programs.",
      dbUnavailable: "Database unavailable.",
      dbUnavailableSave: "Database unavailable. Cannot save programs.",
      dbUnavailableSeed: "Database unavailable. Cannot seed data.",
      programExists: "Program code already exists.",
      saveFailed: "Save failed.",
      deleteFailed: "Delete failed.",
      loadFailed: "Load failed.",
      seedFailed: "Seed failed.",
      seedConfirm: "Seed sample programs? This will overwrite N02/N03.",
      deleteProgramConfirm: "Delete program {code}?",
      templateNamePrompt: "Template name",
      templateDeleteConfirm: "Delete this template?",
      templateSaveFailed: "Template save failed.",
      templateDeleteFailed: "Template delete failed.",
      historyDeleteConfirm: "Delete this history entry?",
      historyClearConfirm: "Clear all history entries?",
      historyDeleteFailed: "History delete failed.",
      historyClearFailed: "History clear failed.",
      historySaveFailed: "Unable to save history.",
      viewingHistory: "Showing history from {date}.",
      noHistoryExport: "No history to export.",
      historyExportName: "fertilizer-history.json",
    },
    validation: {
      programCodeRequired: "Program code is required.",
      programCodeInvalid:
        "Program code can only use letters, numbers, hyphen, or underscore.",
      fertilizerRequired: "Add at least one fertilizer.",
      rowProgramRequired: "Row {index}: program code is required.",
      rowTimesInvalid: "Row {index}: times must be a positive number.",
      rowFertilizerNameRequired: "Row {index}: fertilizer name is required.",
      rowFertilizerValueInvalid: "Row {index}: value must be greater than 0.",
      rowFertilizerUnitInvalid: "Row {index}: unit must be kg or L.",
      duplicateFertilizers: "Duplicate fertilizer names: {names}.",
    },
    calc: {
      skippedUnnamed: "Skipped unnamed fertilizer in program {code}.",
      skippedUnit: "Skipped {name} in {code}: unit must be kg or L.",
      skippedValue: "Skipped {name} in {code}: value must be greater than 0.",
      unitMismatchProgram:
        "Unit mismatch inside program {code} for {name}: {unitA} vs {unitB}.",
      duplicateCombined:
        "Duplicate fertilizer {name} in program {code}; values combined.",
      unitMismatchTotals:
        "Unit mismatch for {name}: {unitA} vs {unitB}.",
    },
  },
  fr: {
    app: {
      kicker: "Programmes d'engrais",
      title: "Gestionnaire hors ligne",
      documentTitle: "Programmes d'engrais hors ligne",
    },
    language: {
      english: "Anglais",
      french: "Francais",
      arabic: "Arabe",
    },
    status: {
      dbLoading: "BD chargement",
      dbReady: "BD prete",
      dbError: "BD erreur",
      online: "En ligne",
      offline: "Hors ligne",
    },
    actions: {
      seed: "Exemples",
      newProgram: "Nouveau programme",
      addProgram: "Ajouter programme",
      calculate: "Calculer",
      addFertilizer: "Ajouter engrais",
      save: "Enregistrer",
      delete: "Supprimer",
      close: "Fermer",
      edit: "Modifier",
      duplicate: "Dupliquer",
      template: "Modele",
      use: "Utiliser",
      view: "Voir",
      export: "Exporter",
      exportJson: "Exporter JSON",
      clear: "Effacer",
      printReport: "Imprimer rapport",
    },
    titles: {
      dailyConsumption: "Consommation quotidienne",
      programs: "Programmes",
      templates: "Modeles",
      history: "Historique",
      historyDetails: "Details historique",
      newProgram: "Nouveau programme",
      editProgram: "Modifier programme {code}",
      duplicateProgram: "Dupliquer {code}",
      templateFrom: "Nouveau depuis modele: {name}",
    },
    labels: {
      programsUsed: "Programmes utilises",
      totalItems: "Total elements",
      fertilizer: "Engrais",
      total: "Total",
      unit: "Unite",
      programCode: "Code programme",
      notesOptional: "Notes (optionnel)",
      fertilizers: "Engrais",
      searchPrograms: "Rechercher programmes",
      name: "Nom",
      updated: "Mis a jour",
      actions: "Actions",
      when: "Quand",
      programs: "Programmes",
      items: "Elements",
      templates: "Modeles",
      history: "Historique",
      lastCalculation: "Dernier calcul",
      times: "Fois",
      remove: "Retirer",
      language: "Langue",
      value: "Valeur",
    },
    help: {
      dailyConsumption:
        "Ajoutez des codes de programme et des fois. Exemple: N02 x 3, N03 x 1.",
      programs: "Creez, modifiez et supprimez des recettes hors ligne.",
      templates: "Sauvegardez des programmes comme modeles.",
      history: "Calculs recents avec horodatage.",
      uniqueCode: "Code unique. Exemple: N01, N02.",
    },
    placeholders: {
      searchProgram: "Rechercher code programme",
      programCode: "N02",
      programNotes: "ex: melange hiver",
      fertilizerName: "NITRATE CALCIUM",
      fertilizerValue: "0.35",
      times: "1",
    },
    table: {
      noResults: "Aucun resultat.",
      loadingPrograms: "Chargement des programmes...",
      noPrograms: 'Aucun programme. Cliquez "Nouveau programme".',
      noTemplates: "Aucun modele.",
      noHistory: "Aucun historique.",
    },
    report: {
      lastCalculation: "Dernier calcul",
    },
    messages: {
      missingPrograms: "Programme(s) manquant(s): {codes}.",
      missingShort: " (manquant: {codes})",
      addProgramRow: "Ajoutez au moins un programme pour calculer.",
      programsLoadFailed: "Impossible de charger les programmes.",
      dbUnavailable: "BD indisponible.",
      dbUnavailableSave: "BD indisponible. Impossible d'enregistrer.",
      dbUnavailableSeed: "BD indisponible. Impossible d'initialiser.",
      programExists: "Code programme existe deja.",
      saveFailed: "Echec d'enregistrement.",
      deleteFailed: "Echec de suppression.",
      loadFailed: "Echec de chargement.",
      seedFailed: "Echec d'initialisation.",
      seedConfirm: "Initialiser les exemples? Ceci ecrasera N02/N03.",
      deleteProgramConfirm: "Supprimer programme {code}?",
      templateNamePrompt: "Nom du modele",
      templateDeleteConfirm: "Supprimer ce modele?",
      templateSaveFailed: "Echec enregistrement modele.",
      templateDeleteFailed: "Echec suppression modele.",
      historyDeleteConfirm: "Supprimer cet historique?",
      historyClearConfirm: "Effacer tout l'historique?",
      historyDeleteFailed: "Echec suppression historique.",
      historyClearFailed: "Echec nettoyage historique.",
      historySaveFailed: "Impossible d'enregistrer l'historique.",
      viewingHistory: "Historique affiche du {date}.",
      noHistoryExport: "Aucun historique a exporter.",
      historyExportName: "historique-engrais.json",
    },
    validation: {
      programCodeRequired: "Code programme requis.",
      programCodeInvalid:
        "Code programme: lettres, chiffres, tiret ou underscore.",
      fertilizerRequired: "Ajoutez au moins un engrais.",
      rowProgramRequired: "Ligne {index}: code programme requis.",
      rowTimesInvalid: "Ligne {index}: fois doit etre positif.",
      rowFertilizerNameRequired: "Ligne {index}: nom engrais requis.",
      rowFertilizerValueInvalid: "Ligne {index}: valeur doit etre > 0.",
      rowFertilizerUnitInvalid: "Ligne {index}: unite doit etre kg ou L.",
      duplicateFertilizers: "Noms d'engrais en double: {names}.",
    },
    calc: {
      skippedUnnamed: "Engrais sans nom ignore dans {code}.",
      skippedUnit: "Ignore {name} dans {code}: unite doit etre kg ou L.",
      skippedValue: "Ignore {name} dans {code}: valeur doit etre > 0.",
      unitMismatchProgram:
        "Incoherence unite dans {code} pour {name}: {unitA} vs {unitB}.",
      duplicateCombined:
        "Doublon {name} dans {code}; valeurs combinees.",
      unitMismatchTotals:
        "Incoherence unite pour {name}: {unitA} vs {unitB}.",
    },
  },
  ar: {
    app: {
      kicker: "برامج الأسمدة",
      title: "مدير البرامج بدون إنترنت",
      documentTitle: "برامج الأسمدة بدون إنترنت",
    },
    language: {
      english: "الإنجليزية",
      french: "الفرنسية",
      arabic: "العربية",
    },
    status: {
      dbLoading: "تحميل قاعدة البيانات",
      dbReady: "قاعدة البيانات جاهزة",
      dbError: "خطأ في قاعدة البيانات",
      online: "متصل",
      offline: "غير متصل",
    },
    actions: {
      seed: "بيانات تجريبية",
      newProgram: "برنامج جديد",
      addProgram: "إضافة برنامج",
      calculate: "احسب",
      addFertilizer: "إضافة سماد",
      save: "حفظ",
      delete: "حذف",
      close: "إغلاق",
      edit: "تعديل",
      duplicate: "نسخ",
      template: "قالب",
      use: "استخدام",
      view: "عرض",
      export: "تصدير",
      exportJson: "تصدير JSON",
      clear: "مسح",
      printReport: "طباعة التقرير",
    },
    titles: {
      dailyConsumption: "الاستهلاك اليومي",
      programs: "البرامج",
      templates: "القوالب",
      history: "السجل",
      historyDetails: "تفاصيل السجل",
      newProgram: "برنامج جديد",
      editProgram: "تعديل البرنامج {code}",
      duplicateProgram: "نسخ {code}",
      templateFrom: "جديد من القالب: {name}",
    },
    labels: {
      programsUsed: "البرامج المستخدمة",
      totalItems: "إجمالي العناصر",
      fertilizer: "السماد",
      total: "الإجمالي",
      unit: "الوحدة",
      programCode: "رمز البرنامج",
      notesOptional: "ملاحظات (اختياري)",
      fertilizers: "الأسمدة",
      searchPrograms: "بحث عن البرامج",
      name: "الاسم",
      updated: "آخر تحديث",
      actions: "الإجراءات",
      when: "الوقت",
      programs: "البرامج",
      items: "العناصر",
      templates: "القوالب",
      history: "السجل",
      lastCalculation: "آخر عملية حساب",
      times: "مرات",
      remove: "إزالة",
      language: "اللغة",
      value: "القيمة",
    },
    help: {
      dailyConsumption:
        "أضف رموز البرامج وعدد المرات. مثال: N02 × 3، N03 × 1.",
      programs: "أنشئ وعدل واحذف وصفات الأسمدة المحفوظة محليًا.",
      templates: "احفظ البرامج كقوالب واستخدمها لإنشاء برامج جديدة.",
      history: "حسابات حديثة مع طابع زمني.",
      uniqueCode: "رمز فريد. مثال: N01، N02.",
    },
    placeholders: {
      searchProgram: "ابحث عن رمز البرنامج",
      programCode: "N02",
      programNotes: "مثال: خلطة الشتاء",
      fertilizerName: "نترات الكالسيوم",
      fertilizerValue: "0.35",
      times: "1",
    },
    table: {
      noResults: "لا توجد نتائج بعد.",
      loadingPrograms: "جاري تحميل البرامج...",
      noPrograms: 'لا توجد برامج بعد. اضغط "برنامج جديد".',
      noTemplates: "لا توجد قوالب بعد.",
      noHistory: "لا يوجد سجل بعد.",
    },
    report: {
      lastCalculation: "آخر عملية حساب",
    },
    messages: {
      missingPrograms: "برامج مفقودة: {codes}.",
      missingShort: " (مفقودة: {codes})",
      addProgramRow: "أضف برنامجًا واحدًا على الأقل للحساب.",
      programsLoadFailed: "تعذر تحميل البرامج.",
      dbUnavailable: "قاعدة البيانات غير متاحة.",
      dbUnavailableSave: "قاعدة البيانات غير متاحة. لا يمكن الحفظ.",
      dbUnavailableSeed: "قاعدة البيانات غير متاحة. لا يمكن إنشاء بيانات تجريبية.",
      programExists: "رمز البرنامج موجود بالفعل.",
      saveFailed: "فشل الحفظ.",
      deleteFailed: "فشل الحذف.",
      loadFailed: "فشل التحميل.",
      seedFailed: "فشل إنشاء البيانات التجريبية.",
      seedConfirm: "هل تريد إنشاء بيانات تجريبية؟ سيتم استبدال N02/N03.",
      deleteProgramConfirm: "حذف البرنامج {code}؟",
      templateNamePrompt: "اسم القالب",
      templateDeleteConfirm: "حذف هذا القالب؟",
      templateSaveFailed: "فشل حفظ القالب.",
      templateDeleteFailed: "فشل حذف القالب.",
      historyDeleteConfirm: "حذف سجل هذه العملية؟",
      historyClearConfirm: "مسح كل سجلات التاريخ؟",
      historyDeleteFailed: "فشل حذف السجل.",
      historyClearFailed: "فشل مسح السجل.",
      historySaveFailed: "تعذر حفظ السجل.",
      viewingHistory: "عرض السجل بتاريخ {date}.",
      noHistoryExport: "لا يوجد سجل للتصدير.",
      historyExportName: "fertilizer-history-ar.json",
    },
    validation: {
      programCodeRequired: "رمز البرنامج مطلوب.",
      programCodeInvalid:
        "رمز البرنامج يجب أن يحتوي على أحرف أو أرقام أو شرطة أو underscore.",
      fertilizerRequired: "أضف سمادًا واحدًا على الأقل.",
      rowProgramRequired: "السطر {index}: رمز البرنامج مطلوب.",
      rowTimesInvalid: "السطر {index}: عدد المرات يجب أن يكون رقمًا موجبًا.",
      rowFertilizerNameRequired: "السطر {index}: اسم السماد مطلوب.",
      rowFertilizerValueInvalid: "السطر {index}: القيمة يجب أن تكون أكبر من 0.",
      rowFertilizerUnitInvalid: "السطر {index}: الوحدة يجب أن تكون kg أو L.",
      duplicateFertilizers: "أسماء أسمدة مكررة: {names}.",
    },
    calc: {
      skippedUnnamed: "تم تجاهل سماد بدون اسم في البرنامج {code}.",
      skippedUnit: "تم تجاهل {name} في {code}: الوحدة يجب أن تكون kg أو L.",
      skippedValue: "تم تجاهل {name} في {code}: القيمة يجب أن تكون أكبر من 0.",
      unitMismatchProgram:
        "عدم تطابق الوحدات داخل البرنامج {code} للعنصر {name}: {unitA} مقابل {unitB}.",
      duplicateCombined:
        "اسم السماد {name} مكرر في {code}؛ تم جمع القيم.",
      unitMismatchTotals:
        "عدم تطابق الوحدات للعنصر {name}: {unitA} مقابل {unitB}.",
    },
  },
};

function resolveValue(lang, key) {
  const parts = key.split(".");
  let current = translations[lang];
  for (const part of parts) {
    if (!current || typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
}

let currentLanguage = "en";
try {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED_LANGS.includes(stored)) {
    currentLanguage = stored;
  }
} catch (error) {
  currentLanguage = "en";
}

document.documentElement.lang = currentLanguage;
document.documentElement.dir = RTL_LANGS.has(currentLanguage) ? "rtl" : "ltr";

export function getLanguage() {
  return currentLanguage;
}

export function setLanguage(lang) {
  const next = SUPPORTED_LANGS.includes(lang) ? lang : "en";
  currentLanguage = next;
  document.documentElement.lang = next;
  document.documentElement.dir = RTL_LANGS.has(next) ? "rtl" : "ltr";
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch (error) {
    /* ignore storage errors */
  }
}

export function t(key, vars = {}) {
  const value =
    resolveValue(currentLanguage, key) ?? resolveValue("en", key) ?? key;
  if (typeof value !== "string") return key;
  return value.replace(/\{(\w+)\}/g, (_, token) =>
    Object.prototype.hasOwnProperty.call(vars, token) ? vars[token] : `{${token}}`
  );
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });

  root.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(node.dataset.i18nTitle));
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
  });

  document.title = t("app.documentTitle");
}
