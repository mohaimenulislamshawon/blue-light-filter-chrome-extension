# 🛡️ EyeShield — Smart Blue Light Filter for Chrome

> Automatically adjusts screen warmth, brightness, contrast & saturation based on time of day to reduce eye strain and improve visual comfort.

EyeShield is a lightweight, modern **Chrome extension** that protects your eyes by applying a smart blue light filter across all websites. It intelligently adapts to daytime, evening, and night viewing conditions — or lets you fully customize the experience manually.

🔗 **GitHub Repository:**  
https://github.com/mohaimenulislamshawon/blue-light-filter-chrome-extension

---

## ✨ Features

- 🌅 **Automatic Time-Based Adjustment**
  - Day mode
  - Evening mode
  - Night mode
- 🎛️ **Manual Custom Controls**
  - Warmth
  - Brightness
  - Contrast
  - Saturation
- ⚡ **Instant Live Preview**
- 🌍 Works on **all websites**
- 🧠 Smart profile switching every 5 minutes
- 🔄 One-click reset to default settings
- 💾 Persistent settings storage
- 🧩 Lightweight & fast (Manifest V3 compliant)

---

## 🚀 Installation (Developer Mode)

Since this extension is not yet published on the Chrome Web Store, you can load it manually:

### 1️⃣ Clone the repository

```bash
git clone https://github.com/mohaimenulislamshawon/blue-light-filter-chrome-extension.git
```

Or download the ZIP and extract it.

### 2️⃣ Open Chrome Extensions Page

Go to:

```
chrome://extensions/
```

### 3️⃣ Enable Developer Mode

Turn on **Developer Mode** (top right).

### 4️⃣ Load the Extension

Click **Load unpacked** and select the project folder.

🎉 The extension will now appear in your Chrome toolbar.

---

## ⚙️ How It Works

EyeShield uses:

- `chrome.storage.local` to store user settings
- `chrome.alarms` to monitor time changes
- `chrome.scripting` for instant CSS injection
- `content_scripts` to apply filters to all tabs
- Manifest Version 3 service worker architecture

The filter is applied using CSS:

```css
html {
  filter: sepia(x) brightness(x) contrast(x) saturate(x);
}
```

This ensures:
- Smooth transitions
- Low performance impact
- No layout breaking
- Works across all frames

---

## 🌙 Default Time Profiles

| Time Period | Warmth | Brightness | Contrast | Saturation |
|------------|--------|------------|----------|------------|
| Day (6AM–5PM) | 18% | 100% | 95% | 92% |
| Evening (5PM–9PM) | 35% | 92% | 92% | 85% |
| Night (9PM–6AM) | 55% | 85% | 90% | 75% |

Auto mode switches between these automatically.

---

## 🎛️ Manual Mode

When Auto Mode is turned off, you can fully customize:

- Warmth (0–70%)
- Brightness (60–100%)
- Contrast (80–100%)
- Saturation (60–100%)

Changes apply instantly.

---

## 📁 Project Structure

```
blue-light-filter-chrome-extension/
│
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
└── icons/
```

### File Responsibilities

- **background.js** → State management & broadcast to tabs  
- **content.js** → Applies visual filter to pages  
- **popup.html / popup.js** → User interface  
- **manifest.json** → Chrome extension configuration  

---

## 🔐 Permissions Used

```json
"permissions": ["storage", "alarms", "scripting"],
"host_permissions": ["<all_urls>"]
```

These are required for:

- Saving settings
- Automatic time checking
- Injecting CSS into tabs

❗ No tracking.  
❗ No external APIs.  
❗ No data collection.

---

## 🎯 Why EyeShield?

Long screen exposure can cause:

- Eye strain  
- Dry eyes  
- Headaches  
- Sleep disruption from blue light  

EyeShield helps reduce harsh blue light and improve comfort during long browsing sessions — especially at night.

---

## 🛠 Built With

- HTML5  
- CSS3  
- Vanilla JavaScript  
- Chrome Extension Manifest V3 API  

No frameworks. No dependencies.

---

## 📈 Future Improvements (Planned)

- 🌅 Real sunrise/sunset detection  
- 🌍 Per-site whitelist / blacklist  
- 🔄 Chrome sync storage  
- 🎮 Video-only reduction mode  
- 🌈 Advanced color profiles  
- 📊 Usage statistics  

---

## 🤝 Contributing

Pull requests are welcome!

If you’d like to improve EyeShield:

1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Open a Pull Request  

---

## 📜 License

This project is open-source.  
You may use, modify, and distribute it freely.

(Add a license like MIT if desired.)

---

## 👨‍💻 Author

**Mohaimenul Islam Shawon**  
GitHub: https://github.com/mohaimenulislamshawon

---

## ⭐ Support

If you like this project:

- ⭐ Star the repository  
- 🧠 Share feedback  
- 🚀 Suggest new features  

---

### Protect your eyes. Browse comfortably. 🛡️🌙
