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
  socket.on('room', (roomName, done) => {
    console.log(roomName)
    setTimeout(() => {
      done('hi?')
      // backend 가 실행하는 것이 아니라 frontend 에서 실행한다.
      // backend 에서 실행한다면 보안문제가 생긴다. 실행 버튼을 눌러주는 것이라고 생각하면 된다.
    }, 1000)
  })
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
