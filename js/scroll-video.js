// Canvas image-sequence scroll controller — powered by GSAP ScrollTrigger
// Industry-standard approach: preloaded .webp frames painted on <canvas>

(function () {
  'use strict';

  // ---- Config ----
  const FRAME_COUNT  = 150;                           // total frames extracted at 30fps
  const FRAME_PATH   = 'assets/frames/frame_';        // prefix
  const FRAME_EXT    = '.webp';
  const PAD          = 4;                              // zero-pad width  → frame_0001.webp

  // ---- DOM ----
  const canvas  = document.getElementById('heroCanvas');
  const section = document.getElementById('heroSection');
  if (!canvas || !section) return;

  const ctx = canvas.getContext('2d');

  // ---- Frame name helper ----
  const frameSrc = (i) =>
    `${FRAME_PATH}${String(i + 1).padStart(PAD, '0')}${FRAME_EXT}`;

  // ---- State ----
  const images  = new Array(FRAME_COUNT);
  const frameObj = { current: 0 };   // GSAP will tween this
  let   loaded  = 0;
  let   firstFrame = null;

  // ---- Resize: keep canvas pixel-perfect ----
  const resize = () => {
    canvas.width  = canvas.offsetWidth  * devicePixelRatio;
    canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    drawFrame(frameObj.current);
  };
  window.addEventListener('resize', resize);

  // ---- Draw with object-fit: cover logic ----
  const drawFrame = (index) => {
    const img = images[Math.round(index)];
    if (!img || !img.complete) return;

    const cw = canvas.offsetWidth;
    const ch = canvas.offsetHeight;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // object-fit: cover — fill canvas, crop overflow
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // ---- Preload all frames ----
  const preload = () => {
    return new Promise((resolve) => {
      for (let i = 0; i < FRAME_COUNT; i++) {
        const img  = new Image();
        img.src    = frameSrc(i);
        img.onload = () => {
          loaded++;
          if (i === 0) {
            firstFrame = img;
            resize();                       // paint first frame immediately
          }
          if (loaded === FRAME_COUNT) resolve();
        };
        img.onerror = () => {
          loaded++;
          if (loaded === FRAME_COUNT) resolve();
        };
        images[i] = img;
      }
    });
  };

  // ---- Scene text transitions (driven by ScrollTrigger progress) ----
  const scene1 = document.getElementById('scene1');
  const scene2 = document.getElementById('scene2');
  const scene3 = document.getElementById('scene3');
  const scene4 = document.getElementById('scene4');

  const setScene = (el, opacity, y) => {
    if (!el) return;
    el.style.opacity   = opacity;
    el.style.transform  = `translateY(${y}px)`;
  };

  const rangeScene = (el, pct, start, end) => {
    if (!el) return;
    if (pct < start || pct >= end) { setScene(el, 0, 50); return; }
    const mid = (start + end) / 2;
    if (pct < mid) {
      const p = (pct - start) / (mid - start);
      setScene(el, p, 50 * (1 - p));
    } else {
      const p = (pct - mid) / (end - mid);
      setScene(el, 1 - p, -(p * 60));
    }
  };

  const updateScenes = (pct) => {
    if (scene1) {
      if (pct < 0.25) {
        const p = pct / 0.25;
        setScene(scene1, 1 - p, p * -80);
      } else {
        setScene(scene1, 0, -80);
      }
    }
    rangeScene(scene2, pct, 0.18, 0.48);
    rangeScene(scene3, pct, 0.42, 0.72);
    if (scene4) {
      if (pct >= 0.68) {
        const p = Math.min(1, (pct - 0.68) / 0.18);
        setScene(scene4, p, 50 * (1 - p));
      } else {
        setScene(scene4, 0, 50);
      }
    }
  };

  // ---- Bootstrap ----
  preload().then(() => {
    resize();

    gsap.registerPlugin(ScrollTrigger);

    // Main timeline: scrub frameObj.current from 0 → FRAME_COUNT-1
    gsap.to(frameObj, {
      current: FRAME_COUNT - 1,
      ease: 'none',
      snap: { current: 1 },            // snap to integer frame indices
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,                     // 0.5s catch-up for buttery feel
        onUpdate: (self) => {
          drawFrame(frameObj.current);
          updateScenes(self.progress);
        },
      },
    });
  });

  // Paint something immediately while frames load
  resize();
})();
