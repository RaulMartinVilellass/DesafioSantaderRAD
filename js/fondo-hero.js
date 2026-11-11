(function(){
var hero=document.querySelector('.hero'),c=document.getElementById('fondo-hero');
if(!hero||!c)return;
var x=c.getContext('2d'),vis=true;
hero.style.position='relative';hero.style.overflow='hidden';hero.style.isolation='isolate';
c.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;display:block;pointer-events:none';
var W,H,dpr,small,dark,P=[];
var mq=matchMedia('(prefers-color-scheme: dark)'),rm=matchMedia('(prefers-reduced-motion: reduce)');
function isDark(){return true}
var m={x:0,y:0},s={x:0,y:0},last=-1e9,px=0,py=0;
function rnd(a,b){return a+Math.random()*(b-a)}
function resize(){
dpr=Math.min(window.devicePixelRatio||1,2);W=hero.clientWidth;H=hero.clientHeight;if(!W||!H)return;small=W<700;
c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
if(!s.x){s.x=m.x=W/2;s.y=m.y=H/2}
var n=small?40:90;P=[];
for(var i=0;i<n;i++)P.push({x:rnd(0,W),y:rnd(0,H),z:rnd(.3,1),vx:rnd(-.15,.15),vy:rnd(-.3,-.05),r:rnd(.8,2.2),g:Math.random()<.35,ph:rnd(0,6.28)});
}
resize();
if(window.ResizeObserver)new ResizeObserver(resize).observe(hero);else addEventListener('resize',resize);
if(window.IntersectionObserver)new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(hero);
addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();m.x=e.clientX-r.left;m.y=e.clientY-r.top;last=performance.now()},{passive:true});
function lerp(a,b,k){return a+(a<b?1:-1)*0+(b-a)*k}

var bands=[[.12,.10,.30,.30],[.34,.05,.50,.22],[.55,.12,.40,.26],[.78,.07,.70,.2],[.95,.1,.25,.18]];
function drawBands(t){
x.globalCompositeOperation='source-over';
bands.forEach(function(b,i){
var w=b[1]*W+40;
x.save();
x.translate(W*b[0]+px*b[2]*50+Math.sin(t*.35+i)*24,H*.5+py*b[2]*30);
x.rotate(-.85);
var g=x.createLinearGradient(-w/2,0,w/2,0),col=dark?'90,140,255':'140,175,245';
g.addColorStop(0,'rgba('+col+',0)');g.addColorStop(.5,'rgba('+col+','+(b[3]*(dark?.5:1))+')');g.addColorStop(1,'rgba('+col+',0)');
x.fillStyle=g;x.fillRect(-w/2,-H*1.2,w,H*2.4);
x.restore();
});
}
function star(t){
var cx=W*.86-px*26,cy=H*.62-py*18,R=Math.min(H*.5,W*.6);
x.save();x.translate(cx,cy);x.rotate(Math.sin(t*.3)*.05);
x.beginPath();
for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,r=i%2?R*.45:R;x[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}
x.closePath();x.lineWidth=R*.11;x.lineJoin='miter';
x.strokeStyle=dark?'rgba(110,150,255,.12)':'rgba(120,160,240,.2)';x.stroke();x.restore();
}
function goldStar(t){
var R=small?W*.15:Math.min(H*.17,W*.22),bx=W*(small?.8:.78),by=small?110:H*.34;
var cx=bx-px*46+(s.x-bx)*.025,cy=by-py*32+(s.y-by)*.025+Math.sin(t*.8)*8;
x.save();x.translate(cx,cy);x.rotate(.18+Math.sin(t*.4)*.04+px*.05);
x.beginPath();
for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,r=i%2?R*.46:R;x[i?'lineTo':'moveTo'](Math.cos(a)*r,Math.sin(a)*r)}
x.closePath();
var g=x.createLinearGradient(-R,-R,R,R);
g.addColorStop(0,'#f6c94a');g.addColorStop(.5,'#e8b52c');g.addColorStop(1,'#c99418');
x.lineWidth=R*.1;x.lineJoin='round';x.strokeStyle=g;
x.shadowColor='rgba(255,200,80,.55)';x.shadowBlur=18;x.stroke();
x.restore();x.shadowBlur=0;
}
function waveCorner(t,flip){
x.save();
if(flip){x.translate(W,H);x.scale(-1,-1);x.translate(0,0)}
var ox=(flip?-1:1)*px*18,oy=(flip?-1:1)*py*12,a=Math.sin(t*.5+(flip?2:0))*.02,b=Math.cos(t*.4+(flip?1:0))*.02;
x.translate(ox,oy);
function path(k){
x.beginPath();
x.moveTo(-40,H*(.25+k)+H*a);
x.bezierCurveTo(W*.1,H*(.15+k)+H*b,W*.2,H*(.17+k)-H*a,W*(.31+k*.3),-40);
}
// fill
path(0);x.lineTo(-40,-40);x.closePath();
var g=x.createLinearGradient(0,0,W*.35,H*.25);
if(dark){g.addColorStop(0,'#02071f');g.addColorStop(1,'#0a2a9c')}else{g.addColorStop(0,'#04115a');g.addColorStop(1,'#1546c8')}
x.fillStyle=g;x.fill();
// gold lines
[0,.05].forEach(function(k,i){
path(k);
var gg=x.createLinearGradient(0,H*.25,W*.35,0);
gg.addColorStop(0,'rgba(210,150,40,.9)');gg.addColorStop(.6,'#ffe4a0');gg.addColorStop(1,'rgba(210,150,40,.2)');
x.strokeStyle=gg;x.lineWidth=i?1:2.2;x.shadowColor='rgba(255,200,90,.9)';x.shadowBlur=i?0:14;x.stroke();
});
x.shadowBlur=0;x.restore();
}
function halftone(t,flip){
var g=small?26:20,zw=W*.3,zh=H*.55,col=dark?'110,160,255':'18,64,196';
x.fillStyle='rgba('+col+',.85)';
var ox=flip?W-zw:0,oy=flip?0:H-zh,ccx=flip?W:0,ccy=flip?0:H;
var shx=-px*14*(flip?-1:1),shy=-py*10;
for(var gy=oy;gy<oy+zh;gy+=g)for(var gx=ox;gx<ox+zw;gx+=g){
var d=Math.hypot((gx-ccx)/zw,(gy-ccy)/zh);if(d>1)continue;
var r=(1-d)*g*.42*(.85+.15*Math.sin(t*1.2-d*6));
var X=gx+shx,Y=gy+shy,dx=X-s.x,dy=Y-s.y,dm=Math.hypot(dx,dy);
if(dm<170){var f=1-dm/170;r*=1+f*.9;X+=dx/(dm||1)*f*f*14;Y+=dy/(dm||1)*f*f*14}
if(r<.4)continue;
x.beginPath();x.arc(X,Y,r,0,6.283);x.fill();
}
}
function particles(t){
x.globalCompositeOperation=dark?'lighter':'source-over';
for(var i=0;i<P.length;i++){
var p=P[i];
p.x+=p.vx*p.z+Math.sin(t+p.ph)*.12;p.y+=p.vy*p.z;
var dx=p.x+px*p.z*30-s.x,dy=p.y+py*p.z*20-s.y,d=Math.hypot(dx,dy);
if(d<180){var f=Math.pow(1-d/180,2);p.x+=dx/(d||1)*f*3;p.y+=dy/(d||1)*f*3}
if(p.y<-10)p.y=H+10;if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10;if(p.y>H+10)p.y=-10;
var a=(.35+.35*Math.sin(t*1.5+p.ph))*p.z;
x.fillStyle=p.g?'rgba(235,175,60,'+a+')':(dark?'rgba(160,190,255,'+a+')':'rgba(30,80,210,'+a*.8+')');
x.beginPath();x.arc(p.x+px*p.z*30,p.y+py*p.z*20,p.r*p.z+.3,0,6.283);x.fill();
}
}
function light(){
x.globalCompositeOperation=dark?'lighter':'source-over';
var R=Math.max(110,Math.min(W,H)*.17),g=x.createRadialGradient(s.x,s.y,0,s.x,s.y,R);
if(dark){g.addColorStop(0,'rgba(110,160,255,.12)');g.addColorStop(1,'rgba(110,160,255,0)')}
else{g.addColorStop(0,'rgba(255,255,255,.25)');g.addColorStop(1,'rgba(255,255,255,0)')}
x.fillStyle=g;x.fillRect(s.x-R,s.y-R,R*2,R*2);
var g2=x.createRadialGradient(s.x,s.y,0,s.x,s.y,40);
g2.addColorStop(0,'rgba(255,200,90,.12)');g2.addColorStop(1,'rgba(255,200,90,0)');
x.fillStyle=g2;x.fillRect(s.x-40,s.y-40,80,80);
x.globalCompositeOperation='source-over';
}
function frame(now){
requestAnimationFrame(frame);
if(!vis||!W)return;
dark=isDark();
var t=now*.001*(rm.matches?.25:1);
if(now-last>4000){m.x=W*(.5+.3*Math.sin(t*.35));m.y=H*(.5+.25*Math.sin(t*.27+1))}
s.x+=(m.x-s.x)*.07;s.y+=(m.y-s.y)*.07;
var tx=(s.x/W-.5)*2,ty=(s.y/H-.5)*2;px+=(tx-px)*.05;py+=(ty-py)*.05;
x.globalCompositeOperation='source-over';
var g=x.createLinearGradient(0,0,W,H);
if(dark){g.addColorStop(0,'#030922');g.addColorStop(.5,'#0a1a66');g.addColorStop(1,'#040d38')}
else{g.addColorStop(0,'#cfe0ff');g.addColorStop(.5,'#f4f7ff');g.addColorStop(1,'#b9d0fa')}
x.fillStyle=g;x.fillRect(0,0,W,H);
var cg=x.createRadialGradient(W*.5+px*30,H*.45,0,W*.5+px*30,H*.45,Math.max(W,H)*.55);
cg.addColorStop(0,dark?'rgba(50,100,230,.35)':'rgba(255,255,255,.85)');cg.addColorStop(1,'rgba(255,255,255,0)');
x.fillStyle=cg;x.fillRect(0,0,W,H);
drawBands(t);star(t);goldStar(t);
halftone(t,false);halftone(t,true);
waveCorner(t,false);waveCorner(t,true);
particles(t);light();
}
requestAnimationFrame(frame);
})();
