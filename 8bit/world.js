'use strict';
/* Nacimiento 8-bit · mundo: terrazas, red de arroyos con muchos caminos y simulacion de agua (modelo de tuberias) */
const WX=224,WY=198,NC=WX*WY;
const GTOP=18,GBOT=264,HMAX=48,Y0=GTOP+HMAX; // fila y a altura h se dibuja en pantalla en Y0+y-h
const T=new Float32Array(NC),TD=new Float32Array(NC),D=new Float32Array(NC),D0=new Float32Array(NC);
const FL=new Float32Array(NC),FR=new Float32Array(NC),FU=new Float32Array(NC),FW=new Float32Array(NC);
const VX=new Float32Array(NC),VY=new Float32Array(NC),GATE=new Float32Array(NC),WL=new Float32Array(NC),NAV=new Float32Array(NC),SEGR=new Float32Array(NC);
const MAT=new Uint8Array(NC),MATD=new Uint8Array(NC),MAT0=new Uint8Array(NC),SEG=new Uint8Array(NC),SEGD=new Uint8Array(NC);
const POOLI=new Uint8Array(NC),FLUME=new Uint8Array(NC),TUN=new Uint8Array(NC),NAVQ=new Int32Array(NC);
const M_GRASS=0,M_MOSS=1,M_PATH=2,M_GRAVEL=3,M_ROCK=4,M_PEBBLE=5,M_BED=6;
const SIM={K:.1,DAMP:.94,Q:3.5,RATE:240};
const CUSTOM_SEG=99;

const LEDGES=[{y:50,p:.3},{y:100,p:1.7},{y:148,p:3.1}];
function ledgeY(L,x){return L.y+2.4*Math.sin(x*.047+L.p)+1.2*Math.sin(x*.121+L.p*2.3)}
function sm01(t){t=t<0?0:t>1?1:t;return t*t*(3-2*t)}
function ground(x,y){let h=HMAX-y*.06;for(const L of LEDGES)h-=12*sm01((y-ledgeY(L,x)+.8)/1.6);return h}

/* ---- red de arroyos: 27 rutas distintas del manantial a los estanques ---- */
const NODES={
 S:{x:112,y:22,rx:17,ry:10,dep:3.5},
 F1:{x:66,y:44},F3:{x:158,y:44},
 P1:{x:112,y:69,rx:13,ry:8,dep:3.2},
 N2:{x:80,y:79},N3:{x:146,y:79},
 Q1:{x:34,y:122,rx:11,ry:7,dep:3},
 Q2:{x:112,y:120,rx:13,ry:9,dep:3.4},
 Q3:{x:184,y:124},
 E1:{x:22,y:180,rx:13,ry:8,end:1,mult:3,nm:0},
 E2:{x:66,y:184,rx:11,ry:7,end:1,mult:2,nm:1},
 E3:{x:112,y:181,rx:21,ry:11,end:1,mult:1,nm:2},
 E4:{x:158,y:184,rx:11,ry:7,end:1,mult:2,nm:3},
 E5:{x:204,y:181,rx:10,ry:7,end:1,mult:5,nm:4}};
const EDGES=[
 [1,'S','F1',[[94,31],[80,37]],3,3.4],
 [2,'S','P1',[[112,34],[112,44],[112,55]],3.2,3.4],
 [3,'S','F3',[[130,31],[144,37]],3,3.4],
 [4,'F1','Q1',[[55,51],[50,64],[46,80],[42,97],[37,111]],2.6,3],
 [5,'F1','N2',[[74,52],[79,63]],2.6,3],
 [6,'P1','N2',[[99,74]],2.6,3],
 [7,'P1','Q2',[[112,80],[113,90],[112,101]],2.6,3],
 [8,'P1','N3',[[125,74]],2.6,3],
 [9,'F3','N3',[[150,52],[146,64]],2.6,3],
 [10,'F3','Q3',[[171,51],[186,62],[196,76],[198,90],[196,103],[190,114]],2.6,3,{tunnel:[80,95]}],
 [11,'N2','Q1',[[67,89],[55,101],[44,114]],2.6,3],
 [12,'N2','Q2',[[89,90],[97,102],[104,112]],2.6,3],
 [13,'N3','Q2',[[137,89],[127,102],[120,112]],2.6,3],
 [14,'N3','Q3',[[155,89],[165,101],[174,113]],2.6,3,{flume:[11,10]}],
 [15,'Q1','E1',[[28,134],[24,148],[22,163]],2.6,3],
 [16,'Q1','E2',[[42,134],[53,148],[61,165]],2.6,3],
 [17,'Q2','E2',[[100,133],[86,148],[73,166]],2.6,3],
 [18,'Q2','E3',[[112,134],[112,148],[112,161]],3.2,3.2],
 [19,'Q2','E4',[[124,133],[138,148],[151,166]],2.6,3],
 [20,'Q3','E4',[[177,135],[167,148],[161,166]],2.6,3],
 [21,'Q3','E5',[[192,135],[203,148],[205,166]],2.6,3]];
const EDGE_BY_ID={};
const POOLS=[],DECIDE=[],ENDS=[];let SRC=[],ROUTES=new Set(),ROUTE_LIST=[];

function cr(a,b,c,d,t,t2,t3){return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3)}
function buildPath(pts){const P=[pts[0],...pts,pts[pts.length-1]],out=[];
 for(let i=1;i<P.length-2;i++){const p0=P[i-1],p1=P[i],p2=P[i+1],p3=P[i+2],L=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]),n=Math.max(2,Math.ceil(L/.35));
  for(let s=0;s<n;s++){const t=s/n,t2=t*t,t3=t2*t;out.push([cr(p0[0],p1[0],p2[0],p3[0],t,t2,t3),cr(p0[1],p1[1],p2[1],p3[1],t,t2,t3)])}}
 out.push(pts[pts.length-1].slice());return out}
function idxAt(arc,a){for(let i=0;i<arc.length;i++)if(arc[i]>=a)return i;return arc.length-1}

function carvePath(e,bed0){
 const P=e.path,L=P.length,beds=new Float32Array(L),arc=new Float32Array(L);let bed=bed0;
 for(let i=0;i<L;i++){if(i)arc[i]=arc[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
  bed=Math.min(bed-.004,ground(P[i][0],P[i][1])-e.dep);beds[i]=bed}
 const tot=arc[L-1];e.arc=arc;e.len=tot;
 let f0=-1,f1=-1;
 if(e.flume){f0=e.flume[0];f1=tot-e.flume[1];const i0=idxAt(arc,f0),i1=idxAt(arc,f1),b0=beds[i0],b1=beds[i1];
  for(let i=i0;i<=i1;i++)beds[i]=b0+(b1-b0)*(arc[i]-arc[i0])/(arc[i1]-arc[i0]||1)}
 e.beds=beds;
 const hw=e.hw,R=Math.ceil(hw+3.6);
 for(let i=0;i<L;i++){const x=P[i][0],y=P[i][1],b=beds[i],cx=Math.round(x),cy=Math.round(y);
  const lab=e.id&&arc[i]>5&&arc[i]<tot-5,inFl=e.flume&&arc[i]>=f0&&arc[i]<=f1,inTun=e.tunnel&&y>=e.tunnel[0]&&y<=e.tunnel[1];
  for(let j=cy-R;j<=cy+R;j++){if(j<0||j>=WY)continue;
   for(let ii=cx-R;ii<=cx+R;ii++){if(ii<0||ii>=WX)continue;const k=j*WX+ii,r=Math.hypot(ii-x,j-y);
    if(inTun&&r<=hw+1.5)TUN[k]=1;
    if(inFl){const tq=P[Math.min(L-1,i+2)],tp=P[Math.max(0,i-2)],tl=Math.hypot(tq[0]-tp[0],tq[1]-tp[1])||1,al=Math.abs((ii-x)*(tq[0]-tp[0])+(j-y)*(tq[1]-tp[1]))/tl;
     if(r<=hw-.5){T[k]=b+(r/hw)*(r/hw)*.8;FLUME[k]=1;MAT[k]=M_BED;if(b+.9>WL[k])WL[k]=b+.9;if(lab&&r<SEGR[k]){SEG[k]=e.id;SEGR[k]=r}}
     else if(r<=hw+1.6&&al<.7&&FLUME[k]!==1){T[k]=b+2.4;FLUME[k]=2;MAT[k]=M_BED}
     continue}
    if(r<=hw){if(FLUME[k]===2)continue;const v=b+(r/hw)*(r/hw)*e.dep*.45;if(v<T[k])T[k]=v;if(!POOLI[k])MAT[k]=M_BED;if(b+1.1>WL[k])WL[k]=b+1.1;
     if(lab&&!POOLI[k]&&r<SEGR[k]){SEG[k]=e.id;SEGR[k]=r}}
    else if(r<=hw+1.4){if(MAT[k]===M_GRASS||MAT[k]===M_MOSS||MAT[k]===M_GRAVEL)MAT[k]=M_PEBBLE}
    else if(r<=hw+3.6){if(MAT[k]===M_GRASS&&hash2(ii,j)<.55)MAT[k]=M_MOSS}}}}
 return beds[L-1]}

function digPool(n,sill,dep){const id=POOLS.length+1;POOLS.push(n);n.pid=id;n.sill=sill;
 const R=Math.ceil(Math.max(n.rx,n.ry)*1.3+2);
 for(let j=Math.round(n.y)-R;j<=Math.round(n.y)+R;j++){if(j<0||j>=WY)continue;
  for(let i=Math.round(n.x)-R;i<=Math.round(n.x)+R;i++){if(i<0||i>=WX)continue;
   const k=j*WX+i,dx=(i-n.x)/n.rx,dy=(j-n.y)/n.ry,q=dx*dx+dy*dy;
   if(q<=1){const v=sill-dep*Math.pow(1-q,.55);if(v<T[k])T[k]=v;POOLI[k]=id;MAT[k]=M_BED;SEG[k]=0;SEGR[k]=99;if(sill+.8>WL[k])WL[k]=sill+.8}
   else if(q<=1.5){const v=sill+1+(q-1)*4;if(v<T[k])T[k]=v;if(MAT[k]!==M_BED)MAT[k]=M_PEBBLE}}}}
function inEll(n,x,y,s){const dx=(x-n.x)/(n.rx*s),dy=(y-n.y)/(n.ry*s);return dx*dx+dy*dy<=1}

function buildWorld(){
 for(let y=0,k=0;y<WY;y++)for(let x=0;x<WX;x++,k++){T[k]=ground(x,y);MAT[k]=M_GRASS}
 WL.fill(-99);SEG.fill(0);SEGR.fill(99);POOLI.fill(0);FLUME.fill(0);TUN.fill(0);
 for(let y=0,k=0;y<WY;y++)for(let x=0;x<WX;x++,k++){
  if(((x-112)/27)**2+((y-8)/8)**2<1&&hash2(x,y)<.85)MAT[k]=M_ROCK;
  const qg=((x-21)/15)**2+((y-76)/17)**2;if(qg<1)MAT[k]=qg>.86?M_PEBBLE:M_GRAVEL}
 MAT0.set(MAT);
 for(const key in NODES){const n=NODES[key];n.key=key;n.ins=[];n.outs=[];n.inBeds=[];n.open=-1}
 const E=EDGES.map(a=>{const e={id:a[0],from:NODES[a[1]],to:NODES[a[2]],wp:a[3],hw:a[4],dep:a[5]};Object.assign(e,a[6]||{});EDGE_BY_ID[e.id]=e;return e});
 for(const e of E){e.from.outs.push(e);e.to.ins.push(e)}
 const S=NODES.S;S.out=ground(S.x,S.y)-3.4;digPool(S,S.out,S.dep);
 for(const e of E){const f=e.from;
  if(f.out===undefined){f.out=Math.min(...f.inBeds)-(f.rx?.35:.05);if(f.rx)digPool(f,f.out,f.dep)}
  e.path=buildPath([[f.x,f.y],...e.wp,[e.to.x,e.to.y]]);
  e.to.inBeds.push(carvePath(e,f.out))}
 for(const key of ['E1','E2','E3','E4','E5']){const n=NODES[key];n.out=Math.min(...n.inBeds)-.4;digPool(n,n.out,4);ENDS.push(n);
  const d={id:0,hw:1.7,dep:2.4,path:buildPath([[n.x,n.y],[n.x,n.y+n.ry+3],[n.x,WY-1]])};carvePath(d,n.out)}
 for(const n of POOLS){n.cells=[];n.ck=Math.round(n.y)*WX+Math.round(n.x);for(let k=0;k<NC;k++)if(POOLI[k]===n.pid)n.cells.push(k)}
 /* sin etiqueta de tramo cerca de nodos: asi la ruta de cada barco queda limpia */
 for(let y=0,k=0;y<WY;y++)for(let x=0;x<WX;x++,k++){if(!SEG[k])continue;
  for(const key in NODES){const n=NODES[key];if(n.rx?inEll(n,x,y,1.25):Math.hypot(x-n.x,y-n.y)<5){SEG[k]=0;break}}}
 /* pasaderas dentro del arroyo 7 */
 for(const s of [[110,86],[114,89]])for(let j=0;j<2;j++)for(let i=0;i<2;i++){const k=(s[1]+j)*WX+s[0]+i;T[k]+=2.7}
 /* compuertas en cada bifurcacion */
 for(const key in NODES){const n=NODES[key];if(n.outs.length<2)continue;DECIDE.push(n);
  n.outs.forEach(e=>{let a0=7;if(n.rx){for(let i=0;i<e.path.length;i++){if(!inEll(n,e.path[i][0],e.path[i][1],1)){a0=e.arc[i]+3;break}}}
   const i=idxAt(e.arc,a0),p=e.path[i],q=e.path[Math.min(e.path.length-1,i+4)],dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1;
   e.gx=p[0];e.gy=p[1];e.tx=dx/l;e.ty=dy/l;e.gateCells=[];const R=Math.ceil(e.hw+3);
   for(let j=Math.round(p[1])-R;j<=Math.round(p[1])+R;j++)for(let ii=Math.round(p[0])-R;ii<=Math.round(p[0])+R;ii++){
    if(j<0||j>=WY||ii<0||ii>=WX)continue;const rx=ii-p[0],ry=j-p[1],al=rx*e.tx+ry*e.ty,ac=-rx*e.ty+ry*e.tx;
    if(Math.abs(al)<=1&&Math.abs(ac)<=e.hw+1.6)e.gateCells.push(j*WX+ii)}
   const ie=idxAt(e.arc,a0+5);e.entry=[e.path[ie][0],e.path[ie][1]];
   const ax=e.entry[0]-n.x,ay=e.entry[1]-n.y,ang=Math.atan2(ay,ax)*180/Math.PI;
   e.arrow=ang<25?'right':ang<70?'dr':ang<110?'down':ang<155?'dl':'left'})}
 /* manantial */
 SRC=[{cells:[],q:SIM.Q}];
 for(let j=11;j<=16;j++)for(let i=109;i<=115;i++)if(Math.hypot(i-112,j-13.5)<=2.6&&POOLI[j*WX+i])SRC[0].cells.push(j*WX+i);
 /* todas las rutas validas (DFS) */
 const dfs=(n,acc)=>{if(n.end){const k=acc.join('-');ROUTES.add(k);ROUTE_LIST.push(k);return}for(const e of n.outs)dfs(e.to,acc.concat(e.id))};
 dfs(S,[]);
 for(let k=0;k<NC;k++)D[k]=Math.max(0,WL[k]-T[k]);
 TD.set(T);MATD.set(MAT);SEGD.set(SEG);
 for(let i=0;i<700;i++)simStep();
 D0.set(D)}

function resetWorld(){T.set(TD);MAT.set(MATD);SEG.set(SEGD);D.set(D0);GATE.fill(0);FL.fill(0);FR.fill(0);FU.fill(0);FW.fill(0);VX.fill(0);VY.fill(0);
 for(const n of DECIDE)n.open=-1}

/* ---- simulacion: modelo de tuberias con flujo proporcional a la profundidad aguas arriba ---- */
function simStep(){const K=SIM.K,DM=SIM.DAMP;
 for(const s of SRC){if(!s.cells.length)continue;const q=s.q/s.cells.length;for(const c of s.cells)D[c]+=q}
 let k=0;
 for(let y=0;y<WY;y++){for(let x=0;x<WX;x++,k++){const d=D[k];
  if(d<=0){FL[k]=0;FR[k]=0;FU[k]=0;FW[k]=0;continue}
  const h=T[k]+GATE[k]+d,kd=K*(d<1.5?d:1.5);let fl=0,fr=0,fu=0,fw=0,n;
  if(x>0){n=k-1;fl=FL[k]*DM+kd*(h-T[n]-GATE[n]-D[n]);if(fl<0)fl=0}
  if(x<WX-1){n=k+1;fr=FR[k]*DM+kd*(h-T[n]-GATE[n]-D[n]);if(fr<0)fr=0}
  if(y>0){n=k-WX;fu=FU[k]*DM+kd*(h-T[n]-GATE[n]-D[n]);if(fu<0)fu=0}
  if(y<WY-1){n=k+WX;fw=FW[k]*DM+kd*(h-T[n]-GATE[n]-D[n]);if(fw<0)fw=0}
  const s=fl+fr+fu+fw;if(s>d*.95){const c=d*.95/s;fl*=c;fr*=c;fu*=c;fw*=c}
  FL[k]=fl;FR[k]=fr;FU[k]=fu;FW[k]=fw}}
 k=0;
 for(let y=0;y<WY;y++){for(let x=0;x<WX;x++,k++){
  let v=D[k]-FL[k]-FR[k]-FU[k]-FW[k];
  if(x>0)v+=FR[k-1];if(x<WX-1)v+=FL[k+1];if(y>0)v+=FW[k-WX];if(y<WY-1)v+=FU[k+WX];
  if(v<.02){v-=.0006;if(v<0)v=0}
  D[k]=v}}
 for(let x=0,k2=(WY-1)*WX;x<WX;x++,k2++)D[k2]=0;
 /* rebosadero oculto: un estanque con salidas cerradas no inunda el jardin */
 for(const n of POOLS){if(n.end||!n.cells)continue;const s=T[n.ck]+D[n.ck]-(n.sill+2.6);if(s>0){const r=s*.3;for(const c of n.cells){const v=D[c]-r;D[c]=v>0?v:0}}}}
function updVel(){let k=0;
 for(let y=0;y<WY;y++)for(let x=0;x<WX;x++,k++){const d=D[k];
  if(d<.06){VX[k]*=.7;VY[k]*=.7;continue}
  const fx=((x>0?FR[k-1]:0)-FL[k]+FR[k]-(x<WX-1?FL[k+1]:0))*.5,fy=((y>0?FW[k-WX]:0)-FU[k]+FW[k]-(y<WY-1?FU[k+WX]:0))*.5,dd=d<.3?.3:d;
  VX[k]=VX[k]*.75+fx/dd*.25;VY[k]=VY[k]*.75+fy/dd*.25}}
/* distancia por el agua hasta un estanque final: guia a los barcos en aguas lentas */
function computeNav(){NAV.fill(1e9);let qh=0,qt=0;
 for(let k=0;k<NC;k++){const p=POOLI[k];if(p&&POOLS[p-1].end&&D[k]>.2){NAV[k]=0;NAVQ[qt++]=k}}
 while(qh<qt){const k=NAVQ[qh++],x=k%WX,nv=NAV[k]+1;let n;
  n=k-1;if(x>0&&NAV[n]>nv&&D[n]>.18&&!GATE[n]){NAV[n]=nv;NAVQ[qt++]=n}
  n=k+1;if(x<WX-1&&NAV[n]>nv&&D[n]>.18&&!GATE[n]){NAV[n]=nv;NAVQ[qt++]=n}
  n=k-WX;if(k>=WX&&NAV[n]>nv&&D[n]>.18&&!GATE[n]){NAV[n]=nv;NAVQ[qt++]=n}
  n=k+WX;if(k<NC-WX&&NAV[n]>nv&&D[n]>.18&&!GATE[n]){NAV[n]=nv;NAVQ[qt++]=n}}}

/* ---- muestreo ---- */
function cellAt(x,y){const i=x<0?0:x>=WX?WX-1:x|0,j=y<0?0:y>=WY?WY-1:y|0;return j*WX+i}
function depthAt(x,y){return D[cellAt(x,y)]}
function surfAt(x,y){const k=cellAt(x,y);return T[k]+D[k]}
function velAt(x,y){const fx=x-.5,fy=y-.5,x0=clamp(Math.floor(fx),0,WX-2),y0=clamp(Math.floor(fy),0,WY-2),tx=clamp(fx-x0,0,1),ty=clamp(fy-y0,0,1),k=y0*WX+x0;
 const a=(1-tx)*(1-ty),b=tx*(1-ty),c=(1-tx)*ty,d=tx*ty;
 return [VX[k]*a+VX[k+1]*b+VX[k+WX]*c+VX[k+WX+1]*d,VY[k]*a+VY[k+1]*b+VY[k+WX]*c+VY[k+WX+1]*d]}
function navDir(x,y){const cx=x|0,cy=y|0;let best=1e9,bx=0,by=0;
 for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(!dx&&!dy)continue;const xx=cx+dx,yy=cy+dy;if(xx<0||yy<0||xx>=WX||yy>=WY)continue;
  const v=NAV[yy*WX+xx]+Math.hypot(dx,dy)*.01;if(v<best){best=v;bx=dx;by=dy}}
 if(best>=NAV[cy*WX+cx])return [0,0,best];const l=Math.hypot(bx,by)||1;return [bx/l,by/l,best]}

/* ---- compuertas ---- */
function setGate(n,open){n.open=open;n.outs.forEach((e,i)=>{const cl=!(open<0||open===i);for(const c of e.gateCells)GATE[c]=cl?4.5:0})}
function cycleGate(n){let o=n.open+1;if(o>=n.outs.length)o=-1;setGate(n,o)}

/* ---- pala y tierra ---- */
function digStroke(pts){if(pts.length<2)return false;
 const a=pts[0],b=pts[pts.length-1];if(surfAt(a[0],a[1])<surfAt(b[0],b[1]))pts.reverse();
 const P=[];for(let i=0;i<pts.length-1;i++){const p=pts[i],q=pts[i+1],L=Math.hypot(q[0]-p[0],q[1]-p[1]),n=Math.max(1,Math.ceil(L/.35));for(let s=0;s<n;s++)P.push([p[0]+(q[0]-p[0])*s/n,p[1]+(q[1]-p[1])*s/n])}
 P.push(pts[pts.length-1]);if(P.length<4)return false;
 const k0=cellAt(P[0][0],P[0][1]);let bed=D[k0]>.3?T[k0]:ground(P[0][0],P[0][1])-2.6;
 const hw=2.2,R=4;
 for(const p of P){const x=p[0],y=p[1];bed=Math.min(bed-.004,ground(x,y)-2.6);
  const cx=Math.round(x),cy=Math.round(y);
  for(let j=cy-R;j<=cy+R;j++){if(j<0||j>=WY-1)continue;for(let i=cx-R;i<=cx+R;i++){if(i<0||i>=WX)continue;
   const k=j*WX+i,r=Math.hypot(i-x,j-y);if(FLUME[k])continue;
   if(r<=hw){const v=bed+(r/hw)*(r/hw)*1.2;if(v<T[k])T[k]=v;if(!POOLI[k]){MAT[k]=M_BED;if(!SEG[k])SEG[k]=CUSTOM_SEG}}
   else if(r<=hw+1.3&&(MAT[k]===M_GRASS||MAT[k]===M_MOSS||MAT[k]===M_GRAVEL))MAT[k]=M_PEBBLE}}}
 return true}
function fillAt(x,y){let ch=false;const cx=Math.round(x),cy=Math.round(y);
 for(let j=cy-3;j<=cy+3;j++){if(j<0||j>=WY-1)continue;for(let i=cx-3;i<=cx+3;i++){if(i<0||i>=WX)continue;
  const k=j*WX+i;if(Math.hypot(i-x,j-y)>2.8||FLUME[k]||POOLI[k])continue;const g=ground(i,j);
  if(T[k]<g-.01){T[k]=Math.min(g,T[k]+.9);ch=true;if(T[k]>=g-.05){MAT[k]=MAT0[k];if(SEG[k]===CUSTOM_SEG)SEG[k]=0}}}}
 return ch}
