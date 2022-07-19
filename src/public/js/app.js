const socket = io()

const welcome = document.querySelector('#welcome')
const form = document.querySelector('form')

function backendDone(message) {
  console.log(`backend: ${message}`)
}

function handleRoomSubmit(event) {
  event.preventDefault()
  const input = form.querySelector('input')
  socket.emit('room', {payload: input.value}, backendDone)
  input.value = ''
}

form.addEventListener('submit', handleRoomSubmit)
