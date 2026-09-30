'use strict';
/* Nacimiento 8-bit · render, interfaz, entrada y bucle principal */
const CV=document.getElementById('c'),CX=CV.getContext('2d',{alpha:false}),IMG=CX.createImageData(W,H),P32=new Uint32Array(IMG.data.buffer);
const TG=[9,9,9,10,9,9,9,9,9,34,9,9,9,9,10,9,9,9,9,9,34,9,9,9,10,9,9,9,9,9,9,34,9,9,34,9,9,10,9,9,9,9,9,9,9,9,9,9,9,10,9,9,34,9,9,10,9,9,9,9,9,9,34,9];
const FLW=[1,20,19,18],RAKE=[[14,71,5],[29,77,4],[20,87,5.5]];
const SIGNPOS={S:[139,19],F1:[56,38],F3:[168,38],P1:[131,64],N2:[69,73],N3:[157,73],Q1:[50,116],Q2:[131,113],Q3:[196,118]};
const LIGHTS=[],SUB_HUD=subArr({P:1,Q:2});
SP.koiU=mkSpr(3,7,(i,j)=>SP.koiV.d[(6-j)*3+i]);
let PTR=null,navTimer=0,Q2ID=0;

/* ---------- colores del terreno y del agua ---------- */
function groundCol(k,x,y){
 switch(MAT[k]){
  case M_GRASS:{if(hash2(x>>3,y>>3)<.09){const h=hash2(x,y);if(h<.07)return FLW[(h*60|0)&3]}return TG[((y+(x>>5)*3)&7)*8+(x&7)]}
  case M_MOSS:{const h=hash2(x,y);return h<.5?34:h<.82?9:8}
  case M_PATH:return hash2(x,y)<.8?7:5;
  case M_GRAVEL:{let b=99;for(const r of RAKE){const d=Math.hypot(x-r[0],(y-r[1])*1.25)-r[2];if(d<b)b=d}
   const ph=b<7.5?b%2.4:(y%3)*.8;return ph<.8?3:ph<1.4?1:2}
  case M_ROCK:{const h=hash2(x,y);return h<.55?3:h<.88?2:0}
  case M_PEBBLE:{const h=hash2(x,y);return h<.42?2:h<.78?3:h<.92?7:0}
  case M_BED:{if(FLUME[k])return FLUME[k]===2?((((x*.6+y*.8)|0)%5===0)?8:((x+y)&1?11:10)):9;return hash2(x,y)<.55?4:5}}
 return 9}
function waterCol(k,x,y,d){
 if(FLUME[k])return ((y*2-(G.t*60|0))&7)<2?1:((y*2-(G.t*60|0))&7)<4?15:14;
 let c=d<.45?14:d<1.5?13:12;
 if(POOLI[k]===Q2ID){const n=NODES.Q2,dx=x-n.x,dy=(y-n.y)*1.4,a=Math.atan2(dy,dx),r=Math.hypot(dx,dy),s=Math.sin(a*3-r*.5+G.t*4);
  if(s>.85)return 15;if(s>.6)return 14;return c}
 const vx=VX[k],vy=VY[k],sp=Math.abs(vx)+Math.abs(vy);
 if(sp>.035){const inv=1/sp,ph=(x*vx+y*vy)*inv*.9-G.t*Math.min(34,sp*260),m=ph-Math.floor(ph/6)*6;
  if(sp>.16&&hash2(x*3+(G.t*14|0),y)<.28)return 1;
  if(m<1.1&&hash2(x,y)<.75)return sp>.12?1:15;return c}
 const h=hash2(x,y);if(hash2(x+((G.t*1.3+h*7)|0)*31,y)<.02)return 15;
 return c}
function faceCol(k,x,y,fy,flen,wet,tc){
 if(GATE[k])return 4;
 if(flen<=2){const mm=MAT[k];if(wet||mm===M_GRASS||mm===M_MOSS||mm===M_GRAVEL||mm===M_ROCK)return tc}
 if(FLUME[k])return (fy&3)===0?8:((x&1)?11:10);
 if(wet){if(flen>=3){if(fy>=flen-2){if(Math.random()<.004)part(x,Y0+y-(T[k]+D[k])+flen,(Math.random()-.5)*8,-8-Math.random()*10,.8,1,-4);return ((x+(G.t*18|0))&1)?1:15}
   const ph=fy-G.t*50+hash2(x,11)*7,m=ph-Math.floor(ph/5)*5;return m<1.3?1:m<3?15:14}
  return 13}
 if(flen>=5){if(fy===0)return hash2(x,y)<.5?8:34;const f=fy-1,band=(f/3)|0,off=(band&1)?2:0;
  if(f%3===2||((x+off+((band*7)%3))%5)===0)return 0;return f%3===0?2:3}
 const m=MAT[k];if(m===M_PEBBLE||m===M_ROCK||m===M_BED||m===M_GRAVEL)return fy===0?3:4;return fy===0?34:4}
function renderTerrain(){
 for(let x=0;x<WX;x++){let ymin=GBOT;
  for(let y=WY-1;y>=0;y--){const k=y*WX+x,d=D[k],g=GATE[k],wet=d>.12&&!g,hs=wet?T[k]+d:T[k]+g,top=Y0+y-Math.round(hs);
   if(top>=ymin)continue;
   const tc=g?(((x+y)&1)?5:4):wet?waterCol(k,x,y,d):groundCol(k,x,y);
   if(top>=GTOP){const p=top*W+x;FB[p]=tc;ZB[p]=y;PICK[p]=k}
   const flen=ymin-top-1;
   for(let fy=Math.max(top+1,GTOP);fy<ymin;fy++){const p=fy*W+x;FB[p]=faceCol(k,x,y,fy-top-1,flen,wet,flen<=2&&wet?waterCol(k,x,y+fy-top,d):tc);ZB[p]=y;PICK[p]=k}
   ymin=top;if(ymin<=GTOP)break}}}

/* ---------- objetos ---------- */
function scrY(x,y,wat){const k=cellAt(x,y);return Y0+Math.floor(y)-Math.round(wat&&D[k]>.12?T[k]+D[k]:T[k])}
function drawDecor(o){let s=o.s,sub=null;
 if(o.kind==='monk')s=((G.t*1.6)|0)&1?SP.monkA:SP.monkB;
 if(o.kind==='lantern')sub=(G.night&&o.l.lit)?SUB_LIT:SUB_OFF;
 const sy=scrY(o.x,o.y,o.wat),x=Math.round(o.x-(s.w>>1)),y=sy-s.h+1;
 blit(s,x,y,Math.floor(o.y)+(o.dz||0)+1,false,sub);
 if(o.kind==='lantern'&&G.night&&o.l.lit)LIGHTS.push([Math.round(o.x),y+7,16])}
function drawKoi(q){const k=cellAt(q.x,q.y);let sy=Y0+q.y-(T[k]+D[k]),z=Math.floor(q.y)+1;const ca=Math.cos(q.a),sa=Math.sin(q.a);
 if(q.jump>0){sy-=Math.sin((1-q.jump)*Math.PI)*11;z=null}
 if(Math.abs(ca)>=Math.abs(sa)*.8)blit(SP.koi,q.x-3,sy-1,z,ca<0,q.sub);else blit(sa>0?SP.koiV:SP.koiU,q.x-1,sy-3,z,false,q.sub)}
function drawFrog(f){if(f.st==='ride'||f.st==='gone')return;const k=cellAt(f.x,f.y),sy=Y0+f.y-(T[k]+D[k])-(f.h||0)-(f.poke>0?Math.sin(f.poke/.35*Math.PI)*4:0);
 blit(SP.frog,f.x-3,sy-4,f.h>0?null:Math.floor(f.y)+2)}
function drawBoat(b){
 if(b.st==='crash'){if(b.t>.9&&(((G.t*10)|0)&1))return;const x=Math.round(b.cx),y=Math.round(b.cy);rect(x-2,y-1,4,2,1);pset(x-1,y-2,2);pset(x+2,y,2);pset(x-3,y,3);return}
 if(b.inTun&&b.st==='float')return;
 if(b.st==='dock'&&b.dockT>11&&(((G.t*8)|0)&1))return;
 const sx=Math.round(b.x),sy=Math.round(Y0+b.y-b.hv-(b.hop>0?Math.sin(b.hop/.45*Math.PI)*6:0)),bob=(((G.t*2.2+b.ph)|0)&1),z=Math.floor(b.y)+2;
 const sp=Math.hypot(b.vx,b.vy);
 if(b.st==='float'&&sp>6&&!b.fall){const ux=b.vx/sp,uy=b.vy/sp,wc=((G.t*10)|0)&1?1:15;
  for(let i=1;i<=3;i++){const wx=Math.round(sx-ux*(4+i*1.6)),wy=Math.round(sy-uy*(2+i*1.2));pset(wx-Math.round(uy*i*.7),wy+Math.round(ux*i*.4),wc);pset(wx+Math.round(uy*i*.7),wy-Math.round(ux*i*.4),i&1?15:1)}}
 let rows=8,yo=0;if(b.st==='sink'){rows=Math.max(1,8-Math.floor(b.t*6));yo=8-rows}
 blit(SP.boat,sx-5,sy-7+bob+yo,z,b.flip,b.sub,rows);
 if(b.frog&&b.frog.st==='ride')blit(SP.frog,sx-3,sy-11+bob,z);
 if(G.night&&b.st!=='sink'){const fy=sy-8+bob;pset(sx,fy,(((G.t*9+b.ph)|0)%3)?20:35);pset(sx,fy-1,35);LIGHTS.push([sx,fy,6])}
 if(b.gold&&Math.random()<.15)part(sx+(Math.random()-.5)*8,sy-4-Math.random()*5,0,-8,.4,35,0)}
function drawFlash(){const f=G.flash;if(!f)return;if(f.t>2&&((f.t*10)|0)&1)return;
 for(const id of f.ids){const e=EDGE_BY_ID[id];if(!e)continue;const P=e.path;for(let i=0;i<P.length;i+=3){const x=Math.round(P[i][0]),yy=P[i][1],sy=scrY(x,yy,1)-1;
   if(sy<GTOP||sy>=GBOT)continue;pset(x,sy,((i/3+((f.t*16)|0))&3)===0?1:f.c)}}}
function drawTrails(){for(const b of boats){const tr=b.trail;if(!tr||b.demo)continue;const n=tr.length,c=b.pal[0]===1?15:b.pal[0];
 for(let i=0;i<n;i++){if(i<n-18&&(i&1))continue;const p=tr[i];if(p[1]<GTOP||p[1]>=GBOT)continue;const q=p[1]*W+p[0];if(ZB[q]>p[2])continue;FB[q]=i<n-10?b.pal[1]:c}}}
function drawFlying(b){const t=Math.min(1,b.t),x=b.x0+(b.x1-b.x0)*t,gy=b.y0+(b.y1-b.y0)*t,y=gy-b.arc*4*t*(1-t);
 if(gy>=GTOP&&gy<GBOT)for(let i=-2;i<=2;i++)if(((i+(gy|0))&1)===0)pset(x+i,gy,0);
 blit(SP.boat,x-5,y-7,null,((G.t*12)|0)&1,b.sub)}
function drawSign(n){const p=SIGNPOS[n.key];if(!p)return;const sy=scrY(p[0],p[1]),x=p[0]-4,y=sy-10;
 blit(SP.sign,x,y,p[1]+1);
 if(G.state==='play'&&((G.t*6)|0)&1){for(const b of boats){if(b.st!=='float'||b.demo||b.dec.has(n.key))continue;
   const e=b.edge;if((e&&e.to===n&&e.len-e.arc[b.ei]<26)||(!e&&n.rx&&inEll(n,b.x,b.y,1.6))){frame(x-1,y-1,11,11,20);break}}}blit(n.open<0?ARROWS.all:ARROWS[n.outs[n.open].arrow],x+2,y+2,p[1]+1);n.hit=[x-3,y-3,x+12,y+14]}
function drawItems(){const it=[];
 for(const o of DECOR)it.push([o.y+(o.dz||0),0,o]);
 for(const q of kois)it.push([q.y-.6,1,q]);
 for(const f of frogs)it.push([f.y+.5,2,f]);
 for(const b of boats)if(b.st!=='fly')it.push([b.y+1,3,b]);
 for(const n of DECIDE)it.push([SIGNPOS[n.key][1],4,n]);
 it.sort((a,b)=>a[0]-b[0]);
 for(const e of it){const o=e[2];switch(e[1]){case 0:drawDecor(o);break;case 1:drawKoi(o);break;case 2:drawFrog(o);break;case 3:drawBoat(o);break;case 4:drawSign(o)}}
 CLIPT=0;for(const b of boats)if(b.st==='fly')drawFlying(b);CLIPT=GTOP}
function drawParticles(){for(const p of parts){if(p.k===1&&p.t>p.life-.5&&((p.t*10)|0)&1)continue;if(p.k===2){if(p.t>p.life*.7&&((p.t*12)|0)&1)continue;pset(p.x,p.y,p.col);pset(p.x-p.vx*.04,p.y-p.vy*.04,p.col);if(G.night)LIGHTS.push([p.x|0,p.y|0,1])}else pset(p.x,p.y,p.col)}}
function drawPondLabels(){for(const n of ENDS){const s='×'+n.mult,w=textW(s)+4,y=scrY(n.x,n.y-n.ry-2)-10,x=Math.round(n.x-w/2);const c=n.mult>=5?20:n.mult===3?19:n.mult===2?27:1;rect(x,y,w,10,0);text(s,x+2,y+2,c)}}
let HOV=null;
function drawAim(){if(!PTR&&HOV&&G.state==='play'&&!G.help&&G.tool===0){const px=Math.round(HOV[0]),py=Math.round(HOV[1]);if(py>=GTOP&&py<GBOT){const k=PICK[py*W+px];if(k>=0&&D[k]>.3){const c=((G.t*6)|0)&1?20:1;pset(px-3,py,c);pset(px+3,py,c);pset(px,py-3,c);pset(px,py+3,c);pset(px-2,py,c);pset(px+2,py,c);pset(px,py-2,c);pset(px,py+2,c)}}}
 if(!PTR)return;
 if(PTR.m===0){const dx=PTR.x-PTR.x0,dy=PTR.y-PTR.y0,d=Math.hypot(dx,dy);if(d<7)return;
  for(let s=0;s<d;s+=3)pset(PTR.x0+dx*s/d,PTR.y0+dy*s/d,20);for(let a=0;a<6.28;a+=.5)pset(PTR.x+Math.cos(a)*4,PTR.y+Math.sin(a)*3,20)}
 else if(PTR.m===1){for(const p of PTR.pts)pset(p[0],scrY(p[0],p[1])-1,((G.t*8)|0)&1?20:35)}}
function drawHints(){if(G.state!=='play')return;const bl=((G.t*3)|0)&1,m=MISSIONS[G.mis];if(!m)return;
 if(m[0]==='throw'&&bl){const y=scrY(112,22,1)-18;text('↓',109,y,20,0);text('↓',109,y-3,20,0)}
 if(m[0]==='gate'&&bl){const h=NODES.S.hit;if(h)frame(h[0],h[1],h[2]-h[0],h[3]-h[1],20)}}
function lightCircle(cx,cy,r){const R=r+2;for(let j=-R;j<=R;j++){const y=cy+j;if(y<GTOP||y>=GBOT)continue;
 for(let i=-R;i<=R;i++){const x=cx+i;if(x<0||x>=W)continue;const d=Math.hypot(i,j),p=y*W+x;if(d<=r)LIT[p]=2;else if(d<=R&&!LIT[p])LIT[p]=1}}}
function buildLights(){LIT.fill(0);for(const l of LIGHTS)lightCircle(l[0],l[1],l[2]);
 for(const f of fireflies){if(Math.sin(f.ph)<.25)continue;const sx=f.x|0,sy=(scrY(f.x,f.y,1)-5)|0;if(sy<GTOP||sy>=GBOT)continue;FB[sy*W+sx]=20;lightCircle(sx,sy,1)}}
function drawPopups(){for(const p of pops){if(p.t>1&&((p.t*10)|0)&1)continue;const s=p.s,w=textW(s),x=clamp(Math.round(p.x-w/2),1,W-w-2),y=Math.round(p.y-p.t*10);
 if(y>GTOP+1&&y<GBOT-8)text(s,x,y,p.c,0)}}

/* ---------- interfaz ---------- */
function drawHUD(){rect(0,0,W,GTOP,0);for(let x=0;x<W;x++)pset(x,GTOP-1,(x>>1)&1?13:12);
 text(L('pts')+' '+String(G.score).padStart(6,'0'),2,1,1);
 const rs=L('routes')+' '+String(G.found.size).padStart(2,'0')+'/'+ROUTES.size;text(rs,W-1-textW(rs),1,11);
 const nb=activeBoats();blit(SP.boat,98,0,null,false,SUB_HUD);text(String(nb),110,1,15);
 let s,c;if(G.state==='title'){s=L('t3')+' · 8-BIT';c=15}else if(G.hintT>0){s=G.hint;c=15}else if(G.mis<MISSIONS.length){s='▶ '+missionText();c=(G.mis===0&&((G.t*2)|0)&1)?20:35}else{s='★ '+L('master');c=20}
 text(s,2,10,c)}
function drawIcon(i,cx,cy,on){
 if(i===0){blit(SP.boat,cx-5,cy-4,null,false,SUB_HUD);return}
 if(i===1){for(let t=0;t<7;t++){pset(cx+4-t,cy-5+t,5);pset(cx+5-t,cy-5+t,4)}rect(cx-5,cy+1,4,3,2);rect(cx-4,cy+4,2,1,3);pset(cx-2,cy+1,3);rect(cx+3,cy-6,3,1,4);return}
 if(i===2){for(let j=0;j<6;j++){const w=2+j*2;rect(cx-w/2,cy-2+j,w,1,j<1?10:j<2?9:(j&1)?5:4)}pset(cx,cy-5,1);pset(cx-1,cy-4,1);pset(cx+1,cy-4,1);pset(cx,cy-3,1);return}
 if(i===3){if(!G.night){for(let j=-4;j<=4;j++)for(let q=-4;q<=4;q++){const a=q*q+j*j<=16,b=(q-2)*(q-2)+(j+1)*(j+1)<=12;if(a&&!b)pset(cx+q,cy+j,20)}}
  else{for(let j=-3;j<=3;j++)for(let q=-3;q<=3;q++)if(q*q+j*j<=9)pset(cx+q,cy+j,20);for(let a=0;a<8;a++){const an=a*Math.PI/4;pset(cx+Math.round(Math.cos(an)*5),cy+Math.round(Math.sin(an)*5),20)}}return}
 if(i===4){rect(cx-5,cy-2,3,4,2);for(let j=0;j<4;j++)rect(cx-2+j,cy-2-j,1,4+j*2,2);
  if(AU.mode<2){pset(cx+3,cy-1,1);pset(cx+3,cy+1,1);pset(cx+4,cy,1);if(AU.mode===0){pset(cx+5,cy-3,1);pset(cx+6,cy-1,1);pset(cx+6,cy+1,1);pset(cx+5,cy+3,1)}}
  else for(let t=-2;t<=2;t++){pset(cx+4+t,cy+t,17);pset(cx+4+t,cy-t,17)}return}
 if(i===5){textC('?',cx,cy-7,1,-1,2);return}
 if(i===6){textC('3D',cx,cy-3,15,-1,1)}}
function drawToolbar(){rect(0,GBOT,W,H-GBOT,0);for(let x=0;x<W;x++)pset(x,GBOT,(x>>1)&1?13:12);
 const m=MISSIONS[G.mis],bl=((G.t*3)|0)&1;
 for(let i=0;i<7;i++){const x=i*32+2,y=GBOT+3,sel=i<3&&G.tool===i;
  let hl=false;if(G.state==='play'&&m&&bl&&((m[0]==='night'&&i===3&&!G.night)||(m[0]==='dig'&&i===1)))hl=true;
  rect(x,y,28,H-y-2,sel?12:23);frame(x,y,28,H-y-2,hl?20:sel?15:3);drawIcon(i,x+14,y+10)}}
function drawBanner(){if(!banners.length)return;const b=banners[0];if(b.t<.15&&((b.t*40)|0)&1)return;const w=textW(b.s)+12,x=((W-w)/2)|0,y=GTOP+98;
 rect(x,y,w,15,0);frame(x,y,w,15,b.c);text(b.s,x+6,y+4,b.c)}
function blitScaled(s,x,y,sc,sub){for(let j=0;j<s.h;j++)for(let i=0;i<s.w;i++){let c=s.d[j*s.w+i];if(c===-1)continue;if(c<-1){c=sub[-c-2];if(c<0)continue}rect(x+i*sc,y+j*sc,sc,sc,c)}}
function langToggle(cx,y){rect(cx-40,y,80,15,0);frame(cx-40,y,80,15,15);text('ES',cx-26,y+4,LANG==='es'?20:3);text('·',cx-3,y+4,2);text('EN',cx+15,y+4,LANG==='en'?20:3)}
function drawTitle(){dither(0,GTOP,W,GBOT-GTOP);
 rect(20,30,184,190,0);frame(20,30,184,190,13);frame(22,32,180,186,12);
 textC(L('t1'),W/2+1,41,13,-1,2);textC(L('t1'),W/2,40,1,-1,2);
 textC(L('t2'),W/2+1,61,16,-1,2);textC(L('t2'),W/2,60,20,-1,2);
 const wy=112;for(let x=40;x<184;x++){const s=Math.sin(x*.35+G.t*5);pset(x,wy+Math.round(s),s>.6?1:14);pset(x,wy+2+Math.round(Math.sin(x*.3-G.t*4)),13)}
 blitScaled(SP.boat,W/2-22,wy-30+Math.round(Math.sin(G.t*3)*1.5),4,subArr({P:1,Q:2}));
 textC(L('t3'),W/2,124,15);
 if(((G.t*2.4)|0)&1)textC(L('tap'),W/2,146,20);
 textC(L('rec')+' '+G.hi,W/2,170,1);textC(L('bestb')+' '+G.best,W/2,182,1);
 textC(L('routes')+' '+G.found.size+'/'+ROUTES.size,W/2,194,11);
 langToggle(W/2,236)}
const HELP={x:14,y:36,w:196,h:204};
function drawHelp(){dither(0,GTOP,W,GBOT-GTOP);const P=HELP;rect(P.x,P.y,P.w,P.h,0);frame(P.x,P.y,P.w,P.h,15);frame(P.x+2,P.y+2,P.w-4,P.h-4,13);
 textC(L('howto'),W/2,P.y+10,20,0);const hl=L('help');for(let i=0;i<hl.length;i++)text(hl[i],P.x+10,P.y+26+i*14,1,0);
 const by=P.y+P.h-28;rect(P.x+10,by,82,16,16);frame(P.x+10,by,82,16,1);textC(L('reset'),P.x+51,by+5,1,0);
 rect(P.x+P.w-92,by,82,16,12);frame(P.x+P.w-92,by,82,16,1);textC(L('close'),P.x+P.w-51,by+5,1,0);
 langToggle(W/2,by-19)}
function present(){if(!G.night){for(let p=0;p<W*H;p++)P32[p]=LUT_DAY[FB[p]]}
 else{let p=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++,p++){const l=LIT[p];P32[p]=l===3?LUT_DAY[FB[p]]:(l===2||(l===1&&((x+y)&1)))?LUT_WARM[FB[p]]:LUT_NIGHT[FB[p]]}}
 CX.putImageData(IMG,0,0)}
function render(){FB.fill(0);ZB.fill(-1);PICK.fill(-1);LIGHTS.length=0;
 CLIPT=GTOP;CLIPB=GBOT;MARKLIT=false;
 renderTerrain();drawTrails();drawFlash();drawItems();drawParticles();drawPondLabels();drawAim();drawHints();
 if(G.night)buildLights();
 MARKLIT=G.night;drawPopups();
 CLIPT=0;CLIPB=H;
 drawHUD();drawToolbar();drawBanner();
 if(G.state==='title')drawTitle();else if(G.help)drawHelp();
 MARKLIT=false;present()}

/* ---------- acciones ---------- */
function hint(s){G.hint=s;G.hintT=2.6}
function setTool(i){G.tool=i;hint(L('tool'+i));sfx('click')}
function toggleNight(){G.night=!G.night;auNight(G.night);if(G.night)for(const l of lanterns)l.lit=false;hint(L(G.night?'night1':'night0'));sfx('click')}
function cycleSound(){AU.mode=(AU.mode+1)%3;auApplyMode();hint(L('snd'+AU.mode));sfx('click');save()}
function resetGarden(){resetWorld();boats.length=0;for(const f of frogs){f.st='pad';f.boat=null}for(const l of lanterns)l.lit=false;navTimer=0;G.help=false;sfx('click')}
function startGame(){G.state='play';boats.length=0;G.score=0;G.help=false;sfx('click')}
function toolClick(i){if(i<3)setTool(i);else if(i===3)toggleNight();else if(i===4)cycleSound();else if(i===5){G.help=!G.help;sfx('click')}else if(i===6)location.href='../'}
function throwFromBottom(x,y){return throwBoat(112+(x-112)*.35,300,x,y,0,0,70)}
function addDig(x,y){const p=PTR;const n=Math.max(1,Math.ceil(Math.hypot(x-(p.lx===undefined?x:p.lx),y-(p.ly===undefined?y:p.ly))/2));
 for(let s=1;s<=n;s++){const sx=p.lx===undefined?x:p.lx+(x-p.lx)*s/n,sy=p.ly===undefined?y:p.ly+(y-p.ly)*s/n,px=Math.round(sx),py=Math.round(sy);
  if(px<0||px>=W||py<GTOP||py>=GBOT)continue;const k=PICK[py*W+px];if(k<0)continue;const w=[k%WX+.5,((k/WX)|0)+.5],l=p.pts[p.pts.length-1];
  if(!l||Math.hypot(w[0]-l[0],w[1]-l[1])>=1.5){p.pts.push(w);if(Math.random()<.5)part(px,py,(Math.random()-.5)*30,-20-Math.random()*20,.4,[4,5,7][(Math.random()*3)|0],200)}}
 p.lx=x;p.ly=y}
function doFill(x,y){const px=Math.round(x),py=Math.round(y);if(px<0||px>=W||py<GTOP||py>=GBOT)return;const k=PICK[py*W+px];if(k<0)return;
 if(fillAt(k%WX+.5,((k/WX)|0)+.5)){sfx('fill');navTimer=0;if(Math.random()<.6)part(px,py,(Math.random()-.5)*20,-15,.35,[4,5,9][(Math.random()*3)|0],150)}}
function helpClick(x,y){const P=HELP,by=P.y+P.h-28;
 if(y>=by&&y<by+16){if(x>=P.x+10&&x<P.x+92){resetGarden();return}if(x>=P.x+P.w-92&&x<P.x+P.w-10){G.help=false;sfx('click');return}}
 if(y>=by-19&&y<by-4){LANG=LANG==='es'?'en':'es';save();sfx('click');return}
 if(x<P.x||x>P.x+P.w||y<P.y||y>P.y+P.h){G.help=false}}
function toLogical(e){const r=CV.getBoundingClientRect();return [(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
function down(x,y){
 if(G.state==='title'){if(y>=236&&y<252&&x>=58&&x<166){LANG=LANG==='es'?'en':'es';save();sfx('click');return}startGame();return}
 if(G.help){helpClick(x,y);return}
 if(y>=GBOT){toolClick(clamp(Math.floor(x/32),0,6));return}
 if(y<GTOP)return;
 if(G.tool===0){for(const n of DECIDE){const h=n.hit;if(h&&x>=h[0]&&x<=h[2]&&y>=h[1]&&y<=h[3]){cycleGate(n);gateChanged(n);navTimer=0;sfx('gate');onEvent('gate');return}}
  for(const b of boats){if(b.st!=='float'||b.hop>0)continue;const sx=b.x,sy=Y0+b.y-b.hv-3;if(Math.abs(sx-x)<5&&Math.abs(sy-y)<5){b.hop=.45;b.vx*=1.6;b.vy*=1.6;sfx('hop');if(!b.demo){b.pts+=10;popup('+10',sx,sy-8,11)}return}}
  for(const f of frogs){if(f.st!=='pad')continue;const k=cellAt(f.px,f.py),sy=Y0+f.py-(T[k]+D[k])-2;if(Math.abs(f.px-x)<5&&Math.abs(sy-y)<5){f.h=0;f.poke=.35;sfx('frog');return}}
  PTR={m:0,x0:x,y0:y,x,y};return}
 if(G.tool===1){PTR={m:1,pts:[],x,y};addDig(x,y);return}
 if(G.tool===2){PTR={m:2,x,y};doFill(x,y)}}
function move(x,y){if(!PTR)return;PTR.x=x;PTR.y=y;if(PTR.m===1)addDig(x,y);else if(PTR.m===2)doFill(x,y)}
function up(x,y){if(!PTR)return;const p=PTR;PTR=null;
 if(p.m===0){if(y<GTOP||y>=GBOT)return;const dx=x-p.x0,dy=y-p.y0,d=Math.hypot(dx,dy);
  if(d<7)throwFromBottom(x,y);else{const sp=Math.min(30,d*.6);throwBoat(p.x0,p.y0,x,y,dx/d*sp,dy/d*sp,24)}}
 else if(p.m===1){if(digStroke(p.pts)){sfx('dig');navTimer=0}}}
CV.addEventListener('pointerdown',e=>{e.preventDefault();try{CV.setPointerCapture(e.pointerId)}catch(_){}auInit();const q=toLogical(e);down(q[0],q[1])});
CV.addEventListener('pointermove',e=>{const q=toLogical(e);HOV=q;if(!PTR)return;move(q[0],q[1])});
CV.addEventListener('pointerleave',()=>{HOV=null});
CV.addEventListener('pointerup',e=>{const q=toLogical(e);up(q[0],q[1])});
CV.addEventListener('pointercancel',()=>{PTR=null});
CV.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{const k=e.key.toLowerCase();auInit();
 if(G.state==='title'){if(k===' '||k==='enter'){e.preventDefault();startGame()}return}
 if(k===' '){e.preventDefault();const S=NODES.S,tx=S.x+(Math.random()-.5)*S.rx*1.3,ty=S.y+(Math.random()-.5)*S.ry*.7;throwFromBottom(tx,scrY(tx,ty,1))}
 else if(k==='n')toggleNight();else if(k==='m')cycleSound();else if(k==='h'||k==='?'){G.help=!G.help}else if(k==='1'||k==='2'||k==='3')setTool(+k-1);else if(k==='escape')G.help=false});
function fit(){const s=Math.min(innerWidth/W,innerHeight/H),k=s>=2?Math.floor(s):s;CV.style.width=Math.floor(W*k)+'px';CV.style.height=Math.floor(H*k)+'px'}
addEventListener('resize',fit);

/* ---------- arranque ---------- */
let last=performance.now(),acc=0;
function loop(now){let dt=(now-last)/1000;last=now;if(dt>.1)dt=.1;if(dt<0)dt=0;
 acc+=dt*SIM.RATE;let n=0;while(acc>=1&&n<8){simStep();acc-=1;n++}if(acc>8)acc=0;
 updVel();navTimer-=dt;if(navTimer<=0){computeNav();navTimer=.35}
 if(Math.random()<dt*14){const k=cellAt(112,14);part(112+(Math.random()-.5)*6,Y0+14-(T[k]+D[k]),(Math.random()-.5)*16,-10-Math.random()*14,.5,Math.random()<.5?1:15,60)}
 updGame(dt);render();requestAnimationFrame(loop)}
buildWorld();Q2ID=NODES.Q2.pid;load();initDecor();computeNav();fit();
window.N8={G,boats,NODES,ROUTES,throwBoat,throwFromBottom,scrY,cellAt,D,T,SIM,computeNav,startGame,toggleNight,setGate,cycleGate,DECIDE,EDGE_BY_ID,resetGarden,digStroke,frogs,lanterns,MISSIONS};
requestAnimationFrame(loop);
