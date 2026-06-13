(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', menu.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        selectAll('[data-filter-input]').forEach(function (input) {
            var targetSelector = input.getAttribute('data-filter-target') || '[data-search-card]';
            var cards = selectAll(targetSelector);
            var empty = document.querySelector(input.getAttribute('data-empty-target') || '[data-empty-state]');

            function filter() {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search-text') || card.textContent || '').toLowerCase();
                    var matched = !query || text.indexOf(query) !== -1;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            input.addEventListener('input', filter);
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input.name === 'q') {
                input.value = q;
            }
            filter();
        });
    }

    function setupNavSearch() {
        selectAll('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupNavSearch();
    });
}());
