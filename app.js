const canvas = document.getElementById('hanabiCanvas');
const ctx = canvas.getContext('2d');
const form = document.getElementById('hanabiForm');
const resultArea = document.getElementById('resultArea');
const hanabiStage = document.getElementById('hanabiStage');
const skyOverlay = document.getElementById('skyOverlay');
const locationMid = document.getElementById('locationMid');
const locationFront = document.getElementById('locationFront');
const resultTitle = document.getElementById('resultTitle');
const resultMood = document.getElementById('resultMood');
const resultMessage = document.getElementById('resultMessage');
const letterCard = document.getElementById('letterCard');
const shareCard = document.getElementById('shareCard');
const partnerLetter = document.getElementById('partnerLetter');
const shareUrl = document.getElementById('shareUrl');
const toast = document.getElementById('toast');

const COLOR_MAP = { sakura:{label:'さくらピンク',hex:'#ff92c8'}, navy:{label:'夜空ネイビー',hex:'#3552ff'}, gold:{label:'星の金',hex:'#ffd666'}, white:{label:'月あかりホワイト',hex:'#fffaf0'}, blue:{label:'海いろブルー',hex:'#67ccff'}, mint:{label:'ミントグリーン',hex:'#90f3d8'}, orange:{label:'夕やけオレンジ',hex:'#ff9f52'}, violet:{label:'すみれパープル',hex:'#b991ff'} };
const TYPE_MAP = { round:{label:'まるい花火',phrase:'まるい花火'}, willow:{label:'しだれ花火',phrase:'しだれ花火'}, sparkle:{label:'きらめき花火',phrase:'きらめき花火'}, heart:{label:'ハート花火',phrase:'ハートみたいな花火'}, droplet:{label:'ステラ花火',phrase:'お星さまの花火'} };
const MOOD_MAP = {
  festival:{label:'夏祭り（川沿い）',text:'川沿いの夜。屋台の灯りと花火が、揺れる水面にきらめく。',sky:'linear-gradient(180deg,#1a1d3b 0%,#15203d 45%,#0d1632 100%)',lights:'radial-gradient(ellipse at 18% 82%, rgba(246,183,90,.35) 0 12%, transparent 40%),radial-gradient(ellipse at 60% 86%, rgba(247,133,96,.28) 0 10%, transparent 42%),linear-gradient(0deg, rgba(28,49,84,.45) 0 13%, transparent 26%)',mid:'polygon(0 72%, 14% 66%, 25% 68%, 39% 62%, 52% 66%, 67% 58%, 81% 63%, 100% 56%, 100% 100%, 0 100%)',front:'polygon(0 84%, 15% 80%, 33% 83%, 42% 78%, 66% 81%, 82% 76%, 100% 80%, 100% 100%, 0 100%)'},
  seaside:{label:'海辺',text:'海辺の夜。穏やかな波に、きらきらと花火の光が映る。',sky:'linear-gradient(180deg,#101d3b 0%,#0d2d4f 52%,#11315a 100%)',lights:'linear-gradient(0deg, rgba(111,190,237,.42) 0 16%, transparent 32%),radial-gradient(circle at 70% 90%, rgba(173,222,255,.24) 0 16%, transparent 36%)',mid:'polygon(0 74%, 26% 72%, 50% 74%, 77% 71%, 100% 73%, 100% 100%, 0 100%)',front:'polygon(0 86%, 20% 84%, 40% 87%, 62% 84%, 100% 88%, 100% 100%, 0 100%)'},
  harbor:{label:'港',text:'港の夜。宝石みたいな街の灯りに重なるように、大輪の花火が開く。',sky:'linear-gradient(180deg,#121938 0%,#182447 48%,#19253f 100%)',lights:'radial-gradient(circle at 17% 86%, rgba(255,203,108,.24) 0 7%, transparent 24%),radial-gradient(circle at 72% 85%, rgba(123,203,255,.2) 0 8%, transparent 25%),linear-gradient(0deg, rgba(39,64,100,.32) 0 14%, transparent 32%)',mid:'polygon(0 70%, 7% 70%, 7% 62%, 11% 62%, 11% 68%, 17% 68%, 17% 58%, 22% 58%, 22% 69%, 31% 69%, 31% 60%, 36% 60%, 36% 67%, 44% 67%, 44% 57%, 52% 57%, 52% 68%, 60% 68%, 60% 61%, 67% 61%, 67% 69%, 74% 69%, 74% 56%, 80% 56%, 80% 68%, 89% 68%, 89% 60%, 95% 60%, 95% 71%, 100% 71%, 100% 100%, 0 100%)',front:'polygon(0 85%, 100% 85%, 100% 100%, 0 100%)'},
  rooftop:{label:'屋上',text:'屋上の夜。手すり越しの花火が、ビルのシルエットをやさしく照らす。',sky:'linear-gradient(180deg,#141d40 0%,#141d35 50%,#111827 100%)',lights:'radial-gradient(circle at 25% 74%, rgba(255,220,130,.2) 0 6%, transparent 22%),radial-gradient(circle at 76% 71%, rgba(154,204,255,.18) 0 6%, transparent 22%)',mid:'polygon(0 72%, 12% 72%, 12% 64%, 18% 64%, 18% 72%, 28% 72%, 28% 61%, 34% 61%, 34% 72%, 48% 72%, 48% 66%, 55% 66%, 55% 72%, 67% 72%, 67% 60%, 75% 60%, 75% 72%, 88% 72%, 88% 63%, 95% 63%, 95% 72%, 100% 72%, 100% 100%, 0 100%)',front:'polygon(0 82%, 100% 82%, 100% 84%, 0 84%, 0 100%, 100% 100%, 100% 88%, 0 88%)'},
  starry:{label:'星空の丘',text:'星空の夜。満天の星に彩りを添えるように、花束みたいな花火が咲く。',sky:'linear-gradient(180deg,#0c1431 0%,#111d3c 48%,#121b2e 100%)',lights:'radial-gradient(circle at 24% 80%, rgba(198,221,255,.08) 0 10%, transparent 34%)',mid:'polygon(0 74%, 20% 67%, 38% 72%, 56% 64%, 72% 70%, 85% 62%, 100% 69%, 100% 100%, 0 100%)',front:'polygon(0 86%, 18% 82%, 42% 87%, 62% 81%, 80% 85%, 100% 80%, 100% 100%, 0 100%)'}
};
const MESSAGE_CANDIDATES=['ずっと一緒にいようね','また来年も一緒に見ようね','この夏を忘れないよ','きみと見られてうれしい','この夜を覚えていてね'];
const RESTORE_KEYS=['yourName','yourPronoun','partnerName','color1','color2','fireworkType','mood','message','seed'];

let width=0,height=0,rockets=[],particles=[],lastLaunch=0,launchCount=0,animationStarted=false;
let activeSettings=getDefaultSettings();
let rng=mulberry32(123456);

function getDefaultSettings(){return{yourName:'',yourPronoun:'',partnerName:'',color1:'sakura',color2:'gold',fireworkType:'round',mood:'festival',message:'',seed:String(Date.now()).slice(-8)}}
function valueOf(id){return document.getElementById(id).value.trim()}
function writeForm(settings){Object.entries(settings).forEach(([k,v])=>{const f=document.getElementById(k);if(f&&v!==undefined)f.value=v})}
function createNewSeed(){return String(Date.now()).slice(-8)}

function readForm(){return{yourName:valueOf('yourName')||'あなた',yourPronoun:valueOf('yourPronoun')||'私',partnerName:valueOf('partnerName')||'きみ',color1:valueOf('color1')||'sakura',color2:valueOf('color2')||'gold',fireworkType:valueOf('fireworkType')||'round',mood:valueOf('mood')||'festival',message:valueOf('message')||'この夜を覚えていてね',seed:activeSettings.seed||createNewSeed()}}

function parseSettingsFromUrl(){
  const params=new URLSearchParams(window.location.search);
  if(!params.toString()) return null;
  const restored={...getDefaultSettings()};
  let hasAny=false;
  for(const key of RESTORE_KEYS){if(params.has(key)){restored[key]=params.get(key);hasAny=true;}}
  return hasAny?restored:null;
}

function applySettings(settings,shouldScroll=true){
  const merged={...getDefaultSettings(),...settings};
  if(!merged.seed) merged.seed=createNewSeed();
  activeSettings=merged;
  writeForm(activeSettings);
  updateResultText();
  drawMoodOverlay();
  resultArea.hidden=false;
  resetShow();
  startAnimation();
  resizeCanvas();
  if(shouldScroll) resultArea.scrollIntoView({behavior:'smooth',block:'start'});
}

function resizeCanvas(){if(!hanabiStage||resultArea.hidden) return;const rect=hanabiStage.getBoundingClientRect();if(!rect.width||!rect.height) return;const dpr=Math.min(window.devicePixelRatio||1,2);width=rect.width;height=rect.height;canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',resizeCanvas);

function updateResultText(){const mood=MOOD_MAP[activeSettings.mood]||MOOD_MAP.festival;const type=TYPE_MAP[activeSettings.fireworkType]||TYPE_MAP.round;resultTitle.textContent=`${activeSettings.yourName}と${activeSettings.partnerName}の花火`;resultMood.textContent=`${mood.text} ${type.label}が広がっています。`;resultMessage.textContent=activeSettings.message}
function drawMoodOverlay(){
  const mood = MOOD_MAP[activeSettings.mood] || MOOD_MAP.festival;

  if (hanabiStage) {
    hanabiStage.dataset.scene = activeSettings.mood;
  }
  
  skyOverlay.style.setProperty('--sky-gradient', mood.sky || MOOD_MAP.festival.sky);
  skyOverlay.style.setProperty('--location-lights', mood.lights || MOOD_MAP.festival.lights);

  if (locationMid) {
    locationMid.style.setProperty('--mid-shape', mood.mid || MOOD_MAP.festival.mid);
  }

  if (locationFront) {
    locationFront.style.setProperty('--front-shape', mood.front || MOOD_MAP.festival.front);
  }

  const layerOverrides = {
    festival: {
      midBg: 'linear-gradient(0deg, rgba(255,197,110,0.18) 0 10%, rgba(255,197,110,0.12) 10% 18%, rgba(31,67,101,0.18) 18% 26%, transparent 40%), repeating-linear-gradient(90deg, rgba(255,217,148,0.18) 0 10px, rgba(239,145,84,0.10) 10px 22px, transparent 22px 44px), linear-gradient(180deg, rgba(33,75,117,0.14) 0 60%, transparent 84%)',
      frontBg: 'linear-gradient(0deg, rgba(16,22,38,0.56) 0 16%, rgba(24,30,50,0.42) 16% 24%, transparent 34%), repeating-linear-gradient(90deg, rgba(255,210,140,0.20) 0 12px, rgba(255,162,90,0.12) 12px 24px, transparent 24px 48px)'
    },
    seaside: {
      midBg: 'linear-gradient(180deg, rgba(141,212,255,0.24) 0 8%, rgba(116,191,243,0.14) 8% 18%, rgba(45,118,176,0.18) 18% 28%, transparent 44%), repeating-linear-gradient(0deg, rgba(188,236,255,0.16) 0 2px, transparent 2px 9px), linear-gradient(0deg, rgba(35,93,152,0.12) 0 22%, transparent 36%)',
      frontBg: 'linear-gradient(0deg, rgba(10,51,91,0.50) 0 18%, rgba(14,71,122,0.34) 18% 30%, transparent 44%), repeating-linear-gradient(0deg, rgba(168,226,255,0.12) 0 2px, transparent 2px 10px)'
    },
    harbor: {
      midBg: 'linear-gradient(0deg, rgba(253,223,139,0.20) 0 8%, rgba(89,132,174,0.16) 8% 18%, transparent 34%), repeating-linear-gradient(90deg, rgba(255,224,153,0.18) 0 8px, rgba(255,180,112,0.08) 8px 18px, transparent 18px 36px), linear-gradient(180deg, rgba(32,55,86,0.26) 0 58%, transparent 86%)',
      frontBg: 'linear-gradient(0deg, rgba(8,18,36,0.62) 0 20%, rgba(13,30,56,0.46) 20% 34%, transparent 46%), repeating-linear-gradient(90deg, rgba(255,217,133,0.16) 0 6px, transparent 6px 16px), linear-gradient(180deg, rgba(23,36,62,0.34) 0 44%, transparent 76%)'
    },
    rooftop: {
      midBg: 'linear-gradient(0deg, rgba(148,166,196,0.14) 0 14%, rgba(74,95,126,0.26) 14% 28%, transparent 42%), repeating-linear-gradient(90deg, rgba(151,170,200,0.18) 0 14px, rgba(82,100,130,0.12) 14px 30px, transparent 30px 56px), linear-gradient(180deg, rgba(21,29,47,0.24) 0 58%, transparent 86%)',
      frontBg: 'linear-gradient(0deg, rgba(20,27,44,0.68) 0 14%, rgba(39,50,77,0.58) 14% 20%, rgba(16,24,39,0.48) 20% 30%, transparent 40%), repeating-linear-gradient(90deg, rgba(98,116,148,0.22) 0 18px, rgba(47,61,88,0.18) 18px 32px, transparent 32px 62px)'
    },
    starry: {
      midBg: 'linear-gradient(0deg, rgba(173,188,230,0.10) 0 8%, rgba(92,109,157,0.22) 8% 18%, rgba(41,54,88,0.30) 18% 30%, transparent 44%), linear-gradient(180deg, rgba(14,23,44,0.10) 0 58%, transparent 88%)',
      frontBg: 'linear-gradient(0deg, rgba(8,13,28,0.72) 0 16%, rgba(17,28,52,0.54) 16% 26%, transparent 40%), radial-gradient(circle at 22% 6%, rgba(220,232,255,0.10) 0 2px, transparent 3px), radial-gradient(circle at 68% 10%, rgba(210,224,255,0.08) 0 1.5px, transparent 3px)'
    }
  };

  const layers = layerOverrides[activeSettings.mood] || layerOverrides.festival;

  if (locationMid) {
    locationMid.style.background = layers.midBg;
  }

  if (locationFront) {
    locationFront.style.background = layers.frontBg;
  }
}
function resetShow(){rockets=[];particles=[];launchCount=0;lastLaunch=0;rng=mulberry32(hashString(JSON.stringify(activeSettings)))}
function startAnimation(){if(!animationStarted){animationStarted=true;requestAnimationFrame(tick)}}
function tick(time){if(!width||!height||resultArea.hidden){requestAnimationFrame(tick);return;}ctx.globalCompositeOperation='destination-out';ctx.fillStyle='rgba(0,0,0,0.18)';ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation='lighter';if(time-lastLaunch>760&&launchCount<10){launchRocket();launchCount++;lastLaunch=time}updateRockets();updateParticles();requestAnimationFrame(tick)}
function launchRocket(){
  const x=width*(0.2+rng()*0.6);
  const targetY=height*(0.13+rng()*0.22);
  rockets.push({
    x,
    y:height+10,
    vx:(rng()-0.5)*0.8,
    vy:-7.8-rng()*1.6,
    targetY,
    color:chooseColor(),
    fuse:5+rng()*10
  });
}
function updateRockets(){
  ctx.globalCompositeOperation='lighter';
  rockets=rockets.filter((r)=>{
    r.x+=r.vx;
    r.y+=r.vy;
    r.vy+=0.032;

    if(r.y<=r.targetY&&!r.armed){
      r.armed=true;
      r.fuse=11+rng()*8;
      r.vy=Math.max(r.vy*0.18,-0.65);
    }

    if(r.armed){
      r.vx*=0.96;
      r.vy=r.vy*0.82+0.018;
      r.fuse-=1;
      drawGlow(r.x,r.y,2.35,r.color,0.94);

      if(r.fuse<=0||r.vy>=-0.02){
        explode(r.x+(rng()-0.5)*4.2,r.y+(rng()-0.5)*2.8);
        return false;
      }

      return true;
    }

    drawGlow(r.x,r.y,2.3,r.color,0.9);
    return true;
  });
}
function updateParticles(){particles=particles.filter((p)=>{p.x+=p.vx;p.y+=p.vy;p.vx*=p.drag;p.vy=p.vy*p.drag+p.gravity;p.life-=p.decay;if(p.life<=0)return false;drawGlow(p.x,p.y,p.size,p.color,p.life);return true})}
function explode(x,y){const colors=[COLOR_MAP[activeSettings.color1].hex,COLOR_MAP[activeSettings.color2].hex,'#fff7e8'];const type=activeSettings.fireworkType;if(type==='heart')return explodeHeart(x,y,colors);if(type==='willow')return explodeWillow(x,y,colors);if(type==='sparkle')return explodeSparkle(x,y,colors);if(type==='droplet')return explodeDroplet(x,y,colors);explodeRound(x,y,colors,90)}
function explodeRound(x,y,colors,count){
  for(let i=0;i<count;i++){
    const a=(Math.PI*2*i)/count;
    const s=(1+rng()*3.1)*0.78;
    addParticle(x,y,Math.cos(a)*s,Math.sin(a)*s,pick(colors),0.88+rng()*1.12,0.988,0.021,0.007+rng()*0.0045);
  }
}
function explodeWillow(x,y,colors){
  const count=136;
  const willowScale=1.1;
  for(let i=0;i<count;i++){
    const spread=(rng()-0.5);
    const branchBias=(rng()-0.5)*0.45;
    const vx=(spread*(0.58+rng()*0.92)+branchBias*0.32)*willowScale;
    const vy=(-(0.72+rng()*1.18)+Math.abs(spread)*(0.28+rng()*0.26))*willowScale;
    addParticle(
      x+(rng()-0.5)*1.8,
      y-(rng()*0.9),
      vx,
      vy,
      pick(colors),
      (0.52+rng()*0.52)*1.09,
      0.986+rng()*0.008,
      0.026+rng()*0.006,
      0.005+rng()*0.003
    );
  }
}
function explodeSparkle(x,y,colors){
  const sparklePalette=[
    '#fffdf5','#fff7e8','#ffe9b8','#ffe082','#fff1d1','#f6fbff',
    ...colors
  ];

  for(let i=0;i<170;i++){
    const a=rng()*Math.PI*2;
    const s=(0.5+rng()*3.4)*0.72;
    const jitter=0.84+rng()*0.36;
    addParticle(
      x+(rng()-0.5)*1.4,
      y+(rng()-0.5)*1.4,
      Math.cos(a)*s*jitter,
      Math.sin(a)*s*jitter,
      pick(sparklePalette),
      0.34+rng()*0.48,
      0.972+rng()*0.02,
      0.012+rng()*0.01,
      0.010+rng()*0.018
    );
  }

  for(let i=0;i<56;i++){
    const a=rng()*Math.PI*2;
    const s=(0.5+rng()*2.4)*0.72;
    addParticle(
      x+(rng()-0.5)*2.4,
      y+(rng()-0.5)*2.4,
      Math.cos(a)*s,
      Math.sin(a)*s,
      pick(['#ffffff','#fff7e8','#ffe9b8','#f4f9ff']),
      0.24+rng()*0.32,
      0.958+rng()*0.018,
      0.006+rng()*0.006,
      0.022+rng()*0.028
    );
  }
}
function explodeDroplet(x,y,colors){
  const outerRadius=3.02;
  const innerRadius=1.2;
  const starScale=1.22;
  const outlineCount=132;
  const step=Math.PI/5;
  const angleOffset=-Math.PI/2;

  for(let i=0;i<outlineCount;i++){
    const t=(i/outlineCount)*Math.PI*2;
    const wrapped=((t-angleOffset)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
    const sector=Math.floor(wrapped/step);
    const local=(wrapped-sector*step)/step;
    const r1=sector%2===0?outerRadius:innerRadius;
    const r2=(sector+1)%2===0?outerRadius:innerRadius;
    const radius=(r1+(r2-r1)*local)*(0.97+rng()*0.08);
    const px=Math.cos(t)*radius*starScale;
    const py=Math.sin(t)*radius*starScale;
    addParticle(
      x+px*0.87+(rng()-0.5)*0.11,
      y+py*0.87+(rng()-0.5)*0.11,
      px*(0.165+rng()*0.13)+(rng()-0.5)*0.055,
      py*(0.165+rng()*0.13)+(rng()-0.5)*0.055,
      pick(colors),
      0.62+rng()*0.4,
      0.988+rng()*0.004,
      0.015+rng()*0.0028,
      0.006+rng()*0.0022
    );
  }

  const innerCount=36;
  for(let i=0;i<innerCount;i++){
    const a=angleOffset+rng()*Math.PI*2;
    const wobble=Math.cos(a*5);
    const edgeMix=0.34+rng()*0.34;
    const maxR=(innerRadius+(outerRadius-innerRadius)*Math.max(0,wobble))*0.8;
    const r=Math.sqrt(rng())*maxR*edgeMix;
    const ix=Math.cos(a)*r*starScale;
    const iy=Math.sin(a)*r*starScale;
    addParticle(
      x+ix*0.46+(rng()-0.5)*0.14,
      y+iy*0.46+(rng()-0.5)*0.14,
      ix*(0.1+rng()*0.09),
      iy*(0.1+rng()*0.09),
      pick(colors),
      0.37+rng()*0.22,
      0.982+rng()*0.008,
      0.0125+rng()*0.0026,
      0.007+rng()*0.0024
    );
  }
}
function explodeHeart(x,y,colors){
  const c=110;
  for(let i=0;i<c;i++){
    const t=(Math.PI*2*i)/c;
    const hx=16*Math.pow(Math.sin(t),3);
    const hy=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));
    addParticle(x,y,hx*(0.112+rng()*0.036),hy*(0.112+rng()*0.036),pick(colors),0.88+rng()*1.04,0.988,0.02,0.007+rng()*0.004);
  }
}
function addParticle(x,y,vx,vy,color,size,drag,gravity,decay){particles.push({x,y,vx,vy,color,size,drag,decay,gravity,life:1})}
function drawGlow(x,y,radius,color,alpha){
  const glow=radius*3.45;
  const g=ctx.createRadialGradient(x,y,0,x,y,glow);
  g.addColorStop(0,hexToRgba(color,alpha));
  g.addColorStop(0.3,hexToRgba(color,alpha*0.45));
  g.addColorStop(1,hexToRgba(color,0));
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.arc(x,y,glow,0,Math.PI*2);
  ctx.fill();
}
function chooseColor(){return pick([COLOR_MAP[activeSettings.color1].hex,COLOR_MAP[activeSettings.color2].hex,'#fff7e8'])}
function pick(list){return list[Math.floor(rng()*list.length)]}
function hexToRgba(hex,a){const v=parseInt(hex.replace('#',''),16);return`rgba(${(v>>16)&255}, ${(v>>8)&255}, ${v&255}, ${Math.max(0,Math.min(a,1))})`}
function createTwinkleStars(){const layer=document.querySelector('.twinkle-layer');if(!layer)return;const stars=['✦','✧','∙'];const count=window.innerWidth<760?28:48;layer.innerHTML='';for(let i=0;i<count;i++){const star=document.createElement('span');star.className='twinkle-star';star.textContent=stars[Math.floor(Math.random()*stars.length)];star.style.left=`${Math.random()*100}%`;star.style.top=`${Math.random()*100}%`;star.style.setProperty('--star-size',`${8+Math.random()*10}px`);star.style.setProperty('--star-duration',`${2.8+Math.random()*4}s`);star.style.setProperty('--star-delay',`${Math.random()*5}s`);star.style.setProperty('--star-rotate',`${Math.random()*40-20}deg`);layer.appendChild(star)}}

function createPartnerLetter(){const mood=MOOD_MAP[activeSettings.mood]?.text||'夜空に花火が咲く。';const c1=COLOR_MAP[activeSettings.color1]?.label||'光';const c2=COLOR_MAP[activeSettings.color2]?.label||'光';const shape=TYPE_MAP[activeSettings.fireworkType]?.phrase||'花火';return `${activeSettings.partnerName}、隣に座って。\n今から一緒に花火を見よう？\n\n今夜は、${activeSettings.yourPronoun}たちのためだけの花火だよ。\n${mood}\n${c1}と${c2}の光が広がって、\n最後に${shape}がきらきら残る。\n\nねえ、${activeSettings.partnerName}。\n「${activeSettings.message}」\n\n${activeSettings.partnerName}へ\n${activeSettings.yourName}より`}
function createShareUrl(){const url=new URL(window.location.href);url.search='';const params=new URLSearchParams();Object.entries(activeSettings).forEach(([k,v])=>v&&params.set(k,v));url.search=params.toString();return url.toString()}
function copyText(text,message){navigator.clipboard.writeText(text).then(()=>showToast(message),()=>showToast('コピーできませんでした。'))}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200)}
function hashString(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}

form.addEventListener('submit',(e)=>{e.preventDefault();const s=readForm();s.seed=createNewSeed();applySettings(s)});
document.querySelectorAll('[data-scroll-to]').forEach((b)=>b.addEventListener('click',()=>document.getElementById(b.dataset.scrollTo)?.scrollIntoView({behavior:'smooth'})));
document.getElementById('surpriseButton').addEventListener('click',()=>{const presets=[{color1:'orange',color2:'gold',fireworkType:'round',mood:'festival'},{color1:'blue',color2:'white',fireworkType:'droplet',mood:'seaside'},{color1:'navy',color2:'gold',fireworkType:'sparkle',mood:'harbor'},{color1:'violet',color2:'white',fireworkType:'heart',mood:'rooftop'},{color1:'white',color2:'mint',fireworkType:'willow',mood:'starry'}];const s={...readForm(),...pick(presets),seed:createNewSeed()};applySettings(s,true);});
document.getElementById('pickMessageButton').addEventListener('click',()=>{document.getElementById('message').value=pick(MESSAGE_CANDIDATES)});
document.getElementById('replayButton').addEventListener('click',()=>{activeSettings.seed=createNewSeed();resetShow();showToast('もう一度、花火を打ち上げます。')});
document.getElementById('letterButton').addEventListener('click',()=>{partnerLetter.value=createPartnerLetter();letterCard.hidden=false;letterCard.scrollIntoView({behavior:'smooth',block:'nearest'})});
document.getElementById('shareButton').addEventListener('click',()=>{shareUrl.value=createShareUrl();shareCard.hidden=false;shareCard.scrollIntoView({behavior:'smooth',block:'nearest'})});
document.getElementById('copyLetterButton').addEventListener('click',()=>copyText(partnerLetter.value,'パートナー向けの文をコピーしました。'));
document.getElementById('copyShareButton').addEventListener('click',()=>copyText(shareUrl.value,'URLをコピーしました。'));

createTwinkleStars();
window.addEventListener('resize',createTwinkleStars);
const restored=parseSettingsFromUrl();
if(restored){applySettings(restored,false)}else{writeForm(activeSettings);drawMoodOverlay()}
