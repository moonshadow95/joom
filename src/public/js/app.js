const socket = io()

const welcome = document.querySelector('#welcome')
const form = document.querySelector('form')
const room = document.querySelector('#room')
let roomName
room.hidden = true

function addMessage(message) {
  const ul = room.querySelector('ul')
  const li = document.createElement('li')
  li.innerText = message
  ul.appendChild(li)
}

function showRoom() {
  room.hidden = false
  form.hidden = true
  const roomTitle = room.querySelector('h3')
  roomTitle.innerText = roomName
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
