/* dlstack — distilled
 * Loads data/links.json and renders sections, cards, YouTube facades.
 * No search, no filter, no clock, no theme toggle. The page is the index.
 */
(() => {
  "use strict";

  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const frag = (html) => document.createRange().createContextualFragment(html);

  const hostOf = (url) => {
    try { return new URL(url, location.href).hostname.replace(/^www\./, ""); }
    catch { return ""; }
  };
  const faviconFor = (url) => {
    const h = hostOf(url);
    return h ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(h)}&sz=128` : "";
  };
  const ytThumb = (id) => `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`;

  function renderLink(it) {
    const host = hostOf(it.url);
    const custom = it.image || it.icon;
    const src = custom || faviconFor(it.url);
    const isFavicon = !custom;
    const initial = (it.title || host || "·").trim().charAt(0).toUpperCase();
    return `
      <a class="card card--link reveal" href="${esc(it.url)}" target="_blank" rel="noopener noreferrer">
        <span class="favicon" ${src ? "" : "data-fallback"}>
          ${src
            ? `<img loading="lazy" alt="" src="${esc(src)}" data-fallback-initial="${esc(initial)}"${isFavicon ? ' class="is-favicon"' : ""}>`
            : esc(initial)}
        </span>
        <span>
          <span class="card__title">${esc(it.title)}</span>
          ${it.description ? `<span class="card__desc">${esc(it.description)}</span>` : ""}
          <span class="card__meta">
            ${host ? `<span class="card__host">${esc(host)}</span>` : ""}
            ${dateMarkup(it)}
          </span>
        </span>
      </a>`;
  }

  function renderProject(it) {
    const featured = it.featured ? " card--featured" : "";
    const tag = it.url ? "a" : "div";
    const attrs = it.url ? `href="${esc(it.url)}" target="_blank" rel="noopener noreferrer"` : "";
    const tags = (it.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join("");
    return `
      <${tag} class="card card--project${featured} reveal" ${attrs}>
        <span class="card__title">${esc(it.title)}</span>
        ${it.description ? `<p class="card__desc">${esc(it.description)}</p>` : ""}
        ${(tags || it.date) ? `<div class="tags">${tags}${dateMarkup(it)}</div>` : ""}
      </${tag}>`;
  }

  function renderYouTube(it) {
    return `
      <div class="card card--youtube reveal">
        <div class="yt" role="button" tabindex="0" aria-label="Play: ${esc(it.title)}" data-yt="${esc(it.id)}" style="background-image:url('${esc(ytThumb(it.id))}')">
          <div class="yt__play" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
          </div>
          <div class="yt__title">${esc(it.title)}${it.date ? ` <span class="yt__date">${esc(fmtDate(it.date))}</span>` : ""}</div>
        </div>
      </div>`;
  }

  function renderPortfolio(it) {
    const src = it.image || it.url;
    const tag = it.url ? "a" : "div";
    const attrs = it.url ? `href="${esc(it.url)}" target="_blank" rel="noopener noreferrer"` : "";
    const ratio = it.ratio ? ` style="--portfolio-ratio:${esc(String(it.ratio).replace(":", " / "))}"` : "";
    return `
      <${tag} class="card card--portfolio reveal" ${attrs}>
        <div class="portfolio__media"${ratio}>
          ${src ? `<img loading="lazy" alt="${esc(it.title || "")}" src="${esc(src)}">` : ""}
        </div>
        ${(it.title || it.description || it.date) ? `
        <div class="portfolio__caption">
          ${it.title ? `<span class="card__title">${esc(it.title)}</span>` : ""}
          ${it.description ? `<span class="card__desc">${esc(it.description)}</span>` : ""}
          ${dateMarkup(it)}
        </div>` : ""}
      </${tag}>`;
  }

  function renderClient(it) {
    const host = hostOf(it.url);
    const custom = it.image || it.icon;
    const src = custom || faviconFor(it.url);
    const isFavicon = !custom;
    const initial = (it.title || host || "·").trim().charAt(0).toUpperCase();
    const tag = it.url ? "a" : "div";
    const attrs = it.url ? `href="${esc(it.url)}" target="_blank" rel="noopener noreferrer"` : "";
    return `
      <${tag} class="card card--client reveal" ${attrs} title="${esc(it.title || host || "")}">
        <span class="client__logo" ${src ? "" : "data-fallback"}>
          ${src
            ? `<img loading="lazy" alt="${esc(it.title || host || "")}" src="${esc(src)}" data-fallback-initial="${esc(initial)}"${isFavicon ? ' class="is-favicon"' : ""}>`
            : esc(initial)}
        </span>
        ${it.title ? `<span class="client__title">${esc(it.title)}</span>` : ""}
        ${dateMarkup(it)}
      </${tag}>`;
  }

  const renderItem = (it) =>
    it.type === "youtube"   ? renderYouTube(it) :
    it.type === "card"      ? renderProject(it) :
    it.type === "client"    ? renderClient(it) :
    it.type === "portfolio" ? renderPortfolio(it) :
                              renderLink(it);

  function renderSection(sec, n) {
    const items = (sec.items || []).map(renderItem).join("");
    const num = String(n).padStart(2, "0");
    const isClients = sec.layout === "clients" || sec.items?.[0]?.type === "client";
    const gridClass = isClients ? "grid--clients" : "grid";
    return `
      <section class="section">
        <header class="section__head">
          <div class="section__numwrap">
            <small>№</small>
            <span class="section__num">${num}</span>
          </div>
          <div class="section__titlewrap">
            <h2 class="section__title">${esc(sec.label)}</h2>
            ${sec.kicker ? `<span class="section__kicker">${esc(sec.kicker)}</span>` : ""}
          </div>
        </header>
        <div class="${gridClass}">${items}</div>
      </section>`;
  }

  const SOCIAL_ICONS = {
    github:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.3 1.19-3.1-.12-.3-.52-1.48.11-3.08 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.78.11 3.08.74.8 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 4.97 8.5 2.5 2.5 0 0 1 4.98 3.5ZM3 9.75h4V21H3V9.75ZM9.5 9.75h3.8v1.55h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H18V16.1c0-1.17-.02-2.68-1.63-2.68-1.63 0-1.88 1.27-1.88 2.6V21H9.5V9.75Z"/></svg>',
    mail:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    rss:      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3a16 16 0 0 1 16 16h-3A13 13 0 0 0 5 6V3Zm0 7a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6v-3Zm1.5 6a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/></svg>',
    link:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days-icon lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>',
	  bluesky:  '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Bluesky</title><path d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/></svg>',
    lastfm:   '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Last.fm</title><path d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z"/></svg>'
  };

  function renderSocial(items) {
    return items.map(s =>
      `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${SOCIAL_ICONS[s.icon] || SOCIAL_ICONS.link}<span>${esc(s.label)}</span></a>`
    ).join("");
  }

  function nameMarkup(name) {
    if (!name) return "";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length < 2) return `<span class="hero__name-first">${esc(name)}</span>`;
    const last = parts.pop();
    return `<span class="hero__name-first">${esc(parts.join(" "))}</span> <em data-text="${esc(last)}">${esc(last)}</em>`;
  }

  function fmtDate(d) {
    if (!d) return "";
    const m = String(d).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
    if (!m) return String(d);
    const [, y, mo, dd] = m;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    if (dd && mo) return `${months[+mo - 1]} ${+dd}, ${y}`;
    if (mo)       return `${months[+mo - 1]} ${y}`;
    return y;
  }
  const dateMarkup = (it) =>
    it.date ? `<time class="card__date" datetime="${esc(it.date)}">${esc(fmtDate(it.date))}</time>` : "";

  function attachFaviconFallback(root) {
    $$("img[data-fallback-initial]", root).forEach(img => {
      img.addEventListener("error", () => {
        const initial = img.dataset.fallbackInitial || "·";
        const parent = img.parentElement;
        if (parent) { parent.setAttribute("data-fallback", ""); parent.textContent = initial; }
      }, { once: true });
    });
  }

  function attachYouTube(root) {
    const open = (fac) => {
      const id = fac.dataset.yt;
      if (!id) return;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&controls=1`;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.title = fac.getAttribute("aria-label") || "YouTube video";
      fac.replaceChildren(iframe);
      fac.classList.add("yt--playing");
      fac.removeAttribute("data-yt");
      fac.removeAttribute("role");
      fac.removeAttribute("tabindex");
      fac.style.cursor = "default";
    };
    root.addEventListener("click", (e) => {
      const fac = e.target.closest("[data-yt]");
      if (fac) { e.preventDefault(); open(fac); }
    });
    root.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const fac = e.target.closest("[data-yt]");
      if (fac) { e.preventDefault(); open(fac); }
    });
  }

  function attachTheme() {
    const root = document.documentElement;
    const btn = $("#theme");
    if (!btn) return;
    const order = ["auto", "light", "dark"];
    const label = { auto: "Auto", light: "Light", dark: "Dark" };
    const stored = localStorage.getItem("dlstack-theme");
    if (!order.includes(root.dataset.theme)) root.dataset.theme = "auto";
    if (order.includes(stored)) root.dataset.theme = stored;
    const sync = () => {
      btn.textContent = label[root.dataset.theme];
      btn.setAttribute("aria-label", `Theme: ${label[root.dataset.theme]}. Click to change.`);
    };
    sync();
    btn.addEventListener("click", () => {
      const i = order.indexOf(root.dataset.theme);
      root.dataset.theme = order[(i + 1) % order.length];
      localStorage.setItem("dlstack-theme", root.dataset.theme);
      sync();
    });
  }

  function bootCosmos() {
    const root = document.documentElement;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) { root.classList.add("cosmos-static"); return; }

    const canvas = document.createElement("canvas");
    canvas.className = "cosmos-bg";
    canvas.setAttribute("aria-hidden", "true");
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false }) ||
               canvas.getContext("experimental-webgl");
    if (!gl) { root.classList.add("cosmos-static"); return; }

    const vsSrc = `
      attribute vec2 a;
      void main() { gl_Position = vec4(a, 0.0, 1.0); }
    `;
    const fsSrc = `
      precision highp float;
      uniform vec2  u_res;
      uniform float u_time;
      uniform vec2  u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i),            hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.55;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.04; a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 frag = gl_FragCoord.xy;
        vec2 uv = frag / u_res;
        vec2 p  = (frag - 0.5 * u_res) / u_res.y;

        // gravity well: pull sampling toward cursor very subtly
        vec2 m = (u_mouse - 0.5 * u_res) / u_res.y;
        vec2 toM = p - m;
        float md = length(toM) + 0.001;
        p -= (toM / md) * 0.03 * exp(-md * 1.6);

        // nebula via warped fbm
        vec2 q  = p * 1.25 + vec2(u_time * 0.015, u_time * 0.010);
        vec2 r  = q + vec2(fbm(q + u_time * 0.04), fbm(q - u_time * 0.03));
        float n = fbm(r);

        // palette: deep indigo -> magenta -> violet -> cyan ridges
        vec3 deep    = vec3(0.020, 0.012, 0.055);
        vec3 violet  = vec3(0.350, 0.150, 0.620);
        vec3 magenta = vec3(0.950, 0.220, 0.700);
        vec3 cyan    = vec3(0.290, 0.940, 1.000);

        vec3 col = deep;
        col = mix(col, violet,  smoothstep(0.25, 0.70, n));
        col = mix(col, magenta, smoothstep(0.55, 0.92, n) * 0.85);
        col += cyan * smoothstep(0.78, 0.98, n) * 0.45;

        // soft vignette
        float vig = smoothstep(1.25, 0.30, length(p));
        col *= mix(0.55, 1.05, vig);

        // ───── starfield — two layers ─────
        // layer 1 — small dense
        float starDensity = 90.0;
        vec2 sc = uv * starDensity * vec2(u_res.x / u_res.y, 1.0);
        vec2 si = floor(sc);
        vec2 sf = fract(sc) - 0.5;
        float sh = hash(si);
        if (sh > 0.986) {
          float d = length(sf);
          float tw = 0.55 + 0.45 * sin(u_time * 2.4 + sh * 88.0);
          col += vec3(smoothstep(0.05, 0.0, d) * tw);
        }
        // layer 2 — bright sparse blue-white
        starDensity = 28.0;
        sc = uv * starDensity * vec2(u_res.x / u_res.y, 1.0);
        si = floor(sc);
        sf = fract(sc) - 0.5;
        sh = hash(si + 13.7);
        if (sh > 0.993) {
          float d = length(sf);
          float tw = 0.3 + 0.7 * sin(u_time * 1.7 + sh * 200.0);
          float s  = smoothstep(0.09, 0.0, d) * tw;
          col += vec3(0.72, 0.86, 1.0) * s * 1.8;
          // soft halo
          col += vec3(0.45, 0.55, 0.95) * smoothstep(0.28, 0.0, d) * tw * 0.18;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("[cosmos]", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) { root.classList.add("cosmos-static"); return; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[cosmos]", gl.getProgramInfoLog(prog));
      root.classList.add("cosmos-static"); return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1,  1,-1,  -1, 1,
      -1, 1,  1,-1,   1, 1
    ]), gl.STATIC_DRAW);
    const aLoc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(aLoc);
    gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

    const uRes   = gl.getUniformLocation(prog, "u_res");
    const uTime  = gl.getUniformLocation(prog, "u_time");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    document.body.prepend(canvas);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0;
    const resize = () => {
      w = Math.floor(window.innerWidth  * dpr);
      h = Math.floor(window.innerHeight * dpr);
      canvas.width  = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const mouse  = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    window.addEventListener("pointermove", (e) => {
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
    }, { passive: true });

    let running = true;
    document.addEventListener("visibilitychange", () => {
      const wasPaused = !running;
      running = !document.hidden;
      if (running && wasPaused) requestAnimationFrame(loop);
    });

    const t0 = performance.now();
    function loop(now) {
      if (!running) return;
      mouse.x += (target.x - mouse.x) * 0.05;
      mouse.y += (target.y - mouse.y) * 0.05;
      gl.uniform2f(uRes,   w, h);
      gl.uniform1f(uTime,  (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse.x * w, mouse.y * h);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function attachReveal(root) {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal", root).forEach(el => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal", root).forEach(el => io.observe(el));
  }

  async function loadData() {
    const sources = ["data/links.json", "data/links.example.json"];
    let lastErr;
    for (const src of sources) {
      try {
        const res = await fetch(src, { cache: "no-cache" });
        if (!res.ok) { lastErr = new Error(`${src}: HTTP ${res.status}`); continue; }
        return await res.json();
      } catch (err) { lastErr = err; }
    }
    throw lastErr || new Error("No data file found.");
  }

  async function main() {
    const app = $("#app");
    let data;
    try {
      data = await loadData();
    } catch (err) {
      const p = document.createElement("p");
      p.style.cssText = "color:var(--accent);font-family:var(--mono);padding:2rem;max-width:48ch";
      p.textContent = `Couldn't load data/links.json or data/links.example.json. Check that one exists and is valid JSON. Details: ${err.message}`;
      app.replaceChildren(p);
      return;
    }

    if (data.theme?.accent) {
      document.documentElement.style.setProperty("--accent", data.theme.accent);
    }
    const validTpl = new Set(["editorial", "swiss", "cosmos"]);
    const tpl = validTpl.has(data.theme?.template) ? data.theme.template : "editorial";
    document.documentElement.dataset.template = tpl;
    try { localStorage.setItem("dlstack-template", tpl); } catch (e) {}
    if (tpl === "cosmos") bootCosmos();

    const p = data.profile || {};
    const sections = data.sections || [];
    const social = data.social || [];
    document.title = `${p.name || "Links"}`;

    const taglineMarkup = (t) =>
      esc(t).replace(/\s*[·•|]\s*/g, '<span aria-hidden="true">·</span>');

    const html = `
      <div class="marker">
        <span class="marker__brand"><span class="star" aria-hidden="true">✱</span> Index №01</span>
        <span class="marker__year">MMXXVI</span>
        <button id="theme" class="theme" type="button">Auto</button>
      </div>

      <header class="hero">
        <span class="hero__asterism" aria-hidden="true">✱</span>
        <h1 class="hero__name">${nameMarkup(p.name)}</h1>
        ${p.tagline ? `<p class="hero__tagline">${taglineMarkup(p.tagline)}</p>` : ""}
        ${p.bio ? `<p class="hero__bio">${esc(p.bio)}</p>` : ""}
        ${social.length ? `<nav class="social" aria-label="Social">${renderSocial(social)}</nav>` : ""}
      </header>

      <main>${sections.map((s, i) => renderSection(s, i + 1)).join("")}</main>

      <footer class="foot">
        <span>${esc(data.footer?.copy || "")}</span>
        <span class="foot__mark" aria-hidden="true">— ✱ —</span>
        <span class="foot__right">© ${new Date().getFullYear()} ${esc(p.name || "")}</span>
      </footer>
    `;
    app.replaceChildren(frag(html));

    attachFaviconFallback(app);
    attachYouTube(app);
    attachReveal(app);
    attachTheme();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
