const socket = io()

const welcome = document.querySelector('#welcome')
const form = document.querySelector('form')
const room = document.querySelector('#room')
let roomName
room.hidden = true

function showRoom() {
  room.hidden = false
  form.hidden = true
  const roomTitle = room.querySelector('h3')
  roomTitle.innerText = roomName
}

function handleRoomSubmit(event) {
  event.preventDefault()
  const input = form.querySelector('input')
  socket.emit('room', {payload: input.value}, showRoom)
  roomName = input.value
  input.value = ''
}

form.addEventListener('submit', handleRoomSubmit)
