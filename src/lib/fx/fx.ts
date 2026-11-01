/**
 * ATELIER interaction layer.
 *
 * A small, dependency-free runtime that progressively enhances server-rendered
 * markup through data attributes, so pages stay complete and readable without
 * it (and in the static preview). One rAF loop drives every scroll/pointer effect.
 *
 *   data-reveal                 fade/slide in when scrolled into view (optional style="--d:120ms")
 *   data-fx="words"             words light up as the element scrolls through the viewport
 *   data-fx="marquee"           horizontal track whose speed and direction follow scroll velocity
 *   data-fx="hscroll"           pinned horizontal scroll (desktop); child [data-hscroll-track]
 *   data-fx="tilt"              3D tilt toward the pointer, exposes --mx/--my for a light sheen
 *   data-fx="magnetic"          element drifts toward the pointer
 *   data-parallax="0.15"        vertical parallax relative to the viewport centre
 *   data-fx="spin"              slow rotation that speeds up with scrolling
 *   data-fx="preview"           rows [data-preview-src] show an image that follows the cursor
 *   data-fx="letters"           letters ripple away from the pointer
 *   data-fx="count"             numbers count up when first visible
 *   data-fx="blob"              soft shape that eases toward the pointer
 *   data-cursor="View"          label shown in the custom cursor while hovering
 */

type Cleanup = () => void;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export function initFx(doc: Document = document): Cleanup {
  const win = doc.defaultView;
  if (!win) return () => {};
  const html = doc.documentElement;
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = win.matchMedia("(pointer: fine)").matches;
  const desktop = win.matchMedia("(min-width: 1024px)");
  const cleanups: Cleanup[] = [];
  const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
    win.addEventListener(type, fn, opts);
    cleanups.push(() => win.removeEventListener(type, fn, opts));
  };
  const all = <T extends HTMLElement = HTMLElement>(sel: string) => Array.from(doc.querySelectorAll<T>(sel));

  html.classList.add("fx-ready");
  cleanups.push(() => html.classList.remove("fx-ready"));

  // ---------------------------------------------------------------- state
  const pointer = { x: win.innerWidth / 2, y: win.innerHeight / 2, active: false };
  let scrollY = win.scrollY;
  let lastScrollY = scrollY;
  let velocity = 0;

  on("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  }, { passive: true });
  on("scroll", () => (scrollY = win.scrollY), { passive: true });

  // ---------------------------------------------------------------- reveal
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
        if ((entry.target as HTMLElement).dataset.fx === "count") countUp(entry.target as HTMLElement);
      }),
    { rootMargin: "0px 0px -8% 0px" },
  );
  const observeReveals = () => all("[data-reveal]:not(.is-in), [data-fx='count']:not(.is-in)").forEach((el) => io.observe(el));
  observeReveals();
  const mo = new MutationObserver(() => {
    observeReveals();
    splitAll();
  });
  mo.observe(doc.body, { childList: true, subtree: true });
  cleanups.push(() => {
    io.disconnect();
    mo.disconnect();
  });

  function countUp(el: HTMLElement) {
    const target = Number(el.dataset.to ?? el.textContent ?? 0);
    if (reduced || !Number.isFinite(target)) return;
    const start = performance.now();
    const dur = 1400;
    const step = (t: number) => {
      const p = clamp((t - start) / dur);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) win!.requestAnimationFrame(step);
    };
    win!.requestAnimationFrame(step);
  }

  // ---------------------------------------------------------------- text splitting
  function split(el: HTMLElement, unit: "word" | "char") {
    if (el.dataset.split) return;
    el.dataset.split = unit;
    const text = el.textContent ?? "";
    el.setAttribute("aria-label", text.trim());
    el.textContent = "";
    const parts = unit === "word" ? text.split(/(\s+)/) : Array.from(text);
    parts.forEach((part) => {
      if (/^\s+$/.test(part)) {
        el.appendChild(doc.createTextNode(part));
        return;
      }
      const span = doc.createElement("span");
      span.className = unit === "word" ? "fx-word" : "fx-char";
      span.setAttribute("aria-hidden", "true");
      span.textContent = part;
      el.appendChild(span);
    });
  }
  function splitAll() {
    all("[data-fx='words']").forEach((el) => split(el, "word"));
    all("[data-fx='letters']").forEach((el) => split(el, "char"));
  }
  splitAll();

  // ---------------------------------------------------------------- custom cursor
  let cursor: HTMLDivElement | null = null;
  let cursorLabel: HTMLSpanElement | null = null;
  const cursorPos = { x: pointer.x, y: pointer.y };
  if (finePointer && !reduced) {
    doc.querySelectorAll(".fx-cursor").forEach((n) => n.remove());
    cursor = doc.createElement("div");
    cursor.className = "fx-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursorLabel = doc.createElement("span");
    cursor.appendChild(cursorLabel);
    doc.body.appendChild(cursor);
    html.classList.add("fx-has-cursor");
    cleanups.push(() => {
      cursor?.remove();
      html.classList.remove("fx-has-cursor");
    });
    on("pointerover", (e) => {
      const target = e.target as HTMLElement | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, [role='button'], input, select, textarea, label");
      cursor!.classList.toggle("is-label", Boolean(labelled));
      cursor!.classList.toggle("is-hover", Boolean(interactive) && !labelled);
      cursorLabel!.textContent = labelled?.dataset.cursor ?? "";
    });
    on("pointerdown", () => cursor?.classList.add("is-down"));
    on("pointerup", () => cursor?.classList.remove("is-down"));
    const leave = () => cursor?.classList.add("is-hidden");
    const enter = () => cursor?.classList.remove("is-hidden");
    doc.addEventListener("pointerleave", leave);
    doc.addEventListener("pointerenter", enter);
    cleanups.push(() => {
      doc.removeEventListener("pointerleave", leave);
      doc.removeEventListener("pointerenter", enter);
    });
  }

  // ---------------------------------------------------------------- scroll progress
  doc.querySelectorAll(".fx-progress").forEach((n) => n.remove());
  const progress = doc.createElement("div");
  progress.className = "fx-progress";
  progress.setAttribute("aria-hidden", "true");
  doc.body.appendChild(progress);
  cleanups.push(() => progress.remove());

  // ---------------------------------------------------------------- tilt & magnetic (delegated)
  if (finePointer && !reduced) {
    const reset = (el: HTMLElement) => {
      el.style.transform = "";
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
    };
    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;
    on("pointermove", (e) => {
      const t = e.target as HTMLElement | null;
      const tilt = t?.closest<HTMLElement>("[data-fx='tilt']") ?? null;
      if (tilted && tilted !== tilt) reset(tilted);
      tilted = tilt;
      if (tilt) {
        const r = tilt.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        tilt.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 9}deg)`;
        tilt.style.setProperty("--mx", `${px * 100}%`);
        tilt.style.setProperty("--my", `${py * 100}%`);
      }
      const mag = t?.closest<HTMLElement>("[data-fx='magnetic']") ?? null;
      if (magnet && magnet !== mag) magnet.style.transform = "";
      magnet = mag;
      if (mag) {
        const r = mag.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        mag.style.transform = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
      }
    }, { passive: true });
  }

  // ---------------------------------------------------------------- hover preview
  let preview: HTMLDivElement | null = null;
  const previewPos = { x: 0, y: 0, rot: 0 };
  if (finePointer && !reduced) {
    doc.querySelectorAll(".fx-preview").forEach((n) => n.remove());
    preview = doc.createElement("div");
    preview.className = "fx-preview";
    preview.setAttribute("aria-hidden", "true");
    const img = doc.createElement("img");
    img.alt = "";
    preview.appendChild(img);
    doc.body.appendChild(preview);
    cleanups.push(() => preview?.remove());
    on("pointerover", (e) => {
      const row = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-preview-src]");
      const inList = row?.closest("[data-fx='preview']");
      if (row && inList) {
        if (img.getAttribute("src") !== row.dataset.previewSrc) img.src = row.dataset.previewSrc!;
        preview!.classList.add("is-visible");
      } else preview!.classList.remove("is-visible");
    });
  }

  // ---------------------------------------------------------------- horizontal scroll sizing
  const sizeHScroll = () => {
    all("[data-fx='hscroll']").forEach((section) => {
      const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
      if (!track) return;
      if (!desktop.matches) {
        section.style.height = "";
        track.style.transform = "";
        return;
      }
      const distance = Math.max(0, track.scrollWidth - win.innerWidth);
      section.style.height = `${distance + win.innerHeight}px`;
      section.dataset.distance = String(distance);
    });
  };
  sizeHScroll();
  on("resize", sizeHScroll);
  on("load", sizeHScroll);
  const sizeTimer = win.setTimeout(sizeHScroll, 600);
  cleanups.push(() => {
    win.clearTimeout(sizeTimer);
    all("[data-fx='hscroll']").forEach((s) => (s.style.height = ""));
  });

  // ---------------------------------------------------------------- marquee state
  const marquees = new Map<HTMLElement, { x: number; dir: number }>();

  // ---------------------------------------------------------------- main loop
  let raf = 0;
  const vh = () => win.innerHeight;
  const tick = (time: number) => {
    const delta = scrollY - lastScrollY;
    lastScrollY = scrollY;
    velocity = lerp(velocity, delta, 0.12);

    // progress bar
    const max = doc.documentElement.scrollHeight - vh();
    progress.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max) : 0})`;

    // cursor
    if (cursor) {
      cursorPos.x = lerp(cursorPos.x, pointer.x, 0.22);
      cursorPos.y = lerp(cursorPos.y, pointer.y, 0.22);
      cursor.style.transform = `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`;
      cursor.classList.toggle("is-active", pointer.active);
    }
    if (preview?.classList.contains("is-visible")) {
      const nx = lerp(previewPos.x, pointer.x, 0.14);
      previewPos.rot = lerp(previewPos.rot, clamp((nx - previewPos.x) * 0.6, -12, 12), 0.1);
      previewPos.x = nx;
      previewPos.y = lerp(previewPos.y, pointer.y, 0.14);
      preview.style.transform = `translate3d(${previewPos.x}px, ${previewPos.y}px, 0) rotate(${previewPos.rot}deg)`;
    } else {
      previewPos.x = pointer.x;
      previewPos.y = pointer.y;
    }

    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.bottom > -100 && r.top < vh() + 100 ? r : null;
    };

    // words
    all("[data-fx='words']").forEach((el) => {
      const r = inView(el);
      if (!r) return;
      const words = el.querySelectorAll<HTMLElement>(".fx-word");
      const p = reduced ? 1 : clamp((vh() * 0.85 - r.top) / (r.height + vh() * 0.35));
      const lit = p * words.length;
      words.forEach((w, i) => (w.style.opacity = String(0.14 + 0.86 * clamp(lit - i))));
    });

    if (!reduced) {
      // marquee
      all("[data-fx='marquee']").forEach((el) => {
        const track = el.querySelector<HTMLElement>("[data-track]");
        if (!track || !inView(el)) return;
        const base = Number(el.dataset.direction ?? 1);
        const state = marquees.get(el) ?? { x: 0, dir: base };
        // Scrolling down runs the row in its base direction, scrolling up reverses it.
        if (Math.abs(velocity) > 0.4) state.dir = velocity > 0 ? base : -base;
        const speed = (0.6 + Math.min(Math.abs(velocity) * 0.35, 14)) * state.dir;
        const half = track.scrollWidth / 2;
        state.x = ((state.x + speed) % half + half) % half;
        track.style.transform = `translate3d(${-state.x}px, 0, 0) skewX(${clamp(velocity * -0.25, -8, 8)}deg)`;
        marquees.set(el, state);
      });

      // parallax
      all("[data-parallax]").forEach((el) => {
        const host = el.parentElement ?? el;
        const r = inView(host);
        if (!r) return;
        const speed = Number(el.dataset.parallax) || 0.12;
        const offset = (r.top + r.height / 2 - vh() / 2) * -speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });

      // spin
      all("[data-fx='spin']").forEach((el) => {
        el.style.transform = `rotate(${(time * 0.012 + scrollY * 0.25) % 360}deg)`;
      });

      // blob
      all("[data-fx='blob']").forEach((el) => {
        const r = el.parentElement?.getBoundingClientRect();
        if (!r) return;
        const tx = clamp((pointer.x - r.left) / r.width, 0, 1) - 0.5;
        const ty = clamp((pointer.y - r.top) / r.height, 0, 1) - 0.5;
        const cur = (el as HTMLElement & { _p?: { x: number; y: number } })._p ?? { x: 0, y: 0 };
        cur.x = lerp(cur.x, tx * 120, 0.04);
        cur.y = lerp(cur.y, ty * 90, 0.04);
        (el as HTMLElement & { _p?: { x: number; y: number } })._p = cur;
        const breathe = 1 + Math.sin(time / 1800) * 0.06;
        el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) scale(${breathe})`;
      });

      // letters
      all("[data-fx='letters']").forEach((el) => {
        const r = inView(el);
        if (!r) return;
        const near = pointer.y > r.top - 120 && pointer.y < r.bottom + 120;
        el.querySelectorAll<HTMLElement>(".fx-char").forEach((c) => {
          const cr = c.getBoundingClientRect();
          const d = Math.abs(pointer.x - (cr.left + cr.width / 2));
          const lift = near ? Math.max(0, 1 - d / 260) : 0;
          const prev = Number(c.dataset.lift ?? 0);
          const next = lerp(prev, lift, 0.12);
          c.dataset.lift = next.toFixed(3);
          c.style.transform = `translate3d(0, ${(-next * 22).toFixed(1)}px, 0)`;
          c.style.opacity = String(0.08 + next * 0.5);
        });
      });
    }

    // horizontal scroll (also with reduced motion: it is driven by the user's own scrolling)
    all("[data-fx='hscroll']").forEach((section) => {
      const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
      if (!track || !desktop.matches) return;
      const r = section.getBoundingClientRect();
      const distance = Number(section.dataset.distance ?? 0);
      const p = clamp(-r.top / Math.max(1, r.height - vh()));
      track.style.transform = `translate3d(${-p * distance}px, 0, 0)`;
      section.style.setProperty("--hp", p.toFixed(4));
    });

    raf = win.requestAnimationFrame(tick);
  };
  raf = win.requestAnimationFrame(tick);
  cleanups.push(() => win.cancelAnimationFrame(raf));

  return () => cleanups.splice(0).reverse().forEach((fn) => fn());
}
