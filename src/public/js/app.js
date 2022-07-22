const socket = io()

const welcome = document.querySelector('#welcome')
const roomNameForm = welcome.querySelector('#roomName')
const nameForm = welcome.querySelector('#name')
const room = document.querySelector('#room')
let roomName
room.hidden = true

function handleNickNameSubmit(event) {
  event.preventDefault()
  const input = welcome.querySelector('#name input')
  const h3 = welcome.querySelector('h3')
  h3.innerText = `Your name: ${input.value}`
  socket.emit('nickname', input.value)
}

function handleMessageSubmit(event) {
  event.preventDefault()
  const input = room.querySelector('#message input')
  const value = input.value
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${value}`)
  })
  input.value = ''
}

function addMessage(message) {
  const ul = room.querySelector('ul')
  const li = document.createElement('li')
  li.innerText = message
  ul.appendChild(li)
}

function showRoom() {
  room.hidden = false
  roomNameForm.hidden = true
  const h3 = room.querySelector('h3')
  h3.innerText = `Room: ${roomName}`
  const messageForm = room.querySelector('#message')
  messageForm.addEventListener('submit', handleMessageSubmit)
}

function handleRoomSubmit(event) {
  event.preventDefault()
  const input = roomNameForm.querySelector('input')
  socket.emit('room', input.value, showRoom)
  roomName = input.value
  input.value = ''
}

roomNameForm.addEventListener('submit', handleRoomSubmit)
nameForm.addEventListener('submit', handleNickNameSubmit)

socket.on("welcome", (user) => {
  addMessage(`${user} joined`)
})

socket.on('bye', (left) => {
  addMessage(`${left} left`)
})

socket.on('new_message', addMessage)
// same as - socket.on('new_message', (message)=>addMessage(message))

socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul')
  roomList.innerHTML = ''
  if (rooms.length === 0) {
    roomList.innerHTML = ''
    return
  }
  rooms.forEach(room => {
    const li = document.createElement('li')
    li.innerText = room
    roomList.appendChild(li)
  })
})
