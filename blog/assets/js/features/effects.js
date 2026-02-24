import { clamp } from "../core/utils.js";

export function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}

export function initSpotlight() {
  const spotlight = document.getElementById("spotlight");
  if (!spotlight || !window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  window.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--spot-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--spot-y", `${event.clientY}px`);
    spotlight.classList.add("active");
  });

  window.addEventListener("pointerleave", () => {
    spotlight.classList.remove("active");
  });
}

export function bindTiltCards() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  document.querySelectorAll(".interactive-tilt").forEach((card) => {
    if (card.dataset.tiltBound === "true") return;
    card.dataset.tiltBound = "true";

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * 10;
      const rotateX = (0.5 - py) * 8;
      card.style.transform = `perspective(1000px) rotateX(${clamp(rotateX, -8, 8)}deg) rotateY(${clamp(rotateY, -10, 10)}deg) translateY(-1px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

export function animateCounter(node, target, locale = "zh") {
  if (!node) return;

  const duration = 1500;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(target * progress);
    node.textContent = value.toLocaleString(locale === "zh" ? "zh-CN" : "en-US");

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}
