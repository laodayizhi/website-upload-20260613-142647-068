(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var empty = document.querySelector("[data-empty]");
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var wrap = document.querySelector("[data-player-wrap]");
    var startButton = document.querySelector("[data-player-start]");
    var toggleButton = document.querySelector("[data-player-toggle]");
    var muteButton = document.querySelector("[data-player-mute]");
    var fullButton = document.querySelector("[data-player-full]");
    var seek = document.querySelector("[data-player-seek]");
    var time = document.querySelector("[data-player-time]");
    var loaded = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function format(value) {
      if (!Number.isFinite(value)) {
        return "0:00";
      }
      var minutes = Math.floor(value / 60);
      var seconds = Math.floor(value % 60).toString().padStart(2, "0");
      return minutes + ":" + seconds;
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function play() {
      load();
      var request = video.play();
      if (request && typeof request.then === "function") {
        request.catch(function () {});
      }
    }

    function pause() {
      video.pause();
    }

    function toggle() {
      if (video.paused) {
        play();
      } else {
        pause();
      }
    }

    function updateState() {
      if (wrap) {
        wrap.classList.toggle("is-playing", !video.paused);
      }
      if (startButton) {
        startButton.classList.toggle("is-hidden", !video.paused || video.currentTime > 0);
      }
      if (toggleButton) {
        toggleButton.textContent = video.paused ? "▶" : "Ⅱ";
      }
    }

    function updateTime() {
      if (seek) {
        seek.max = Number.isFinite(video.duration) ? video.duration : 0;
        seek.value = video.currentTime || 0;
      }
      if (time) {
        time.textContent = format(video.currentTime || 0) + " / " + format(video.duration || 0);
      }
    }

    if (startButton) {
      startButton.addEventListener("click", play);
    }
    if (toggleButton) {
      toggleButton.addEventListener("click", toggle);
    }
    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "静" : "音";
      });
    }
    if (fullButton) {
      fullButton.addEventListener("click", function () {
        var target = wrap || video;
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (target.requestFullscreen) {
          target.requestFullscreen();
        }
      });
    }
    if (seek) {
      seek.addEventListener("input", function () {
        video.currentTime = parseFloat(seek.value || "0");
      });
    }

    video.addEventListener("click", toggle);
    video.addEventListener("play", updateState);
    video.addEventListener("pause", updateState);
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateTime);
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });

    updateState();
    updateTime();
  };
})();
