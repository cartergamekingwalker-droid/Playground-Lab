(() => {
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
let W=900,H=600,objects=[],tool='box',paused=false,gravity=1,drag=null,selected=null,last=0;
const colors=['#63b8ff','#ffbd69','#a98bff','#6ed6a0','#ff8295','#e7d86c'];
const label={box:'Box',ball:'Ball',crate:'Crate','heavy':'Heavy ball',ragdoll:'Ragdoll',platform:'Platform',select:'Drag',delete:'Delete',pin:'Pin / unpin'};
function resize(){const r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;W=r.width;H=r.height;canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0)}
new ResizeObserver(resize).observe(canvas);window.addEventListener('resize',resize);resize();
function updateUI(){ $('objectCount').textContent=objects.length; $('toolName').textContent=label[tool]; $('simState').textContent=paused?'Paused':'Running'; $('objectInfo').textContent=selected&&objects.includes(selected)?`${label[selected.type]} · ${selected.fixed?'Pinned':'Dynamic'} · Mass ${selected.mass}`:'No object selected.'}
function spawn(type,x,y){
 const o={type,x,y,vx:(Math.random()-.5)*35,vy:0,angle:(Math.random()-.5)*.2,spin:(Math.random()-.5)*.4,color:colors[Math.floor(Math.random()*colors.length)],fixed:type==='platform',mass:1};
 if(type==='ball'||type==='heavy'){o.r=type==='heavy'?27:18;o.mass=type==='heavy'?4:1}
 else if(type==='platform'){o.w=145;o.h=16;o.mass=1}
 else if(type==='crate'){o.w=58;o.h=58;o.mass=2}
 else if(type==='ragdoll'){o.w=34;o.h=82;o.mass=2;o.joints=[{x:0,y:-32,r:12},{x:0,y:-7},{x:-15,y:15},{x:15,y:15},{x:-22,y:-7},{x:22,y:-7}]}
 else {o.w=type==='box'?54:100;o.h=type==='box'?54:22}
 objects.push(o);selected=o;updateUI();return o;
}
function point(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function hit(o,p){if(o.r)return Math.hypot(p.x-o.x,p.y-o.y)<o.r+5;return Math.abs(p.x-o.x)<o.w/2+6&&Math.abs(p.y-o.y)<o.h/2+6}
canvas.addEventListener('pointerdown',e=>{
 const p=point(e);
 if(e.button===2){const i=objects.findLastIndex(o=>hit(o,p));if(i>=0){if(objects[i]===selected)selected=null;objects.splice(i,1);updateUI()}return}
 if(tool==='select'||tool==='delete'||tool==='pin'){
  const i=objects.findLastIndex(o=>hit(o,p));
  if(i<0){selected=null;updateUI();return}
  const o=objects[i];selected=o;
  if(tool==='delete'){objects.splice(i,1);selected=null}
  else if(tool==='pin'){o.fixed=!o.fixed;o.vx=o.vy=0}
  else drag={o,dx:p.x-o.x,dy:p.y-o.y};
  updateUI();return;
 }
 spawn(tool,p.x,p.y);
});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const p=point(e);drag.o.x=p.x-drag.dx;drag.o.y=p.y-drag.dy;drag.o.vx=drag.o.vy=0});
window.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('contextmenu',e=>e.preventDefault());
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>{tool=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('active',x===b));$('hint').textContent=tool==='select'?'Drag objects with your mouse':tool==='delete'?'Click an object to delete it':tool==='pin'?'Click an object to pin or unpin it':'Click in the world to spawn a '+label[tool].toLowerCase();updateUI()}));
$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'▶ Resume':'Ⅱ Pause';$('pausedLabel').classList.toggle('show',paused);updateUI()};
$('reset').onclick=()=>{objects=[];selected=null;spawn('box',W*.47,H*.35);spawn('ball',W*.56,H*.2);paused=false;$('pause').textContent='Ⅱ Pause';$('pausedLabel').classList.remove('show');updateUI()};
$('clear').onclick=()=>{objects=[];selected=null;updateUI()};
$('gravity').oninput=e=>{gravity=+e.target.value;$('gravityValue').textContent=gravity.toFixed(1)+'×'};
function bounds(o){return o.r?o.r:Math.max(o.w,o.h)*.48}
function physics(dt){
 const floor=H-26;
 for(const o of objects){if(o.fixed)continue;o.vy+=900*gravity*dt;o.vx*=.998;o.vy*=.999;o.x+=o.vx*dt;o.y+=o.vy*dt;o.angle+=o.spin*dt;
  const r=bounds(o);
  if(o.y+r>floor){o.y=floor-r;o.vy*=-.42;if(Math.abs(o.vy)<22)o.vy=0;o.vx*=.97}
  if(o.x-r<0){o.x=r;o.vx=Math.abs(o.vx)*.55}if(o.x+r>W){o.x=W-r;o.vx=-Math.abs(o.vx)*.55}
 }
 // Stable, lightweight circular collision approximation for this prototype.
 for(let i=0;i<objects.length;i++)for(let j=i+1;j<objects.length;j++){
  const a=objects[i],b=objects[j];if(a.fixed&&b.fixed)continue;
  const ra=bounds(a),rb=bounds(b),dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||.001,min=ra+rb;
  if(dist<min){const nx=dx/dist,ny=dy/dist,over=min-dist,ia=a.fixed?0:1/a.mass,ib=b.fixed?0:1/b.mass,sum=ia+ib;if(!sum)continue;
   a.x-=nx*over*ia/sum;b.x+=nx*over*ib/sum;
   const rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel<0){const impulse=-1.25*rel/sum;a.vx-=impulse*ia*nx;a.vy-=impulse*ia*ny;b.vx+=impulse*ib*nx;b.vy+=impulse*ib*ny}
  }
 }
}
function draw(o){
 ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.angle);
 if(o.type==='ragdoll'){
  ctx.lineCap='round';ctx.strokeStyle='#d9e5f3';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(0,9);ctx.moveTo(0,-10);ctx.lineTo(-21,3);ctx.moveTo(0,-10);ctx.lineTo(21,3);ctx.moveTo(0,9);ctx.lineTo(-14,38);ctx.moveTo(0,9);ctx.lineTo(14,38);ctx.stroke();
  ctx.fillStyle='#f2c49c';ctx.beginPath();ctx.arc(0,-32,12,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#9aacc0';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#4d8cbd';ctx.fillRect(-10,-19,20,29);
 }else if(o.r){ctx.fillStyle=o.color;ctx.strokeStyle='#edf5ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,o.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ffffff38';ctx.beginPath();ctx.arc(-o.r*.3,-o.r*.35,o.r*.23,0,Math.PI*2);ctx.fill()}
 else{ctx.fillStyle=o.fixed?'#647d99':o.color;ctx.strokeStyle='#eaf3ff';ctx.lineWidth=2;ctx.fillRect(-o.w/2,-o.h/2,o.w,o.h);ctx.strokeRect(-o.w/2,-o.h/2,o.w,o.h);ctx.fillStyle='#ffffff24';ctx.fillRect(-o.w/2+5,-o.h/2+5,Math.max(5,o.w*.3),5)}
 if(o===selected){ctx.strokeStyle='#7bd0ff';ctx.lineWidth=2;ctx.setLineDash([5,4]);if(o.r){ctx.beginPath();ctx.arc(0,0,o.r+6,0,Math.PI*2);ctx.stroke()}else ctx.strokeRect(-o.w/2-5,-o.h/2-5,o.w+10,o.h+10)}
 if(o.fixed){ctx.fillStyle='#fff';ctx.font='11px Segoe UI';ctx.textAlign='center';ctx.fillText('PIN',0,(o.r||o.h/2)+15)}
 ctx.restore();
}
function frame(t){const dt=Math.min((t-last)/1000||0,.025);last=t;if(!paused&&!drag)physics(dt);
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#101722';ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='#1e2a3a';ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 ctx.fillStyle='#344b64';ctx.fillRect(0,H-26,W,26);ctx.fillStyle='#6c89a7';ctx.fillRect(0,H-26,W,3);
 objects.forEach(draw);requestAnimationFrame(frame)}
spawn('box',W*.46,H*.25);spawn('ball',W*.56,H*.15);requestAnimationFrame(frame);updateUI();
})();