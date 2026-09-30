'use strict';
/* Nacimiento 8-bit · juego: barcos de papel, ranas, carpas, puntos, rutas y misiones */
let LANG=(navigator.language||'es').toLowerCase().indexOf('es')===0?'es':'en';
const TXT={
es:{t1:'NACIMIENTO',t2:'8-BIT',t3:'BARQUITOS DE PAPEL',tap:'TOCA PARA JUGAR',pts:'PTS',routes:'RUTAS',rec:'RÉCORD',bestb:'MEJOR BARCO',
 done:'¡MISIÓN CUMPLIDA! +500',newroute:'¡RUTA NUEVA!',master:'¡MAESTRO DEL JARDÍN!',
 cascade:'CASCADA',gcascade:'GRAN CASCADA',torii:'TORII',bridge:'PUENTE',stones:'PASADERAS',tunnel:'TÚNEL',flume:'TOBOGÁN',whirl:'REMOLINO',frog:'RANA',lantern:'FAROL',
 glub:'¡GLUB!',plaf:'¡PLAF!',full:'¡DEMASIADOS BARCOS!',festival:'¡FESTIVAL DE FAROLES! +1000',
 tool0:'TOCA EL AGUA O ARRASTRA Y SUELTA',tool1:'PALA: ARRASTRA PARA CAVAR UN CANAL',tool2:'TIERRA: ARRASTRA PARA TAPAR',
 night1:'NOCHE: FAROLILLOS FLOTANTES',night0:'DE DÍA',snd0:'SONIDO: MÚSICA Y EFECTOS',snd1:'SONIDO: SOLO EFECTOS',snd2:'SONIDO: APAGADO',
 ponds:['LOTOS','IRIS','CARPAS','LUNA','DORADO'],
 help:['TOCA EL AGUA: LANZA UN BARCO','ARRASTRA Y SUELTA: CON IMPULSO','LETREROS: MUEVEN LAS COMPUERTAS','PALA: CAVA · TIERRA: TAPA','LUNA: NOCHE DE FAROLILLOS','RUTA NUEVA: +1000 PUNTOS','ESTANQUES: ×1 ×2 ×3 ×5','TECLADO: ESPACIO N M H'],
 howto:'CÓMO JUGAR',reset:'REINICIAR',close:'CERRAR',lang:'ESPAÑOL',back:'VOLVER AL 3D',
 m_throw:'LANZA UN BARCO AL AGUA DE ARRIBA',m_dock:'LLEVA UN BARCO A UN ESTANQUE',m_torii:'PASA BAJO EL TORII FLOTANTE',
 m_gate:'TOCA UN LETRERO DE COMPUERTA',m_bridge:'PASA BAJO EL PUENTE ROJO',m_casc3:'UN SOLO BARCO: 3 CASCADAS',
 m_frog:'LLEVA UNA RANA DE PASAJERA',m_flume:'BAJA POR EL TOBOGÁN DE BAMBÚ',m_tunnel:'CRUZA EL TÚNEL DE ROCA',
 m_whirl:'DA UNA VUELTA EN EL REMOLINO',m_gold:'LLEGA AL ESTANQUE DORADO ×5',m_fleet:'6 BARCOS NAVEGANDO A LA VEZ',
 m_routes8:'DESCUBRE 8 RUTAS DISTINTAS',m_night:'DE NOCHE: ENCIENDE 5 FAROLES',m_big:'UN BARCO DE 3000 PUNTOS',
 m_dig:'CAVA UN CANAL Y NAVÉGALO',m_routes16:'DESCUBRE 16 RUTAS',m_routesAll:'DESCUBRE LAS 27 RUTAS'},
en:{t1:'NACIMIENTO',t2:'8-BIT',t3:'PAPER BOATS',tap:'TAP TO PLAY',pts:'PTS',routes:'ROUTES',rec:'HI-SCORE',bestb:'BEST BOAT',
 done:'MISSION COMPLETE! +500',newroute:'NEW ROUTE!',master:'GARDEN MASTER!',
 cascade:'WATERFALL',gcascade:'BIG FALL',torii:'TORII',bridge:'BRIDGE',stones:'STONES',tunnel:'TUNNEL',flume:'SLIDE',whirl:'WHIRLPOOL',frog:'FROG',lantern:'LANTERN',
 glub:'GLUB!',plaf:'SPLAT!',full:'TOO MANY BOATS!',festival:'LANTERN FESTIVAL! +1000',
 tool0:'TAP THE WATER OR DRAG AND RELEASE',tool1:'SHOVEL: DRAG TO DIG A CHANNEL',tool2:'EARTH: DRAG TO FILL IT IN',
 night1:'NIGHT: FLOATING LANTERNS',night0:'DAYTIME',snd0:'SOUND: MUSIC AND SFX',snd1:'SOUND: SFX ONLY',snd2:'SOUND: OFF',
 ponds:['LOTUS','IRIS','KOI','MOON','GOLD'],
 help:['TAP THE WATER: THROW A BOAT','DRAG AND RELEASE: THROW HARDER','SIGNS: SWITCH THE SLUICE GATES','SHOVEL: DIG · EARTH: FILL','MOON: LANTERN NIGHT','NEW ROUTE: +1000 POINTS','PONDS: ×1 ×2 ×3 ×5','KEYS: SPACE N M H'],
 howto:'HOW TO PLAY',reset:'RESET',close:'CLOSE',lang:'ENGLISH',back:'BACK TO 3D',
 m_throw:'THROW A BOAT INTO THE TOP POOL',m_dock:'SAIL A BOAT INTO A POND',m_torii:'SAIL UNDER THE FLOATING TORII',
 m_gate:'TAP A SIGN TO SWITCH A GATE',m_bridge:'SAIL UNDER THE RED BRIDGE',m_casc3:'ONE BOAT, THREE WATERFALLS',
 m_frog:'GIVE A FROG A RIDE',m_flume:'RIDE THE BAMBOO SLIDE',m_tunnel:'GO THROUGH THE ROCK TUNNEL',
 m_whirl:'SPIN AROUND THE WHIRLPOOL',m_gold:'REACH THE GOLDEN POND ×5',m_fleet:'6 BOATS SAILING AT ONCE',
 m_routes8:'FIND 8 DIFFERENT ROUTES',m_night:'AT NIGHT: LIGHT 5 LANTERNS',m_big:'ONE 3000-POINT BOAT',
 m_dig:'DIG A CHANNEL AND SAIL IT',m_routes16:'FIND 16 ROUTES',m_routesAll:'FIND ALL 27 ROUTES'}};
function L(k){const t=TXT[LANG];return (t&&t[k]!==undefined)?t[k]:(TXT.es[k]!==undefined?TXT.es[k]:k)}

const G={fw:[],flash:null,state:'title',tool:0,night:false,score:0,hi:0,best:0,found:new Set(),mis:0,t:0,hint:'',hintT:0,help:false,demoT:1.2,tick:0,combo:0,comboT:9};
const boats=[],frogs=[],kois=[],parts=[],pops=[],banners=[],DECOR=[],lanterns=[],fireflies=[];
const PAPERS=[[1,2],[17,16],[20,5],[19,18],[1,3],[11,9],[6,21]],GOLD=[35,20];
const BOAT={VK:230,VMAX:46,NAVV:12,STEER:20,BANK:8,WOB:1.3,MAXB:40,MAXA:30};
const KOICOL=[subArr({K:21,L:1}),subArr({K:1,L:17}),subArr({K:20,L:35}),subArr({K:1,L:21}),subArr({K:17,L:1}),subArr({K:6,L:20})];
const SUB_LIT=subArr({W:20}),SUB_OFF=subArr({W:0});
let ZONES=[];let boatN=0;
const NEAR8=[[2.5,0],[-2.5,0],[0,2.5],[0,-2.5],[1.8,1.8],[-1.8,1.8],[1.8,-1.8],[-1.8,-1.8]];

/* ---------- decorado ---------- */
function initDecor(){
 const A=(s,x,y,o)=>{const d=Object.assign({s,x,y},o||{});DECOR.push(d);return d};
 A(SP.rockL,103,11);A(SP.rockM2,121,10);A(SP.rockS,112,7);A(SP.rockM,95,15);A(SP.rockS,130,15);A(SP.rockS,86,9);A(SP.rockM,140,8);
 A(SP.pine[0],16,20);A(SP.pine[1],206,18);A(SP.pine[1],40,12);A(SP.sakura[0],62,26);A(SP.sakura[1],164,26);A(SP.pine[0],186,10);
 A(SP.bamboo[0],7,46);A(SP.bamboo[1],215,46);A(SP.bamboo[0],26,46);
 A(SP.toriiS,112,42);
 A(SP.toriiB,112,73,{wat:1});
 A(SP.tsuku,93,66);
 for(const r of [[13,69,'rockM'],[17,71,'rockS'],[10,73,'rockS'],[29,77,'rockL'],[19,86,'rockM2'],[24,88,'rockS'],[15,89,'rockS']])A(SP[r[2]],r[0],r[1]);
 A(SP.monkA,31,94,{kind:'monk'});
 A(SP.bamboo[1],213,74);A(SP.bamboo[0],219,80);A(SP.sakura[2],178,97);A(SP.pine[1],98,98);
 A(SP.mound,197,96);
 const e13=EDGE_BY_ID[13],pb=e13.path[idxAt(e13.arc,e13.len*.42)];A(SP.bridge,pb[0],pb[1]+2,{dz:1});
 const e18=EDGE_BY_ID[18],ps=e18.path[idxAt(e18.arc,e18.len*.8)];A(SP.slab,ps[0],ps[1]+1,{dz:1});
 A(SP.stone,110.5,87);A(SP.stone,114.5,90);
 A(SP.sakura[2],70,132);A(SP.sakura[0],152,130);A(SP.sakura[1],92,166);A(SP.sakura[2],134,166);A(SP.pine[0],38,164);A(SP.pine[1],184,164);
 for(const p of [[96,58],[128,58],[58,120],[166,122],[86,160],[140,160],[46,176],[180,178],[150,40],[74,40]])A(SP.bush,p[0],p[1]);
 A(SP.pine[0],10,142);A(SP.bamboo[1],216,150);A(SP.rockM,48,190);A(SP.rockS,88,194);A(SP.rockM2,134,194);A(SP.rockS,180,192);
 for(const p of [[100,43],[124,43],[69,61],[156,65],[92,107],[131,106],[84,173],[141,173]]){const l={x:p[0],y:p[1],lit:false};lanterns.push(l);A(SP.lantern,p[0],p[1],{kind:'lantern',l})}
 for(const p of [[14,178],[29,184],[20,175],[31,177]])A(SP.lily,p[0],p[1],{wat:1,dz:-2});
 for(const p of [[17,183],[26,176]])A(SP.lotus,p[0],p[1],{wat:1,dz:-1});
 for(const p of [[200,178],[209,184]])A(SP.lily,p[0],p[1],{wat:1,dz:-2});
 ZONES=[{id:'torii1',x:112,y:41,r:4.5,p:100,l:'torii'},{id:'torii2',x:112,y:70,r:5.5,p:250,l:'torii'},
  {id:'stones',x:112,y:88,r:5,p:50,l:'stones'},{id:'bridge1',x:pb[0],y:pb[1],r:5,p:150,l:'bridge'},{id:'bridge2',x:ps[0],y:ps[1],r:5,p:100,l:'bridge'}];
 for(const p of [[27,125],[41,119],[35,128]])frogs.push({px:p[0],py:p[1],x:p[0],y:p[1],st:'pad',t:0,h:0,boat:null});
 const addK=(P,n)=>{for(let i=0;i<n;i++){const a=Math.random()*6.28;kois.push({P,x:P.x+Math.cos(a)*P.rx*.4,y:P.y+Math.sin(a)*P.ry*.4,a:Math.random()*6.28,sp:4+Math.random()*4,sub:KOICOL[(i+(P===NODES.P1?3:0))%KOICOL.length],jump:0})}};
 addK(NODES.E3,7);addK(NODES.P1,3);addK(NODES.E1,2);
 for(let i=0;i<26;i++)fireflies.push({x:Math.random()*WX,y:20+Math.random()*170,ph:Math.random()*6.28,vx:0,vy:0})}

/* ---------- particulas, textos y avisos ---------- */
function part(x,y,vx,vy,life,col,g,k){if(parts.length<700)parts.push({x,y,vx,vy,life,t:0,col,g:g||0,k:k||0})}
function splash(sx,sy,n,big){for(let i=0;i<n;i++)part(sx+(Math.random()-.5)*4,sy,(Math.random()-.5)*(big?70:45),-15-Math.random()*(big?70:45),.3+Math.random()*.35,[1,15,14][i%3],260)}
function popup(s,x,y,c){s=String(s);const w=textW(s);
 for(let tries=0;tries<4;tries++){let hit=false;for(const p of pops){if(p.t<.8&&Math.abs((p.y-p.t*10)-y)<9&&Math.abs(p.x-x)<(w+textW(p.s))/2+2){hit=true;break}}if(!hit)break;y-=9}
 pops.push({s,x,y,t:0,c:c===undefined?1:c})}
function banner(s,c){banners.push({s,t:0,c:c===undefined?20:c})}
function boatScr(b){return [b.x,Y0+b.y-b.hv]}

/* ---------- barcos ---------- */
function activeBoats(){let n=0;for(const b of boats)if(b.st==='fly'||b.st==='float')n++;return n}
function throwBoat(x0,y0,x1,y1,vx,vy,arc,demo){
 if(activeBoats()>=BOAT.MAXA){if(!demo){sfx('nope');popup(L('full'),x1,y1-10,17)}return null}
 if(boats.length>=BOAT.MAXB){const i=boats.findIndex(b=>b.st==='dock'||b.st==='sink'||b.st==='crash');if(i>=0)boats.splice(i,1);else return null}
 boatN++;const gold=!demo&&Math.random()<.06,pal=gold?GOLD:PAPERS[boatN%PAPERS.length];
 const b={n:boatN,st:'fly',t:0,x0,y0,x1,y1,dur:clamp(Math.hypot(x1-x0,y1-y0)/290,.32,.85),arc:arc,x:0,y:0,vx:vx||0,vy:vy||0,hv:0,vz:0,fall:0,
  sub:subArr({P:pal[0],Q:pal[1]}),pal,trail:[],trT:0,gold,pts:0,casc:0,route:[],zones:new Set(),dec:new Set(),steer:null,whirl:null,frog:null,flip:false,
  ph:Math.random()*6.28,dry:0,age:0,navBest:1e9,navT:0,top:false,inFl:false,inTun:false,demo:!!demo,dockT:0,cust:0,custDone:false,edge:null,ei:0,freeT:0};
 boats.push(b);if(!demo){sfx('throw');onEvent('throw')}return b}
function landBoat(b){
 const px=clamp(Math.round(b.x1),0,W-1),py=clamp(Math.round(b.y1),GTOP,GBOT-1);let k=PICK[py*W+px];
 let wx,wy;if(k>=0){wx=k%WX+.5;wy=((k/WX)|0)+.5}else{b.st='crash';b.t=0;b.cx=b.x1;b.cy=b.y1;return}
 if(D[cellAt(wx,wy)]<.35){let best=1e9,bx=0,by=0;
  for(let dy=-9;dy<=9;dy++)for(let dx=-9;dx<=9;dx++){const xx=wx+dx,yy=wy+dy;if(xx<0||yy<0||xx>=WX||yy>=WY)continue;
   if(D[cellAt(xx,yy)]>.4&&!TUN[cellAt(xx,yy)]){const d=dx*dx+dy*dy;if(d<best){best=d;bx=xx;by=yy}}}
  if(best<1e9){wx=bx;wy=by}else{b.st='crash';b.t=0;b.cx=b.x1;b.cy=b.y1;if(!b.demo){popup(L('plaf'),b.x1,b.y1-8,7);sfx('nope')}return}}
 b.x=wx;b.y=wy;b.st='float';b.hv=surfAt(wx,wy);b.t=0;b.top=POOLI[cellAt(wx,wy)]===NODES.S.pid;
 const s=boatScr(b);splash(s[0],s[1],8);if(!b.demo)sfx('splash')}
function sinkBoat(b,c){if(b.st==='sink')return;b.st='sink';b.t=0;b.cause=c||'';if(b.frog)frogOff(b);if(!b.demo){const s=boatScr(b);popup(L('glub'),s[0],s[1]-8,3);sfx('sink')}}
function ev(b,kind,pts,lbl){b.pts+=pts;if(b.demo)return;const s=boatScr(b);popup((lbl?L(lbl)+' ':'')+'+'+pts,s[0],s[1]-10,kind==='cascade'?15:kind==='frog'?10:20);
 sfx(kind==='cascade'?'cascade':kind==='torii'?'bell':kind==='bridge'||kind==='stones'?'point':kind==='frog'?'frog':kind==='tunnel'?'tunnel':kind==='flume'?'flume':kind==='whirl'?'whirl':kind==='lantern'?'lantern':'point',b.route.length)}
/* navegacion: en los arroyos el barco sigue el cauce (riel) y en cada bifurcacion elige una salida abierta */
function pickOut(n,b){const opts=n.outs.filter((e,i)=>n.open<0||n.open===i);if(!opts.length)return null;
 if(n.key==='S'){let tot=0;const w=opts.map(e=>{const v=1/(1+(Math.hypot(b.x-e.entry[0],b.y-e.entry[1])/8)**2);tot+=v;return v});
  let r=Math.random()*tot;for(let i=0;i<opts.length;i++){r-=w[i];if(r<=0)return opts[i]}return opts[opts.length-1]}
 return opts[(Math.random()*opts.length)|0]}
function joinRail(b,e){b.edge=e;b.steer=null;const P=e.path;let bi=0,best=1e9;
 for(let i=0;i<P.length;i+=2){const dx=P[i][0]-b.x,dy=P[i][1]-b.y,d=dx*dx+dy*dy;if(d<best){best=d;bi=i}}
 b.ei=bi;if(b.route[b.route.length-1]!==e.id)b.route.push(e.id)}
function atNode(b,n){if(n.end||b.dec.has(n.key))return;b.dec.add(n.key);const e=pickOut(n,b);if(!e)return;
 if(n.rx){b.steer={x:e.entry[0],y:e.entry[1],e,t:0,n:n.key};
  if(n.key==='Q2')b.whirl={cx:n.x,cy:n.y,acc:0,last:Math.atan2(b.y-n.y,b.x-n.x),need:(1+Math.random()*1.3)*Math.PI*2,ex:Math.atan2(e.entry[1]-n.y,e.entry[0]-n.x),scored:false}}
 else joinRail(b,e)}
function decide(b){for(const n of DECIDE){if(b.dec.has(n.key))continue;if(n.rx?inEll(n,b.x,b.y,1):Math.hypot(b.x-n.x,b.y-n.y)<5)atNode(b,n)}}
function railStep(b){const e=b.edge,P=e.path,A=e.arc,to=e.to;let bi=b.ei,best=1e9;
 const lo=Math.max(0,bi-8),hi=Math.min(P.length-1,bi+30);
 for(let i=lo;i<=hi;i++){const dx=P[i][0]-b.x,dy=P[i][1]-b.y,d=dx*dx+dy*dy;if(d<best){best=d;bi=i}}
 b.ei=bi;
 if(to.rx){if(inEll(to,b.x,b.y,1)){b.edge=null;if(to.end){dockBoat(b,to);return 'dock'}return null}}
 else if(A[bi]>=e.len-1.5){b.edge=null;atNode(b,to);if(!b.edge)return null;return railStep(b)}
 let ti=bi;const ta=A[bi]+5;while(ti<P.length-1&&A[ti]<ta)ti++;
 const q=P[Math.min(P.length-1,ti+1)],tdx=q[0]-P[ti][0],tdy=q[1]-P[ti][1],tl=Math.hypot(tdx,tdy)||1,lat=Math.sin(G.t*.9+b.ph)*.9;
 const gx=P[ti][0]-tdy/tl*lat-b.x,gy=P[ti][1]+tdx/tl*lat-b.y,gl=Math.hypot(gx,gy)||1;
 const k=cellAt(b.x,b.y),v=velAt(b.x,b.y);let s=clamp(Math.hypot(v[0],v[1])*BOAT.VK,13,34);
 if(FLUME[k]===1)s=42;if(D[k]<.06&&D[cellAt(P[ti][0],P[ti][1])]<.06&&!b.fall)s=2;
 return [gx/gl*s,gy/gl*s]}
function gateChanged(n){for(const b of boats){if(b.st!=='float')continue;
 const idx=b.edge?n.outs.indexOf(b.edge):-1;
 if(idx>=0&&!(n.open<0||n.open===idx)&&b.edge.arc[b.ei]<(Math.hypot(b.edge.gx-n.x,b.edge.gy-n.y)+2)){b.edge=null;b.dec.delete(n.key);b.route.pop();b.freeT=1.2;b.steer={x:n.x,y:n.y,e:null,t:0,n:n.key}}
 else if(b.steer&&b.steer.n===n.key&&b.steer.e){b.dec.delete(n.key);b.steer=null;if(b.whirl)b.whirl=null}}}
function updBoat(b,dt){
 b.age+=dt;if(b.hop>0)b.hop-=dt;
 if(b.st==='fly'){b.t+=dt/b.dur;if(b.t>=1)landBoat(b);return}
 if(b.st==='crash'||b.st==='sink'){b.t+=dt;if(b.st==='sink'&&Math.random()<dt*8){const s=boatScr(b);part(s[0]+(Math.random()-.5)*6,s[1]-2,0,-12,.5,15,0)}if(b.t>1.4)b.dead=true;return}
 if(b.st==='dock'){b.dockT+=dt;const P=b.pond;b.vx+=((P.x-b.x)*.3+(Math.random()-.5)*8)*dt;b.vy+=((P.y-b.y)*.3+(Math.random()-.5)*6)*dt;b.vx*=.97;b.vy*=.97;
  const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;if(inEll(P,nx,ny,.85)){b.x=nx;b.y=ny}else{b.vx*=-.5;b.vy*=-.5}
  b.hv+=(surfAt(b.x,b.y)-b.hv)*Math.min(1,dt*8);if(b.dockT>14)b.dead=true;return}
 const k=cellAt(b.x,b.y);
 if(D[k]<.15){b.dry+=dt;if(b.dry>2.2){sinkBoat(b,'dry');return}}else b.dry=0;
 if(b.freeT>0)b.freeT-=dt;
 const sg0=SEG[k];
 if(b.edge&&sg0===CUSTOM_SEG)b.edge=null;
 if(b.edge&&b.freeT<=0){for(const o of NEAR8){const kk=cellAt(b.x+o[0],b.y+o[1]);if(SEG[kk]===CUSTOM_SEG&&D[kk]>.3){const key='c'+(kk>>4);
    if(!b.dec.has(key)){b.dec.add(key);if(Math.random()<.5){b.edge=null;b.freeT=2;b.steer={x:b.x+o[0]*2,y:b.y+o[1]*2,e:null,t:0,n:key}}}break}}}
 if(!b.edge&&!b.steer&&!b.whirl&&b.freeT<=0&&sg0>0&&sg0<CUSTOM_SEG)joinRail(b,EDGE_BY_ID[sg0]);
 let tx=0,ty=0,rail=null;
 if(b.edge)rail=railStep(b);
 if(rail==='dock')return;
 if(rail){tx=rail[0];ty=rail[1]}
 else{
  decide(b);
  const v=velAt(b.x,b.y),sp=Math.hypot(v[0],v[1]),s=Math.min(BOAT.VMAX,sp*BOAT.VK);
  if(sp>1e-5){tx=v[0]/sp*s;ty=v[1]/sp*s}
  const slow=clamp(1-s/BOAT.NAVV,0,1);
  if(slow>0){const nd=navDir(b.x,b.y);if(nd[2]<1e8){tx+=nd[0]*BOAT.NAVV*slow;ty+=nd[1]*BOAT.NAVV*slow}}
  if(b.whirl){const w=b.whirl,dx=b.x-w.cx,dy=b.y-w.cy,r=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx);let da=a-w.last;
   if(da>Math.PI)da-=2*Math.PI;if(da<-Math.PI)da+=2*Math.PI;w.acc+=Math.abs(da);w.last=a;
   if(!w.scored&&w.acc>=Math.PI*2){w.scored=true;ev(b,'whirl',200,'whirl');onEvent('whirl',{b})}
   const ux=dx/r,uy=dy/r;tx=-uy*17+ux*(6.5-r)*2.4;ty=ux*17+uy*(6.5-r)*2.4;
   if(w.acc>=w.need){let de=a-w.ex;de=((de+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;if(Math.abs(de)<.55)b.whirl=null}
   if(w.acc>w.need+Math.PI*5)b.whirl=null}
  else if(b.steer){const st=b.steer;st.t+=dt;const dx=st.x-b.x,dy=st.y-b.y,dd=Math.hypot(dx,dy);
   if(dd<2.5){b.steer=null;if(st.e)joinRail(b,st.e)}
   else if(st.t>4.5){b.steer=null;const n=NODES[st.n];if(n&&n.outs){let be=null,bd=1e9;n.outs.forEach((e,i)=>{if(n.open<0||n.open===i){const q=Math.hypot(e.entry[0]-b.x,e.entry[1]-b.y);if(q<bd){bd=q;be=e}}});if(be){if(bd<6)joinRail(b,be);else b.steer={x:be.entry[0],y:be.entry[1],e:be,t:0,n:st.n}}}}
   else{tx=tx*.15+dx/dd*BOAT.STEER*.85;ty=ty*.15+dy/dd*BOAT.STEER*.85}}
  const gx=depthAt(b.x+1.5,b.y)-depthAt(b.x-1.5,b.y),gy=depthAt(b.x,b.y+1.5)-depthAt(b.x,b.y-1.5);
  tx+=clamp(gx,-1,1)*BOAT.BANK;ty+=clamp(gy,-1,1)*BOAT.BANK}
 tx+=Math.sin(G.t*2.1+b.ph)*BOAT.WOB;ty+=Math.cos(G.t*1.7+b.ph*1.3)*BOAT.WOB;
 const rep=rail?2.5:4.5;for(const o of boats){if(o===b||o.st!=='float')continue;const dx=b.x-o.x,dy=b.y-o.y,d2=dx*dx+dy*dy;if(d2<12&&d2>.01){const d=Math.sqrt(d2);tx+=dx/d*(3.5-d)*rep;ty+=dy/d*(3.5-d)*rep}}
 if(D[k]<.15){let bd=D[k],bx=0,by=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const q=D[cellAt(b.x+dx,b.y+dy)];if(q>bd+.1){bd=q;bx=dx;by=dy}}if(bx||by){const l=Math.hypot(bx,by);tx+=bx/l*14;ty+=by/l*14}}
 const a=Math.min(1,dt*(b.fall?1.2:rail?5:3.2));b.vx+=(tx-b.vx)*a;b.vy+=(ty-b.vy)*a;
 let nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;
 if(!rail){const ok=(x,y)=>{const kk=cellAt(x,y);if(kk===k)return true;const dd=D[kk];return dd>=.2||dd>=D[k]+.05||(dd>.02&&T[kk]+dd<b.hv-1.2)};
  if(!ok(nx,ny)){if(ok(nx,b.y)){ny=b.y;b.vy*=-.2}else if(ok(b.x,ny)){nx=b.x;b.vx*=-.2}else{nx=b.x;ny=b.y;b.vx*=-.3;b.vy*=-.3}}}
 b.x=clamp(nx,.5,WX-.5);b.y=clamp(ny,.5,WY-1.5);
 b.trT+=dt;if(b.trT>.09){b.trT=0;b.trail.push([Math.round(b.x),Math.round(Y0+b.y-b.hv),Math.floor(b.y)+1]);if(b.trail.length>34)b.trail.shift()}
 if(Math.abs(b.vx)>4)b.flip=b.vx<0;
 const k2=cellAt(b.x,b.y),s2=T[k2]+D[k2];
 if(FLUME[k2]){b.hv+=(s2-b.hv)*Math.min(1,dt*14);b.fall=0}
 else if(b.fall){b.vz+=320*dt;b.hv-=b.vz*dt;if(b.hv<=s2){const drop=b.fall-s2;b.hv=s2;b.fall=0;b.vz=0;const sc=boatScr(b);splash(sc[0],sc[1],drop>5.5?12:5,drop>8);
   if(drop>5.5){b.casc++;const big=Math.abs(b.x-112)<7;ev(b,'cascade',big?200:100,big?'gcascade':(b.casc===1?'cascade':null));onEvent('cascade',{b})}}}
 else if(s2<b.hv-2.5){b.fall=b.hv;b.vz=25}
 else b.hv+=(s2-b.hv)*Math.min(1,dt*10);
 const sg=SEG[k2];
 if(sg===CUSTOM_SEG){if(b.route[b.route.length-1]!==CUSTOM_SEG)b.route.push(CUSTOM_SEG);b.cust+=dt;if(b.cust>1.2&&!b.custDone){b.custDone=true;onEvent('customSail',{b})}}
 if(FLUME[k2]===1)b.inFl=true;else if(b.inFl){b.inFl=false;ev(b,'flume',300,'flume');onEvent('flume',{b})}
 if(TUN[k2])b.inTun=true;else if(b.inTun){b.inTun=false;ev(b,'tunnel',200,'tunnel');onEvent('tunnel',{b})}
 for(const z of ZONES){if(b.zones.has(z.id))continue;if(Math.hypot(b.x-z.x,b.y-z.y)<z.r){b.zones.add(z.id);ev(b,z.l,z.p,z.l);onEvent('zone',{id:z.id,b})}}
 if(G.night)for(const l of lanterns){if(!l.lit&&Math.hypot(b.x-l.x,b.y-l.y)<15){l.lit=true;ev(b,'lantern',50,'lantern');onEvent('lantern',{b});
   if(lanterns.every(q=>q.lit)){G.score+=1000;banner(L('festival'),20);for(let i=0;i<7;i++)G.fw.push({t:-i*.35,x:30+Math.random()*164,y:40+Math.random()*60})}}}
 const pi=POOLI[k2];if(pi){const P=POOLS[pi-1];if(P.end&&inEll(P,b.x,b.y,.9)){dockBoat(b,P);return}}
 if(b.edge||b.steer||b.whirl){b.navT=0;b.navBest=1e9}else{b.navT+=dt;const nv=NAV[k2];if(nv<b.navBest-1){b.navBest=nv;b.navT=0}}
 if(b.navT>8)sinkBoat(b,'stuck');else if(b.age>150)sinkBoat(b,'age')}
function dockBoat(b,P){b.st='dock';b.pond=P;b.dockT=0;b.vx*=.3;b.vy*=.3;if(b.frog)frogOff(b);if(b.demo)return;
 const total=b.pts*P.mult*(b.gold?2:1),s=boatScr(b);G.score+=total;
 popup('+'+total+(P.mult>1?' ×'+P.mult:'')+(b.gold?' ★×2':''),s[0],s[1]-12,P.mult>=5||b.gold?20:P.mult>1?11:1);
 if(G.comboT<1.6){G.combo++;const cb=100*G.combo;G.score+=cb;popup('COMBO ×'+(G.combo+1)+' +'+cb,s[0],s[1]-22,19);sfx('point',G.combo+4)}else G.combo=0;G.comboT=0;
 if(total>G.best)G.best=total;sfx('dock');
 const key=b.route.filter(x=>x!==CUSTOM_SEG).join('-');
 if(b.top&&ROUTES.has(key)&&!G.found.has(key)){G.found.add(key);G.score+=1000;banner(L('newroute')+' '+G.found.size+'/'+ROUTES.size,11);sfx('route');
  G.flash={ids:b.route.slice(),t:0,c:b.pal[0]===1?20:b.pal[0]};G.fw.push({t:0,x:s[0],y:s[1]-30})}
 for(let i=0;i<4+P.mult*4;i++){const a=Math.random()*6.28,v=20+Math.random()*40;part(s[0],s[1]-3,Math.cos(a)*v,Math.sin(a)*v-25,.6+Math.random()*.4,[20,35,1,19,11][i%5],90)}
 if(G.score>G.hi)G.hi=G.score;
 onEvent('dock',{b,P,total});
 let n=0;for(let i=boats.length-1;i>=0;i--){const o=boats[i];if(o.st==='dock'&&o.pond===P&&++n>6)o.dead=true}
 save()}

/* ---------- ranas, carpas, luciernagas ---------- */
function frogOff(b){const f=b.frog;b.frog=null;if(!f)return;f.st='off';f.t=0;f.fx=b.x;f.fy=b.y;f.boat=null;
 const P=b.pond||null;f.tx=P?P.x+(Math.random()-.5)*P.rx:b.x+(Math.random()-.5)*8;f.ty=P?P.y+(Math.random()-.5)*P.ry*.8:b.y+3}
function updFrogs(dt){
 for(const f of frogs){if(f.poke>0)f.poke-=dt;
  if(f.st==='pad'){f.x=f.px;f.y=f.py;f.h=0;for(const b of boats){if(b.st!=='float'||b.frog||b.demo)continue;
    if(Math.hypot(b.x-f.px,b.y-f.py)<8.5){f.st='jump';f.t=0;f.boat=b;b.frog=f;f.fx=f.px;f.fy=f.py;sfx('frog');break}}}
  else if(f.st==='jump'){f.t+=dt/.45;const b=f.boat;if(!b||b.st!=='float'){f.st='gone';f.t=0;if(b)b.frog=null;continue}
   const t=Math.min(1,f.t);f.x=f.fx+(b.x-f.fx)*t;f.y=f.fy+(b.y-f.fy)*t;f.h=Math.sin(t*Math.PI)*9;
   if(f.t>=1){f.st='ride';f.h=0;ev(b,'frog',300,'frog');onEvent('frog',{b})}}
  else if(f.st==='ride'){const b=f.boat;if(!b||(b.st!=='float'&&b.st!=='dock')){f.st='gone';f.t=0;continue}f.x=b.x;f.y=b.y}
  else if(f.st==='off'){f.t+=dt/.5;const t=Math.min(1,f.t);f.x=f.fx+(f.tx-f.fx)*t;f.y=f.fy+(f.ty-f.fy)*t;f.h=Math.sin(t*Math.PI)*7;
   if(f.t>=1){f.st='gone';f.t=0;const k=cellAt(f.x,f.y);splash(f.x,Y0+f.y-(T[k]+D[k]),6)}}
  else if(f.st==='gone'){f.t+=dt;if(f.t>7){f.st='pad';f.t=0;const k=cellAt(f.px,f.py);splash(f.px,Y0+f.py-(T[k]+D[k]),4)}}}}
function updKoi(dt){
 for(const q of kois){if(q.jump>0){q.jump-=dt/.8;if(q.jump<=0){q.jump=0;const k=cellAt(q.x,q.y);splash(q.x,Y0+q.y-(T[k]+D[k]),7);sfx('koi')}continue}
  q.a+=(Math.sin(G.t*.7+q.sp*3)*.9+(Math.random()-.5)*.6)*dt;
  let nx=q.x+Math.cos(q.a)*q.sp*dt,ny=q.y+Math.sin(q.a)*q.sp*.7*dt;
  if(!inEll(q.P,nx,ny,.78)||D[cellAt(nx,ny)]<.8){q.a=Math.atan2(q.P.y-q.y,q.P.x-q.x)+(Math.random()-.5);nx=q.x;ny=q.y}
  q.x=nx;q.y=ny;if(Math.random()<dt*.012&&G.state==='play')q.jump=1}}
function updFireflies(dt){for(const f of fireflies){f.vx+=(Math.random()-.5)*30*dt;f.vy+=(Math.random()-.5)*30*dt;f.vx*=.98;f.vy*=.98;
 f.x=clamp(f.x+f.vx*dt,2,WX-2);f.y=clamp(f.y+f.vy*dt,4,WY-6);f.ph+=dt*(1.5+Math.sin(f.x)*.5)}}

/* ---------- misiones y guardado ---------- */
const MISSIONS=[
 ['throw',t=>t==='throw'],['dock',t=>t==='dock'],['torii',(t,d)=>t==='zone'&&d.id==='torii2'],['gate',t=>t==='gate'],
 ['bridge',(t,d)=>t==='zone'&&d.id==='bridge1'],['casc3',(t,d)=>t==='cascade'&&d.b.casc>=3],['frog',t=>t==='frog'],
 ['flume',t=>t==='flume'],['tunnel',t=>t==='tunnel'],['whirl',t=>t==='whirl'],['gold',(t,d)=>t==='dock'&&d.P.mult===5],
 ['fleet',t=>t==='tick'&&boats.filter(b=>b.st==='float'&&!b.demo).length>=6],['routes8',()=>G.found.size>=8],
 ['night',()=>G.night&&lanterns.filter(l=>l.lit).length>=5],['big',(t,d)=>t==='dock'&&d.total>=3000],
 ['dig',t=>t==='customSail'],['routes16',()=>G.found.size>=16],['routesAll',()=>G.found.size>=ROUTES.size]];
function missionText(){const m=MISSIONS[G.mis];return m?L('m_'+m[0]):L('master')}
function onEvent(t,d){if(G.state!=='play')return;const m=MISSIONS[G.mis];if(!m)return;
 if(m[1](t,d||{})){G.mis++;G.score+=500;if(G.score>G.hi)G.hi=G.score;banner(L('done'),20);sfx('mission');G.fw.push({t:0,x:60+Math.random()*104,y:60});
  if(G.mis>=MISSIONS.length)banner(L('master'),35);save()}}
function save(){try{localStorage.setItem('n8b',JSON.stringify({best:G.best,hi:G.hi,found:[...G.found],mis:G.mis,lang:LANG,snd:AU.mode}))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem('n8b')||'null');if(!s)return;
 G.best=s.best||0;G.hi=s.hi||0;G.found=new Set((s.found||[]).filter(k=>ROUTES.has(k)));G.mis=Math.min(s.mis||0,MISSIONS.length);
 if(s.lang==='es'||s.lang==='en')LANG=s.lang;AU.mode=s.snd|0}catch(e){}}

/* ---------- bucle de juego ---------- */
function updGame(dt){
 G.t+=dt;G.comboT+=dt;
 for(const b of boats)updBoat(b,dt);
 for(let i=boats.length-1;i>=0;i--)if(boats[i].dead)boats.splice(i,1);
 updFrogs(dt);updKoi(dt);if(G.night)updFireflies(dt);
 for(const p of parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;if(p.k===1)p.x+=Math.sin(G.t*3+p.y)*6*dt}
 for(let i=parts.length-1;i>=0;i--)if(parts[i].t>parts[i].life)parts.splice(i,1);
 for(const p of pops)p.t+=dt;for(let i=pops.length-1;i>=0;i--)if(pops[i].t>1.4)pops.splice(i,1);
 if(banners.length){banners[0].t+=dt;if(banners[0].t>2)banners.shift()}
 if(G.flash){G.flash.t+=dt;if(G.flash.t>2.6)G.flash=null}
 for(const f of G.fw){f.t+=dt;if(!f.boom&&f.t>=0){f.boom=true;sfx('boom');const cs=[[17,20,1],[19,18,1],[11,10,1],[15,14,1],[35,20,6]][(Math.random()*5)|0];
   for(let i=0;i<36;i++){const a=i/36*6.283,v=28+Math.random()*16;part(f.x,f.y,Math.cos(a)*v,Math.sin(a)*v,.9+Math.random()*.5,cs[i%3],35,2)}}}
 for(let i=G.fw.length-1;i>=0;i--)if(G.fw[i].t>2)G.fw.splice(i,1);
 if(G.hintT>0)G.hintT-=dt;
 if(Math.random()<dt*1.4)for(const o of DECOR)if(o.s===SP.sakura[0]||o.s===SP.sakura[1]||o.s===SP.sakura[2]){if(Math.random()<.18){const k=cellAt(o.x,o.y);part(o.x+(Math.random()-.5)*14,Y0+o.y-T[k]-12-Math.random()*6,6+Math.random()*6,7+Math.random()*5,3+Math.random()*2,Math.random()<.5?18:19,0,1)}}
 G.tick+=dt;if(G.tick>.5){G.tick=0;onEvent('tick')}
 if(G.state==='title'){G.demoT-=dt;if(G.demoT<=0){G.demoT=2.6;const e=NODES.S;const tx=e.x+(Math.random()-.5)*20,ty=e.y+(Math.random()-.5)*6;const k=cellAt(tx,ty);
   const b=throwBoat(112,300,tx,Y0+ty-(T[k]+D[k]),0,0,70,true)}}}
