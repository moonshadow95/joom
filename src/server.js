import express from 'express'

const port = 3000
const app = express()

app.set('view engine','pug')
app.set('views', __dirname+'/views')

app.use('/public', express.static(__dirname + '/public'))
app.get('/',(req,res)=>res.render('home'))

const handleListening = () => console.log(`✅ Listening on http://localhost:${port}`)
app.listen(port,handleListening)
