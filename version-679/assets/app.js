(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector(".hero-slider");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var next = hero.querySelector(".hero-next");
      var prev = hero.querySelector(".hero-prev");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });
      start();
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var filterScope = document.querySelector("[data-filter-scope]");
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-pill"));
    var activeFilter = "all";

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilter() {
      if (!filterScope) {
        return;
      }
      var keyword = normalize(filterInput ? filterInput.value : "");
      var items = Array.prototype.slice.call(filterScope.querySelectorAll(".movie-card, .rank-row"));
      items.forEach(function (item) {
        var text = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-tags"),
          item.getAttribute("data-meta")
        ].join(" "));
        var category = item.getAttribute("data-category") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedCategory = activeFilter === "all" || category === activeFilter;
        item.classList.toggle("is-filter-hidden", !(matchedKeyword && matchedCategory));
      });
    }

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        filterInput.value = query;
      }
      filterInput.addEventListener("input", applyFilter);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.getAttribute("data-filter-value") || "all";
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  });
})();

function initMoviePlayer(videoId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  if (!video || !overlay || !streamUrl) {
    return;
  }

  var loaded = false;
  var hlsInstance = null;

  function mountStream() {
    if (loaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    loaded = true;
  }

  function begin() {
    mountStream();
    overlay.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", begin);
  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
