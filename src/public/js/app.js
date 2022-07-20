const socket = io()

const welcome = document.querySelector('#welcome')
const form = document.querySelector('form')
const room = document.querySelector('#room')
let roomName
room.hidden = true

function handleMessageSubmit(event) {
  event.preventDefault()
  const input = room.querySelector('input')
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
  const formInRom = room.querySelector('form')
  formInRom.addEventListener('submit', handleMessageSubmit)
}

function handleRoomSubmit(event) {
  event.preventDefault()
  const input = form.querySelector('input')
  socket.emit('room', input.value, showRoom)
  roomName = input.value
  input.value = ''
}

form.addEventListener('submit', handleRoomSubmit)

socket.on("welcome", () => {
  addMessage('Someone joined')
})

socket.on('bye', () => {
  addMessage('Someone left')
})

socket.on('new_message', addMessage)
// same as - socket.on('new_message', (message)=>addMessage(message))
