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

wsServer.on('connection', socket => {
  socket.on('join_room', (roomName, done) => {
    socket.join(roomName)
    done()
    socket.to(roomName).emit('welcome')
  })
  socket.on('offer', (offer, roomName) => {
    socket.to(roomName).emit('offer', offer)
  })
})

const handleListening = () => console.log(`✅ Listening on http://localhost:${port}`)

httpServer.listen(3000, handleListening)
