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
const selBox=document.getElementById('sel-box');
const heartsUI=document.getElementById('hearts');
const foodUI=document.getElementById('food');

let uid,players={},world={},ents=[],cam={x:0,y:0},keys={},ts=16,vy=0,onG=false;
let mx=0,my=0,isM=false,mX=-1,mY=-1,mS=0,lA=0;
let inv={},hbArr=[201,202,203,0,0,0,0,0,0],selIdx=0;
const sc=3;

const bd=[
{n:'grass',c:'#4c3'},{n:'dirt',c:'#866043'},{n:'stone',c:'#7d7d7d',r:'p'},{n:'gold_ore',c:'#fcee4b',r:'p'},{n:'iron_ore',c:'#898075',r:'p'},{n:'oak_log',c:'#6b511f'},{n:'leaves',c:'#282'},
{n:'granite',c:'#9a6d55',r:'p'},{n:'polished_granite',c:'#a0735a',r:'p'},{n:'diorite',c:'#b4b4b9',r:'p'},{n:'polished_diorite',c:'#c4c4c9',r:'p'},{n:'andesite',c:'#828382',r:'p'},{n:'polished_andesite',c:'#8e8e8e',r:'p'},{n:'cobblestone',c:'#666666',r:'p'},{n:'coarse_dirt',c:'#77553a'},{n:'podzol',c:'#5a3b1d'},{n:'cobbled_deepslate',c:'#4d4d50',r:'p'},{n:'polished_deepslate',c:'#48484a',r:'p'},{n:'deepslate_bricks',c:'#424244',r:'p'},{n:'deepslate_tiles',c:'#38383a',r:'p'},{n:'bedrock',c:'#555555',r:'p'},{n:'sand',c:'#dbd3a0'},{n:'red_sand',c:'#a95821'},{n:'gravel',c:'#857f7e'},{n:'coal_ore',c:'#696969',r:'p'},{n:'deepslate_coal_ore',c:'#4a4a4c',r:'p'},{n:'deepslate_iron_ore',c:'#525050',r:'p'},{n:'copper_ore',c:'#9b5a41',r:'p'},{n:'deepslate_copper_ore',c:'#4c4442',r:'p'},{n:'deepslate_gold_ore',c:'#5c5532',r:'p'},{n:'redstone_ore',c:'#ff0000',r:'p'},{n:'deepslate_redstone_ore',c:'#661111',r:'p'},{n:'emerald_ore',c:'#17dd62',r:'p'},{n:'deepslate_emerald_ore',c:'#23583a',r:'p'},{n:'lapis_ore',c:'#224baa',r:'p'},{n:'deepslate_lapis_ore',c:'#28375c',r:'p'},{n:'diamond_ore',c:'#2cead9',r:'p'},{n:'deepslate_diamond_ore',c:'#265552',r:'p'},{n:'nether_gold_ore',c:'#733531',r:'p'},{n:'nether_quartz_ore',c:'#7b625e',r:'p'},{n:'ancient_debris',c:'#5e463f',r:'p'},{n:'coal_block',c:'#111111',r:'p'},{n:'raw_iron_block',c:'#ddba8e',r:'p'},{n:'raw_copper_block',c:'#c8754b',r:'p'},{n:'raw_gold_block',c:'#f3d23b',r:'p'},{n:'iron_block',c:'#e6e6e6',r:'p'},{n:'copper_block',c:'#c06b50',r:'p'},{n:'gold_block',c:'#fedc3c',r:'p'},{n:'diamond_block',c:'#61ffed',r:'p'},{n:'netherite_block',c:'#423f40',r:'p'},{n:'spruce_log',c:'#3a2510'},{n:'birch_log',c:'#dcdcdc'},{n:'jungle_log',c:'#564024'},{n:'acacia_log',c:'#695e54'},{n:'dark_oak_log',c:'#2d1c0b'},{n:'mangrove_log',c:'#4b2622'},{n:'cherry_log',c:'#301720'},{n:'oak_planks',c:'#a2834e'},{n:'spruce_planks',c:'#715535'},{n:'birch_planks',c:'#c4b079'},{n:'jungle_planks',c:'#a4764b'},{n:'acacia_planks',c:'#a85d32'},{n:'dark_oak_planks',c:'#422b15'},{n:'mangrove_planks',c:'#783830'},{n:'cherry_planks',c:'#e6aeba'},{n:'bamboo_planks',c:'#c4a747'},{n:'glass',c:'#c0d8ff',r:'w'},{n:'white_wool',c:'#e9ecec'},{n:'white_concrete',c:'#cfd5d6',r:'p'},{n:'white_concrete_powder',c:'#e1e3e3'},{n:'bricks',c:'#9a6659',r:'p'},{n:'bookshelf',c:'#7c623b'},{n:'obsidian',c:'#15111e',r:'p'},{n:'crying_obsidian',c:'#2c124c',r:'p'},{n:'chest',c:'#d38d2f'},{n:'crafting_table',c:'#764528'},{n:'furnace',c:'#707070',r:'p'},{n:'blast_furnace',c:'#525252',r:'p'},{n:'smoker',c:'#595045',r:'p'},{n:'dispenser',c:'#717171',r:'p'},{n:'dropper',c:'#707070',r:'p'},{n:'hopper',c:'#494949',r:'p'},{n:'piston',c:'#716c54'},{n:'sticky_piston',c:'#788a53'},{n:'slime_block',c:'#73c847'},{n:'honey_block',c:'#ffb617'},{n:'redstone_block',c:'#aa0f00',r:'p'},{n:'redstone_lamp',c:'#663b22'},{n:'glowstone',c:'#d1a84f'},{n:'sea_lantern',c:'#acd5ce'},{n:'shroomlight',c:'#f09565'},{n:'magma_block',c:'#8f3711'},{n:'soul_sand',c:'#544033'},{n:'soul_soil',c:'#4b392d'},{n:'netherrack',c:'#612727',r:'p'},{n:'basalt',c:'#515156',r:'p'},{n:'polished_basalt',c:'#5b5c5e',r:'p'},{n:'smooth_basalt',c:'#47474d',r:'p'},{n:'end_stone',c:'#dfdeb0',r:'p'},{n:'end_stone_bricks',c:'#dad9a7',r:'p'},{n:'purpur_block',c:'#a97aa9',r:'p'},{n:'purpur_pillar',c:'#aba0ab',r:'p'},{n:'tuff',c:'#6c6d66',r:'p'},{n:'tuff_bricks',c:'#5b5b55',r:'p'},{n:'calcite',c:'#e0e2df',r:'p'},{n:'amethyst_block',c:'#865ebd',r:'p'},{n:'packed_ice',c:'#8cbdf5'},{n:'blue_ice',c:'#74a7fc'},{n:'snow_block',c:'#f8fefd',r:'s'},{n:'clay',c:'#a0a6b3'},{n:'terracotta',c:'#985e43',r:'p'}
];

const texMap={},bNames={},reqs={},colors={};
const cdn='https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.19.2/assets/minecraft/textures/';
const nMap={'grass':'grass_block_side','leaves':'oak_leaves','chest':'barrel_side','crafting_table':'crafting_table_front','furnace':'furnace_front','blast_furnace':'blast_furnace_front','smoker':'smoker_front','dispenser':'dispenser_front','dropper':'dropper_front','hopper':'hopper_outside','piston':'piston_side','sticky_piston':'piston_top_sticky','redstone_lamp':'redstone_lamp_off','snow_block':'snow'};

bd.forEach((b,i)=>{
    let id=i+1;
    bNames[id]=b.n;
    colors[id]=b.c;
    if(b.r)reqs[id]=b.r;
    let img=new Image();
    img.crossOrigin='Anonymous';
    img.src=cdn+'block/'+(nMap[b.n]||b.n)+'.png';
    texMap[id]=img;
});

const tools=[{id:201,n:'iron_pickaxe',t:'p'},{id:202,n:'iron_shovel',t:'s'},{id:203,n:'iron_sword',t:'w'}];
tools.forEach(t=>{
    let img=new Image();
    img.crossOrigin='Anonymous';
    img.src=cdn+'item/'+t.n+'.png';
    texMap[t.id]=img;
    reqs[t.id]=t.t;
});

const entImg={s:new Image(),z:new Image(),p:new Image()};
entImg.s.crossOrigin='Anonymous';entImg.s.src=cdn+'entity/steve.png';
entImg.z.crossOrigin='Anonymous';entImg.z.src=cdn+'entity/zombie/zombie.png';
entImg.p.crossOrigin='Anonymous';entImg.p.src=cdn+'entity/pig/pig.png';

for(let i=0;i<10;i++){
    let h=document.createElement('div');h.className='icon';h.style.backgroundImage=`url('${cdn}gui/sprites/hud/heart/full.png')`;heartsUI.appendChild(h);
    let f=document.createElement('div');f.className='icon';f.style.backgroundImage=`url('${cdn}gui/sprites/hud/food/full.png')`;foodUI.appendChild(f);
}

window.addEventListener('resize',()=>cvs.width=window.innerWidth,cvs.height=window.innerHeight);
cvs.width=window.innerWidth;cvs.height=window.innerHeight;

let savedId=localStorage.getItem('mc_id');
let savedPw=localStorage.getItem('mc_pw');
if(savedId&&savedPw){
    idIn.value=savedId;pwIn.value=savedPw;
    socket.emit('log',{id:savedId,pw:savedPw});
}

function updHb(){
    let slots=document.querySelectorAll('.slot');
    slots.forEach(s=>s.remove());
    for(let i=0;i<9;i++){
        let d=document.createElement('div');
        d.className='slot';
        let bid=hbArr[i];
        if(bid>0&&texMap[bid]){
            let s=document.createElement('div');
            s.style.width='32px';s.style.height='32px';s.style.margin='2px';
            s.style.backgroundImage=`url(${texMap[bid].src})`;
            s.style.backgroundSize='cover';s.style.imageRendering='pixelated';
            if(inv[bid]>1)s.innerHTML=`<div style="position:absolute;bottom:0px;right:2px;color:#fff;text-shadow:2px 2px 0 #000;font-size:16px;font-family:'Galmuri9';">${inv[bid]}</div>`;
            d.appendChild(s);
        }
        d.onclick=()=>{selIdx=i;selBox.style.left=(i*40-2)+'px';};
        hb.appendChild(d);
    }
    selBox.style.left=(selIdx*40-2)+'px';
    socket.emit('inv',inv);
}

document.getElementById('btn_reg').onclick=()=>socket.emit('reg',{id:idIn.value,pw:pwIn.value});
document.getElementById('btn_log').onclick=()=>socket.emit('log',{id:idIn.value,pw:pwIn.value});
document.getElementById('btn_out').onclick=()=>{localStorage.removeItem('mc_id');localStorage.removeItem('mc_pw');location.reload();};

socket.on('err',e=>alert(e==='E1'?'이미 존재하는 닉네임입니다.':'정보가 일치하지 않습니다.'));
socket.on('reg_ok',()=>socket.emit('log',{id:idIn.value,pw:pwIn.value}));
socket.on('start',d=>{
    localStorage.setItem('mc_id',idIn.value);
    localStorage.setItem('mc_pw',pwIn.value);
    ui.style.display='none';
    gameUI.style.display='block';
    uid=d.uid;world=d.w;players=d.p;inv=d.inv||{};
    let uKeys=Object.keys(inv).map(Number);
    for(let i=0;i<9;i++){if(uKeys[i])hbArr[i]=uKeys[i];}
    updHb();
    requestAnimationFrame(loop);
});
socket.on('sys',d=>{msgs.innerHTML+=`<div style="color:#ff5">${d.u} 이(가) 게임에 ${d.t==='join'?'참여했습니다':'떠났습니다'}</div>`;msgs.scrollTop=msgs.scrollHeight;});
socket.on('chat',d=>{msgs.innerHTML+=`<div style="color:#fff">&lt;${d.u}&gt; ${d.m}</div>`;msgs.scrollTop=msgs.scrollHeight;});
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
    if(e.key>='1'&&e.key<='9'&&document.activeElement!==chatIn){selIdx=parseInt(e.key)-1;selBox.style.left=(selIdx*40-2)+'px';}
};
window.onkeyup=e=>{
    keys[e.key.toLowerCase()]=0;
    if(e.key==='Tab')tabUI.style.display='none';
};

cvs.onmousemove=e=>{
    mx=e.clientX;my=e.clientY;
    let bx=Math.floor((mx/sc+cam.x)/ts),by=Math.floor((my/sc+cam.y)/ts);
    if(isM&&(bx!==mX||by!==mY))isM=false;
};
cvs.onmousedown=e=>{
    if(document.activeElement===chatIn)return;
    let bx=Math.floor((mx/sc+cam.x)/ts),by=Math.floor((my/sc+cam.y)/ts);
    if(e.button===0){
        if(world[bx]&&world[bx][by]){isM=true;mX=bx;mY=by;mS=Date.now();}
    }else if(e.button===2){
        if(Date.now()-lA>300){
            if(!world[bx]||!world[bx][by]){
                let bid=hbArr[selIdx];
                if(bid>0&&bid<200&&inv[bid]>0){
                    inv[bid]--;
                    if(inv[bid]<=0){hbArr[selIdx]=0;delete inv[bid];}
                    socket.emit('block',{x:bx,y:by,v:bid});
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

function drawHumanoid(cx,img,x,y,mv,dir,isZ,sp){
    if(!img.complete||img.naturalWidth===0){
        cx.fillStyle=isZ?'#090':'#22e';
        cx.fillRect(x+4,y,8,24);
        return;
    }
    let t=mv?Date.now()/(sp?100:200):0;
    let lA=mv?Math.sin(t)*1.0:0;
    let aA=mv?-Math.sin(t)*1.0:(isZ?-Math.PI/2:0);
    cx.save();
    cx.translate(x+8,y+12);
    cx.scale(dir,1);
    cx.scale(0.75,0.75);
    cx.save();cx.translate(0,-4);cx.rotate(-aA);cx.drawImage(img,40,20,4,12,-2,0,4,12);cx.restore();
    cx.save();cx.translate(0,4);cx.rotate(-lA);cx.drawImage(img,0,20,4,12,-2,0,4,12);cx.restore();
    cx.drawImage(img,20,20,8,12,-4,-4,8,12);
    cx.save();cx.translate(0,-4);cx.drawImage(img,0,8,8,8,-4,-8,8,8);cx.restore();
    cx.save();cx.translate(0,4);cx.rotate(lA);cx.drawImage(img,0,20,4,12,-2,0,4,12);cx.restore();
    cx.save();cx.translate(0,-4);cx.rotate(aA);cx.drawImage(img,40,20,4,12,-2,0,4,12);cx.restore();
    cx.restore();
}

function drawPig(cx,img,x,y,mv,dir){
    if(!img.complete||img.naturalWidth===0){
        cx.fillStyle='#f8a';
        cx.fillRect(x,y,12,12);
        return;
    }
    let t=mv?Date.now()/150:0;
    let lA=mv?Math.sin(t)*1.0:0;
    cx.save();
    cx.translate(x+6,y+6);
    cx.scale(dir,1);
    cx.scale(0.85,0.85);
    cx.save();cx.translate(-6,2);cx.rotate(-lA);cx.drawImage(img,0,16,4,6,-2,0,4,6);cx.restore();
    cx.save();cx.translate(6,2);cx.rotate(lA);cx.drawImage(img,0,16,4,6,-2,0,4,6);cx.restore();
    cx.drawImage(img,28,16,16,8,-8,-4,16,8);
    cx.drawImage(img,0,8,8,8,6,-8,8,8);
    cx.save();cx.translate(-6,2);cx.rotate(lA);cx.drawImage(img,0,16,4,6,-2,0,4,6);cx.restore();
    cx.save();cx.translate(6,2);cx.rotate(-lA);cx.drawImage(img,0,16,4,6,-2,0,4,6);cx.restore();
    cx.restore();
}

function loop(){
    if(!players[uid])return requestAnimationFrame(loop);
    let p=players[uid];
    let dx=0,sp=keys['shift'];
    let vD=sp?4.5:2.5;
    if(keys['a']&&document.activeElement!==chatIn)dx=-vD;
    if(keys['d']&&document.activeElement!==chatIn)dx=vD;
    vy+=0.25;
    p.y+=vy;
    let pbx=Math.floor((p.x+8)/ts),pby=Math.floor((p.y+24)/ts);
    if(world[pbx]&&world[pbx][pby]){
        p.y=pby*ts-24;
        vy=0;
        onG=true;
    }else{
        onG=false;
    }
    if(keys['w']&&onG&&document.activeElement!==chatIn)vy=-5;
    p.x+=dx;
    pbx=Math.floor((p.x+(dx>0?12:4))/ts);
    pby=Math.floor((p.y+12)/ts);
    if(world[pbx]&&world[pbx][pby])p.x-=dx;
    socket.emit('move',{x:p.x,y:p.y});
    
    cam.x=p.x-(cvs.width/2)/sc;
    cam.y=p.y-(cvs.height/2)/sc;
    
    ctx.fillStyle='#6abdf2';
    ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.save();
    ctx.scale(sc,sc);
    ctx.translate(-cam.x,-cam.y);
    ctx.imageSmoothingEnabled=false;
    
    for(let x in world){
        for(let y in world[x]){
            let bid=world[x][y];
            if(bid){
                let img=texMap[bid];
                if(img&&img.complete&&img.naturalWidth>0){
                    ctx.drawImage(img,x*ts,y*ts,ts,ts);
                }else{
                    ctx.fillStyle=colors[bid]||'#f0f';
                    ctx.fillRect(x*ts,y*ts,ts,ts);
                }
            }
        }
    }
    
    if(isM){
        let pr=(Date.now()-mS)/600;
        if(pr>=1){
            let bid=world[mX]&&world[mX][mY];
            if(bid){
                let hT=reqs[hbArr[selIdx]];
                let rT=reqs[bid];
                if(!rT||rT===hT){
                    if(!inv[bid])inv[bid]=0;
                    inv[bid]++;
                    if(!hbArr.includes(bid)){
                        let emp=hbArr.indexOf(0);
                        if(emp!==-1)hbArr[emp]=bid;
                    }
                }
                socket.emit('block',{x:mX,y:mY,v:0});
            }
            isM=false;
            lA=Date.now();
            updHb();
        }else{
            ctx.fillStyle=`rgba(0,0,0,${pr*0.5})`;
            ctx.fillRect(mX*ts,mY*ts,ts,ts);
            ctx.strokeStyle='#000';
            ctx.lineWidth=1;
            ctx.strokeRect(mX*ts+ts/2-5,mY*ts+ts/2-1.5,10,3);
            ctx.fillStyle='#0f0';
            ctx.fillRect(mX*ts+ts/2-5,mY*ts+ts/2-1.5,10*pr,3);
        }
    }

    ents.forEach(e=>{
        if(!e.px)e.px=e.x;
        if(!e.dir)e.dir=1;
        let mv=Math.abs(e.x-e.px)>0.1;
        if(e.x>e.px)e.dir=1;
        if(e.x<e.px)e.dir=-1;
        e.px=e.x;
        if(e.t==='pig')drawPig(ctx,entImg.p,e.x,e.y,mv,e.dir);
        else drawHumanoid(ctx,entImg.z,e.x,e.y,mv,e.dir,true,false);
        ctx.fillStyle='#fff';
        ctx.textAlign='center';
        ctx.font='6px Galmuri9';
        ctx.fillText(e.t,e.x+8,e.y-4);
    });

    for(let u in players){
        let op=players[u];
        if(!op.px)op.px=op.x;
        if(!op.dir)op.dir=1;
        let mv=Math.abs(op.x-op.px)>0.1;
        let isSp=Math.abs(op.x-op.px)>3;
        if(op.x>op.px)op.dir=1;
        if(op.x<op.px)op.dir=-1;
        op.px=op.x;
        drawHumanoid(ctx,entImg.s,op.x,op.y,mv,op.dir,false,isSp);
        ctx.fillStyle=u===uid?'#ff5':'#fff';
        ctx.textAlign='center';
        ctx.font='6px Galmuri9';
        ctx.fillText(u,op.x+8,op.y-4);
    }
    
    ctx.restore();
    requestAnimationFrame(loop);
}
