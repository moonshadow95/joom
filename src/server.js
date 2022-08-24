import http from 'http';
import express from 'express';
import {Server} from 'socket.io';

const port = 3000;
const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: {sids, rooms},
    },
  } = wsServer;
  const publicRoomList = [];
  rooms.forEach((_, key) => {
    if (!sids.get(key)) {
      publicRoomList.push(key);
    }
  });
  return publicRoomList;
}

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anonymous';
  wsServer.emit('room_change', publicRooms());
  socket.on('room', (roomName, showRoom) => {
    socket.join(roomName)
    showRoom(roomName)
    socket.to(roomName).emit('welcome', socket.nickname, roomName)
    wsServer.sockets.emit('room_change', publicRooms())
  })
  socket.on('join_room', (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit('welcome', socket.nickname, roomName);
  });
  socket.on('offer', (offer, roomName) => {
    socket.to(roomName).emit('offer', offer);
  });
  socket.on('answer', (answer, roomName) => {
    socket.to(roomName).emit('answer', answer);
  });
  socket.on('ice', (ice, roomName) => {
    socket.to(roomName).emit('ice', ice);
  });
  socket.on('nickname', nickname => (socket['nickname'] = nickname))
});

const handleListening = () =>
  console.log(`✅ Listening on http://localhost:${port}`);

httpServer.listen(3000, handleListening);
