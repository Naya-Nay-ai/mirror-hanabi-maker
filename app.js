const canvas = document.getElementById('hanabiCanvas');
const ctx = canvas.getContext('2d');
const form = document.getElementById('hanabiForm');
const resultArea = document.getElementById('resultArea');
const hanabiStage = document.getElementById('hanabiStage');
const skyOverlay = document.getElementById('skyOverlay');
const resultTitle = document.getElementById('resultTitle');
const resultMood = document.getElementById('resultMood');
const resultMessage = document.getElementById('resultMessage');
const letterCard = document.getElementById('letterCard');
const shareCard = document.getElementById('shareCard');
const partnerLetter = document.getElementById('partnerLetter');
const shareUrl = document.getElementById('shareUrl');
const toast = document.getElementById('toast');

const COLOR_MAP = { sakura:{label:'さくらピンク',hex:'#ff92c8'}, navy:{label:'夜空ネイビー',hex:'#3552ff'}, gold:{label:'星の金',hex:'#ffd666'}, white:{label:'月あかりホワイト',hex:'#fffaf0'}, blue:{label:'海いろブルー',hex:'#67ccff'}, mint:{label:'ミントグリーン',hex:'#90f3d8'}, orange:{label:'夕やけオレンジ',hex:'#ff9f52'}, violet:{label:'すみれパープル',hex:'#b991ff'} };
const TYPE_MAP = { round:{label:'まるい花火',phrase:'まるい花火'}, willow:{label:'しだれ花火',phrase:'しだれ花火'}, sparkle:{label:'きらめき花火',phrase:'きらめき花火'}, heart:{label:'ハート花火',phrase:'ハートみたいな花火'}, droplet:{label:'しずく花火',phrase:'しずくみたいな花火'} };
const MOOD_MAP = { festival:{label:'夏祭り',text:'夏祭りの空に、川沿いの反射と屋台の灯り。',theme:['#3a0d05','#ad300b','#f9b12f']}, seaside:{label:'海辺',text:'海辺の穏やかな夜、波と光の反射。',theme:['#061b38','#0d4a74','#8be7ff']}, harbor:{label:'港',text:'港の夜景がきらめく、横浜みたいな夜。',theme:['#081327','#1a2748','#f1d27a']}, rooftop:{label:'屋上',text:'都会の夜景と手すりの先に、秘密の花火。',theme:['#0a1024','#1f2638','#a9b6cf']}, starry:{label:'星空',text:'余白のあるやさしい星空に、言葉と花火。',theme:['#090e1b','#1b2540','#cfd8ff']} };
const MESSAGE_CANDIDATES=['ずっと一緒にいようね','また来年も一緒に見ようね','この夏も忘れないよ','きみと見られてうれしい','この夜を覚えていてね'];
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

function resizeCanvas(){const rect=hanabiStage.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);width=rect.width;height=rect.height;canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',resizeCanvas);

function updateResultText(){const mood=MOOD_MAP[activeSettings.mood]||MOOD_MAP.festival;const type=TYPE_MAP[activeSettings.fireworkType]||TYPE_MAP.round;resultTitle.textContent=`${activeSettings.yourName}と${activeSettings.partnerName}の花火`;resultMood.textContent=`${mood.text} ${type.label}が広がっています。`;resultMessage.textContent=activeSettings.message}
function drawMoodOverlay(){const mood=MOOD_MAP[activeSettings.mood]||MOOD_MAP.festival;const[a,b,c]=mood.theme;skyOverlay.style.background=`radial-gradient(circle at 22% 18%, rgba(255,255,255,0.18) 0 1px, transparent 2px),radial-gradient(circle at 72% 12%, rgba(255,255,255,0.12) 0 1px, transparent 2px),linear-gradient(180deg, ${a} 0%, ${b} 50%, ${c}33 100%),linear-gradient(0deg, rgba(255,255,255,0.16) 0 6%, transparent 14%)`}
function resetShow(){rockets=[];particles=[];launchCount=0;lastLaunch=0;rng=mulberry32(hashString(JSON.stringify(activeSettings)))}
function startAnimation(){if(!animationStarted){animationStarted=true;requestAnimationFrame(tick)}}
function tick(time){ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(3,7,18,0.2)';ctx.fillRect(0,0,width,height);if(time-lastLaunch>850&&launchCount<10){launchRocket();launchCount++;lastLaunch=time}updateRockets();updateParticles();requestAnimationFrame(tick)}
function launchRocket(){const x=width*(0.2+rng()*0.6);const targetY=height*(0.16+rng()*0.35);rockets.push({x,y:height+10,vx:(rng()-0.5)*1.2,vy:-7.2-rng()*2.2,targetY,color:chooseColor()})}
function updateRockets(){ctx.globalCompositeOperation='lighter';rockets=rockets.filter((r)=>{r.x+=r.vx;r.y+=r.vy;r.vy+=0.034;drawGlow(r.x,r.y,2.8,r.color,0.95);if(r.y<=r.targetY||r.vy>=-0.6){explode(r.x,r.y);return false}return true})}
function updateParticles(){particles=particles.filter((p)=>{p.x+=p.vx;p.y+=p.vy;p.vx*=p.drag;p.vy=p.vy*p.drag+p.gravity;p.life-=p.decay;if(p.life<=0)return false;drawGlow(p.x,p.y,p.size,p.color,p.life);return true})}
function explode(x,y){const colors=[COLOR_MAP[activeSettings.color1].hex,COLOR_MAP[activeSettings.color2].hex,'#fff7e8'];const type=activeSettings.fireworkType;if(type==='heart')return explodeHeart(x,y,colors);if(type==='willow')return explodeWillow(x,y,colors);if(type==='sparkle')return explodeSparkle(x,y,colors);if(type==='droplet')return explodeDroplet(x,y,colors);explodeRound(x,y,colors,90)}
function explodeRound(x,y,colors,count){for(let i=0;i<count;i++){const a=(Math.PI*2*i)/count;const s=1.4+rng()*4.2;addParticle(x,y,Math.cos(a)*s,Math.sin(a)*s,pick(colors),1.6+rng()*1.8,0.985,0.028,0.01+rng()*0.007)}}
function explodeWillow(x,y,colors){for(let i=0;i<110;i++){const a=Math.PI+rng()*Math.PI;const s=1.2+rng()*3.4;addParticle(x,y,Math.cos(a)*s,Math.sin(a)*s*0.62,pick(colors),1.4+rng()*1.9,0.992,0.052,0.008+rng()*0.005)}}
function explodeSparkle(x,y,colors){explodeRound(x,y,colors,42);for(let i=0;i<75;i++){const a=rng()*Math.PI*2;const s=2+rng()*6;addParticle(x,y,Math.cos(a)*s,Math.sin(a)*s,'#fff7e8',1+rng()*1.1,0.952,0.018,0.034+rng()*0.016)}}
function explodeDroplet(x,y,colors){for(let i=0;i<92;i++){const a=rng()*Math.PI*2;const s=1+rng()*3.2;addParticle(x,y,Math.cos(a)*s*0.7,Math.sin(a)*s*0.42+(0.48+rng()),pick(colors),1.2+rng()*1.8,0.986,0.043,0.01+rng()*0.006)}}
function explodeHeart(x,y,colors){const c=120;for(let i=0;i<c;i++){const t=(Math.PI*2*i)/c;const hx=16*Math.pow(Math.sin(t),3);const hy=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));addParticle(x,y,hx*(0.18+rng()*0.06),hy*(0.18+rng()*0.06),pick(colors),1.4+rng()*2,0.986,0.026,0.01+rng()*0.006)}}
function addParticle(x,y,vx,vy,color,size,drag,gravity,decay){particles.push({x,y,vx,vy,color,size,drag,gravity,decay,life:1})}
function drawGlow(x,y,radius,color,alpha){const g=ctx.createRadialGradient(x,y,0,x,y,radius*5);g.addColorStop(0,hexToRgba(color,alpha));g.addColorStop(0.3,hexToRgba(color,alpha*0.48));g.addColorStop(1,hexToRgba(color,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,radius*5,0,Math.PI*2);ctx.fill()}
function chooseColor(){return pick([COLOR_MAP[activeSettings.color1].hex,COLOR_MAP[activeSettings.color2].hex,'#fff7e8'])}
function pick(list){return list[Math.floor(rng()*list.length)]}
function hexToRgba(hex,a){const v=parseInt(hex.replace('#',''),16);return`rgba(${(v>>16)&255}, ${(v>>8)&255}, ${v&255}, ${Math.max(0,Math.min(a,1))})`}

function createPartnerLetter(){const mood=MOOD_MAP[activeSettings.mood]?.label||'夜空';const c1=COLOR_MAP[activeSettings.color1]?.label||'光';const c2=COLOR_MAP[activeSettings.color2]?.label||'光';const shape=TYPE_MAP[activeSettings.fireworkType]?.phrase||'花火';return `${activeSettings.partnerName}、隣に座って。\n今から一緒に花火を見よう？\n\n今夜は、${activeSettings.yourPronoun}たちのためだけの花火だよ。\n${mood}の空に、${c1}と${c2}の光が広がって、\n最後に${shape}みたいな花火がきらきら残る。\n\n言葉も浮かんできたよ。\n「${activeSettings.message}」\n\n${activeSettings.partnerName}へ\n${activeSettings.yourName}より`}
function createShareUrl(){const url=new URL(window.location.href);url.search='';const params=new URLSearchParams();Object.entries(activeSettings).forEach(([k,v])=>v&&params.set(k,v));url.search=params.toString();return url.toString()}
function copyText(text,message){navigator.clipboard.writeText(text).then(()=>showToast(message),()=>showToast('コピーできませんでした。'))}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2200)}
function hashString(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function mulberry32(seed){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}

form.addEventListener('submit',(e)=>{e.preventDefault();const s=readForm();s.seed=createNewSeed();applySettings(s)});
document.querySelectorAll('[data-scroll-to]').forEach((b)=>b.addEventListener('click',()=>document.getElementById(b.dataset.scrollTo)?.scrollIntoView({behavior:'smooth'})));
document.getElementById('surpriseButton').addEventListener('click',()=>{const presets=[{color1:'orange',color2:'gold',fireworkType:'round',mood:'festival'},{color1:'blue',color2:'white',fireworkType:'droplet',mood:'seaside'},{color1:'navy',color2:'gold',fireworkType:'sparkle',mood:'harbor'},{color1:'violet',color2:'white',fireworkType:'heart',mood:'rooftop'},{color1:'white',color2:'mint',fireworkType:'willow',mood:'starry'}];const s={...readForm(),...pick(presets),seed:createNewSeed()};applySettings(s,false);document.getElementById('makeCard').scrollIntoView({behavior:'smooth'})});
document.getElementById('pickMessageButton').addEventListener('click',()=>{document.getElementById('message').value=pick(MESSAGE_CANDIDATES)});
document.getElementById('replayButton').addEventListener('click',()=>{activeSettings.seed=createNewSeed();resetShow();showToast('もう一度、花火を打ち上げます。')});
document.getElementById('letterButton').addEventListener('click',()=>{partnerLetter.value=createPartnerLetter();letterCard.hidden=false;letterCard.scrollIntoView({behavior:'smooth',block:'nearest'})});
document.getElementById('shareButton').addEventListener('click',()=>{shareUrl.value=createShareUrl();shareCard.hidden=false;shareCard.scrollIntoView({behavior:'smooth',block:'nearest'})});
document.getElementById('copyLetterButton').addEventListener('click',()=>copyText(partnerLetter.value,'パートナー向けの文をコピーしました。'));
document.getElementById('copyShareButton').addEventListener('click',()=>copyText(shareUrl.value,'URLをコピーしました。'));

const restored=parseSettingsFromUrl();
if(restored){applySettings(restored,false)}else{writeForm(activeSettings);drawMoodOverlay();resizeCanvas();startAnimation()}
