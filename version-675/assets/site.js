(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    start();
  }

  const grids = Array.from(document.querySelectorAll("[data-card-grid]"));

  grids.forEach(function (grid) {
    const cards = Array.from(grid.querySelectorAll(".movie-card"));
    const search = document.querySelector("[data-local-search]");
    const year = document.querySelector("[data-filter-year]");
    const region = document.querySelector("[data-filter-region]");

    const apply = function () {
      const keyword = search ? search.value.trim().toLowerCase() : "";
      const yearValue = year ? year.value : "";
      const regionValue = region ? region.value : "";

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        const matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
        const matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
        card.classList.toggle("filtered-out", !(matchKeyword && matchYear && matchRegion));
      });
    };

    if (search) {
      search.addEventListener("input", apply);
    }

    if (year) {
      year.addEventListener("change", apply);
    }

    if (region) {
      region.addEventListener("change", apply);
    }
  });

  const globalForm = document.querySelector("[data-global-search]");
  const globalInput = document.querySelector("[data-global-search-input]");
  const globalResults = document.querySelector("[data-global-results]");

  if (globalForm && globalInput && globalResults && Array.isArray(window.SEARCH_MOVIES)) {
    const render = function () {
      const keyword = globalInput.value.trim().toLowerCase();
      globalResults.innerHTML = "";

      if (!keyword) {
        globalResults.classList.remove("open");
        return;
      }

      const matches = window.SEARCH_MOVIES.filter(function (movie) {
        return movie.t.indexOf(keyword) !== -1 || movie.m.indexOf(keyword) !== -1;
      }).slice(0, 12);

      matches.forEach(function (movie) {
        const link = document.createElement("a");
        link.className = "global-result-card";
        link.href = movie.u;
        link.innerHTML = "<img src=\"" + movie.c + "\" alt=\"" + movie.n.replace(/\"/g, "&quot;") + "\" loading=\"lazy\"><span><strong>" + movie.n + "</strong><span>" + movie.y + " · " + movie.r + " · " + movie.g + "</span></span>";
        globalResults.appendChild(link);
      });

      globalResults.classList.toggle("open", matches.length > 0);
    };

    globalForm.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    globalInput.addEventListener("input", render);
  }
})();

function initMoviePlayer(streamUrl) {
  const video = document.querySelector("[data-player]");
  const button = document.querySelector("[data-player-button]");

  if (!video || !button || !streamUrl) {
    return;
  }

  let ready = false;
  let hls = null;

  const loadStream = function () {
    if (ready) {
      video.play().catch(function () {});
      return;
    }

    ready = true;
    button.classList.add("is-hidden");
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    const play = function () {
      video.play().catch(function () {});
    };

    video.addEventListener("loadedmetadata", play, { once: true });
    window.setTimeout(play, 180);
  };

  button.addEventListener("click", loadStream);
  video.addEventListener("click", function () {
    if (!ready) {
      loadStream();
    }
  });
  video.addEventListener("error", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
      hls = null;
    }
  });
}
