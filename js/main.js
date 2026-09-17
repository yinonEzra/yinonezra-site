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
      `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1` +
      `&controls=0&rel=0&modestbranding=1&playsinline=1&disablekb=1&fs=0&iv_load_policy=3&showinfo=0` +
      `&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    grid.innerHTML = P.map((p, i) => {
      const cover = p.cover || (p.video ? yt.thumb(p.video) : "");
      return `<a class="tile${p.featured || i === 0 ? " featured" : ""}" href="${projectHref(p)}" aria-label="${esc(p.title)}" data-video="${esc(p.video || "")}">
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
    const REVEAL_DELAY = 3300;

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

    // --- Seamless looping -------------------------------------------
    // YouTube shows its title/controls chrome for ~3s whenever playback
    // (re)starts, including after a seek. To hide that:
    //  * clips shorter than DUAL_MAX get a second, hidden player that is
    //    started LEAD seconds before the visible one ends; once its chrome
    //    has faded we swap them, so the loop never shows any UI;
    //  * longer clips (which loop rarely) briefly show their poster while
    //    the single player restarts.
    const CHROME_MS = 3300;  // how long YouTube's chrome stays up after a (re)start
    const LEAD = 4.8;        // seconds before the end to warm up the spare player
    const DUAL_MAX = matchMedia("(max-width: 720px)").matches ? 20 : 45; // seconds; shorter clips get the second player (fewer on phones)
    const PS = () => window.YT && YT.PlayerState;
    const liveVars = (id) => ({ autoplay: 0, mute: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1,
      disablekb: 1, fs: 0, iv_load_policy: 3, origin: location.origin });

    function setupTile(tile, frame, index) {
      const id = tile.dataset.video;
      const players = [];
      let active = 0, started = false, spare = null, spareWarmAt = 0, covering = false, swapping = false;

      const front = (k) => players.forEach((pl, j) => pl.getIframe().classList.toggle("is-back", j !== k));

      const tick = () => {
        const P = players[active];
        if (!P || !P.getDuration) return;
        let d = 0, t = 0, st = -1;
        try { d = P.getDuration(); t = P.getCurrentTime(); st = P.getPlayerState(); } catch (_) { return; }
        if (!(d > 1) || !(t >= 0)) return;
        const remaining = d - t;

        // Decide once whether this clip deserves a second player.
        if (spare === null && started) {
          if (d < DUAL_MAX) {
            const holder = document.createElement("div");
            tile.appendChild(holder);
            spare = new YT.Player(holder, { videoId: id, host: "https://www.youtube-nocookie.com", playerVars: liveVars(id),
              events: { onReady: (e) => { e.target.mute(); } } });
            spare.getIframe().classList.add("live", "is-back");
            spare.getIframe().setAttribute("tabindex", "-1");
            spare.getIframe().setAttribute("aria-hidden", "true");
            players.push(spare);
          } else {
            spare = false;
          }
        }

        if (spare) {
          const S = players[1 - active];
          if (!spareWarmAt && remaining < LEAD && S.playVideo) {
            try { S.mute(); S.seekTo(0, true); S.playVideo(); spareWarmAt = performance.now(); } catch (_) {}
          }
          const warm = spareWarmAt && performance.now() - spareWarmAt >= CHROME_MS;
          if (spareWarmAt && !swapping && (remaining < 1.0 || st === PS().ENDED)) {
            if (warm) {
              swapping = true;
              front(1 - active);
              try { P.pauseVideo(); } catch (_) {}
              active = 1 - active; spareWarmAt = 0; swapping = false;
            } else if (!covering) {
              // Spare not ready yet (slow network): hide the restart behind the poster.
              covering = true; tile.classList.remove("is-live");
              const wait = setInterval(() => {
                if (performance.now() - spareWarmAt >= CHROME_MS) {
                  clearInterval(wait); front(1 - active);
                  try { P.pauseVideo(); } catch (_) {}
                  active = 1 - active; spareWarmAt = 0; tile.classList.add("is-live"); covering = false;
                }
              }, 100);
            }
          }
        } else if (spare === false) {
          if (!covering && (remaining < 1.0 || st === PS().ENDED)) {
            covering = true;
            tile.classList.remove("is-live");
            setTimeout(() => { try { P.seekTo(0, true); P.playVideo(); } catch (_) {} }, 250);
            setTimeout(() => { tile.classList.add("is-live"); covering = false; }, 250 + CHROME_MS + 200);
          }
        }
      };

      const main = new YT.Player(frame, {
        events: {
          onReady: (e) => { e.target.mute(); e.target.playVideo(); },
          onStateChange: (e) => {
            if (e.data === PS().PLAYING && !started) {
              started = true;
              setTimeout(() => reveal(tile, index), REVEAL_DELAY);
            }
          }
        }
      });
      players.push(main);
      setInterval(tick, 100);
    }

    if (frames.length) {
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevReady && prevReady();
        frames.forEach((frame, i) => setupTile(frame.closest(".tile"), frame, i));
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
