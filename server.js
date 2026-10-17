const express=require('express');
const http=require('http');
const {Server}=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=new Server(server);
app.use(express.static('public'));
const users={};
const players={};
const world={};
const ents=[{id:'e1',t:'pig',x:500,y:0},{id:'e2',t:'zombie',x:700,y:0}];
const ts=50;
for(let x=-20;x<100;x++){
    world[x]={};
    for(let y=10;y<30;y++){
        world[x][y]=y===10?1:Math.random()<0.05?4:Math.random()<0.05?5:2;
    }
}
setInterval(()=>{
    ents.forEach(e=>{
        e.x+=(Math.random()-0.5)*5;
        let bx=Math.floor((e.x+15)/ts),by=Math.floor((e.y+30)/ts);
        if(world[bx]&&world[bx][by])e.y=by*ts-30;
        else e.y+=5;
    });
    io.emit('ents',ents);
},100);
io.on('connection',s=>{
    s.on('reg',(d)=>{
        if(users[d.id])return s.emit('err','E1');
        users[d.id]={pw:d.pw};
        s.emit('reg_ok');
    });
    s.on('log',(d)=>{
        if(!users[d.id]||users[d.id].pw!==d.pw)return s.emit('err','E2');
        s.uid=d.id;
        players[d.id]={x:500,y:0,hp:20,hg:20};
        s.emit('start',{w:world,p:players,uid:d.id});
        io.emit('sys',{t:'join',u:d.id});
    });
    s.on('chat',m=>io.emit('chat',{u:s.uid,m}));
    s.on('move',p=>{
        if(s.uid){
            players[s.uid].x=p.x;
            players[s.uid].y=p.y;
            s.broadcast.emit('move',{u:s.uid,x:p.x,y:p.y});
        }
    });
    s.on('block',b=>{
        if(!world[b.x])world[b.x]={};
        world[b.x][b.y]=b.v;
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