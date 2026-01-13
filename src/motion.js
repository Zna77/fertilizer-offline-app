import { animate, stagger } from "framer-motion/dom";

const mediaQuery =
  typeof globalThis.matchMedia === "function"
    ? globalThis.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

let reduceMotion = mediaQuery ? mediaQuery.matches : false;

const updateReducedMotion = () => {
  reduceMotion = mediaQuery.matches;
};

if (mediaQuery) {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", updateReducedMotion);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(updateReducedMotion);
  }
}

function canAnimate() {
  return !reduceMotion && typeof animate === "function";
}

export function animateIn(
  element,
  { y = 12, duration = 0.32, delay = 0 } = {}
) {
  if (!canAnimate() || !element) return null;
  return animate(
    element,
    { opacity: [0, 1], y: [y, 0] },
    { duration, ease: "easeOut", delay }
  );
}

export function animateOut(element, { y = -8, duration = 0.2 } = {}) {
  if (!canAnimate() || !element) return null;
  return animate(
    element,
    { opacity: [1, 0], y: [0, y] },
    { duration, ease: "easeIn" }
  );
}

export function animateList(
  container,
  selector = "tr",
  { y = 10, duration = 0.3, staggerStep = 0.04, startDelay = 0 } = {}
) {
  if (!canAnimate() || !container) return null;
  const elements = container.querySelectorAll(selector);
  if (!elements.length) return null;
  const delay =
    typeof stagger === "function"
      ? stagger(staggerStep, { startDelay })
      : startDelay;

  return animate(
    elements,
    { opacity: [0, 1], y: [y, 0] },
    { duration, ease: "easeOut", delay }
  );
}

export function animatePulse(element) {
  if (!canAnimate() || !element) return null;
  return animate(
    element,
    { scale: [1, 1.04, 1] },
    { duration: 0.24, ease: "easeOut" }
  );
}
