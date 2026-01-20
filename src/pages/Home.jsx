import React, { useEffect, useMemo, useRef, useState } from "react";

// --- Sprites (put files in: src/assets/sprites/) ---
import labRunSheet from "../assets/sprites/lab_run_sheet_48x32.png";

import pickupChampagne from "../assets/sprites/pickup_champagne.png";
import pickupCake from "../assets/sprites/pickup_cake.png";
import pickupBouquet from "../assets/sprites/bouquet.png";
import pickupRing from "../assets/sprites/ring.png";
import couple from "../assets/sprites/couple_idle_sheet.png";
import bridalChorus from "../assets/sounds/bridalchorus.mp3";


export default function Home() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  

  const inputRef = useRef({ left: false, right: false });

  const spritesRef = useRef({
    labRun: null,
    champagne: null,
    cake: null,
    couple: null,
    ready: false,
  });

  const stateRef = useRef({
    t: 0,
    camX: 0,
    camV: 0,
    playerX: 40,
    vx: 0,
    hasChampagne: false,
    hasCake: false,
    hasRing: false,
    reachedCeremony: false,
    pickups: [
      { x: 420, type: "champagne", collected: false },
      { x: 760, type: "ring", collected: false },
      { x: 920, type: "bouquet", collected: false },
      { x: 1120, type: "cake", collected: false },
    ],
    fade: 0,
    fadeStarted: false,
    fireworks: [],
  });

  const [reachedUI, setReachedUI] = useState(false);

  // audio context for short UI sounds (sparkle on pickup)
  const audioRef = useRef(null);
  const bridalAudioRef = useRef(null);

  // typewriter prompt state
  const [typedPrompt, setTypedPrompt] = useState("");
  const PROMPT_TEXT = 'This pup has a job to do! Fetch what\'s needed and find the couple before they say, "I do"';

  const cfg = useMemo(
    () => ({
      // canvas logical resolution (scaled to fit)
      W: 360,
      H: 600,

      // world
      groundY: 420,
      ceremonyX: 1280, // reduced 20% from 1600 to shorten travel time

      // motion
      accel: 0.85,
      maxSpeed: 4.0, // increased so the dog walks faster
      friction: 0.80,

      // pixel vibe (no smoothing)
      // (we still scale via CSS for crisp pixels)
      infoText: ["September 19, 2026", "Hotel Lilien · Tannersville NY"],
    }),
    []
  );

  // --- Load images ---
  useEffect(() => {
    const load = (src) =>
      new Promise((res) => {
        const img = new Image();
        img.src = src;
        img.onload = () => res(img);
      });

    Promise.all([
      load(labRunSheet),
      load(pickupChampagne),
      load(pickupCake),
      load(couple),
      load(pickupRing),
      load(pickupBouquet),
    ]).then(([labRun, champagne, cake, couple, ring, bouquet]) => {
      spritesRef.current = {
        labRun,
        champagne,
        cake,
        couple,
        ring,
        bouquet,
        ready: true,
      };
    });
  }, []);

  // --- Typewriter effect for the header prompt ---
  useEffect(() => {
    setTypedPrompt("");
    const timeouts = [];
    const charDelay = 28;
    for (let i = 0; i < PROMPT_TEXT.length; i++) {
      const t = setTimeout(() => {
        setTypedPrompt(PROMPT_TEXT.slice(0, i + 1));
      }, i * charDelay);
      timeouts.push(t);
    }
    // ensure final state if unmounted early
    const endTimeout = setTimeout(() => setTypedPrompt(PROMPT_TEXT), PROMPT_TEXT.length * charDelay + 40);
    timeouts.push(endTimeout);
    return () => timeouts.forEach((t) => clearTimeout(t));
  }, []);

  // --- Audio sparkle for pickups ---
  const playSparkle = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(1200, ctx.currentTime);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // ignore
    }
  };

  // --- Play bridal chorus when ceremony reached ---
  const playBridal = async () => {
    try {
      // prefer bundled import if available
      if (typeof bridalChorus === 'string' && bridalChorus.length) {
        try {
          if (!bridalAudioRef.current) {
            bridalAudioRef.current = new Audio(bridalChorus);
            bridalAudioRef.current.preload = 'auto';
          }
          bridalAudioRef.current.currentTime = 0;
          bridalAudioRef.current.play().catch(() => {});
          return;
        } catch (e) {
          // fallback to fetching candidates below
        }
      }
      if (bridalAudioRef.current) {
        bridalAudioRef.current.currentTime = 0;
        bridalAudioRef.current.play().catch(() => {});
        return;
      }

      const candidates = [
        '/assets/sounds/bridalchorus.mp3',
        `${process.env.PUBLIC_URL}/assets/sounds/bridalchorus.mp3`,
        '/bridalchorus.mp3',
        `${process.env.PUBLIC_URL}/bridalchorus.mp3`,
      ];

      for (const url of candidates) {
        try {
          const res = await fetch(url, { method: 'HEAD' });
          if (res && res.ok) {
            const audio = new Audio(url);
            audio.preload = 'auto';
            bridalAudioRef.current = audio;
            audio.play().catch(() => {});
            return;
          }
        } catch (e) {
          // try next
        }
      }
    } catch (e) {
      // ignore audio errors
    }
  };

  // --- Resize canvas to container (crisp pixels) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      const rect = parent.getBoundingClientRect();
      // ensure game fills available width but never shrinks past a small-phone width
      const MIN_PHONE_W = 320; // smallest phone width to preserve legibility
      const minScale = MIN_PHONE_W / cfg.W;
      const maxScaleByWidth = rect.width / cfg.W;
      const maxScaleByHeight = (window.innerHeight - 220) / cfg.H;
      const scale = Math.max(minScale, Math.min(maxScaleByWidth, maxScaleByHeight));
      const cssW = Math.floor(cfg.W * scale);
      const cssH = Math.floor(cfg.H * scale);

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      canvas.width = Math.floor(cfg.W * dpr);
      canvas.height = Math.floor(cfg.H * dpr);

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [cfg.W, cfg.H]);

  // --- Keyboard (desktop) ---
  useEffect(() => {
    const down = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") inputRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") inputRef.current.right = true;
    };
    const up = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") inputRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") inputRef.current.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  function drawDog(ctx, cfg, s, sprites) {
    if (!sprites.ready || !sprites.labRun) return;
  
    const screenX = 110;
    const scale = 1.4; // 🔥 DOG SCALE — try 1.3–1.6
    const fw = 48;
    const fh = 32;
  
    const dw = fw * scale;
    const dh = fh * scale;
  
    // move dog's baseline to half its current vertical offset
    const y = cfg.groundY - Math.round(dh / 2);
  
    const speed = Math.abs(s.vx);
    const frame =
      speed > 0.12 ? Math.floor((s.t / 6) % 8) : 0;
  
    drawSheetFrame(
      ctx,
      sprites.labRun,
      frame,
      fw,
      fh,
      Math.round(screenX),
      Math.round(y),
      Math.round(dw),
      Math.round(dh)
    );
  
    // tail wag removed — keep dog static for now
  }
  

  // --- Main loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const loop = () => {
      const s = stateRef.current;
      const input = inputRef.current;
      const sprites = spritesRef.current;

      s.t += 1;

      // Movement
      let desired = 0;
      if (input.left) desired -= cfg.maxSpeed;
      if (input.right) desired += cfg.maxSpeed;

      if (s.fadeStarted) {
        s.vx *= 0.85; // quickly glide to a stop
      }

      if (s.fadeStarted) {
        s.fade = clamp(s.fade + 0.02, 0, 1); // speed of fade
        updateFireworks(s, cfg);
      }
      
      // ease velocity toward desired
      const responsiveness = 0.18; // try 0.12–0.25
      s.vx = lerp(s.vx, desired, responsiveness);
      
      // apply friction when no input
      if (!input.left && !input.right) s.vx *= cfg.friction;

      s.vx = clamp(s.vx, -cfg.maxSpeed, cfg.maxSpeed);

      s.playerX = Math.max(10, s.playerX + s.vx);

      // Camera follows a bit behind
      const targetCam = s.playerX - 90;

      if (s.t === 1) {
        s.camX = targetCam;
        s.camV = 0;
      }

      // spring settings (tune these)
      const stiffness = 0.08; // higher = follows tighter
      const damping = 0.75;   // higher = less oscillation
      
      const force = (targetCam - s.camX) * stiffness;
      s.camV = (s.camV + force) * damping;
      s.camX = s.camX + s.camV;

      // Collect pickups using rectangle collision against dog's on-screen bounds
      // Dog screen rect
      const DOG_SCREEN_X = 110;
      const DOG_SCALE = 1.4;
      const DOG_FW = 48;
      const dogW = DOG_FW * DOG_SCALE;
      const dogLeft = DOG_SCREEN_X;
      const dogRight = DOG_SCREEN_X + dogW;
      const dogH = DOG_FW * DOG_SCALE;
      const dogTop = cfg.groundY - Math.round(dogH / 2);
      const dogBottom = dogTop + dogH;

      for (const p of s.pickups) {
        if (p.collected) continue;

        const px = Math.round(worldToScreen(p.x, s.camX));
        // pickup logical size matches drawPickups size
        // pickup logical size should match how it's drawn (champagne is larger)
        let pSize = 56;
        if (p.type === 'champagne') pSize = Math.round(56 * 1.5); // larger collision for champagne
        else if (p.type === 'cake') pSize = Math.round(56 * 1.3);

        const pLeft = px - Math.round(pSize / 2);
        const pTop = cfg.groundY - pSize + 18; // match groundInset in drawPickups
        const pRight = pLeft + pSize;
        const pBottom = pTop + pSize;

        const overlap = !(dogRight < pLeft || dogLeft > pRight || dogBottom < pTop || dogTop > pBottom);
        if (overlap) {
          p.collected = true;
          // play a quick sparkle sound when items are picked up
          try { playSparkle(); } catch (e) {}
          if (p.type === "champagne") s.hasChampagne = true;
          if (p.type === "cake") s.hasCake = true;
          if (p.type === "ring") s.hasRing = true;
        }
      }

      // Ceremony trigger
      if (!s.reachedCeremony && s.playerX >= cfg.ceremonyX) {
        s.reachedCeremony = true;
        setReachedUI(true);
        spawnFireworkBurst(s, cfg.W * 0.65, 110);
        spawnFireworkBurst(s, cfg.W * 0.35, 90);
        try { playBridal(); } catch (e) {}
      }

// ---- Fade trigger: when ANY part of dog touches arch LEFT edge ----
// Compute left edge of the bride (couple sprite) in screen space
const coupleScale = 0.30;
const coupleW = sprites.couple ? sprites.couple.width * coupleScale : 80;
const brideLeftScreenX = worldToScreen(cfg.ceremonyX, s.camX) - Math.round(coupleW / 2);

// Trigger when the right side of the dog is within 25 pixels of the bride's left edge
const within25pxOfBride = dogRight >= (brideLeftScreenX - 25);

if (!s.fadeStarted && within25pxOfBride) {
  s.fadeStarted = true;
  s.fade = 0;

  // mark ceremony reached for other visuals + UI
  s.reachedCeremony = true;
  setReachedUI(true);

  try { playBridal(); } catch (e) {}

  // stop camera jitter
  s.camV = 0;

  // spawn a few bursts for immediate celebration
  spawnFireworkBurst(s, cfg.W * 0.65, 110);
  spawnFireworkBurst(s, cfg.W * 0.35, 90);
  spawnFireworkBurst(s, cfg.W * 0.5, 120);
}




      // Draw
      drawFrame(ctx, cfg, s, sprites);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [cfg]);

  const press = (dir) => () => (inputRef.current[dir] = true);
  const release = (dir) => () => (inputRef.current[dir] = false);

  return (
    <main className="pixel-home min-h-screen bg-stone-50 px-4 py-6 pb-32 overflow-x-hidden">
      <div className="mx-auto w-full overflow-x-hidden">
        <header className="text-center pt-16">
          <h1 className="pixel-title font-serif text-3xl mx-auto block center">Katerina &amp; Jack</h1>
          <p className="mt-3 text-xs font-medium tracking-wide text-slate-700 typewriter">
            <span>{typedPrompt}</span>
            <span className="tw-caret" aria-hidden="true">█</span>
          </p>
        </header>

        <div className="mt-4 relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm touch-none pixel-panel">

          <div className="p-3">
            <canvas ref={canvasRef} className="block w-full h-auto" />
          </div>
        </div>

{/* Mobile controls (larger, centered, fixed to bottom) */}
  <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40">
  <div className="flex gap-6 items-center">
    <button
      className="select-none h-48 w-48 rounded-2xl border-4 border-slate-900 bg-amber-100 shadow-[6px_6px_0_0_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#0f172a] text-6xl font-extrabold text-slate-900 pixel-control"
      onPointerDown={press("left")}
      onPointerUp={release("left")}
      onPointerCancel={release("left")}
      onPointerLeave={release("left")}
      aria-label="Move left"
    >
      ◀
    </button>

    <button
      className="select-none h-48 w-48 rounded-2xl border-4 border-slate-900 bg-amber-100 shadow-[6px_6px_0_0_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#0f172a] text-6xl font-extrabold text-slate-900 pixel-control"
      onPointerDown={press("right")}
      onPointerUp={release("right")}
      onPointerCancel={release("right")}
      onPointerLeave={release("right")}
      aria-label="Move right"
    >
      ▶
    </button>
  </div>
</div>


        <p className="mt-3 text-center text-xs text-slate-500">
          Desktop: use ←/→ or A/D
        </p>
        <p className="mt-2 text-center text-xs text-slate-600 readable-font">
          September 19, 2026 · Hotel Lilien, 6629 Route 23A, Tannersville, NY 12485
        </p>
      </div>
    </main>
  );
}

/* ---------------- Drawing ---------------- */

function drawFrame(ctx, cfg, s, sprites) {
  const W = cfg.W;
  const H = cfg.H;

  ctx.clearRect(0, 0, W, H);
  // Base fill so there are NO gaps
fill(ctx, 0, 0, W, H, "#6fbf8f");

  // --- SKY (short) ---
  const skyHeight = 160; // 🔥 controls how tall the sky feels (increased to reduce ground area)
  fill(ctx, 0, 0, W, skyHeight, "#cfeef0");

  // sun (soft circular glow)
  drawSun(ctx, 36, 36, 34);

  // pixel-clouds with light parallax
  const cloudPositions = [
    { x: 40 - s.camX * 0.06, y: 36, s: 1.0 },
    { x: 180 - s.camX * 0.04, y: 50, s: 1.2 },
    { x: 300 - s.camX * 0.05, y: 28, s: 0.9 },
  ];
  for (const c of cloudPositions) drawCloudPixel(ctx, (c.x % (W + 200)) - 100, c.y, c.s);
  
  // --- DISTANT TREELINE (SPARSE) ---
  const distantTreeY = skyHeight - 54;
  fill(ctx, 0, distantTreeY + 26, W, 42, "#7fbf9a");

  const distantCount = 6; // ↓ intentionally sparse
  for (let i = 0; i < distantCount; i++) {
    const x =
      ((i * 90 - s.camX * 0.12) % (W + 120)) - 60;

    drawPine(ctx, x, distantTreeY + (i % 2) * 4, "#6aa882");
  }
  

  
  // --- GRASSY WALKING FIELD ---
  // reduce large flat area further: shrink previous flat region by ~80% (keep minimum)
  const origFlat = cfg.groundY - (skyHeight + 40);
  const grassHeight = Math.max(28, Math.round(origFlat * 0.2)); // much smaller flat area
  const grassTop = cfg.groundY - grassHeight;
  const walkColor = "#6aa882"; // shared color for walking background and bottom band
  fill(ctx, 0, grassTop, W, cfg.groundY - grassTop, walkColor);

  // rolling hills (subtle, pixel-feel)
  // smaller, lower hills so green doesn't dominate
  drawHill(ctx, -80 - (s.camX * 0.1), cfg.groundY - 40, W + 200, 40, "#7fbf9a");
  drawHill(ctx, -40 - (s.camX * 0.15), cfg.groundY - 20, W + 160, 28, "#6aa882");

  // --- MIDGROUND SHRUBS / BUSHES ---
for (let i = 0; i < 14; i++) {
  const x = ((i * 40 - s.camX * 0.28) % (W + 80)) - 40;
  const y = cfg.groundY - 70 - (i % 3) * 6;

  // little bush blobs
  fill(ctx, x + 0, y + 10, 10, 8, "#4ea377");
  fill(ctx, x + 8, y + 6,  12, 10, "#56ad7f");
  fill(ctx, x + 18, y + 10, 10, 8, "#4ea377");

  // tiny autumn pop
  if (i % 4 === 0) fill(ctx, x + 12, y + 12, 3, 2, "#f3a24a");
}


  // subtle lighter grass path
  fill(
    ctx,
    0,
    cfg.groundY - 24,
    W,
    24,
    "#6aa882"
  );

  // narrow bottom band (reduce large dark green area so dog walking zone isn't huge)
  const bottomBand = Math.max(12, Math.round((H - cfg.groundY) * 0.22));
  fill(ctx, 0, cfg.groundY, W, bottomBand, walkColor);

  // --- MIDGROUND TREES (NEW LAYER) ---
  // Draw these after the grass so tree trunks and lower canopy appear on top
  const midTreeY = skyHeight + 10;
  const midCount = 9;

  for (let i = 0; i < midCount; i++) {
    const x = ((i * 70 - s.camX * 0.25) % (W + 140)) - 70;
    const color = i % 3 === 0 ? "#5aa67d" : "#63ad85";
    drawPine(ctx, x, midTreeY + (i % 2) * 6, color);
    if (i % 4 === 0) {
      drawPine(ctx, x + 24, midTreeY + 12, color);
    }
  }

  // --- FOREGROUND TREES ---
  const fgY = cfg.groundY - 180;

  for (let i = 0; i < 11; i++) {
    const x =
      ((i * 64 - s.camX * 0.38) % (W + 160)) - 80;

    const color = i % 3 === 0 ? "#2f7c5a" : "#2e7c5a";
    drawPine(ctx, x, fgY + (i % 2) * 6, color);

    if (i % 4 === 0) drawPine(ctx, x + 28, fgY + 14, color);
  }


  // Fireflies (daytime subtle)
  for (let i = 0; i < 12; i++) {
    const fx = (i * 44 + (s.t * 0.9)) % W;
    const fy = 260 + Math.sin(s.t * 0.05 + i) * 18;
    fill(ctx, fx, fy, 2, 2, "rgba(255,236,150,0.85)");
  }

  // Draw pickups (world coords)
  drawPickups(ctx, cfg, s, sprites);

  // Ceremony scene (bride + groom)
  drawCeremony(ctx, cfg, s, sprites);

  // Dog
  drawDog(ctx, cfg, s, sprites);

  drawFadeToCelebration(ctx, cfg, s);

  // vignette light (very subtle)
  fill(ctx, 0, 0, W, 10, "rgba(0,0,0,0.03)");
}

function drawPickups(ctx, cfg, s, sprites) {
  if (!sprites.ready) return;

  // pickups: base size and sink so they sit closer to dog
  const baseSize = 56; // base pickup display size
  const groundInset = 18; // higher inset => looks lower (closer to dog)

  for (const p of s.pickups) {
    if (p.collected) continue;

    const x = Math.round(worldToScreen(p.x, s.camX));
    // size per-type so visuals and collision match
    let drawSize = baseSize;
    if (p.type === 'champagne') drawSize = Math.round(baseSize * 1.5);
    else if (p.type === 'cake') drawSize = Math.round(baseSize * 1.3);

    const drawX = x - Math.round(drawSize / 2);
    const drawY = cfg.groundY - drawSize + groundInset;

    // ring: use generated sprite if available, otherwise fallback to procedural
    if (p.type === 'ring') {
      if (sprites.ring && sprites.ring.complete) {
        ctx.drawImage(sprites.ring, Math.round(drawX), Math.round(drawY - 6), drawSize, drawSize);
      } else {
        drawRing(ctx, Math.round(drawX), Math.round(drawY), drawSize);
      }
    }

    // cake: draw slightly larger
    else if (p.type === 'cake') {
      const cakeSize = drawSize;
      const cakeX = x - Math.round(cakeSize / 2);
      if (sprites.cake) ctx.drawImage(sprites.cake, cakeX, Math.round(cfg.groundY - cakeSize + groundInset), cakeSize, cakeSize);
    }

    // champagne or default
    else if (p.type === 'bouquet') {
      if (sprites.bouquet) {
        const bSize = drawSize;
        const bx = x - Math.round(bSize / 2);
        ctx.drawImage(sprites.bouquet, Math.round(bx), Math.round(cfg.groundY - bSize + groundInset), bSize, bSize);
      }
    }
    else {
      if (sprites.champagne) ctx.drawImage(sprites.champagne, Math.round(drawX), Math.round(drawY), drawSize, drawSize);
    }

    // optional sparkle near the ground
    const tw = 0.35 + 0.25 * Math.sin(s.t * 0.12 + p.x);
    fill(ctx, x + 18, cfg.groundY - 16, 2, 2, `rgba(255,236,150,${tw})`);
  }
}

function drawRing(ctx, drawX, drawY, size) {
  // draw a chunky 8-bit ring made of small blocks
  const s = Math.max(2, Math.round(size / 12));
  // simple 5x5 ring pattern (gold)
  const ringPattern = [
    [0,1,1,1,0],
    [1,1,1,1,1],
    [1,1,0,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0]
  ];
  ctx.fillStyle = '#f4d06f';
  for (let ry = 0; ry < ringPattern.length; ry++) {
    for (let rx = 0; rx < ringPattern[ry].length; rx++) {
      if (!ringPattern[ry][rx]) continue;
      ctx.fillRect(drawX + rx * s, drawY + ry * s, s, s);
    }
  }

  // small gem (pale blue) above center
  ctx.fillStyle = '#dff9ff';
  const gx = drawX + 2 * s;
  const gy = drawY - Math.round(s * 1.5);
  ctx.fillRect(gx, gy, s, s);
  ctx.fillRect(gx - s, gy + s, s, s);
  ctx.fillRect(gx + s, gy + s, s, s);
}

function drawCeremony(ctx, cfg, s, sprites) {
  if (!sprites.ready || !sprites.couple) return;

  const x = worldToScreen(cfg.ceremonyX, s.camX);
  const ground = cfg.groundY;

  // Arch (simple)
  const archTopY = ground - 150;

  // posts (wood)
  fill(ctx, x - 70, archTopY + 35, 10, 90, "#b98b5d");
  fill(ctx, x + 60, archTopY + 35, 10, 90, "#b98b5d");

  // inner shadow
  fill(ctx, x - 67, archTopY + 38, 3, 84, "#a2784e");
  fill(ctx, x + 63, archTopY + 38, 3, 84, "#a2784e");

  // top beam
  fill(ctx, x - 82, archTopY + 25, 164, 12, "#b98b5d");
  fill(ctx, x - 82, archTopY + 33, 164, 4, "#a2784e"); // underside shadow

  // little vine/flowers on the arch
  fill(ctx, x - 60, archTopY + 22, 6, 6, "#97d48f");
  fill(ctx, x - 52, archTopY + 24, 3, 3, "#f7f0ff");
  fill(ctx, x + 40, archTopY + 22, 6, 6, "#97d48f");
  fill(ctx, x + 48, archTopY + 24, 3, 3, "#f1d36a");


  // Draw the joint couple sprite (STATIC)
  // Scale down so it fits your world better
  const scale = 0.30; // tweak 0.30–0.45
  const w = sprites.couple.width * scale;
  const h = sprites.couple.height * scale;

  ctx.drawImage(
    sprites.couple,
    Math.round(x - w / 2),
    Math.round(ground - h),
    Math.round(w),
    Math.round(h)
  );
}

function drawDog(ctx, cfg, s, sprites) {
  if (!sprites.ready || !sprites.labRun) return;

  // Fixed on-screen position (camera moves, dog stays)
  const screenX = 110;
  const scale = 1.4; // dog size
  const fw = 48;
  const fh = 32;

  const dw = fw * scale;
  const dh = fh * scale;

  // move dog's baseline to half its current vertical offset
  const y = cfg.groundY - Math.round(dh / 2);

  const speed = Math.abs(s.vx);
  const frame = speed > 0.12 ? Math.floor((s.t / 6) % 8) : 0;

  // Decide facing direction
  const facingLeft = s.vx < -0.05;

  ctx.save();

  if (facingLeft) {
    // Flip horizontally around the dog's center
    const cx = screenX + dw / 2;
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    ctx.translate(-cx, 0);
  }

  drawSheetFrame(
    ctx,
    sprites.labRun,
    frame,
    fw,
    fh,
    Math.round(screenX),
    Math.round(y),
    Math.round(dw),
    Math.round(dh)
  );

  ctx.restore();

  // tail wag removed — keep dog static to match requested style
}



function drawSheetFrame(ctx, sheet, frameIndex, fw, fh, dx, dy, dw, dh) {
  if (!sheet) return;
  const sx = frameIndex * fw;
  ctx.drawImage(sheet, sx, 0, fw, fh, Math.round(dx), Math.round(dy), dw, dh);
}

/* ---------------- Utils ---------------- */

function worldToScreen(wx, camX) {
  return wx - camX;
}

function fill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function shade(hex, amt) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const rr = Math.max(0, Math.min(255, r + amt));
  const gg = Math.max(0, Math.min(255, g + amt));
  const bb = Math.max(0, Math.min(255, b + amt));

  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(rr)}${toHex(gg)}${toHex(bb)}`;
}

function drawMushroom(ctx, x, y) {
  // stem
  fill(ctx, x + 2, y + 5, 3, 4, "#e7dfcf");
  // cap (red-orange)
  fill(ctx, x, y + 2, 7, 4, "#e07b3a");
  // spots
  fill(ctx, x + 2, y + 3, 1, 1, "#fff2d8");
  fill(ctx, x + 5, y + 4, 1, 1, "#fff2d8");
}

function drawFlower(ctx, x, y) {
  // stem
  fill(ctx, x + 3, y + 4, 1, 4, "#2f7c5a");
  // petals (pale)
  fill(ctx, x + 2, y + 2, 3, 3, "#f7f0ff");
  // center (gold)
  fill(ctx, x + 3, y + 3, 1, 1, "#f1d36a");
}


function drawPine(ctx, x, y, base) {
  // trunk
  fill(ctx, x + 18, y + 44, 8, 36, "#3a2a1d");

  // autumn palette accents
  const leaf1 = mix(base, "#cfe48a", 0.35); // light yellow-green
  const leaf2 = mix(base, "#97d48f", 0.25); // soft green
  const pop   = mix(base, "#f3a24a", 0.35); // small orange pop

  // canopy layers
  fill(ctx, x + 4,  y + 36, 36, 18, leaf2);
  fill(ctx, x + 8,  y + 20, 28, 18, shade(leaf1, -10));
  fill(ctx, x + 12, y + 6,  20, 18, shade(base, -16));

  // highlight edge (left)
  fill(ctx, x + 6,  y + 38, 3, 14, shade(leaf1, +10));
  fill(ctx, x + 10, y + 22, 3, 14, shade(leaf2, +6));

  // shadow edge (right)
  fill(ctx, x + 34, y + 38, 3, 14, shade(base, -24));
  fill(ctx, x + 30, y + 22, 3, 14, shade(base, -28));

  // tiny orange “leaf pop” clusters (sparse)
  fill(ctx, x + 26, y + 28, 4, 3, pop);
  fill(ctx, x + 16, y + 14, 3, 3, pop);

  // root flare
  fill(ctx, x + 16, y + 78, 12, 6, "#2c2016");
}

function drawSun(ctx, cx, cy, r) {
  // soft glow + solid center
  const grd = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
  grd.addColorStop(0, 'rgba(255,240,170,0.95)');
  grd.addColorStop(0.6, 'rgba(255,240,170,0.45)');
  grd.addColorStop(1, 'rgba(255,240,170,0.12)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // small pixel center
  ctx.fillStyle = 'rgba(255,245,200,1)';
  ctx.fillRect(Math.round(cx - 2), Math.round(cy - 2), 4, 4);
}

function drawCloudPixel(ctx, ox, oy, scale = 1) {
  // draw a chunky pixel cloud using small rects for 8-bit vibe
  const s = Math.max(1, Math.round(6 * scale));
  const pattern = [
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,1,1,1,0]
  ];
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  for (let ry = 0; ry < pattern.length; ry++) {
    for (let rx = 0; rx < pattern[ry].length; rx++) {
      if (!pattern[ry][rx]) continue;
      const x = Math.round(ox + rx * s);
      const y = Math.round(oy + ry * s);
      ctx.fillRect(x, y, s, s);
    }
  }
}

function drawHill(ctx, ox, baseY, width, height, color) {
  // simple pixelated rolling hill using column strips
  ctx.fillStyle = color;
  const step = 6;
  for (let i = 0; i < width; i += step) {
    const rel = i / width;
    // smooth bump via sine
    const h = Math.round((Math.sin(rel * Math.PI * 2) * 0.5 + 0.5) * height * 0.6 + (height * 0.4));
    ctx.fillRect(Math.round(ox + i), Math.round(baseY - h), step, h);
  }
}

function mix(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);

  const rr = Math.round(ar + (br - ar) * t);
  const gg = Math.round(ag + (bg - ag) * t);
  const bb2 = Math.round(ab + (bb - ab) * t);

  return `#${rr.toString(16).padStart(2, "0")}${gg.toString(16).padStart(2, "0")}${bb2
    .toString(16)
    .padStart(2, "0")}`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function drawFadeToCelebration(ctx, cfg, s) {
  if (!s.fadeStarted) return;

  // darken + fade out the game behind
  ctx.fillStyle = `rgba(10, 16, 20, ${s.fade * 0.85})`;
  ctx.fillRect(0, 0, cfg.W, cfg.H);

  // fireworks + text fade in
  drawFireworks(ctx, s, s.fadeStarted ? s.fade : 0);

  // wedding details (fade in slightly after fade begins)
  const a = clamp((s.fade - 0.15) / 0.85, 0, 1);
  ctx.fillStyle = `rgba(255,255,255,${a})`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 28px ui-sans-serif, system-ui";
  ctx.fillText("September 19, 2026", cfg.W / 2, cfg.H / 2 - 28);
  ctx.font = "bold 22px ui-sans-serif, system-ui";
  ctx.fillText("Hotel Lilien · Tannersville NY", cfg.W / 2, cfg.H / 2 + 10);
}

function spawnFireworkBurst(s, x, y) {
  const count = 22;
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count;
    const sp = 1.6 + Math.random() * 1.9;
    s.fireworks.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 55 + Math.random() * 25,
    });
  }
}

function updateFireworks(s, cfg) {
  if (!s.fireworks) s.fireworks = [];

  // periodically spawn new bursts while faded
  if (s.fade > 0.25 && s.t % 35 === 0) {
    const x = 60 + Math.random() * (cfg.W - 120);
    const y = 70 + Math.random() * 120;
    spawnFireworkBurst(s, x, y);
  }

  for (const p of s.fireworks) {
    p.life -= 1;
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03; // gravity
    p.vx *= 0.99;
    p.vy *= 0.99;
  }

  s.fireworks = s.fireworks.filter((p) => p.life > 0);
}

function drawFireworks(ctx, s, fadeAlpha) {
  if (!s.fireworks || s.fireworks.length === 0) return;

  for (const p of s.fireworks) {
    const a = clamp((p.life / 70) * fadeAlpha, 0, 1);

    // warm autumn fireworks: pale yellow + small orange pop
    ctx.fillStyle = `rgba(255, 230, 160, ${a})`;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);

    // occasional orange spark
    if ((p.life | 0) % 6 === 0) {
      ctx.fillStyle = `rgba(245, 170, 90, ${a})`;
      ctx.fillRect(Math.round(p.x + 1), Math.round(p.y), 2, 2);
    }
  }
}
