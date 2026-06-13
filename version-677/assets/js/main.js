(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var filterBar = document.querySelector("[data-filter-bar]");

    if (filterBar) {
      var keyword = filterBar.querySelector("[data-filter-keyword]");
      var year = filterBar.querySelector("[data-filter-year]");
      var type = filterBar.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card"));

      function applyFilter() {
        var key = keyword ? keyword.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";

        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.region, card.dataset.type].join(" ").toLowerCase();
          var okKeyword = !key || text.indexOf(key) !== -1;
          var okYear = !yearValue || card.dataset.year === yearValue;
          var okType = !typeValue || card.dataset.type === typeValue;
          card.classList.toggle("is-hidden-by-filter", !(okKeyword && okYear && okType));
        });
      }

      [keyword, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    }

    var searchForm = document.querySelector("[data-search-form]");
    var searchInput = document.querySelector("[data-search-input]");
    var searchResults = document.querySelector("[data-search-results]");
    var searchStatus = document.querySelector("[data-search-status]");

    if (searchForm && searchInput && searchResults && searchStatus && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
          }[char];
        });
      }

      function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
          "<article class=\"movie-card\">",
          "<a class=\"movie-poster\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
          "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
          "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>",
          "<span class=\"poster-play\">▶</span>",
          "</a>",
          "<div class=\"movie-card-body\">",
          "<div class=\"movie-card-top\"><span class=\"movie-type\">" + escapeHtml(movie.type) + "</span><span class=\"movie-rating\">★ " + movie.rating + "</span></div>",
          "<h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>",
          "<p>" + escapeHtml(movie.desc) + "</p>",
          "<div class=\"movie-tags\">" + tags + "</div>",
          "</div>",
          "</article>"
        ].join("");
      }

      function runSearch(query) {
        var q = query.trim().toLowerCase();
        var pool = window.SEARCH_MOVIES;
        var results = q ? pool.filter(function (movie) {
          return movie.index.indexOf(q) !== -1;
        }) : pool.slice(0, 24);

        searchResults.innerHTML = results.slice(0, 120).map(card).join("");
        searchStatus.textContent = q ? "搜索结果" : "热门推荐";
      }

      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = searchInput.value.trim();
        var nextUrl = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
        window.history.replaceState(null, "", nextUrl);
        runSearch(value);
      });

      searchInput.addEventListener("input", function () {
        runSearch(searchInput.value);
      });

      runSearch(initial);
    }
  });
})();
