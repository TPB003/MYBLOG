const header = document.querySelector(".site-header");
const homeSection = document.getElementById("home");

const TOP_LOCK_PX = 72;
const MIN_DELTA_PX = 10;
const HOME_TRIGGER_OFFSET_PX = 24;

let previousY = window.scrollY || 0;
let rafPending = false;

function resolveHomeTriggerY() {
  if (!homeSection) return Number.POSITIVE_INFINITY;
  return Math.max(0, homeSection.offsetTop - HOME_TRIGGER_OFFSET_PX);
}

function updateHeaderVisibility() {
  rafPending = false;
  if (!header) return;

  const currentY = window.scrollY || 0;
  const homeTriggerY = resolveHomeTriggerY();

  // Before the #home section, keep the navigation hidden.
  if (currentY < homeTriggerY) {
    header.classList.add("header-prehome", "header-hidden");
    previousY = currentY;
    return;
  }

  header.classList.remove("header-prehome");

  const delta = currentY - previousY;

  if (currentY <= homeTriggerY + TOP_LOCK_PX) {
    header.classList.remove("header-hidden");
    previousY = currentY;
    return;
  }

  if (delta > MIN_DELTA_PX) {
    header.classList.add("header-hidden");
  } else if (delta < -MIN_DELTA_PX) {
    header.classList.remove("header-hidden");
  }

  previousY = currentY;
}

export function initHeaderScroll() {
  if (!header) return;

  updateHeaderVisibility();

  window.addEventListener(
    "scroll",
    () => {
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(updateHeaderVisibility);
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(updateHeaderVisibility);
    },
    { passive: true }
  );
}
