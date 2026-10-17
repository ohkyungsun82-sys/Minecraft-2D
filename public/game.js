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
const hb=document.getElementById('hotbar');

let uid,players={},world={},ents=[],cam={x:0,y:0},keys={},ts=50,vy=0,onG=false;
let sel=0,mx=0,my=0,isM=false,mX=-1,mY=-1,mS=0,lA=0;
let inv={},hbSlots=[];

const bd=[
{n:'grass',c:'#4c3'},{n:'dirt',c:'#866043'},{n:'stone',c:'#7d7d7d'},{n:'gold_ore',c:'#fcee4b'},{n:'iron_ore',c:'#898075'},{n:'oak_log',c:'#6b511f'},{n:'leaves',c:'#282'},
{n:'granite',c:'#9a6d55'},{n:'polished_granite',c:'#a0735a'},{n:'diorite',c:'#b4b4b9'},{n:'polished_diorite',c:'#c4c4c9'},{n:'andesite',c:'#828382'},{n:'polished_andesite',c:'#8e8e8e'},{n:'cobblestone',c:'#666666'},{n:'coarse_dirt',c:'#77553a'},{n:'podzol',c:'#5a3b1d'},{n:'cobbled_deepslate',c:'#4d4d50'},{n:'polished_deepslate',c:'#48484a'},{n:'deepslate_bricks',c:'#424244'},{n:'deepslate_tiles',c:'#38383a'},{n:'bedrock',c:'#555555'},{n:'sand',c:'#dbd3a0'},{n:'red_sand',c:'#a95821'},{n:'gravel',c:'#857f7e'},{n:'coal_ore',c:'#696969'},{n:'deepslate_coal_ore',c:'#4a4a4c'},{n:'deepslate_iron_ore',c:'#525050'},{n:'copper_ore',c:'#9b5a41'},{n:'deepslate_copper_ore',c:'#4c4442'},{n:'deepslate_gold_ore',c:'#5c5532'},{n:'redstone_ore',c:'#ff0000'},{n:'deepslate_redstone_ore',c:'#661111'},{n:'emerald_ore',c:'#17dd62'},{n:'deepslate_emerald_ore',c:'#23583a'},{n:'lapis_ore',c:'#224baa'},{n:'deepslate_lapis_ore',c:'#28375c'},{n:'diamond_ore',c:'#2cead9'},{n:'deepslate_diamond_ore',c:'#265552'},{n:'nether_gold_ore',c:'#733531'},{n:'nether_quartz_ore',c:'#7b625e'},{n:'ancient_debris',c:'#5e463f'},{n:'coal_block',c:'#111111'},{n:'raw_iron_block',c:'#ddba8e'},{n:'raw_copper_block',c:'#c8754b'},{n:'raw_gold_block',c:'#f3d23b'},{n:'iron_block',c:'#e6e6e6'},{n:'copper_block',c:'#c06b50'},{n:'gold_block',c:'#fedc3c'},{n:'diamond_block',c:'#61ffed'},{n:'netherite_block',c:'#423f40'},{n:'spruce_log',c:'#3a2510'},{n:'birch_log',c:'#dcdcdc'},{n:'jungle_log',c:'#564024'},{n:'acacia_log',c:'#695e54'},{n:'dark_oak_log',c:'#2d1c0b'},{n:'mangrove_log',c:'#4b2622'},{n:'cherry_log',c:'#301720'},{n:'oak_planks',c:'#a2834e'},{n:'spruce_planks',c:'#715535'},{n:'birch_planks',c:'#c4b079'},{n:'jungle_planks',c:'#a4764b'},{n:'acacia_planks',c:'#a85d32'},{n:'dark_oak_planks',c:'#422b15'},{n:'mangrove_planks',c:'#783830'},{n:'cherry_planks',c:'#e6aeba'},{n:'bamboo_planks',c:'#c4a747'},{n:'glass',c:'#c0d8ff'},{n:'white_wool',c:'#e9ecec'},{n:'white_concrete',c:'#cfd5d6'},{n:'white_concrete_powder',c:'#e1e3e3'},{n:'bricks',c:'#9a6659'},{n:'bookshelf',c:'#7c623b'},{n:'obsidian',c:'#15111e'},{n:'crying_obsidian',c:'#2c124c'},{n:'chest',c:'#d38d2f'},{n:'crafting_table',c:'#764528'},{n:'furnace',c:'#707070'},{n:'blast_furnace',c:'#525252'},{n:'smoker',c:'#595045'},{n:'dispenser',c:'#717171'},{n:'dropper',c:'#707070'},{n:'hopper',c:'#494949'},{n:'piston',c:'#716c54'},{n:'sticky_piston',c:'#788a53'},{n:'slime_block',c:'#73c847'},{n:'honey_block',c:'#ffb617'},{n:'redstone_block',c:'#aa0f00'},{n:'redstone_lamp',c:'#663b22'},{n:'glowstone',c:'#d1a84f'},{n:'sea_lantern',c:'#acd5ce'},{n:'shroomlight',c:'#f09565'},{n:'magma_block',c:'#8f3711'},{n:'soul_sand',c:'#544033'},{n:'soul_soil',c:'#4b392d'},{n:'netherrack',c:'#612727'},{n:'basalt',c:'#515156'},{n:'polished_basalt',c:'#5b5c5e'},{n:'smooth_basalt',c:'#47474d'},{n:'end_stone',c:'#dfdeb0'},{n:'end_stone_bricks',c:'#dad9a7'},{n:'purpur_block',c:'#a97aa9'},{n:'purpur_pillar',c:'#aba0ab'},{n:'tuff',c:'#6c6d66'},{n:'tuff_bricks',c:'#5b5b55'},{n:'calcite',c:'#e0e2df'},{n:'amethyst_block',c:'#865ebd'},{n:'packed_ice',c:'#8cbdf5'},{n:'blue_ice',c:'#74a7fc'},{n:'snow_block',c:'#f8fefd'},{n:'clay',c:'#a0a6b3'},{n:'terracotta',c:'#985e43'}
];

const texMap={},bNames={};
const cdn='https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.19.2/assets/minecraft/textures/block/';
const nMap={'grass':'grass_block_side','leaves':'oak_leaves','chest':'barrel_side','crafting_table':'crafting_table_front','furnace':'furnace_front','blast_furnace':'blast_furnace_front','smoker':'smoker_front','dispenser':'dispenser_front','dropper':'dropper_front','hopper':'hopper_outside','piston':'piston_side','sticky_piston':'piston_top_sticky','redstone_lamp':'redstone_lamp_off','snow_block':'snow'};

bd.forEach((b,i)=>{
    let id=i+1;
    bNames[id]=b.n;
    let img=new Image();
    img.crossOrigin='Anonymous';
    img.src=cdn+(nMap[b.n]||b.n)+'.png';
    texMap[id]=img;
});

window.addEventListener('resize',()=>cvs.width=window.innerWidth,cvs.height=window.innerHeight);
cvs.width=window.innerWidth;cvs.height=window.innerHeight;

function updHb(){
    hb.innerHTML='';
    hbSlots=Object.keys(inv).filter(k=>inv[k]>0).map(Number);
    if(!hbSlots.includes(sel)){
        if(hbSlots.length>0)sel=hbSlots[0];
        else sel=0;
    }
    hbSlots.forEach((id,idx)=>{
        let d=document.createElement('div');
        d.className='slot'+(sel===id?' act':'');
        d.style.backgroundImage=`url(${texMap[id].src})`;
        d.style.backgroundSize='cover';
        d.style.imageRendering='pixelated';
        d.style.position='relative';
        d.innerHTML=`<div style="position:absolute;top:2px;left:2px;background:rgba(0,0,0,0.7);padding:2px;border-radius:2px;font-size:10px;">${idx<9?idx+1:''}</div><div style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.7);padding:2px;border-radius:2px;font-size:12px;">${inv[id]}</div>`;
        d.onclick=()=>{sel=id;updHb();};
        hb.appendChild(d);
    });
}
updHb();

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
socket.on('block',b=>{
    if(!world[b.x])world[b.x]={};
    if(b.v===0)delete world[b.x][b.y];
    else world[b.x][b.y]=b.v;
});
socket.on('ents',e=>ents=e);

window.onkeydown=e=>{
    keys[e.key.toLowerCase()]=1;
    if(e.key==='Enter'&&chatIn.value){socket.emit('chat',chatIn.value);chatIn.value='';}
    if(e.key==='Tab'){e.preventDefault();tabUI.style.display='block';pList.innerHTML=Object.keys(players).join('<br>');}
    if(e.key>='1'&&e.key<='9'&&document.activeElement!==chatIn){
        let idx=parseInt(e.key)-1;
        if(hbSlots[idx]){sel=hbSlots[idx];updHb();}
    }
};
window.onkeyup=e=>{
    keys[e.key.toLowerCase()]=0;
    if(e.key==='Tab')tabUI.style.display='none';
};

cvs.onmousemove=e=>{
    mx=e.clientX;
    my=e.clientY;
    let bx=Math.floor((mx+cam.x)/ts);
    let by=Math.floor((my+cam.y)/ts);
    if(isM&&(bx!==mX||by!==mY))isM=false;
};
cvs.onmousedown=e=>{
    if(document.activeElement===chatIn)return;
    let bx=Math.floor((mx+cam.x)/ts);
    let by=Math.floor((my+cam.y)/ts);
    if(e.button===0){
        if(world[bx]&&world[bx][by]){
            isM=true;
            mX=bx;
            mY=by;
            mS=Date.now();
        }
    }else if(e.button===2){
        if(Date.now()-lA>300){
            if(!world[bx]||!world[bx][by]){
                if(sel&&inv[sel]>0){
                    inv[sel]--;
                    socket.emit('block',{x:bx,y:by,v:sel});
                    lA=Date.now();
                    updHb();
                }
            }
        }
    }
};
cvs.onmouseup=e=>{if(e.button===0)isM=false;};
cvs.onmouseleave=()=>isM=false;
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
    ctx.imageSmoothingEnabled=false;
    for(let x in world){
        for(let y in world[x]){
            if(world[x][y]&&texMap[world[x][y]]){
                ctx.drawImage(texMap[world[x][y]],x*ts,y*ts,ts,ts);
            }
        }
    }
    
    if(isM){
        let pr=(Date.now()-mS)/800;
        if(pr>=1){
            let bid=world[mX]&&world[mX][mY];
            if(bid){
                inv[bid]=(inv[bid]||0)+1;
                socket.emit('block',{x:mX,y:mY,v:0});
            }
            isM=false;
            lA=Date.now();
            updHb();
        }else{
            ctx.fillStyle=`rgba(0,0,0,${pr*0.5})`;
            ctx.fillRect(mX*ts,mY*ts,ts,ts);
            ctx.strokeStyle='#000';
            ctx.lineWidth=2;
            ctx.strokeRect(mX*ts+ts/2-15,mY*ts+ts/2-3,30,6);
            ctx.fillStyle='#0f0';
            ctx.fillRect(mX*ts+ts/2-15,mY*ts+ts/2-3,30*pr,6);
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
