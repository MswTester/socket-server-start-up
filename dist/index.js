"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
app.get('/', (req, res) => {
    res.sendFile(__dirname.replace('\\dist', '') + '/src/index.html');
});
let players = {};
io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);
    socket.emit('init', socket.id);
    console.log(players);
    players[socket.id] = [100, 100];
    socket.broadcast.emit('render', players);
    socket.emit('render', players);
    console.log(players);
    socket.on('update', (e) => {
        players[socket.id][0] += e[0];
        players[socket.id][1] += e[1];
        socket.broadcast.emit('render', players);
        socket.emit('render', players);
        console.log(players);
    });
    socket.on('disconnect', e => {
        delete players[socket.id];
        socket.broadcast.emit('render', players);
        socket.emit('render', players);
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});
//# sourceMappingURL=index.js.map