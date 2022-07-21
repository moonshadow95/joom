const socket = io()

const welcome = document.querySelector('#welcome')
const form = document.querySelector('form')
const room = document.querySelector('#room')
let roomName
room.hidden = true

function handleNickNameSubmit(event) {
  event.preventDefault()
  const input = room.querySelector('#name input')
  socket.emit('nickname', input.value)
}

function handleMessageSubmit(event) {
  event.preventDefault()
  const input = room.querySelector('#message input')
  const value = input.value
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${value}`)
  })
}

function addMessage(message) {
  const ul = room.querySelector('ul')
  const li = document.createElement('li')
  li.innerText = message
  ul.appendChild(li)
}

function showRoom() {
  room.hidden = false
  form.hidden = true
  const h3 = room.querySelector('h3')
  h3.innerText = roomName
  const messageForm = room.querySelector('#message')
  const nameForm = room.querySelector('#name')
  messageForm.addEventListener('submit', handleMessageSubmit)
  nameForm.addEventListener('submit', handleNickNameSubmit)
}

function handleRoomSubmit(event) {
  event.preventDefault()
  const input = form.querySelector('input')
  socket.emit('room', input.value, showRoom)
  roomName = input.value
  input.value = ''
}

form.addEventListener('submit', handleRoomSubmit)

socket.on("welcome", (user) => {
  addMessage(`${user} joined`)
})

socket.on('bye', (left) => {
  addMessage(`${left} left`)
})

socket.on('new_message', addMessage)
// same as - socket.on('new_message', (message)=>addMessage(message))
