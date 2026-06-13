(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG') {
        target.classList.add('image-hidden');
      }
    }, true);

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var next = hero.querySelector('[data-hero-next]');
      var prev = hero.querySelector('[data-hero-prev]');
      var index = 0;
      var timer;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5000);
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(index + 1);
          restart();
        });
      }
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(index - 1);
          restart();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
          restart();
        });
      });
      showSlide(0);
      restart();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterList = document.querySelector('[data-filter-list]');
    if (filterForm && filterList) {
      var input = filterForm.querySelector('[data-filter-input]');
      var region = filterForm.querySelector('[data-filter-region]');
      var type = filterForm.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-title]'));
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      if (input) {
        input.value = q;
      }

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : '';
      }

      function filterCards() {
        var keyword = valueOf(input);
        var regionValue = valueOf(region);
        var typeValue = valueOf(type);
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-type') || ''
          ].join(' ').toLowerCase();
          var regionText = (card.getAttribute('data-region') || '').toLowerCase();
          var typeText = (card.getAttribute('data-type') || '').toLowerCase();
          var matched = (!keyword || haystack.indexOf(keyword) !== -1) &&
            (!regionValue || regionText.indexOf(regionValue) !== -1) &&
            (!typeValue || typeText.indexOf(typeValue) !== -1);
          card.classList.toggle('hidden-by-filter', !matched);
        });
      }

      ['input', 'change'].forEach(function (eventName) {
        filterForm.addEventListener(eventName, filterCards);
      });
      filterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        filterCards();
      });
      filterCards();
    }

    var playerBox = document.querySelector('[data-player-box]');
    var video = document.querySelector('.video-player');
    var playButton = document.querySelector('[data-play-button]');
    var hlsInstance = null;

    function attachStream() {
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute('data-stream-url');
      if (!streamUrl) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', streamUrl);
        }
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        }
      } else if (!video.getAttribute('src')) {
        video.setAttribute('src', streamUrl);
      }
    }

    function startPlayback() {
      attachStream();
      if (!video) {
        return;
      }
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (playerBox) {
            playerBox.classList.add('is-playing');
          }
        }).catch(function () {
          if (playerBox) {
            playerBox.classList.remove('is-playing');
          }
        });
      }
    }

    if (video) {
      attachStream();
      video.addEventListener('play', function () {
        if (playerBox) {
          playerBox.classList.add('is-playing');
        }
      });
      video.addEventListener('pause', function () {
        if (playerBox) {
          playerBox.classList.remove('is-playing');
        }
      });
    }
    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }
    if (playerBox) {
      playerBox.addEventListener('click', function (event) {
        if (event.target === playButton) {
          return;
        }
        if (video && video.paused) {
          startPlayback();
        }
      });
    }
  });
})();
