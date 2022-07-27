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

const handleListening = () => console.log(`✅ Listening on http://localhost:${port}`)

httpServer.listen(3000, handleListening)
