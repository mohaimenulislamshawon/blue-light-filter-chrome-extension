// EyeShield Background Service Worker

const DEFAULT_SETTINGS = {
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

function cloneSettings(s) {
  return JSON.parse(JSON.stringify(s));
}

function ensureDefaults(settings) {
  if (!settings || typeof settings !== 'object') return cloneSettings(DEFAULT_SETTINGS);
  const merged = cloneSettings(DEFAULT_SETTINGS);
  if (typeof settings.enabled === 'boolean') merged.enabled = settings.enabled;
  if (typeof settings.autoMode === 'boolean') merged.autoMode = settings.autoMode;
  if (typeof settings.warmth === 'number') merged.warmth = settings.warmth;
  if (typeof settings.brightness === 'number') merged.brightness = settings.brightness;
  if (typeof settings.contrast === 'number') merged.contrast = settings.contrast;
  if (typeof settings.saturation === 'number') merged.saturation = settings.saturation;
  if (settings.profiles && typeof settings.profiles === 'object') {
    ['day', 'evening', 'night'].forEach(function(p) {
      if (settings.profiles[p] && typeof settings.profiles[p] === 'object') {
        merged.profiles[p] = Object.assign({}, merged.profiles[p], settings.profiles[p]);
      }
    });
  }
  return merged;
}

function loadSettings() {
  return new Promise(function(resolve) {
    chrome.storage.local.get('settings', function(result) {
      resolve(ensureDefaults(result ? result.settings : null));
    });
  });
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.set({ settings: cloneSettings(DEFAULT_SETTINGS) });
});

function getTimePeriod() {
  var hour = new Date().getHours();
  if (hour >= 6 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getActiveFilter(settings) {
  if (!settings || !settings.enabled) {
    return { warmth: 0, brightness: 100, contrast: 100, saturation: 100 };
  }
  if (settings.autoMode && settings.profiles) {
    var period = getTimePeriod();
    var profile = settings.profiles[period];
    if (profile) {
      return { warmth: profile.warmth, brightness: profile.brightness, contrast: profile.contrast, saturation: profile.saturation };
    }
  }
  return {
    warmth: settings.warmth || 25,
    brightness: settings.brightness || 90,
    contrast: settings.contrast || 93,
    saturation: settings.saturation || 85
  };
}

function broadcastFilter(settings) {
  var filter = getActiveFilter(settings);
  chrome.tabs.query({}, function(tabs) {
    if (!tabs) return;
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].id) {
        try {
          chrome.tabs.sendMessage(tabs[i].id, {
            type: 'APPLY_FILTER',
            filter: filter,
            enabled: settings.enabled
          }).catch(function() {});
        } catch(e) {}
      }
    }
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'GET_FILTER') {
    loadSettings().then(function(settings) {
      var filter = getActiveFilter(settings);
      sendResponse({ filter: filter, settings: settings });
    });
    return true;
  }

  if (message.type === 'UPDATE_SETTINGS') {
    var settings = ensureDefaults(message.settings);
    chrome.storage.local.set({ settings: settings }, function() {
      broadcastFilter(settings);
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'RESET_DEFAULT') {
    var defSettings = cloneSettings(DEFAULT_SETTINGS);
    chrome.storage.local.set({ settings: defSettings }, function() {
      broadcastFilter(defSettings);
      sendResponse({ settings: defSettings });
    });
    return true;
  }

  if (message.type === 'GET_TIME_PERIOD') {
    sendResponse({ period: getTimePeriod() });
    return true;
  }
});

try {
  chrome.alarms.create('timeCheck', { periodInMinutes: 5 });
  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'timeCheck') {
      loadSettings().then(function(settings) {
        if (settings.enabled && settings.autoMode) {
          broadcastFilter(settings);
        }
      });
    }
  });
} catch(e) {
  console.log('Alarms API not available:', e);
}
