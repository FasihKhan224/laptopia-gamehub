// Scroll-synced video controller — rewritten for buttery smooth playback
// Inspired by anime.js / Apple-style scroll-driven video scrubbing

document.addEventListener('DOMContentLoaded', () => {
  const heroVideo  = document.getElementById('heroVideo');
  const heroSection = document.getElementById('heroSection');

  if (!heroVideo || !heroSection) return;

  heroVideo.pause();

  // ---- State ----
  let videoDuration = 0;
  let targetTime    = 0;
  let currentTime   = 0;
  let rafId         = null;

  // ---- Preload & buffer the entire video ----
  const ensureLoaded = () => {
    return new Promise((resolve) => {
      if (heroVideo.readyState >= 2) {
        videoDuration = heroVideo.duration;
        return resolve();
      }
      heroVideo.addEventListener('loadeddata', () => {
        videoDuration = heroVideo.duration;
        resolve();
      }, { once: true });

      // Trick: briefly play then immediately pause to force the browser
      // to start downloading the whole file, not just the first chunk.
      heroVideo.play().then(() => heroVideo.pause()).catch(() => {});
    });
  };

  // ---- Scene transition helpers ----
  const scene1 = document.getElementById('scene1');
  const scene2 = document.getElementById('scene2');
  const scene3 = document.getElementById('scene3');
  const scene4 = document.getElementById('scene4');

  const setScene = (el, opacity, y) => {
    if (!el) return;
    el.style.opacity   = opacity;
    el.style.transform  = `translateY(${y}px)`;
  };

  const updateSceneRange = (el, scrollPct, start, end) => {
    if (!el) return;
    if (scrollPct < start || scrollPct >= end) {
      setScene(el, 0, 50);
      return;
    }
    const mid = (start + end) / 2;
    if (scrollPct < mid) {
      const p = (scrollPct - start) / (mid - start);
      setScene(el, p, 50 * (1 - p));
    } else {
      const p = (scrollPct - mid) / (end - mid);
      setScene(el, 1 - p, -(p * 60));
    }
  };

  const updateScenes = (pct) => {
    // Scene 1: visible 0–25 %, fades out
    if (scene1) {
      if (pct < 0.25) {
        const p = pct / 0.25;
        setScene(scene1, 1 - p, p * -80);
      } else {
        setScene(scene1, 0, -80);
      }
    }

    // Scenes 2–3 fade in then out across their ranges
    updateSceneRange(scene2, pct, 0.18, 0.48);
    updateSceneRange(scene3, pct, 0.42, 0.72);

    // Scene 4: fades in from 68 % and stays until end
    if (scene4) {
      if (pct >= 0.68) {
        const p = Math.min(1, (pct - 0.68) / 0.18);
        setScene(scene4, p, 50 * (1 - p));
      } else {
        setScene(scene4, 0, 50);
      }
    }
  };

  // ---- Scroll → target time ----
  const onScroll = () => {
    if (!videoDuration) return;

    const rect     = heroSection.getBoundingClientRect();
    const maxScroll = heroSection.offsetHeight - window.innerHeight;
    const scrolled  = Math.max(0, -rect.top);
    const pct       = Math.min(1, Math.max(0, scrolled / maxScroll));

    targetTime = pct * videoDuration;
    updateScenes(pct);

    // Kick the lerp loop if not already running
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  // ---- Lerp loop (runs at display refresh rate) ----
  const LERP_SPEED = 0.08;          // lower = smoother, higher = snappier
  const EPSILON    = 0.01;           // seconds – stop threshold

  const tick = () => {
    const diff = targetTime - currentTime;

    if (Math.abs(diff) > EPSILON) {
      currentTime += diff * LERP_SPEED;
      heroVideo.currentTime = currentTime;
      rafId = requestAnimationFrame(tick);
    } else {
      // Close enough – snap and stop
      currentTime = targetTime;
      heroVideo.currentTime = currentTime;
      rafId = null;
    }
  };

  // ---- Bootstrap ----
  ensureLoaded().then(() => {
    currentTime = 0;
    heroVideo.currentTime = 0;

    // Use passive listener for best scroll perf
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial paint
    onScroll();
  });
});
