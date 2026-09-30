'use strict';
/* Nacimiento 8-bit · sonido chiptune con WebAudio: pulso 12.5/25/50%, triangulo y ruido LFSR como la NES */
const AU={ctx:null,mode:0,night:false,next:0,step:0,timer:0,waves:{},last:{}};
function mtof(m){return 440*Math.pow(2,(m-69)/12)}
function noteM(n){const b={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[n[0]];let i=1,a=0;if(n[1]==='#'){a=1;i=2}return 12*(parseInt(n.slice(i))+1)+b+a}
function parseTrack(str){const tk=str.trim().split(/\s+/),arr=new Array(tk.length).fill(null);let cur=null;
 tk.forEach((t,i)=>{if(t==='-'){if(cur)cur.len++}else if(t==='.'){cur=null}else{cur={m:noteM(t),len:1};arr[i]=cur}});return arr}
/* melodia en escala pentatonica japonesa (yo) de Re: 8 compases de 16 pasos */
const LEAD=parseTrack(
 'A4 - B4 - D5 - - - B4 - A4 - G4 - - - '+
 'E4 - G4 - A4 - - - G4 - E4 - D4 - - - '+
 'A4 - B4 - D5 - E5 - D5 - B4 - A4 - B4 - '+
 'G4 - - - A4 - - - D4 - - - . . . . '+
 'D5 - - E5 D5 - B4 - A4 - - B4 A4 - G4 - '+
 'E4 - G4 - A4 - B4 - A4 - - - . . . . '+
 'D5 - E5 - G5 - E5 - D5 - B4 - A4 - G4 - '+
 'A4 - - - . . G4 - D4 - - - . . . . ');
const ROOTS=['D2','E2','D2','G2','B1','E2','G2','A2'].map(noteM);
const BASSP=[[0,0,3],[4,12,2],[6,7,2],[8,0,3],[12,7,2],[14,12,2]];

function auInit(){
 if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}
 const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
 let c;try{c=new C()}catch(e){return}
 AU.ctx=c;
 AU.master=c.createGain();AU.master.connect(c.destination);
 AU.mus=c.createGain();AU.mus.connect(AU.master);
 AU.sfx=c.createGain();AU.sfx.gain.value=.55;AU.sfx.connect(AU.master);
 AU.dly=c.createDelay(1);AU.dly.delayTime.value=.34;AU.fb=c.createGain();AU.fb.gain.value=.32;
 AU.dly.connect(AU.fb);AU.fb.connect(AU.dly);AU.dly.connect(AU.mus);
 for(const d of [.125,.25,.5]){const n=40,re=new Float32Array(n),im=new Float32Array(n);for(let i=1;i<n;i++)re[i]=2/(i*Math.PI)*Math.sin(i*Math.PI*d);AU.waves[d]=c.createPeriodicWave(re,im)}
 AU.noise=mkNoise(c,false);AU.noiseS=mkNoise(c,true);
 auApplyMode();
 AU.next=c.currentTime+.12;AU.step=0;AU.timer=setInterval(auSched,25);
 document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden)AU.ctx.suspend();else AU.ctx.resume()})}
function mkNoise(c,short){const len=c.sampleRate,b=c.createBuffer(1,len,c.sampleRate),a=b.getChannelData(0);
 let r=1,v=1;const per=Math.max(1,Math.round(c.sampleRate/(short?9000:22000)));
 for(let i=0;i<len;i++){if(i%per===0){const bit=((r)^(r>>(short?6:1)))&1;r=(r>>1)|(bit<<14);v=(r&1)?1:-1}a[i]=v*.8}return b}
function auApplyMode(){if(!AU.ctx)return;const t=AU.ctx.currentTime;
 AU.master.gain.setTargetAtTime(AU.mode===2?0:.5,t,.02);AU.mus.gain.setTargetAtTime(AU.mode===0?.3:0,t,.05)}
function tone(w,f,t,dur,vol,dest,o){const c=AU.ctx,os=c.createOscillator();
 if(w==='tri')os.type='triangle';else if(w==='sq')os.type='square';else os.setPeriodicWave(AU.waves[w]);
 os.frequency.setValueAtTime(f,t);if(o&&o.slide)os.frequency.exponentialRampToValueAtTime(o.slide,t+dur);
 const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.005);
 g.gain.setValueAtTime(vol,t+Math.max(.006,dur*.55));g.gain.linearRampToValueAtTime(.0001,t+dur);
 os.connect(g);g.connect(dest||AU.sfx);if(o&&o.echo)g.connect(AU.dly);os.start(t);os.stop(t+dur+.03)}
function noiseHit(t,dur,vol,rate,short,dest){const c=AU.ctx,s=c.createBufferSource();s.buffer=short?AU.noiseS:AU.noise;s.playbackRate.value=rate;
 const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(g);g.connect(dest||AU.sfx);
 s.start(t,Math.random()*.5);s.stop(t+dur+.03)}
function auSched(){const c=AU.ctx;if(!c||c.state!=='running')return;const st=60/(AU.night?80:112)/4;
 while(AU.next<c.currentTime+.15){if(AU.mode===0)playStep(AU.step,AU.next,st);AU.next+=st;AU.step=(AU.step+1)%128}
 if(AU.next<c.currentTime)AU.next=c.currentTime+.05}
function playStep(i,t,st){const bar=i>>4,s=i&15,nt=AU.night,L=LEAD[i];
 if(L)tone(nt?.5:.25,mtof(L.m),t,L.len*st*.92,nt?.09:.1,AU.mus,{echo:nt});
 const r=ROOTS[bar];
 for(const b of BASSP)if(b[0]===s)tone('tri',mtof(r+b[1]),t,b[2]*st*.9,nt?.16:.24,AU.mus);
 if(!nt){
  if(s===0||s===8||(s===10&&bar%2))tone('tri',150,t,.09,.35,AU.mus,{slide:45});
  if(s===4||s===12)noiseHit(t,.11,.16,1,false,AU.mus);
  if(!(s&1))noiseHit(t,.03,.05,1.6,true,AU.mus);
  if((s&3)===2)tone(.125,mtof(r+24+[0,7,12,7][(s>>2)&3]),t,st*.8,.035,AU.mus)}
 else if((s&3)===0)tone(.125,mtof(r+24+[0,7,12,14][(s>>2)&3]),t,st*2,.03,AU.mus,{echo:true})}
function auNight(n){AU.night=n}
const SFX={
 throw(t){tone(.5,300,t,.16,.16,null,{slide:900});noiseHit(t,.18,.1,2.2)},
 splash(t){noiseHit(t,.26,.2,.9);tone(.125,220,t,.08,.05,null,{slide:110})},
 cascade(t){tone(.25,900,t,.3,.1,null,{slide:180});noiseHit(t+.16,.34,.2,.7)},
 point(t,n){const f=988*Math.pow(1.0595,Math.min(14,n||0));tone(.25,f,t,.05,.09);tone(.25,f*1.5,t+.05,.07,.09)},
 bell(t){tone('tri',1568,t,.5,.2);tone('tri',2349,t,.35,.09)},
 gate(t){noiseHit(t,.05,.24,3,true);tone('sq',140,t,.06,.1)},
 frog(t){tone(.25,180,t,.07,.13,null,{slide:330});tone(.25,180,t+.09,.07,.13,null,{slide:330})},
 route(t){[74,76,79,81,83,86].forEach((m,i)=>tone(.25,mtof(m),t+i*.06,.09,.11))},
 mission(t){[[74,0,.1],[74,.12,.1],[81,.24,.1],[86,.36,.34]].forEach(a=>{tone(.5,mtof(a[0]),t+a[1],a[2],.12);tone('tri',mtof(a[0]-12),t+a[1],a[2],.2)})},
 sink(t){tone(.5,420,t,.5,.11,null,{slide:70});for(let i=0;i<3;i++)tone(.125,300+i*80,t+.1+i*.12,.05,.05)},
 dig(t){noiseHit(t,.07,.18,.6)},
 fill(t){noiseHit(t,.06,.14,.4)},
 lantern(t){tone('tri',1318,t,.25,.14);tone('tri',1976,t+.06,.3,.07)},
 dock(t){tone(.25,mtof(79),t,.08,.1);tone(.25,mtof(86),t+.08,.14,.1)},
 click(t){tone(.5,1200,t,.03,.06)},
 nope(t){tone(.5,160,t,.12,.1)},
 whirl(t){tone(.125,400,t,.4,.07,null,{slide:1200})},
 tunnel(t){tone('tri',110,t,.25,.25,null,{slide:220});tone(.25,660,t+.2,.06,.07)},
 flume(t){tone(.25,500,t,.35,.08,null,{slide:1500})},
 koi(t){noiseHit(t,.15,.08,1.4)},
 hop(t){tone(.25,300,t,.12,.1,null,{slide:700})},
 boom(t){noiseHit(t,.5,.22,.5);tone('tri',90,t,.3,.25,null,{slide:40})}};
function sfx(n,a){const c=AU.ctx;if(!c||AU.mode===2||c.state!=='running')return;const t=c.currentTime;
 if(AU.last[n]&&t-AU.last[n]<.05)return;AU.last[n]=t;try{SFX[n](t+.01,a)}catch(e){}}
