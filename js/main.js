/* Shared rendering for the Work grid and project pages. */
(function () {
  const P = window.PROJECTS || [];
  const yt = {
    thumb: (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    thumbFallback: (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    embed: (id, autoplay) =>
      `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${autoplay ? "&autoplay=1" : ""}`
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const projectHref = (p) => `project.html?p=${encodeURIComponent(p.slug)}`;

  // YouTube's maxres thumbnail doesn't exist for every video; swap to hq on error.
  function attachThumbFallback(img, id) {
    img.addEventListener("error", () => { if (!img.dataset.fb) { img.dataset.fb = 1; img.src = yt.thumbFallback(id); } }, { once: false });
    img.addEventListener("load", () => { if (img.naturalWidth <= 120 && !img.dataset.fb) { img.dataset.fb = 1; img.src = yt.thumbFallback(id); } });
  }

  // ---------- Work grid (live, autoplaying video wall) ----------
  const grid = document.querySelector("[data-grid]");
  if (grid) {
    const live = (id) =>
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}` +
      `&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&showinfo=0` +
      `&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    grid.innerHTML = P.map((p, i) => {
      const cover = p.cover || (p.video ? yt.thumb(p.video) : "");
      return `<a class="tile${p.featured || i === 0 ? " featured" : ""}" href="${projectHref(p)}" aria-label="${esc(p.title)}">
        <img class="poster" src="${esc(cover)}" alt="" data-yt="${p.cover ? "" : esc(p.video || "")}">
        ${p.video ? `<iframe class="live" src="${live(p.video)}" title="${esc(p.title)} (preview)" tabindex="-1" aria-hidden="true" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin"></iframe>` : ""}
        <span class="label">${esc(p.title)}</span>
      </a>`;
    }).join("");
    grid.querySelectorAll("img[data-yt]").forEach((img) => img.dataset.yt && attachThumbFallback(img, img.dataset.yt));

    // Drive the embeds through the YouTube IFrame API so we can
    //  (a) reveal each tile only once video is actually playing (YouTube's
    //      title/controls chrome auto-hides ~3s after playback starts), and
    //  (b) loop seamlessly by seeking back just before the end, so the
    //      end-of-video / replay chrome never flashes on short clips.
    const frames = [...grid.querySelectorAll(".tile .live")];
    const REVEAL_DELAY = 3000;

    // Loading screen: stays up until the first few videos are actually
    // playing (or a hard time limit), so the page appears already "live".
    const loader = document.getElementById("loader");
    const NEED = Math.min(3, frames.length);
    let readyCount = 0, loaderDone = false;
    const setProgress = () => loader && loader.style.setProperty("--p", NEED ? readyCount / NEED : 1);
    const finishLoader = () => {
      if (loaderDone) return;
      loaderDone = true;
      document.documentElement.classList.remove("is-loading");
      loader && loader.classList.add("done");
    };
    if (loader) {
      document.documentElement.classList.add("is-loading");
      setProgress();
      if (!NEED) finishLoader();
      setTimeout(finishLoader, 9000); // never hold visitors hostage
    }

    const reveal = (tile, index) => {
      if (tile.classList.contains("is-live")) return;
      tile.classList.add("is-live");
      if (index < NEED) { readyCount++; setProgress(); if (readyCount >= NEED) finishLoader(); }
    };
    frames.forEach((f, i) => setTimeout(() => reveal(f.closest(".tile"), i), 10000)); // safety net

    if (frames.length) {
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevReady && prevReady();
        frames.forEach((frame, i) => {
          const tile = frame.closest(".tile");
          let started = false;
          const player = new YT.Player(frame, {
            events: {
              onReady: (e) => { e.target.mute(); e.target.playVideo(); },
              onStateChange: (e) => {
                if (e.data === YT.PlayerState.PLAYING && !started) {
                  started = true;
                  setTimeout(() => reveal(tile, i), REVEAL_DELAY);
                }
                if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(0, true); e.target.playVideo(); }
              }
            }
          });
          // Seamless loop: jump back just before the end so YouTube never
          // shows its end-of-video / replay chrome on short clips.
          setInterval(() => {
            try {
              const d = player.getDuration && player.getDuration();
              const t = player.getCurrentTime && player.getCurrentTime();
              if (d > 1 && t > 0 && d - t < 0.8) player.seekTo(0, true);
            } catch (_) { /* player not ready yet */ }
          }, 250);
        });
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.onerror = finishLoader; // API blocked (ad blocker etc.): don't wait on it
      document.head.appendChild(tag);
    }
  }

  // ---------- Project page ----------
  const root = document.querySelector("[data-project]");
  if (root) {
    const slug = new URLSearchParams(location.search).get("p");
    const idx = P.findIndex((p) => p.slug === slug);
    const p = P[idx];
    if (!p) {
      root.innerHTML = `<div class="project-head"><h1>Project not found</h1><p><a href="index.html">Back to work</a></p></div>`;
      return;
    }
    document.title = `${p.title} — ${window.SITE?.name || ""}`;

    const media = [];
    if (p.video) media.push({ type: "video", id: p.video });
    (p.media || []).forEach((m) => media.push(m));

    const prev = P[(idx - 1 + P.length) % P.length];
    const next = P[(idx + 1) % P.length];

    root.innerHTML = `
      <header class="project-head">
        <h1>${esc(p.title)}</h1>
        ${p.description ? `<p>${esc(p.description)}</p>` : ""}
        ${p.tools?.length ? `<ul class="tools">${p.tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
      </header>
      <div class="media">
        ${media.map((m, i) => m.type === "video"
          ? `<div class="video-frame" data-video="${esc(m.id)}">
               <img class="poster" src="${yt.thumb(m.id)}" alt="" data-yt="${esc(m.id)}">
               <button class="poster-btn" type="button" aria-label="Play video"></button>
             </div>`
          : `<figure style="margin:0"><img src="${esc(m.src)}" alt="${esc(m.alt || p.title)}" loading="${i < 2 ? "eager" : "lazy"}"></figure>`
        ).join("")}
      </div>
      <nav class="pager" aria-label="More work">
        <a href="${projectHref(prev)}"><small>Previous</small>${esc(prev.title)}</a>
        <a href="index.html"><small>Index</small>All work</a>
        <a class="next" href="${projectHref(next)}"><small>Next</small>${esc(next.title)}</a>
      </nav>`;

    root.querySelectorAll(".poster[data-yt]").forEach((img) => attachThumbFallback(img, img.dataset.yt));
    root.querySelectorAll(".video-frame").forEach((frame) => {
      frame.querySelector(".poster-btn").addEventListener("click", () => {
        frame.innerHTML = `<iframe src="${yt.embed(frame.dataset.video, true)}" title="${esc(p.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
      });
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
