const socket=io();
const cvs=document.getElementById('cvs');
const ctx=cvs.getContext('2d');
const ui=document.getElementById('ui');
const gameUI=document.getElementById('game');
const idIn=document.getElementById('id');
const pwIn=document.getElementById('pw');
const msgs=document.getElementById('msgs');
const chatIn=document.getElementById('chatinput');
const tabUI=document.getElementById('tab');
const pList=document.getElementById('plist');
let uid,players={},world={},ents=[],cam={x:0,y:0},keys={},ts=50,lastPlace=0,vy=0,onG=false;
const colors={1:'#4c3',2:'#753',3:'#888',4:'#ffd700',5:'#b3b3b3',6:'#853'};
window.addEventListener('resize',()=>cvs.width=window.innerWidth,cvs.height=window.innerHeight);
cvs.width=window.innerWidth;cvs.height=window.innerHeight;
document.getElementById('btn_reg').onclick=()=>socket.emit('reg',{id:idIn.value,pw:pwIn.value});
document.getElementById('btn_log').onclick=()=>socket.emit('log',{id:idIn.value,pw:pwIn.value});
document.getElementById('btn_out').onclick=()=>location.reload();
socket.on('err',e=>alert(e==='E1'?'이미 존재하는 닉네임입니다.':'정보가 일치하지 않습니다.'));
socket.on('reg_ok',()=>socket.emit('log',{id:idIn.value,pw:pwIn.value}));
socket.on('start',d=>{
    ui.style.display='none';
    gameUI.style.display='block';
    uid=d.uid;world=d.w;players=d.p;
    requestAnimationFrame(loop);
});
socket.on('sys',d=>{
    msgs.innerHTML+=`<div style="color:#ff5">${d.u} 이(가) 게임에 ${d.t==='join'?'참여했습니다':'떠났습니다'}</div>`;
    msgs.scrollTop=msgs.scrollHeight;
});
socket.on('chat',d=>{
    msgs.innerHTML+=`<div style="color:#fff">&lt;${d.u}&gt; ${d.m}</div>`;
    msgs.scrollTop=msgs.scrollHeight;
});
socket.on('move',d=>{if(players[d.u]){players[d.u].x=d.x;players[d.u].y=d.y;}else{players[d.u]={x:d.x,y:d.y};}});
socket.on('del',u=>delete players[u]);
socket.on('block',b=>{if(!world[b.x])world[b.x]={};world[b.x][b.y]=b.v;});
socket.on('ents',e=>ents=e);
window.onkeydown=e=>{
    keys[e.key.toLowerCase()]=1;
    if(e.key==='Enter'&&chatIn.value){socket.emit('chat',chatIn.value);chatIn.value='';}
    if(e.key==='Tab'){e.preventDefault();tabUI.style.display='block';pList.innerHTML=Object.keys(players).join('<br>');}
};
window.onkeyup=e=>{
    keys[e.key.toLowerCase()]=0;
    if(e.key==='Tab')tabUI.style.display='none';
};
cvs.onmousedown=e=>{
    if(Date.now()-lastPlace<400||document.activeElement===chatIn)return;
    lastPlace=Date.now();
    let bx=Math.floor((e.clientX+cam.x)/ts);
    let by=Math.floor((e.clientY+cam.y)/ts);
    socket.emit('block',{x:bx,y:by,v:e.button===2?1:0});
};
cvs.oncontextmenu=e=>e.preventDefault();
function loop(){
    if(!players[uid])return requestAnimationFrame(loop);
    let p=players[uid];
    let dx=0;
    if(keys['a']&&document.activeElement!==chatIn)dx=-5;
    if(keys['d']&&document.activeElement!==chatIn)dx=5;
    vy+=0.6;
    p.y+=vy;
    let pbx=Math.floor((p.x+15)/ts),pby=Math.floor((p.y+30)/ts);
    if(world[pbx]&&world[pbx][pby]){
        p.y=pby*ts-30;
        vy=0;
        onG=true;
    }else{
        onG=false;
    }
    if(keys['w']&&onG&&document.activeElement!==chatIn)vy=-12;
    p.x+=dx;
    pbx=Math.floor((p.x+(dx>0?30:0))/ts);
    pby=Math.floor((p.y+15)/ts);
    if(world[pbx]&&world[pbx][pby])p.x-=dx;
    socket.emit('move',{x:p.x,y:p.y});
    cam.x=p.x-cvs.width/2;
    cam.y=p.y-cvs.height/2;
    ctx.fillStyle='#6abdf2';
    ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.save();
    ctx.translate(-cam.x,-cam.y);
    for(let x in world){
        for(let y in world[x]){
            if(world[x][y]){
                ctx.fillStyle=colors[world[x][y]];
                ctx.fillRect(x*ts,y*ts,ts,ts);
                ctx.strokeStyle='rgba(0,0,0,0.2)';
                ctx.strokeRect(x*ts,y*ts,ts,ts);
            }
        }
    }
    ents.forEach(e=>{
        ctx.fillStyle=e.t==='pig'?'#f8a':'#172';
        ctx.fillRect(e.x,e.y,30,30);
        ctx.fillStyle='#fff';
        ctx.textAlign='center';
        ctx.font='12px Galmuri9';
        ctx.fillText(e.t,e.x+15,e.y-10);
    });
    for(let u in players){
        let op=players[u];
        ctx.fillStyle=u===uid?'#e22':'#22e';
        ctx.fillRect(op.x,op.y,30,30);
        ctx.fillStyle='#fff';
        ctx.textAlign='center';
        ctx.font='14px Galmuri9';
        ctx.fillText(u,op.x+15,op.y-10);
    }
    ctx.restore();
    requestAnimationFrame(loop);
}