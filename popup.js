// EyeShield Popup Script

var mainToggle    = document.getElementById('mainToggle');
var autoToggle    = document.getElementById('autoToggle');
var statusDot     = document.getElementById('statusDot');
var statusText    = document.getElementById('statusText');
var timeBadge     = document.getElementById('timeBadge');
var previewStrip  = document.getElementById('previewStrip');
var slidersSection = document.getElementById('slidersSection');
var resetBtn      = document.getElementById('resetBtn');
var toastEl       = document.getElementById('toast');

var warmthSlider    = document.getElementById('warmthSlider');
var brightnessSlider = document.getElementById('brightnessSlider');
var contrastSlider  = document.getElementById('contrastSlider');
var saturationSlider = document.getElementById('saturationSlider');

var warmthVal    = document.getElementById('warmthVal');
var brightnessVal = document.getElementById('brightnessVal');
var contrastVal  = document.getElementById('contrastVal');
var saturationVal = document.getElementById('saturationVal');

// Current settings state
var currentSettings = null;

// Default fallback
var FALLBACK = {
  enabled: true,
  autoMode: true,
  warmth: 25,
  brightness: 90,
  contrast: 93,
  saturation: 85,
  profiles: {
    day:     { warmth: 18, brightness: 100, contrast: 95, saturation: 92 },
    evening: { warmth: 35, brightness: 92,  contrast: 92, saturation: 85 },
    night:   { warmth: 55, brightness: 85,  contrast: 90, saturation: 75 }
  }
};

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(function() { toastEl.classList.remove('show'); }, 1800);
}

function getTimePeriod() {
  var hour = new Date().getHours();
  if (hour >= 6 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getActiveValues(settings) {
  if (!settings) settings = FALLBACK;
  if (settings.autoMode && settings.profiles) {
    var period = getTimePeriod();
    var profile = settings.profiles[period];
    if (profile) {
      return {
        warmth: profile.warmth,
        brightness: profile.brightness,
        contrast: profile.contrast,
        saturation: profile.saturation
      };
    }
  }
  return {
    warmth: settings.warmth || 25,
    brightness: settings.brightness || 90,
    contrast: settings.contrast || 93,
    saturation: settings.saturation || 85
  };
}

function updateUI(settings) {
  if (!settings) settings = FALLBACK;
  currentSettings = settings;

  var enabled = settings.enabled;
  var autoMode = settings.autoMode;

  // Main toggle
  if (enabled) {
    mainToggle.classList.add('active');
  } else {
    mainToggle.classList.remove('active');
  }

  // Status dot
  if (enabled) {
    statusDot.classList.remove('off');
  } else {
    statusDot.classList.add('off');
  }

  // Status text
  if (enabled) {
    statusText.textContent = autoMode
      ? 'Auto — ' + getTimePeriod() + ' mode active'
      : 'Manual — custom settings';
  } else {
    statusText.textContent = 'Disabled';
  }

  // Preview strip
  if (enabled) {
    previewStrip.classList.remove('off');
  } else {
    previewStrip.classList.add('off');
  }

  // Auto toggle
  if (autoMode) {
    autoToggle.classList.add('active');
  } else {
    autoToggle.classList.remove('active');
  }

  // Time badge
  var period = getTimePeriod();
  timeBadge.textContent = period.toUpperCase();
  if (enabled) {
    timeBadge.classList.remove('off');
  } else {
    timeBadge.classList.add('off');
  }

  // Slider values
  var vals = getActiveValues(settings);

  warmthSlider.value = vals.warmth;
  warmthVal.textContent = vals.warmth + '%';

  brightnessSlider.value = vals.brightness;
  brightnessVal.textContent = vals.brightness + '%';

  contrastSlider.value = vals.contrast;
  contrastVal.textContent = vals.contrast + '%';

  saturationSlider.value = vals.saturation;
  saturationVal.textContent = vals.saturation + '%';

  // Disable sliders when off
  warmthSlider.disabled = !enabled;
  brightnessSlider.disabled = !enabled;
  contrastSlider.disabled = !enabled;
  saturationSlider.disabled = !enabled;

  if (enabled) {
    slidersSection.classList.remove('disabled');
  } else {
    slidersSection.classList.add('disabled');
  }
}

function buildFilterCSS(filter, enabled) {
  if (!enabled || !filter) {
    return 'html { filter: none !important; transition: filter 300ms ease !important; }';
  }
  var sepia = (filter.warmth || 0) / 100;
  var brightness = (filter.brightness || 100) / 100;
  var contrast = (filter.contrast || 100) / 100;
  var saturation = (filter.saturation || 100) / 100;
  return 'html { filter: sepia(' + sepia + ') brightness(' + brightness + ') contrast(' + contrast + ') saturate(' + saturation + ') !important; transition: filter 300ms ease !important; }';
}

function applyToActiveTab(settings) {
  var vals = getActiveValues(settings);
  var css = buildFilterCSS(vals, settings.enabled);

  // Inject CSS directly into the active tab for instant effect
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs || !tabs[0]) return;
    var tabId = tabs[0].id;

    // Use scripting API to execute in the page instantly
    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      func: function(cssText) {
        var STYLE_ID = 'eyeshield-filter-style';
        var styleEl = document.getElementById(STYLE_ID);
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = STYLE_ID;
          (document.head || document.documentElement).appendChild(styleEl);
        }
        styleEl.textContent = cssText;
      },
      args: [css]
    }).catch(function() {});
  });
}

function saveSettings(settings) {
  currentSettings = settings;

  // Instant effect on active tab
  applyToActiveTab(settings);

  // Also save & broadcast to all tabs via background
  try {
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings: settings }, function() {
      if (chrome.runtime.lastError) {
        console.log('Save error:', chrome.runtime.lastError);
      }
    });
  } catch(e) {
    console.log('Cannot send message:', e);
  }
}

// Load initial state
try {
  chrome.runtime.sendMessage({ type: 'GET_FILTER' }, function(response) {
    if (chrome.runtime.lastError) {
      updateUI(FALLBACK);
      return;
    }
    if (response && response.settings) {
      updateUI(response.settings);
    } else {
      updateUI(FALLBACK);
    }
  });
} catch(e) {
  updateUI(FALLBACK);
}

// Main Toggle click
mainToggle.addEventListener('click', function() {
  if (!currentSettings) currentSettings = JSON.parse(JSON.stringify(FALLBACK));
  var newSettings = JSON.parse(JSON.stringify(currentSettings));
  newSettings.enabled = !newSettings.enabled;
  updateUI(newSettings);
  saveSettings(newSettings);
  showToast(newSettings.enabled ? 'EyeShield ON' : 'EyeShield OFF');
});

// Auto Mode Toggle click
autoToggle.addEventListener('click', function() {
  if (!currentSettings) currentSettings = JSON.parse(JSON.stringify(FALLBACK));
  var newSettings = JSON.parse(JSON.stringify(currentSettings));
  var newAutoMode = !newSettings.autoMode;
  newSettings.autoMode = newAutoMode;

  // When switching to manual, copy current auto values to manual
  if (!newAutoMode && newSettings.profiles) {
    var period = getTimePeriod();
    var profile = newSettings.profiles[period];
    if (profile) {
      newSettings.warmth = profile.warmth;
      newSettings.brightness = profile.brightness;
      newSettings.contrast = profile.contrast;
      newSettings.saturation = profile.saturation;
    }
  }

  updateUI(newSettings);
  saveSettings(newSettings);
  showToast(newAutoMode ? 'Auto mode ON' : 'Manual mode');
});

// Slider handlers
function handleSlider(sliderEl, displayEl, key) {
  sliderEl.addEventListener('input', function(e) {
    var val = parseInt(e.target.value);
    displayEl.textContent = val + '%';

    if (!currentSettings) currentSettings = JSON.parse(JSON.stringify(FALLBACK));
    var newSettings = JSON.parse(JSON.stringify(currentSettings));
    newSettings.autoMode = false;
    newSettings[key] = val;

    autoToggle.classList.remove('active');
    statusText.textContent = 'Manual — custom settings';

    currentSettings = newSettings;
    saveSettings(newSettings);
  });
}

handleSlider(warmthSlider, warmthVal, 'warmth');
handleSlider(brightnessSlider, brightnessVal, 'brightness');
handleSlider(contrastSlider, contrastVal, 'contrast');
handleSlider(saturationSlider, saturationVal, 'saturation');

// Reset to Default
resetBtn.addEventListener('click', function() {
  try {
    chrome.runtime.sendMessage({ type: 'RESET_DEFAULT' }, function(response) {
      if (chrome.runtime.lastError) {
        updateUI(FALLBACK);
        showToast('Restored defaults');
        return;
      }
      if (response && response.settings) {
        updateUI(response.settings);
        applyToActiveTab(response.settings);
      } else {
        updateUI(FALLBACK);
        applyToActiveTab(FALLBACK);
      }
      showToast('Restored defaults');
    });
  } catch(e) {
    updateUI(FALLBACK);
    applyToActiveTab(FALLBACK);
    showToast('Restored defaults');
  }
});
