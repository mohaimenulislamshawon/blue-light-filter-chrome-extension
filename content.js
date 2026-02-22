// EyeShield Content Script — Applies filter to every page

(function() {
  'use strict';

  var STYLE_ID = 'eyeshield-filter-style';
  var TRANSITION_MS = 800;

  function buildFilterCSS(filter, enabled) {
    if (!enabled || !filter) {
      return 'html { filter: none !important; transition: filter ' + TRANSITION_MS + 'ms ease !important; }';
    }

    var sepia = (filter.warmth || 0) / 100;
    var brightness = (filter.brightness || 100) / 100;
    var contrast = (filter.contrast || 100) / 100;
    var saturation = (filter.saturation || 100) / 100;

    return 'html { filter: sepia(' + sepia + ') brightness(' + brightness + ') contrast(' + contrast + ') saturate(' + saturation + ') !important; transition: filter ' + TRANSITION_MS + 'ms ease !important; }';
  }

  function applyFilter(filter, enabled) {
    var styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = STYLE_ID;
      var target = document.head || document.documentElement;
      if (target) {
        target.appendChild(styleEl);
      } else {
        // DOM not ready yet, wait
        document.addEventListener('DOMContentLoaded', function() {
          var t = document.head || document.documentElement;
          if (t) t.appendChild(styleEl);
        });
      }
    }
    styleEl.textContent = buildFilterCSS(filter, enabled);
  }

  // Request current filter on load — with retry logic
  function requestFilter() {
    try {
      chrome.runtime.sendMessage({ type: 'GET_FILTER' }, function(response) {
        if (chrome.runtime.lastError) {
          // Background not ready, retry in 500ms
          setTimeout(requestFilter, 500);
          return;
        }
        if (response && response.filter && response.settings) {
          applyFilter(response.filter, response.settings.enabled);
        }
      });
    } catch(e) {
      setTimeout(requestFilter, 500);
    }
  }

  requestFilter();

  // Listen for filter updates from background
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === 'APPLY_FILTER') {
      applyFilter(message.filter, message.enabled);
    }
  });
})();
