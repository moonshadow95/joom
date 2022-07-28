const socket = io()

const myFace = document.getElementById('myFace')
const muteBtn = document.getElementById('mute')
const cameraBtn = document.getElementById('camera')
const camerasSelect = document.getElementById('cameras')
const call = document.getElementById('call')

let myStream
let muted = false
let cameraOff = false
let myPeerConnection

call.hidden = true

async function getCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')
    const currentCamera = myStream.getVideoTracks()[0]
    cameras.forEach(camera => {
      const option = document.createElement('option')
      option.value = camera.deviceId
      option.innerText = camera.label
      if (currentCamera.label === camera.label) {
        option.selected = true
      }
      camerasSelect.appendChild(option)
    })
  } catch (e) {
    console.log(e)
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: {
      facingMode: 'user'
    }
  }
  const cameraConstrains = {
    audio: true,
    video: {deviceId: {exact: deviceId}}
  }
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    )
    myFace.srcObject = myStream
    myFace.style.transform = 'scaleX(-1)'
    if (!deviceId) {
      await getCamera()
    }
  } catch (e) {
    console.log(e)
  }
}

function handleMuteClick() {
  myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled)
  if (muted === true) {
    muted = false
    muteBtn.innerText = 'Mute'
  } else {
    muted = true
    muteBtn.innerText = 'Unmute'
  }
}

function handleCameraClick() {
  myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled)
  if (cameraOff === true) {
    cameraOff = false
    cameraBtn.innerText = 'Camera Off'
  } else {
    cameraOff = true
    cameraBtn.innerText = 'Camera On'
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value)
  call.hidden = false
}

muteBtn.addEventListener('click', handleMuteClick)
cameraBtn.addEventListener('click', handleCameraClick)
camerasSelect.addEventListener('input', handleCameraChange)

// Welcome Form (join a room)

const welcome = document.getElementById('welcome')
const welcomeForm = welcome.querySelector('form')

let roomName

async function startMedia() {
  welcome.hidden = true
  call.hidden = false
  await getMedia()
  makeConnection()
}

function handleWelcomeSubmit(event) {
  event.preventDefault()
  const input = welcomeForm.querySelector('input')
  socket.emit('join_room', input.value, startMedia)
  roomName = input.value
  input.value = ''
}

welcomeForm.addEventListener('submit', handleWelcomeSubmit)

// Socket Code

socket.on('welcome', async () => {
  const offer = await myPeerConnection.createOffer()
  myPeerConnection.setLocalDescription(offer)
  console.log('sent the offer')
  socket.emit('offer', offer, roomName)
})

socket.on('offer', (offer) => console.log(offer))

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection()
  myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream))
}
