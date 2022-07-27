const socket = io()

const myFace = document.getElementById('myFace')
const muteBtn = document.getElementById('mute')
const cameraBtn = document.getElementById('camera')
const camerasSelect = document.getElementById('cameras')

let myStream
let muted = false
let cameraOff = false

async function getCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')
    cameras.forEach(camera => {
      const option = document.createElement('option')
      option.value = camera.deviceId
      option.innerText = camera.label
      camerasSelect.appendChild(option)
    })
  } catch (e) {
    console.log(e)
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true, video: true
    })
    myFace.srcObject = myStream

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

getMedia()
getCamera()

muteBtn.addEventListener('click', handleMuteClick)
cameraBtn.addEventListener('click', handleCameraClick)
