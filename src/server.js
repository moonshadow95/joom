import http from 'http'
import express from 'express'
import {Server} from 'socket.io'
import {instrument} from "@socket.io/admin-ui";

const port = 3000
const app = express()

app.set('view engine', 'pug')
app.set('views', __dirname + '/views')

app.use('/public', express.static(__dirname + '/public'))
app.get('/', (_, res) => res.render('home'))
app.get('/*', (_, res) => res.redirect('/'))

const httpServer = http.createServer(app)
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});

instrument(wsServer, {
  auth: false
});

function publicRooms() {
  const {
    sockets:
      {
        adapter:
          {sids, rooms}
      }
  } = wsServer
  const publicRoomList = []
  rooms.forEach((_, key) => {
    if (!sids.get(key)) {
      publicRoomList.push({roomName: key, roomCount: countUsers(key)})
    }
  })
  return publicRoomList
}

function countUsers(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size
}

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anonymous'
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter)
    console.log(`Socket Event: ${event}`)
  })
  wsServer.emit('room_change', publicRooms())
  socket.on('room', (roomName, showRoom) => {
    socket.join(roomName)
    showRoom(roomName, countUsers((roomName)))
    socket.to(roomName).emit('welcome', socket.nickname, roomName, countUsers(roomName))
    // 모든 socket 에 메세지를 보내는 방법
    wsServer.sockets.emit('room_change', publicRooms())
  })
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      // 방을 떠나기 전에 실행되어 나가는 사람이 포함되므로 -1 을 해준다.
      socket.to(room).emit('bye', socket.nickname, room, countUsers(room) - 1)
    })
  })
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms())
  })
  socket.on('new_message', (message, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${message}`)
    console.log(message, room)
    // 프론트의 addMessage 를 실행
    done()
  })
  socket.on('nickname', nickname => (socket['nickname'] = nickname))
})
/*
const wss = new WebSocket.Server({server})

function onSocketClose() {
  console.log('Disconnected from the Browser ❌')
}

const sockets = []

wss.on('connection', (socket) => {
  sockets.push(socket)
  socket['nickname'] = 'anonymous'
  console.log('Connected to Browser ✅')
  socket.on('close', onSocketClose)
  socket.on('message', (msg) => {
    const message = JSON.parse(msg)
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`))
        break
      case "nickname":
        socket['nickname'] = message.payload
        break
    }
  })
})
*/

const handleListening = () => console.log(`✅ Listening on http://localhost:${port}`)

httpServer.listen(3000, handleListening)
