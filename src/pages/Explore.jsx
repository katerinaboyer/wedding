import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import labRunSheet from "../assets/sprites/lab_run_sheet_48x32.png";
import couple from "../assets/sprites/couple_idle_sheet.png";
import hotel from "../assets/sprites/hotel.png";
import mailbox from "../assets/sprites/mailbox.png";

function Explore() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const inputRef = useRef({ up: false, down: false, left: false, right: false });
  const hasNavigatedRef = useRef(false);
  const spritesRef = useRef({
    labRun: null,
    couple: null,
    hotel: null,
    mailbox: null,
    ready: false,
  });

  const [ready, setReady] = useState(false);

  const cfg = useMemo(
    () => ({
      W: 360,
      H: 360,
      speed: 2.4,
    }),
    []
  );

  const stateRef = useRef({
    t: 0,
    x: 240,
    y: 240,
    vx: 0,
    vy: 0,
  });

  useEffect(() => {
    let mounted = true;

    const loadImage = (src) =>
      new Promise((res) => {
        const img = new Image();
        img.src = src;
        img.onload = () => res(img);
      });

    (async () => {
      const [labRun, coupleImg, hotelImg, mailboxImg] = await Promise.all([
        loadImage(labRunSheet),
        loadImage(couple),
        loadImage(hotel),
        loadImage(mailbox),
      ]);
      if (!mounted) return;
      spritesRef.current = {
        labRun,
        couple: coupleImg,
        hotel: hotelImg,
        mailbox: mailboxImg,
        ready: true,
      };
      setReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") inputRef.current.up = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") inputRef.current.down = true;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") inputRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") inputRef.current.right = true;
    };
    const handleKeyUp = (e) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") inputRef.current.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") inputRef.current.down = false;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") inputRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") inputRef.current.right = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.imageSmoothingEnabled = false;

    const loop = () => {
      const s = stateRef.current;
      const input = inputRef.current;
      const sprites = spritesRef.current;
      s.t += 1;

      let dx = 0;
      let dy = 0;
      if (input.up) dy -= cfg.speed;
      if (input.down) dy += cfg.speed;
      if (input.left) dx -= cfg.speed;
      if (input.right) dx += cfg.speed;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.75;
        dy *= 0.75;
      }

      s.vx = dx;
      s.vy = dy;
      s.x = clamp(s.x + s.vx, 20, cfg.W - 20);
      s.y = clamp(s.y + s.vy, 40, cfg.H - 24);

      drawClearing(ctx, cfg, s);
      drawVisitSprites(ctx, sprites);

      // navigate when dog touches the couple sprite
      if (sprites.ready && !hasNavigatedRef.current) {
        const coupleX = 180;
        const coupleY = 300;
        const coupleSize = 54;
        const hitRadius = coupleSize / 2 + 18;
        const dxh = s.x - coupleX;
        const dyh = s.y - coupleY;
        if (dxh * dxh + dyh * dyh <= hitRadius * hitRadius) {
          hasNavigatedRef.current = true;
          navigate("/engagement");
          return;
        }

        // navigate to hotel website when dog touches hotel sprite
        const hotelX = 110;
        const hotelY = 110;
        const hotelSize = 220;
        const hotelHitRadius = hotelSize / 2 + 2;
        const dxHotel = s.x - hotelX;
        const dyHotel = s.y - hotelY;
        if (dxHotel * dxHotel + dyHotel * dyHotel <= hotelHitRadius * hotelHitRadius) {
          hasNavigatedRef.current = true;
          window.location.href = "https://www.hotellilien.com/";
          return;
        }

        // navigate to RSVP page when dog touches mailbox sprite
        const mailboxX = 280;
        const mailboxY = 180;
        const mailboxSize = 60;
        const mailboxHitRadius = mailboxSize / 2 + 5;
        const dxMailbox = s.x - mailboxX;
        const dyMailbox = s.y - mailboxY;
        if (dxMailbox * dxMailbox + dyMailbox * dyMailbox <= mailboxHitRadius * mailboxHitRadius) {
          hasNavigatedRef.current = true;
          navigate("/rsvp");
          return;
        }
      }
      drawDogTopDown(ctx, sprites, s);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [cfg, navigate]);

  return (
    <main className="page-panel page-event px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Explore</h1>
        <section className="info-window rounded-lg p-4">
          <div className="readable-font mb-3">
            <p>Explore the forest clearing and visit the sprites.</p>
            <p>Use arrow keys or WASD to move.</p>
          </div>
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={cfg.W}
              height={cfg.H}
              className="game-canvas"
              aria-label="Explore game canvas"
            />
          </div>
          {!ready && (
            <div className="text-xs text-slate-600 mt-2">Loading sprites…</div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Explore;

function drawClearing(ctx, cfg, s) {
  ctx.clearRect(0, 0, cfg.W, cfg.H);
  // forest canopy base
  ctx.fillStyle = "#7fbf9a";
  ctx.fillRect(0, 0, cfg.W, cfg.H);

  // clearing glow
  const grd = ctx.createRadialGradient(cfg.W / 2, cfg.H / 2 + 10, 40, cfg.W / 2, cfg.H / 2 + 10, 180);
  grd.addColorStop(0, "#eaf9f6");
  grd.addColorStop(1, "#8ec9a5");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, cfg.W, cfg.H);

  // tree ring
  for (let i = 0; i < 22; i++) {
    const a = (Math.PI * 2 * i) / 22;
    const rx = cfg.W / 2 + Math.cos(a) * 150;
    const ry = cfg.H / 2 + Math.sin(a) * 120;
    drawTree(ctx, rx, ry);
  }

  // soft path dots
  for (let i = 0; i < 80; i++) {
    const x = (i * 37 + s.t * 0.4) % cfg.W;
    const y = 210 + Math.sin(i) * 12;
    ctx.fillStyle = "rgba(255,244,200,0.25)";
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
  }
}

function drawVisitSprites(ctx, sprites) {
  if (!sprites.ready) return;
  const spots = [
    { img: sprites.hotel, x: 110, y: 110, size: 220 },
    { img: sprites.mailbox, x: 280, y: 180, size: 60 },
    { img: sprites.couple, x: 180, y: 300, size: 54 },
  ];

  for (const s of spots) {
    if (!s.img) continue;
    ctx.drawImage(s.img, Math.round(s.x - s.size / 2), Math.round(s.y - s.size / 2), s.size, s.size);
  }
}

function drawDogTopDown(ctx, sprites, s) {
  if (!sprites.ready || !sprites.labRun) return;
  const fw = 48;
  const fh = 32;
  const scale = 1.1;
  const frame = Math.abs(s.vx) + Math.abs(s.vy) > 0.1 ? Math.floor((s.t / 6) % 8) : 0;

  const dw = fw * scale;
  const dh = fh * scale;

  ctx.save();
  const facingLeft = s.vx < -0.1;
  if (facingLeft) {
    const cx = s.x + dw / 2;
    ctx.translate(cx, 0);
    ctx.scale(-1, 1);
    ctx.translate(-cx, 0);
  }

  ctx.drawImage(
    sprites.labRun,
    frame * fw,
    0,
    fw,
    fh,
    Math.round(s.x - dw / 2),
    Math.round(s.y - dh / 2),
    Math.round(dw),
    Math.round(dh)
  );
  ctx.restore();
}

function drawTree(ctx, x, y) {
  ctx.fillStyle = "#2f7c5a";
  ctx.fillRect(Math.round(x - 8), Math.round(y - 24), 16, 24);
  ctx.fillStyle = "#3a2a1d";
  ctx.fillRect(Math.round(x - 3), Math.round(y - 6), 6, 12);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
