🎂 AI Interactive Birthday App

An in-browser birthday experience where you light a cake with your hands and blow out the candles — powered by real-time AI hand tracking via your webcam.

✨ What It Does
This app turns your webcam into a birthday candle interaction:

Light the cake — bring your hand close to the match on screen to ignite the candles
Blow out the candles — use a blowing gesture with your hand to extinguish the flames
A birthday song plays as part of the celebration 🎵

All of this happens in real-time in the browser — no backend, no installation.

Open index.html directly in your browser (Chrome recommended) and allow webcam access.


🛠️ Tech Stack
Technology: Purpose HTML / CSS / JSCore app structure and stylingMediaPipe HandsReal-time hand landmark detection via webcamMediaPipe Camera UtilsWebcam stream processingCanvas APIWebcam frame rendering

📁 Project Structure
ai-interactive-birthday-app/
│
├── index.html        # Main HTML page — app layout and script imports
├── style.css         # Styling for the birthday UI
├── script.js         # Core logic: hand tracking, gesture detection, cake interaction
│
└── assets/
    ├── cake_bg.png   # Cake background image
    ├── cake_unlit.gif # Animated unlit cake
    ├── match.gif     # Animated match
    └── bayside-breeze.mp3  # Birthday background music

🚀 Getting Started
No installation or build step needed — it runs entirely in the browser.
1. Clone the repository
bashgit clone https://github.com/Akann01/ai-interactive-birthday-app.git
cd ai-interactive-birthday-app
2. Open in browser
Simply open index.html in Google Chrome (recommended for best webcam + MediaPipe support):
bash
# On macOS
open index.html

# On Windows
start index.html

# Or just drag index.html into your Chrome browser

⚠️ Important: Allow webcam access when prompted. The app won't work without it.

3. Interact!

👋 Move your hand toward the match to light the candles
🤚 Use a hand gesture to blow out the candles
🎵 Birthday music plays automatically


🌐 Browser Compatibility
BrowserSupportChrome✅ RecommendedEdge✅ WorksFirefox⚠️ Partial (webcam may behave differently)Safari❌ Not recommended (MediaPipe CDN compatibility issues)

🔒 Privacy
This app runs entirely on your device. No video, images, or data are ever sent to a server. The webcam feed is processed locally in real time using MediaPipe's client-side models.

🤝 Contributing
Contributions are welcome! Here are some ideas:

 Add name customization ("Happy Birthday, [Name]!")
 Add more gesture interactions (confetti on clap, etc.)
 Mobile support / touch fallback
 Multiple candle states / difficulty levels
 Shareable birthday card generator

Made with 🎂 and a little bit of AI magic.
