const listeners = new Set();

export const state = {
  programs: [],
  programsByCode: new Map(),
  templates: [],
  history: [],
  loading: true,
  dbReady: false,
  dbError: "",
  editingCode: null,
};

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
