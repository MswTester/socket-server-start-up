import express from "express";
import http from "http";
import { Server } from "socket.io";
import { Socket } from "socket.io-client";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname.replace("\\dist", "") + "/src/index.html");
});
let players: { [key: string]: any[] } = {};
let chats: { [key: string]: string } = {};
let bullets: { [key: string]: number[] } = {};

const bulletSpeed = 10;

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  socket.emit("init", socket.id);

  socket.on("login", (e: string) => {
    players[socket.id] = [100, 100, e, 100];
    console.log(players);
    socket.emit("logged", "");
  });

  socket.on("createBullet", (e: number[]) => {
    bullets[socket.id] = [
      players[socket.id][0],
      players[socket.id][1],
      e[0],
      e[1],
    ];
  });

  socket.on("die", (e) => {
    delete players[socket.id];
  });

  socket.on("update", (e: number[]) => {
    console.log(e);
    players[socket.id][0] += e[0];
    players[socket.id][1] += e[1];
  });

  socket.on("disconnect", (e) => {
    delete players[socket.id];
  });

  function render() {
    socket.broadcast.emit("render", [players, chats, bullets]);
    socket.emit("render", [players, chats, bullets]);
  }

  setInterval(() => {
    render();
  }, 1);
});

setInterval(() => {
  let delist: any[] = [];
  Object.keys(bullets).forEach((v, i) => {
    let e = Object.values(bullets)[i];
    e[0] += e[3] * bulletSpeed;
    e[1] += e[3] * (e[2] * bulletSpeed);
    if (e[0] < -1 || e[0] > 2000 || e[1] < -1 || e[1] > 2000) {
      delist.push(v);
    } else {
      Object.keys(players).forEach((v2, i2) => {
        let e2 = Object.values(players)[i2];
        if (v2 == v) return;
        if (
          e2[0] - 10 < e[0] &&
          e2[0] + 10 > e[0] &&
          e2[1] - 10 < e[1] &&
          e2[1] + 10 > e[1]
        ) {
          console.log(e2);
          e2[3] -= 10;
          delist.push(v);
        }
      });
    }
  });
  delist.forEach((v) => {
    delete bullets[v];
  });
}, 1);

server.listen(3000, () => {
  console.log("listening on *:3000");
});
