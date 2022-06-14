const socket = new WebSocket(`ws://${window.location.host}`)

socket.addEventListener('open',()=>{
  console.log('Connected to Server ✅')
})

socket.addEventListener('message',(message)=>{
  console.log('New Message: ', message.data, 'from the server')
})

socket.addEventListener('close', ()=>{
  console.log('Disconnected from the server ❌')
})

setTimeout(()=>{
  socket.send('Hello from the Browser')
},5000)
