const canvas = document.getElementById('hanabiCanvas');
const ctx = canvas.getContext('2d');
const form = document.getElementById('hanabiForm');
const resultArea = document.getElementById('resultArea');
const resultTitle = document.getElementById('resultTitle');
const resultMood = document.getElementById('resultMood');
const resultMessage = document.getElementById('resultMessage');
const letterCard = document.getElementById('letterCard');
const shareCard = document.getElementById('shareCard');
const partnerLetter = document.getElementById('partnerLetter');
const shareUrl = document.getElementById('shareUrl');
const toast = document.getElementById('toast');

const COLOR_MAP = {
  sakura: { label: 'さくらピンク', hex: '#ff8fc7' },
  navy: { label: '夜空ネイビー', hex: '#3446ff' },
  gold: { label: '星の金', hex: '#ffd766' },
  white: { label: '月あかりホワイト', hex: '#fff7e8' },
  blue: { label: '海いろブルー', hex: '#67c9ff' },
  mint: { label: 'ミントグリーン', hex: '#8df5d1' },
  orange: { label: '夕やけオレンジ', hex: '#ff9f4a' },
  violet: { label: 'すみれパープル', hex: '#b78cff' }
};

const TYPE_MAP = {
  round: { label: 'まるい花火', phrase: 'まるく大きな花火' },
  willow: { label: 'しだれ花火', phrase: '光がしだれる花火' },
  sparkle: { label: 'きらめき花火', phrase: '小さな星みたいな花火' },
  heart: { label: 'ハート花火', phrase: 'ハートの花火' },
  droplet: { label: 'しずく花火', phrase: 'しずくみたいな花火' }
};

const MOOD_MAP = {
  festival: '夏祭りの夜空',
  seaside: '海辺の夜空',
  harbor: '港の夜空',
  rooftop: '屋上から見上げる夜空',
  starry: '星が深い夜空'
};

let width = 0;
let height = 0;
let rockets = [];
let particles = [];
let activeSettings = getDefaultSettings();
let lastLaunch = 0;
let launchCount = 0;
let animationStarted = false;
let rng = mulberry32(123456);

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getDefaultSettings() {
  return {
    yourName: 'なや',
    partnerName: 'Nay',
    callName: 'ネイ',
    mood: 'harbor',
    color1: 'sakura',
    color2: 'navy',
    fireworkType: 'droplet',
    message: '今年の夏も一緒',
    seed: String(Date.now()).slice(-6)
  };
}

function readForm() {
  return {
    yourName: valueOf('yourName') || 'あなた',
    partnerName: valueOf('partnerName') || '大切な相手',
    callName: valueOf('callName') || valueOf('partnerName') || 'ねえ',
    mood: valueOf('mood') || 'harbor',
    color1: valueOf('color1') || 'sakura',
    color2: valueOf('color2') || 'navy',
    fireworkType: valueOf('fireworkType') || 'round',
    message: valueOf('message') || '今年の夏も一緒',
    seed: activeSettings.seed || String(Date.now()).slice(-6)
  };
}

function valueOf(id) {
  return document.getElementById(id).value.trim();
}

function writeForm(settings) {
  for (const [key, value] of Object.entries(settings)) {
    const field = document.getElementById(key);
    if (field) field.value = value;
  }
}

function applySettings(settings, shouldScroll = true) {
  activeSettings = { ...getDefaultSettings(), ...settings };
  activeSettings.seed = activeSettings.seed || String(Date.now()).slice(-6);
  writeForm(activeSettings);
  updateResultText();
  resetShow();
  startAnimation();
  if (shouldScroll) resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateResultText() {
  const yourName = activeSettings.yourName || 'あなた';
  const partnerName = activeSettings.partnerName || '大切な相手';
  const mood = MOOD_MAP[activeSettings.mood] || MOOD_MAP.harbor;
  const type = TYPE_MAP[activeSettings.fireworkType] || TYPE_MAP.round;

  resultTitle.textContent = `${yourName} & ${partnerName} Fireworks Night`;
  resultMood.textContent = `${mood}に、${type.label}が上がっています。`;
  resultMessage.textContent = activeSettings.message || '今年の夏も一緒';
}

function resetShow() {
  rockets = [];
  particles = [];
  launchCount = 0;
  lastLaunch = 0;
  rng = mulberry32(hashString(JSON.stringify(activeSettings)));
}

function startAnimation() {
  if (!animationStarted) {
    animationStarted = true;
    requestAnimationFrame(tick);
  }
}

function tick(time) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(3, 8, 24, 0.22)';
  ctx.fillRect(0, 0, width, height);

  if (time - lastLaunch > 820 && launchCount < 9) {
    launchRocket();
    launchCount += 1;
    lastLaunch = time;
  }

  updateRockets();
  updateParticles();
  requestAnimationFrame(tick);
}

function launchRocket() {
  const x = width * (0.18 + rng() * 0.64);
  const targetY = height * (0.18 + rng() * 0.34);
  const startY = height + 10;
  const color = chooseColor();
  rockets.push({ x, y: startY, vx: (rng() - 0.5) * 1.2, vy: -7 - rng() * 2.4, targetY, color });
}

function updateRockets() {
  ctx.globalCompositeOperation = 'lighter';
  rockets = rockets.filter((rocket) => {
    rocket.x += rocket.vx;
    rocket.y += rocket.vy;
    rocket.vy += 0.035;

    drawGlow(rocket.x, rocket.y, 3, rocket.color, 0.9);
    drawGlow(rocket.x, rocket.y + 8, 2, '#ffffff', 0.38);

    if (rocket.y <= rocket.targetY || rocket.vy >= -0.6) {
      explode(rocket.x, rocket.y, rocket.color);
      return false;
    }
    return true;
  });
}

function updateParticles() {
  ctx.globalCompositeOperation = 'lighter';
  particles = particles.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.vy += p.gravity;
    p.life -= p.decay;

    if (p.life <= 0) return false;
    drawGlow(p.x, p.y, p.size, p.color, p.life);
    return true;
  });
}

function explode(x, y, baseColor) {
  const type = activeSettings.fireworkType;
  const colors = [COLOR_MAP[activeSettings.color1]?.hex || '#ff8fc7', COLOR_MAP[activeSettings.color2]?.hex || '#3446ff', '#fff7e8'];

  if (type === 'heart') return explodeHeart(x, y, colors);
  if (type === 'willow') return explodeWillow(x, y, colors);
  if (type === 'sparkle') return explodeSparkle(x, y, colors);
  if (type === 'droplet') return explodeDroplet(x, y, colors);
  return explodeRound(x, y, colors, 90);
}

function explodeRound(x, y, colors, count = 90) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 1.2 + rng() * 4.2;
    addParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, pick(colors), 1.6 + rng() * 2.2, 0.985, 0.026, 0.010 + rng() * 0.008);
  }
}

function explodeWillow(x, y, colors) {
  for (let i = 0; i < 110; i++) {
    const angle = Math.PI + rng() * Math.PI;
    const speed = 1.2 + rng() * 3.4;
    addParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed * 0.58, pick(colors), 1.4 + rng() * 2.0, 0.992, 0.052, 0.007 + rng() * 0.006);
  }
}

function explodeSparkle(x, y, colors) {
  explodeRound(x, y, colors, 44);
  for (let i = 0; i < 70; i++) {
    const angle = rng() * Math.PI * 2;
    const speed = 2 + rng() * 6;
    addParticle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#fff7e8', 0.8 + rng() * 1.4, 0.95, 0.018, 0.03 + rng() * 0.02);
  }
}

function explodeDroplet(x, y, colors) {
  for (let i = 0; i < 95; i++) {
    const angle = rng() * Math.PI * 2;
    const speed = 0.8 + rng() * 3.4;
    const downward = 0.5 + rng() * 1.2;
    addParticle(x, y, Math.cos(angle) * speed * 0.72, Math.sin(angle) * speed * 0.42 + downward, pick(colors), 1.3 + rng() * 2.2, 0.986, 0.044, 0.009 + rng() * 0.006);
  }
}

function explodeHeart(x, y, colors) {
  const count = 120;
  for (let i = 0; i < count; i++) {
    const t = (Math.PI * 2 * i) / count;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const scale = 0.18 + rng() * 0.06;
    addParticle(x, y, hx * scale, hy * scale, pick(colors), 1.5 + rng() * 2.1, 0.986, 0.026, 0.009 + rng() * 0.006);
  }
}

function addParticle(x, y, vx, vy, color, size, drag, gravity, decay) {
  particles.push({ x, y, vx, vy, color, size, drag, gravity, decay, life: 1 });
}

function drawGlow(x, y, radius, color, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 5);
  gradient.addColorStop(0, hexToRgba(color, alpha));
  gradient.addColorStop(0.28, hexToRgba(color, alpha * 0.48));
  gradient.addColorStop(1, hexToRgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 5, 0, Math.PI * 2);
  ctx.fill();
}

function chooseColor() {
  return pick([COLOR_MAP[activeSettings.color1]?.hex || '#ff8fc7', COLOR_MAP[activeSettings.color2]?.hex || '#3446ff', '#fff7e8']);
}

function pick(list) {
  return list[Math.floor(rng() * list.length)];
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const value = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(alpha, 1))})`;
}

function createPartnerLetter() {
  const callName = activeSettings.callName || activeSettings.partnerName || 'ねえ';
  const yourName = activeSettings.yourName || 'あなた';
  const partnerName = activeSettings.partnerName || '大切な相手';
  const mood = MOOD_MAP[activeSettings.mood] || MOOD_MAP.harbor;
  const color1 = COLOR_MAP[activeSettings.color1]?.label || 'やさしい色';
  const color2 = COLOR_MAP[activeSettings.color2]?.label || 'きれいな色';
  const type = TYPE_MAP[activeSettings.fireworkType]?.phrase || '花火';
  const message = activeSettings.message || '今年の夏も一緒';

  return `${callName}、今から一緒に花火を見るよ。\n\n今日は、${yourName}と${partnerName}のための花火。\n${mood}に、${color1}と${color2}の光が広がって、\n最後に${type}がやさしく残る。\n\n画面に出た言葉は、\n「${message}」\n\n${callName}も、隣で見て。`;
}

function createShareUrl() {
  const url = new URL(window.location.href);
  url.search = '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(activeSettings)) {
    if (value) params.set(key, value);
  }
  url.search = params.toString();
  return url.toString();
}

function loadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return null;
  const settings = getDefaultSettings();
  for (const key of Object.keys(settings)) {
    if (params.has(key)) settings[key] = params.get(key);
  }
  return settings;
}

function copyText(text, message) {
  navigator.clipboard.writeText(text).then(
    () => showToast(message),
    () => showToast('コピーできませんでした。手動で選択してね。')
  );
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

document.querySelectorAll('[data-scroll-to]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const settings = readForm();
  settings.seed = String(Date.now()).slice(-8);
  applySettings(settings);
});

document.getElementById('surpriseButton').addEventListener('click', () => {
  const presets = [
    { color1: 'sakura', color2: 'white', fireworkType: 'round', mood: 'festival' },
    { color1: 'navy', color2: 'gold', fireworkType: 'sparkle', mood: 'harbor' },
    { color1: 'blue', color2: 'mint', fireworkType: 'droplet', mood: 'seaside' },
    { color1: 'orange', color2: 'gold', fireworkType: 'willow', mood: 'rooftop' },
    { color1: 'violet', color2: 'white', fireworkType: 'heart', mood: 'starry' }
  ];
  const current = readForm();
  applySettings({ ...current, ...presets[Math.floor(Math.random() * presets.length)], seed: String(Date.now()).slice(-8) }, false);
  document.getElementById('makeCard').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('replayButton').addEventListener('click', () => {
  activeSettings.seed = String(Date.now()).slice(-8);
  resetShow();
  showToast('もう一度、夜空に灯します。');
});

document.getElementById('letterButton').addEventListener('click', () => {
  partnerLetter.value = createPartnerLetter();
  letterCard.hidden = false;
  letterCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.getElementById('copyLetterButton').addEventListener('click', () => copyText(partnerLetter.value, '一緒に見るための文をコピーしました。'));

document.getElementById('shareButton').addEventListener('click', () => {
  shareUrl.value = createShareUrl();
  shareCard.hidden = false;
  shareCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.getElementById('copyShareButton').addEventListener('click', () => copyText(shareUrl.value, '花火のURLをコピーしました。'));

document.getElementById('viewButton').addEventListener('click', () => {
  document.body.classList.toggle('screenshot-mode');
  showToast(document.body.classList.contains('screenshot-mode') ? 'スクショ用にしました。戻すときは再読み込みしてね。' : '通常表示に戻しました。');
});

const fromUrl = loadFromUrl();
if (fromUrl) {
  applySettings(fromUrl, false);
} else {
  writeForm(activeSettings);
  updateResultText();
  startAnimation();
}
