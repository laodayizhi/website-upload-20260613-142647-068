(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-go]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-go")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var clear = panel.querySelector("[data-filter-clear]");
            var empty = panel.parentElement ? panel.parentElement.querySelector("[data-filter-empty]") : null;
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var selectedType = type ? type.value : "";
                var selectedYear = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardType = card.getAttribute("data-type") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;

                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }

                    card.classList.toggle("hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (clear) {
                clear.addEventListener("click", function () {
                    if (input) {
                        input.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    apply();
                });
            }
        });
    }

    function attachStream(video, sourceUrl) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            video._hls = hls;
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }

        video.src = sourceUrl;
        return Promise.resolve();
    }

    window.initMoviePlayer = function (sourceUrl) {
        ready(function () {
            var shell = document.querySelector("[data-player-shell]");
            var video = document.querySelector("[data-player-video]");
            var button = document.querySelector("[data-play-button]");
            var prepared = false;

            if (!shell || !video || !button || !sourceUrl) {
                return;
            }

            function start() {
                shell.classList.add("is-playing");
                var prepare = prepared ? Promise.resolve() : attachStream(video, sourceUrl);
                prepared = true;
                prepare.then(function () {
                    var playAction = video.play();
                    if (playAction && typeof playAction.catch === "function") {
                        playAction.catch(function () {});
                    }
                });
            }

            button.addEventListener("click", start);
            shell.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                if (!shell.classList.contains("is-playing")) {
                    start();
                }
            });
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });
})();
