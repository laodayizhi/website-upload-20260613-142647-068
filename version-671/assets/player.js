import { H as Hls } from './hls.js';

function setupPlayer(frame) {
  var video = frame.querySelector('video');
  var button = frame.querySelector('[data-play-button]');
  var source = video ? video.getAttribute('data-video-src') : '';
  var hlsInstance = null;
  var initialized = false;

  if (!video || !button || !source) {
    return;
  }

  function initializeSource() {
    if (initialized) {
      return;
    }
    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            video.src = source;
          }
        }
      });
      return;
    }

    video.src = source;
  }

  button.addEventListener('click', function () {
    initializeSource();
    button.classList.add('is-hidden');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  });

  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });

  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
