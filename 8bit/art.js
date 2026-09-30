'use strict';
/* Nacimiento 8-bit · arte: paleta NES, fuente de pixeles, sprites y dibujo en el framebuffer indexado */
const W=224,H=288;
const PAL_HEX=['000000','fcfcfc','bcbcbc','7c7c7c','503000','ac7c00','fca044','f0d0b0','005800','00a800',
 '58d854','b8f818','0000bc','0058f8','3cbcfc','a4e4fc','a80020','f83800','f85898','f8b8f8',
 'f8b800','e45c10','4428bc','004058','008888','fce0a8','881400','d8f878','6844fc','9878f8',
 '00e8d8','e40058','6888fc','b8b8f8','007800','f8d878'];
/* noche: cada color se cambia por otro de la misma paleta (palette swap al estilo NES) */
const NIGHT_MAP=[0,33,32,22,0,23,6,22,0,23,24,24,12,12,13,14,16,16,29,33,20,26,22,0,23,33,0,24,22,28,14,16,22,32,23,35];
function hex2abgr(h){const r=parseInt(h.substr(0,2),16),g=parseInt(h.substr(2,2),16),b=parseInt(h.substr(4,2),16);return (255<<24|b<<16|g<<8|r)>>>0}
const LUT_DAY=new Uint32Array(36),LUT_NIGHT=new Uint32Array(36);
for(let i=0;i<36;i++){LUT_DAY[i]=hex2abgr(PAL_HEX[i])}
/* luz de farol: tono calido dentro del circulo iluminado */
const WARM_MAP=[0,25,7,5,4,5,6,25,4,5,20,35,12,13,14,15,16,17,18,19,20,21,22,4,5,25,26,35,28,29,30,31,2,1,4,35];
const LUT_WARM=new Uint32Array(36);
for(let i=0;i<36;i++){LUT_NIGHT[i]=LUT_DAY[NIGHT_MAP[i]];LUT_WARM[i]=LUT_DAY[WARM_MAP[i]]}

const FB=new Uint8Array(W*H),ZB=new Int16Array(W*H),PICK=new Int32Array(W*H),LIT=new Uint8Array(W*H);
let CLIPT=0,CLIPB=H,MARKLIT=false;

function hash2(x,y){let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296}
function clamp(v,a,b){return v<a?a:v>b?b:v}

function pset(x,y,c){x|=0;y|=0;if(x<0||x>=W||y<CLIPT||y>=CLIPB)return;const p=y*W+x;FB[p]=c;if(MARKLIT)LIT[p]=3}
function rect(x,y,w,h,c){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)pset(i,j,c)}
function frame(x,y,w,h,c){for(let i=x;i<x+w;i++){pset(i,y,c);pset(i,y+h-1,c)}for(let j=y;j<y+h;j++){pset(x,j,c);pset(x+w-1,j,c)}}
function dither(x,y,w,h){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if((i+j)&1)pset(i,j,0)}

/* ---------- fuente 5x7 (mayusculas, numeros, signos y tildes) ---------- */
const FONT_SRC={
 A:'0e11111f111111',B:'1e11111e11111e',C:'0e11101010110e',D:'1e11111111111e',E:'1f10101e10101f',F:'1f10101e101010',
 G:'0e11101711110f',H:'1111111f111111',I:'0e04040404040e',J:'0702020202120c',K:'11121418141211',L:'1010101010101f',
 M:'111b1515111111',N:'11111915131111',O:'0e11111111110e',P:'1e11111e101010',Q:'0e11111115120d',R:'1e11111e141211',
 S:'0f10100e01011e',T:'1f040404040404',U:'1111111111110e',V:'11111111110a04',W:'1111111515150a',X:'11110a040a1111',
 Y:'1111110a040404',Z:'1f01020408101f','0':'0e11131519110e','1':'040c040404040e','2':'0e11010204081f',
 '3':'1f02040201110e','4':'02060a121f0202','5':'1f101e0101110e','6':'0608101e11110e','7':'1f010204080808',
 '8':'0e11110e11110e','9':'0e11110f01020c',' ':'00000000000000','.':'00000000000c0c',',':'000000000c0408',
 ':':'000c0c000c0c00',';':'000c0c000c0408','!':'04040404040004','¡':'04000404040404','?':'0e110102040004',
 '¿':'0400040810110e','-':'0000001f000000','+':'0004041f040400','×':'0000110a040a11','/':'01010204081010',
 "'":'04040800000000','"':'0a0a0000000000','(':'02040808080402',')':'08040202020408','%':'18190204081303',
 '*':'00150e1f0e1500','<':'02040810080402','>':'08040201020408','=':'00001f001f0000','#':'0a0a1f0a1f0a0a',
 '_':'0000000000001f','★':'04041f0e0e1b11','♥':'000a1f1f0e0400','←':'0004081f080400','→':'0004021f020400',
 '↓':'04040404150e04','↑':'040e1504040404','·':'00000c0c000000','▶':'080c0e0f0e0c08','♪':'0f090909091b1b'};
const FONT={};
for(const ch in FONT_SRC){const s=FONT_SRC[ch],a=new Uint8Array(7);for(let i=0;i<7;i++)a[i]=parseInt(s.substr(i*2,2),16);FONT[ch]=a}
const ACC={'Á':['A',[[2,-1],[3,-2]]],'É':['E',[[2,-1],[3,-2]]],'Í':['I',[[2,-1],[3,-2]]],'Ó':['O',[[2,-1],[3,-2]]],
 'Ú':['U',[[2,-1],[3,-2]]],'Ü':['U',[[1,-2],[3,-2]]],'Ñ':['N',[[0,-1],[1,-2],[2,-1],[3,-2]]]};
function glyph(ch,x,y,c,sc){let base=ch,acc=null;const a=ACC[ch];if(a){base=a[0];acc=a[1]}
 const g=FONT[base]||FONT['?'];
 for(let r=0;r<7;r++){const b=g[r];if(!b)continue;for(let q=0;q<5;q++)if(b&(16>>q))rect(x+q*sc,y+r*sc,sc,sc,c)}
 if(acc)for(const p of acc)rect(x+p[0]*sc,y+p[1]*sc,sc,sc,c)}
function text(s,x,y,c,sh,sc){sc=sc||1;s=String(s).toUpperCase();let cx=x|0;y|=0;
 for(const ch of s){if(ch!==' '){if(sh!==undefined&&sh>=0)glyph(ch,cx+sc,y+sc,sh,sc);glyph(ch,cx,y,c,sc)}cx+=6*sc}}
function textW(s,sc){return ([...String(s)].length*6-1)*(sc||1)}
function textC(s,cx,y,c,sh,sc){text(s,Math.round(cx-textW(s,sc)/2),y,c,sh,sc)}

/* ---------- sprites ---------- */
function spr(rows){const h=rows.length,w=rows[0].length,d=new Int8Array(w*h);
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const ch=rows[j][i];
  d[j*w+i]=ch==='.'?-1:(ch>='A'&&ch<='Z')?-2-(ch.charCodeAt(0)-65):parseInt(ch,36)}
 return {w,h,d}}
function mkSpr(w,h,fn){const d=new Int8Array(w*h);for(let j=0;j<h;j++)for(let i=0;i<w;i++){const v=fn(i,j);d[j*w+i]=(v===undefined||v===null)?-1:v}return {w,h,d}}
function outline(s,col){const w=s.w+2,h=s.h+2,d=new Int8Array(w*h).fill(-1);
 for(let j=0;j<s.h;j++)for(let i=0;i<s.w;i++)d[(j+1)*w+i+1]=s.d[j*s.w+i];
 const o=d.slice();
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(d[j*w+i]!==-1)continue;
  if((i>0&&d[j*w+i-1]!==-1)||(i<w-1&&d[j*w+i+1]!==-1)||(j>0&&d[(j-1)*w+i]!==-1)||(j<h-1&&d[(j+1)*w+i]!==-1))o[j*w+i]=col}
 return {w,h,d:o}}
function subArr(o){const a=new Int8Array(26).fill(-1);for(const k in o)a[k.charCodeAt(0)-65]=o[k];return a}
function transpose(s){return mkSpr(s.h,s.w,(i,j)=>s.d[i*s.w+j])}
/* blit con prueba de profundidad: el pixel se dibuja si el terreno ahi no esta mas cerca (fila mayor) que z */
function blit(s,x,y,z,flip,sub,rows){x=Math.round(x);y=Math.round(y);const w=s.w,h=rows||s.h,d=s.d,useZ=z!==undefined&&z!==null;
 for(let j=0;j<h;j++){const py=y+j;if(py<CLIPT||py>=CLIPB)continue;const row=py*W;
  for(let i=0;i<w;i++){const px=x+i;if(px<0||px>=W)continue;let c=d[j*w+(flip?w-1-i:i)];if(c===-1)continue;
   if(c<-1){c=sub?sub[-c-2]:0;if(c<0)continue}
   const p=row+px;if(useZ&&ZB[p]>z)continue;FB[p]=c;if(MARKLIT)LIT[p]=3}}}

const SP={};
SP.boat=spr([".....0.....","....0P0....","...0PPQ0...","..0PPPQQ0..","0000PPQ0000","0PPPPPPPPQ0",".0PPPPPPQ0.","..0000000.."]);
SP.frog=spr([".0...0.","0a0.0a0","0aaaaa0","09aaa90",".09.90."]);
SP.lily=spr([".99a99.","9aaa.a9",".9aaa9."]);
SP.lotus=spr(["..j..",".jij.","jiiij",".999."]);
SP.koi=spr(["K...KK.",".KLKKLK","K...KK."]);
SP.koiV=transpose(SP.koi);
SP.stone=outline(spr([".223.","23333",".333."]),0);
SP.lantern=outline(spr(["...2...","..222..",".22223.","2222333",".03330.",".3WWW3.",".3WWW3.",".03330.","..323..","..323..",".22333.","3333333"]),0);
SP.toriiS=spr(["0...........0","0000000000000",".hhhhhhhhhhh.","..hg.....hg..",".hhhhhhhhhhh.","..hg.....hg..","..hg.....hg..","..hg.....hg..","..hg.....hg..","..hg.....hg..",".000.....000."]);
SP.toriiB=spr(["0.................0","0000000000000000000",".00000000000000000.","..hhhhhhhhhhhhhhh..","....hg.......hg....","..hhhhhhhhhhhhhhh..","....hg.......hg....","....hg.......hg....","....hg.......hg....","....hg.......hg....","....hg.......hg....","....hg.......hg....","....hg.......hg....","....hg.......hg....","...000.......000..."]);
SP.sign=spr(["444444444","455555554","455555554","455555554","455555554","455555554","455555554","455555554","444444444","....4....","....4...."]);
SP.slab=spr(["0222222222220","0333333333330",".00000000000."]);
SP.tsuku=spr(["......0000",".....09aa0","..3330000.",".32dd23...","32dddd23..","33222233..",".333333..."]);
SP.monkA=spr(["..77...",".7777..","..77..5",".4444.5","444445.",".4444..",".4444..",".4..4..",".0..0.."]);
SP.monkB=spr(["..77...",".7777..","..77...",".44445.","44444.5",".4444..",".4444..",".4..4..",".0..0.."]);
const ARROWS={all:["..1..","..1..",".111.","1.1.1","1.1.1"],down:["..1..","..1..","1.1.1",".111.","..1.."],
 dl:["....1","...1.","1.1..","11...","111.."],dr:["1....",".1...","..1.1","...11","..111"],
 left:["..1..",".1...","11111",".1...","..1.."],right:["..1..","...1.","11111","...1.","..1.."]};
for(const k in ARROWS)ARROWS[k]=spr(ARROWS[k]);

function genSakura(seed){const C=[[8,6,6],[4,9,4.2],[12,9,4.2],[8,3,4],[12,5,3.5],[4,5,3.5]];
 return outline(mkSpr(17,19,(i,j)=>{let inC=false;for(const c of C){const dx=i-c[0],dy=j-c[1];if(dx*dx+dy*dy<=c[2]*c[2]){inC=true;break}}
  if(inC&&j<=13){const n=hash2(i+seed*31,j+seed*17),l=(i-8)*.55+(j-7)*.8;
   if(l<-3.2)return n<.35?1:19;if(l<.5)return n<.12?19:18;if(l<3.5)return n<.15?18:31;return n<.5?31:16}
  if(j>=11&&(i===8||i===9))return i===8?26:4;
  if((j===11&&i===7)||(j===10&&i===6)||(j===12&&i===10)||(j===11&&i===11)||(j===18&&(i===7||i===10)))return 26;
  return -1}),0)}
function genPine(seed){const P=[[8,4,5,2.6],[4,9,4,2.2],[13,8,4,2.2],[8,13,6,2.6]];
 return outline(mkSpr(17,20,(i,j)=>{for(const p of P){const dx=(i-p[0])/p[2],dy=(j-p[1])/p[3];if(dx*dx+dy*dy<=1){const n=hash2(i+seed,j*3);
   if(dy<-.45)return n<.3?10:9;if(dy<.3)return n<.2?9:34;return n<.3?34:8}}
  const tx=8+Math.round(Math.sin(j*.5+seed)*1.2);
  if(j>=14&&(i===tx||i===tx+1))return i===tx?5:4;
  if(j>=5&&j<14&&i===8+Math.round(Math.sin(j*.6)))return 4;
  return -1}),0)}
function genBamboo(seed){const st=[[2,4],[5,0],[8,2],[10,6]],lv=[[-1,1],[-2,1],[-3,2],[2,2],[3,2],[4,3],[-1,4],[-2,5],[2,6],[3,7]];
 return outline(mkSpr(13,24,(i,j)=>{for(const s of st){if(j>=s[1]+3){if(i===s[0])return ((j-s[1])%5===0)?8:10;if(i===s[0]+1)return ((j-s[1])%5===0)?8:9}}
  for(const s of st)for(const l of lv)if(i===s[0]+l[0]&&j===s[1]+l[1])return hash2(i+seed,j)<.5?9:10;
  return -1}),0)}
function genRock(w,h,seed){return outline(mkSpr(w,h,(i,j)=>{const cx=(w-1)/2,cy=(h-1)/2+.3,dx=(i-cx)/(w/2),dy=(j-cy)/(h/2);
  if(dx*dx+dy*dy+hash2(i+seed,j)*.18>1)return -1;const l=dx*.6+dy*.9,n=hash2(i*3+seed,j*5);
  if(l<-.55)return n<.4?1:2;if(l<.25)return n<.15?2:3;return n<.5?3:23}),0)}
function genMound(){return outline(mkSpr(27,19,(i,j)=>{const dx=(i-13)/13.5,dy=(j-11)/11;
  if(dx*dx+dy*dy>1&&j<11)return -1;if(j>=11&&Math.abs(i-13)>12.5-(j-11)*.35)return -1;
  const mx=(i-13)/4.6,my=(j-18.5)/6.2;if(mx*mx+my*my<1)return 0;
  const n=hash2(i*7,j*3);if(j<5)return n<.4?34:n<.7?9:8;if(j<7&&n<.5)return 34;
  const l=dx*.5+dy*.7;if(l<-.3)return n<.3?1:2;if(l<.3)return n<.2?2:3;return n<.5?3:23}),0)}
function genBridge(w){const c=(w-1)/2;
 return outline(mkSpr(w,12,(i,j)=>{const t=(i-c)/c,top=Math.round(7-3.4*(1-t*t));
  if(j===top)return 17;if(j===top+1)return 16;if(j===top-3&&i>0&&i<w-1)return 17;
  if(j>top-3&&j<top&&i%3===1)return 17;if(j>top+1&&(i<=1||i>=w-2))return 16;return -1}),0)}
SP.sakura=[genSakura(1),genSakura(2),genSakura(3)];
SP.pine=[genPine(1),genPine(2.5)];
SP.bamboo=[genBamboo(1),genBamboo(7)];
SP.rockS=genRock(5,4,1);SP.rockM=genRock(8,6,2);SP.rockL=genRock(12,8,3);SP.rockM2=genRock(9,6,5);
SP.mound=genMound();
SP.bush=outline(mkSpr(7,5,(i,j)=>{const dx=(i-3)/3.5,dy=(j-2.6)/2.6;if(dx*dx+dy*dy>1)return -1;const n=hash2(i*5,j*9);return dy<-.3?(n<.4?10:9):dy<.4?(n<.3?9:34):(n<.5?34:8)}),0);
SP.bridge=genBridge(17);
