import express from 'express';
import http from 'http';
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname.replace('\\dist', '') + '/src/index.html');
});
let players:{[key:string]:number[]} = {}

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);


    socket.emit('init', socket.id)
    console.log(players)
    players[socket.id] = [100, 100]
    socket.broadcast.emit('render', players)
    socket.emit('render', players)
    console.log(players)

    socket.on('update', (e:number[]) => {
        players[socket.id][0] += e[0]
        players[socket.id][1] += e[1]
        socket.broadcast.emit('render', players)
        socket.emit('render', players)
        console.log(players)
    })

    socket.on('disconnect', e => {
        delete players[socket.id]
        socket.broadcast.emit('render', players)
        socket.emit('render', players)
    })
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});