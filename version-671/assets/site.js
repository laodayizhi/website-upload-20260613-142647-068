(function () {
  var mobileButton = document.querySelector('[data-mobile-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showHeroSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showHeroSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showHeroSlide(activeIndex + 1);
    }, 5200);
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupGlobalSearch(input) {
    var shell = input.closest('.search-shell');
    var panel = shell ? shell.querySelector('[data-search-panel]') : null;

    if (!panel) {
      return;
    }

    function closePanel() {
      panel.classList.remove('open');
      panel.innerHTML = '';
    }

    input.addEventListener('input', function () {
      var query = normalizeText(input.value);
      if (!query || !window.SEARCH_INDEX) {
        closePanel();
        return;
      }

      var matches = window.SEARCH_INDEX.filter(function (item) {
        return normalizeText(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.genre + ' ' + item.tags).indexOf(query) !== -1;
      }).slice(0, 12);

      if (!matches.length) {
        panel.innerHTML = '<div class="empty-filter-state">未找到相关影片</div>';
        panel.classList.add('open');
        return;
      }

      panel.innerHTML = matches.map(function (item) {
        return [
          '<a class="search-result-item" href="' + escapeHTML(item.url) + '">',
          '  <img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '">',
          '  <span><strong>' + escapeHTML(item.title) + '</strong><span>' + escapeHTML(item.year) + ' · ' + escapeHTML(item.region) + ' · ' + escapeHTML(item.type) + '</span></span>',
          '</a>'
        ].join('');
      }).join('');
      panel.classList.add('open');
    });

    document.addEventListener('click', function (event) {
      if (!shell.contains(event.target)) {
        closePanel();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(setupGlobalSearch);

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function setupLocalFilter(panel) {
    var section = panel.closest('section') || document;
    var grid = section.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }

    var search = panel.querySelector('[data-local-filter]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var channelSelect = panel.querySelector('[data-filter-channel]');
    var count = panel.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));
    var empty = document.createElement('div');
    empty.className = 'empty-filter-state';
    empty.textContent = '没有匹配的影片，请调整搜索或筛选条件。';

    var queryFromUrl = getQueryParam('q');
    if (queryFromUrl && search) {
      search.value = queryFromUrl;
    }

    function applyFilter() {
      var keyword = normalizeText(search ? search.value : '');
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var channel = channelSelect ? channelSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var titleMatch = normalizeText(card.getAttribute('data-title')).indexOf(keyword) !== -1;
        var typeMatch = !type || card.getAttribute('data-type') === type;
        var yearMatch = !year || card.getAttribute('data-year') === year;
        var channelMatch = !channel || card.getAttribute('data-channel') === channel;
        var shouldShow = titleMatch && typeMatch && yearMatch && channelMatch;
        card.classList.toggle('is-filtered-out', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部';
      }

      if (!visible && !grid.contains(empty)) {
        grid.appendChild(empty);
      }
      if (visible && grid.contains(empty)) {
        grid.removeChild(empty);
      }
    }

    [search, typeSelect, yearSelect, channelSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupLocalFilter);

  var backToTop = document.querySelector('[data-back-to-top]');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('visible', window.scrollY > 680);
    });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
