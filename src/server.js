import http from 'http'
import express from 'express'
import {Server} from 'socket.io'

const port = 3000
const app = express()

app.set('view engine', 'pug')
app.set('views', __dirname + '/views')

app.use('/public', express.static(__dirname + '/public'))
app.get('/', (_, res) => res.render('home'))
app.get('/*', (_, res) => res.redirect('/'))

const httpServer = http.createServer(app)
const wsServer = new Server(httpServer);

wsServer.on('connection', (socket) => {
  socket['nickname'] = 'Anonymous'
  socket.onAny((event) => console.log(`Socket Event: ${event}`))
  socket.on('room', (roomName, showRoom) => {
    socket.join(roomName)
    showRoom()
    socket.to(roomName).emit('welcome', socket.nickname)
  })
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit('bye', socket.nickname)
    })
  })
  socket.on('new_message', (message, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${message}`)
    done()
    // 프론트의 addMessage 를 실행
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
