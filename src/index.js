import register from './gif-player';

// shims
window.requestIdleCallback = window.requestIdleCallback ||
  function (cb) {
    var start = Date.now();
    return setTimeout(function() {
      cb({
        didTimeout: false,
        timeRemaining: function() {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, 1);
  }

window.cancelIdleCallback = window.cancelIdleCallback ||
  function (id) {
    clearTimeout(id);
  }

if (window.WebComponents && window.WebComponents.ready) {
  register();
} else {
  window.addEventListener('WebComponentsReady', register);
}
