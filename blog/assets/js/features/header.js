const header = document.querySelector(".site-header");
const TOP_LOCK_PX = 72;
const MIN_DELTA_PX = 10;

let previousY = window.scrollY || 0;
let rafPending = false;

function updateHeaderVisibility() {
  rafPending = false;
  if (!header) return;

  const currentY = window.scrollY || 0;
  const delta = currentY - previousY;

  if (currentY <= TOP_LOCK_PX) {
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

  window.addEventListener(
    "scroll",
    () => {
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(updateHeaderVisibility);
    },
    { passive: true }
  );
}

