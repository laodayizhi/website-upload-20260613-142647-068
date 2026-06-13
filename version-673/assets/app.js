(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        if (slides.length) {
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    showSlide(index);
                });
            });

            setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

        filterPanels.forEach(function (filterPanel) {
            var input = filterPanel.querySelector('[data-filter-input]');
            var typeSelect = filterPanel.querySelector('[data-filter-type]');
            var yearSelect = filterPanel.querySelector('[data-filter-year]');
            var scope = document.querySelector(filterPanel.getAttribute('data-filter-panel')) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var empty = document.querySelector('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query && input) {
                input.value = query;
            }

            function includesText(haystack, needle) {
                return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
            }

            function applyFilter() {
                var keyword = input ? input.value.trim() : '';
                var typeValue = typeSelect ? typeSelect.value : '';
                var yearValue = yearSelect ? yearSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = card.getAttribute('data-search') || '';
                    var type = card.getAttribute('data-type') || '';
                    var year = card.getAttribute('data-year') || '';
                    var matchKeyword = !keyword || includesText(haystack, keyword);
                    var matchType = !typeValue || type === typeValue;
                    var matchYear = !yearValue || year === yearValue;
                    var matched = matchKeyword && matchType && matchYear;

                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? 'none' : 'block';
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }

            if (typeSelect) {
                typeSelect.addEventListener('change', applyFilter);
            }

            if (yearSelect) {
                yearSelect.addEventListener('change', applyFilter);
            }

            applyFilter();
        });
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var start = document.querySelector('[data-player-start]');
    var button = document.querySelector('[data-play-button]');
    var loaded = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function hideStart() {
        if (start) {
            start.classList.add('is-hidden');
        }
    }

    function attachSource() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        attachSource();
        hideStart();

        var result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }
    }

    if (start) {
        start.addEventListener('click', play);
    }

    if (button) {
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            play();
        });
    }

    video.addEventListener('play', hideStart);
    video.addEventListener('click', function () {
        if (!loaded) {
            play();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
