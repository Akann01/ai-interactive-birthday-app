// ===== DOM ELEMENTS =====
const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const match = document.querySelector(".match");
const cakeArea = document.querySelector(".cake-area");
const cakeImg = document.querySelector(".cake");
const birthdaySong = document.getElementById("birthdaySong");

// ===== MINIMAL AESTHETIC BACKGROUND (SOFT, NOT WHITE/BLUE) =====
document.body.style.background = "#f8f7fb"; // premium minimal pastel

// ===== AUDIO SETTINGS =====
if (birthdaySong) {
  birthdaySong.volume = 0.6;
  birthdaySong.loop = false;
}

// ===== CONSTANTS =====
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const WEBCAM_WIDTH = isMobile ? 240 : 300;
const WEBCAM_HEIGHT = isMobile ? 180 : 225;
const BLOW_THRESHOLD = 8; // very sensitive for reliable blowing
const LIGHT_DISTANCE = 20;

canvas.width = WEBCAM_WIDTH;
canvas.height = WEBCAM_HEIGHT;

// ===== STATE VARIABLES =====
let handPosition = { x: 0.5, y: 0.5 };
let isHandDetected = false;
let isCakeLit = false;
let isCandlesBlownOut = false;

// ===== MEDIAPIPE HANDS SETUP =====
const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: isMobile ? 0 : 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
});

// ===== HAND TRACKING RESULTS =====
hands.onResults((results) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mirror webcam feed
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(results.image, -canvas.width, 0, canvas.width, canvas.height);
  ctx.restore();

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    isHandDetected = true;

    const indexTip = landmarks[8];
    handPosition.x = 1 - indexTip.x;
    handPosition.y = indexTip.y;

    updateMatchPosition();
    checkCandleLighting();
  } else {
    isHandDetected = false;
  }
});

// ===== MATCH MOVEMENT =====
function updateMatchPosition() {
  if (!isHandDetected) return;

  const cakeRect = cakeArea.getBoundingClientRect();
  const padding = 20;

  const matchX =
    padding + handPosition.x * (cakeRect.width - padding * 2 - 40);
  const matchY =
    padding + handPosition.y * (cakeRect.height - padding * 2 - 60);

  match.style.left = `${matchX}px`;
  match.style.top = `${matchY}px`;
}

// ===== LIGHT CANDLES =====
function checkCandleLighting() {
  if (isCakeLit || isCandlesBlownOut) return;

  const matchRect = match.getBoundingClientRect();
  const cakeRect = cakeImg.getBoundingClientRect();

  const matchTipX = matchRect.left + matchRect.width / 2;
  const matchTipY = matchRect.top;

  const candleX = cakeRect.left + cakeRect.width / 2;
  const candleY = cakeRect.top + 10;

  const distance = Math.hypot(matchTipX - candleX, matchTipY - candleY);

  if (distance < LIGHT_DISTANCE) {
    lightCake();
  }
}

function lightCake() {
  if (isCakeLit) return;

  isCakeLit = true;
  cakeImg.src = "assets/cake_lit.gif";
  match.style.display = "none";

  // Clean minimal look (no glow/neon)
  cakeArea.style.boxShadow = "none";
}

// ===== BLOW OUT CANDLES + MUSIC =====
function blowOutCandles() {
  if (!isCakeLit || isCandlesBlownOut) return;

  console.log("💨 Blow detected!");

  isCandlesBlownOut = true;
  cakeImg.src = "assets/cake_unlit.gif";

  createConfetti();

  if (birthdaySong) {
    birthdaySong.currentTime = 0;
    birthdaySong.play().catch(() => {});
  }
}

// ===== SMOOTH CONFETTI (TOP + BOTTOM, NO ASSEMBLING) =====
function createConfetti() {
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  const symbols = ["⭒", "˚", "⋆", "⊹", "₊", "˖", "✦", "✧", "·", "°", "✶"];
  const count = 90;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const confetti = document.createElement("span");
      confetti.className = "confetti";
      confetti.textContent =
        symbols[Math.floor(Math.random() * symbols.length)];

      // Random spawn zone (prevents stacking)
      const spawnFromTop = Math.random() > 0.5;

      if (spawnFromTop) {
        confetti.style.top = Math.random() * 15 + "vh";
        confetti.style.animation = "confettiFall 6s linear forwards";
      } else {
        confetti.style.top = 85 + Math.random() * 10 + "vh";
        confetti.style.animation = "confettiRise 6s linear forwards";
      }

      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.fontSize = 0.8 + Math.random() * 1.2 + "rem";

      const sway = (Math.random() - 0.5) * 120;
      confetti.style.setProperty("--sway", sway + "px");

      container.appendChild(confetti);

      setTimeout(() => confetti.remove(), 7000);
    }, i * 35);
  }

  setTimeout(() => container.remove(), 15000);
}

// ===== RELIABLE BLOW DETECTION (FIXED) =====
let audioContext = null;
let analyser = null;
let microphone = null;
let isBlowDetectionActive = false;

async function initBlowDetection() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 512;
    microphone.connect(analyser);

    isBlowDetectionActive = true;
    detectBlow();

    console.log("🎤 Microphone ready");
  } catch (err) {
    console.error("Microphone access denied:", err);
    alert("Please allow microphone access to blow out the candles.");
  }
}

function detectBlow() {
  if (!isBlowDetectionActive) return;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);

  const volume =
    dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

  if (volume > BLOW_THRESHOLD && isCakeLit && !isCandlesBlownOut) {
    blowOutCandles();
  }

  requestAnimationFrame(detectBlow);
}

// ===== CAMERA =====
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: WEBCAM_WIDTH,
        height: WEBCAM_HEIGHT,
        facingMode: "user",
      },
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play();
      startHandTracking();
    };
  } catch (err) {
    alert("Please allow camera access.");
  }
}

function startHandTracking() {
  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: WEBCAM_WIDTH,
    height: WEBCAM_HEIGHT,
  });

  camera.start();
}

// ===== START EVERYTHING (CLEAN & STABLE) =====
window.addEventListener("DOMContentLoaded", async () => {
  initCamera();
  await initBlowDetection();

  // Unlock audio after first user interaction (browser policy)
  document.body.addEventListener(
    "click",
    () => {
      if (birthdaySong) {
        birthdaySong
          .play()
          .then(() => {
            birthdaySong.pause();
            birthdaySong.currentTime = 0;
          })
          .catch(() => {});
      }
    },
    { once: true }
  );
});