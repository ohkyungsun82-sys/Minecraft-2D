const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const fs=require('fs');
const app=express();
const server=http.createServer(app);
const io=new Server(server);
app.use(express.static('public'));

let users=fs.existsSync('users.json')?JSON.parse(fs.readFileSync('users.json')):{};
let world=fs.existsSync('world.json')?JSON.parse(fs.readFileSync('world.json')):null;
let players={};
let ents=[{id:'e1',t:'pig',x:500,y:0},{id:'e2',t:'zombie',x:700,y:0}];
const ts=16;

if(!world){
    world={};
    for(let x=-200;x<200;x++){
        world[x]={};
        let gh=20+Math.floor(Math.sin(x/15)*6+Math.sin(x/5)*3);
        for(let y=gh;y<=80;y++){
            if(y===80)world[x][y]=21;
            else if(y>=50){
                let r=Math.random();world[x][y]=r<0.01?38:r<0.02?30:r<0.03?32:17;
            }else if(y>=gh+4){
                let r=Math.random();world[x][y]=r<0.02?25:r<0.04?5:r<0.05?28:3;
            }else if(y>gh)world[x][y]=2;
            else world[x][y]=1;
        }
        if(Math.random()<0.08){
            let th=4+Math.floor(Math.random()*2);
            for(let ty=1;ty<=th;ty++)world[x][gh-ty]=6;
            for(let lx=-2;lx<=2;lx++){
                for(let ly=th-1;ly<=th+1;ly++){
                    if(Math.abs(lx)===2&&ly===th+1)continue;
                    if(!world[x+lx])world[x+lx]={};
                    if(!world[x+lx][gh-ly])world[x+lx][gh-ly]=7;
                }
            }
        }
    }
}

setInterval(()=>{
    fs.writeFileSync('users.json',JSON.stringify(users));
    fs.writeFileSync('world.json',JSON.stringify(world));
},10000);

setInterval(()=>{
    ents.forEach(e=>{
        e.x+=(Math.random()-0.5)*2;
        let bx=Math.floor((e.x+4)/ts),by=Math.floor((e.y+12)/ts);
        if(world[bx]&&world[bx][by])e.y=by*ts-12;
        else e.y+=2;
    });
    io.emit('ents',ents);
},100);

io.on('connection',s=>{
    s.on('reg',d=>{
        if(users[d.id])return s.emit('err','E1');
        users[d.id]={pw:d.pw,inv:{201:1,202:1,203:1},x:500,y:0,hp:20,hg:20};
        s.emit('reg_ok');
    });
    s.on('log',d=>{
        if(!users[d.id]||users[d.id].pw!==d.pw)return s.emit('err','E2');
        s.uid=d.id;
        players[d.id]={x:users[d.id].x||500,y:users[d.id].y||0,hp:users[d.id].hp||20,hg:users[d.id].hg||20};
        s.emit('start',{w:world,p:players,uid:d.id,inv:users[d.id].inv||{}});
        io.emit('sys',{t:'join',u:d.id});
    });
    s.on('chat',m=>io.emit('chat',{u:s.uid,m}));
    s.on('move',p=>{
        if(s.uid&&users[s.uid]){
            players[s.uid].x=users[s.uid].x=p.x;
            players[s.uid].y=users[s.uid].y=p.y;
            s.broadcast.emit('move',{u:s.uid,x:p.x,y:p.y});
        }
    });
    s.on('inv',v=>{if(s.uid&&users[s.uid])users[s.uid].inv=v;});
    s.on('block',b=>{
        if(!world[b.x])world[b.x]={};
        if(b.v===0)delete world[b.x][b.y];
        else world[b.x][b.y]=b.v;
        io.emit('block',b);
    });
    s.on('disconnect',()=>{
        if(s.uid){
            delete players[s.uid];
            io.emit('sys',{t:'leave',u:s.uid});
            io.emit('del',s.uid);
        }
    });
});
server.listen(process.env.PORT||3000);
