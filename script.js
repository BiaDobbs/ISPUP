const viewport = document.getElementById("timeline-viewport");
const track = document.getElementById("timeline-track");
const timelineBar = document.getElementById("timeline-bar");
const marker = document.getElementById("timeline-marker");
const steps = Array.from(document.querySelectorAll(".step"));

const STEP_STOPS = [0, 0.10, 0.15, 0.20, 0.27, 0.35, 0.40, 0.45, 0.64, 0.75, 0.85, 0.95];

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const state = { maxShift: 0 };

let snapTimer = null;

function measure() {
  state.maxShift = Math.max(0, track.scrollWidth - viewport.clientWidth);
}

function getActiveIndex(progress) {
  let closest = 0, minDist = Infinity;
  STEP_STOPS.forEach((stop, i) => {
    const d = Math.abs(progress - stop);
    if (d < minDist) { minDist = d; closest = i; }
  });
  return closest;
}

function update(progress) {
  const p = clamp(progress, 0, 1);
  const day = Math.round(p * 1000);
  const split = Math.round(viewport.clientWidth * p);

  marker.textContent = `Dia ${day}`;
  marker.style.setProperty("--marker-left", `${split}px`);
  timelineBar.style.setProperty("--split", `${split}px`);

  const activeIndex = getActiveIndex(p);
  steps.forEach((step, i) => step.classList.toggle("is-active", i === activeIndex));
}

function syncFromViewport() {
  const progress = state.maxShift > 0 ? clamp(viewport.scrollLeft / state.maxShift, 0, 1) : 0;
  update(progress);

  // Snap suave após o utilizador parar de scrollar
  clearTimeout(snapTimer);
  snapTimer = setTimeout(() => {
    const activeIndex = getActiveIndex(progress);
    const targetScroll = STEP_STOPS[activeIndex] * state.maxShift;
    viewport.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, 150);
}

viewport.addEventListener("scroll", syncFromViewport, { passive: true });

viewport.addEventListener("wheel", (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    viewport.scrollLeft += e.deltaY;
  }
}, { passive: false });

window.addEventListener("resize", () => { measure(); syncFromViewport(); });

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

measure();
viewport.scrollLeft = 0;
syncFromViewport();