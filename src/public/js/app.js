const socket = io()

const welcome = document.querySelector('#welcome')
const roomNameForm = welcome.querySelector('#roomName')
const nameForm = welcome.querySelector('#name')
const room = document.querySelector('#room')
let roomName
room.hidden = true

function showRoomList(rooms) {
  const ul = welcome.querySelector('ul')
  ul.innerHTML = ''
  if (rooms.length === 0) {
    ul.innerHTML = ''
    return
  }
  rooms.forEach(room => {
    const li = document.createElement('li')
    const button = document.createElement('button')
    const i = document.createElement('i')
    button.innerText = room.roomName
    i.innerText = `(${room.roomCount})`
    ul.appendChild(li)
    li.appendChild(button)
    li.appendChild(i)
    button.style.marginRight = '12px'
    button.addEventListener('click', (event) => {
      socket.emit('room', event.currentTarget.innerText, showRoom)
      roomName = event.currentTarget.innerText
    })
  })
}

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

function changeTitle(roomName, newCount) {
  const h3 = room.querySelector('h3')
  h3.innerText = `Room: ${roomName}(${newCount})`
}

function addMessage(message) {
  const ul = room.querySelector('ul')
  const li = document.createElement('li')
  li.innerText = message
  ul.appendChild(li)
}

function showRoom(name, count) {
  room.hidden = false
  roomNameForm.hidden = true
  const messageForm = room.querySelector('#message')
  messageForm.addEventListener('submit', handleMessageSubmit)
  changeTitle(name, count)
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

socket.on("welcome", (user, roomName, newCount) => {
  addMessage(`${user} joined`)
  changeTitle(roomName, newCount)
})

socket.on('bye', (user, roomName, newCount) => {
  addMessage(`${user} left`)
  changeTitle(roomName, newCount)
})

socket.on('new_message', addMessage)
// same as - socket.on('new_message', (message)=>addMessage(message))

socket.on('room_change', (rooms) => showRoomList(rooms))
