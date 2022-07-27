const socket = io()

const myFace = document.getElementById('myFace')
const muteBtn = document.getElementById('mute')
const cameraBtn = document.getElementById('camera')

let myStream
let muted = true
let cameraOff = true

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
  if (muted === true) {
    muted = false
    muteBtn.innerText = 'Mute'
  } else {
    muted = true
    muteBtn.innerText = 'Unmute'
  }
}

function handleCameraClick() {
  if (cameraOff === true) {
    cameraOff = false
    cameraBtn.innerText = 'Camera Off'
  } else {
    cameraOff = true
    cameraBtn.innerText = 'Camera On'
  }
}

muteBtn.addEventListener('click', handleMuteClick)
cameraBtn.addEventListener('click', handleCameraClick)
