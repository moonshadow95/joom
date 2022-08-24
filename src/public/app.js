const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const muteIcon = muteBtn.querySelector('img');
const cameraBtn = document.getElementById('camera');
const cameraIcon = cameraBtn.querySelector('img');
const camerasSelect = document.getElementById('cameras');
const call = document.getElementById('call');
const nicknameForm = document.querySelector('#nickname form');
const nickname = document.querySelector('#nickname h3');
const chat = document.getElementById('chat');
const chatForm = document.getElementById('chatForm');
const chatInput = chatForm.querySelector('input');

let myStream;
let muted = false;
let cameraOff = false;
let myPeerConnection;
let myDataChannel;

call.hidden = true;
chat.hidden = true;

async function getCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: {
      facingMode: 'user',
    },
  };
  const cameraConstrains = {
    audio: true,
    video: {deviceId: {exact: deviceId}},
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    );
    myFace.srcObject = myStream;
    myFace.style.transform = 'scaleX(-1)';
    if (!deviceId) {
      await getCamera();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (muted === true) {
    muted = false;
    muteIcon.src =
      'https://img.icons8.com/windows/32/ffffff/block-microphone.png';
    muteBtn.style.backgroundColor = '#fc1c1c';
  } else {
    muted = true;
    muteIcon.src =
      'https://img.icons8.com/windows/32/ffffff/microphone--v1.png';
    muteBtn.style.backgroundColor = '#118bee';
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff === true) {
    cameraOff = false;
    cameraIcon.src =
      'https://img.icons8.com/external-regular-kawalan-studio/24/ffffff/external-camera-off-user-interface-regular-kawalan-studio.png';
    cameraBtn.style.backgroundColor = '#fc1c1c';
  } else {
    cameraOff = true;
    cameraIcon.src =
      'https://img.icons8.com/material-outlined/24/ffffff/camera--v1.png';
    cameraBtn.style.backgroundColor = '#118bee';
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);

  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === 'video');
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);
camerasSelect.addEventListener('input', handleCameraChange);

// Welcome (join a room, save a nickname)

const welcome = document.getElementById('welcome');
const roomNameForm = welcome.querySelector('form');

let roomName;

function showRoomList(rooms) {
  const ul = welcome.querySelector('ul');
  ul.innerHTML = '';
  if (rooms.length === 0) {
    ul.innerHTML = "There's no room";
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.innerText = room;
    ul.appendChild(li);
    li.appendChild(button);
    button.style.marginRight = '12px';
    button.addEventListener('click', handleRoomSubmit);
  });
}

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  chat.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleRoomSubmit(event) {
  event.preventDefault();
  const h3 = call.querySelector('h3')
  if (event.target === roomNameForm) {
    const input = roomNameForm.querySelector('input');
    h3.innerText = `Room : '${input.value}'`
    await initCall();
    socket.emit('join_room', input.value);
    roomName = input.value;
    input.value = '';
  } else {
    h3.innerText = `Room : '${event.target.innerText}'`;
    await initCall();
    socket.emit('join_room', event.target.innerText);
    roomName = event.target.innerText;
  }
}

function makeMessage(data) {
  const ul = chat.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = data;
  ul.appendChild(li);
  ul.scrollTop = ul.scrollHeight;
}

function handleChatSubmit(e) {
  e.preventDefault();
  try {
    makeMessage(`You: ${chatInput.value}`);
    myDataChannel.send(`${nickname.innerText}: ${chatInput.value}`);
  } catch (error) {
    console.log(error)
  }
  chatInput.value = '';
}

function changeNickname(name) {
  nickname.innerText = name
}

async function handleNickSubmit(e) {
  e.preventDefault()
  const input = nicknameForm.querySelector('input')
  socket.emit('nickname', input.value)
  changeNickname(input.value)
}

roomNameForm.addEventListener('submit', handleRoomSubmit);
chatForm.addEventListener('submit', handleChatSubmit);
nicknameForm.addEventListener('submit', handleNickSubmit)

// Socket Code

socket.on('welcome', async () => {
  // runs on normal tab
  myDataChannel = myPeerConnection.createDataChannel('chat');
  myDataChannel.addEventListener('message', (event) => makeMessage(event.data));
  console.log('made data channel');
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  console.log('sent the offer');
  socket.emit('offer', offer, roomName);
});

socket.on('offer', async (offer) => {
  // runs on secret tab
  myPeerConnection.addEventListener('datachannel', (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener('message', (event) =>
      makeMessage(event.data)
    );
  });
  console.log('received the offer');
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  socket.emit('answer', answer, roomName);
  myPeerConnection.setLocalDescription(answer);
});

socket.on('answer', (answer) => {
  myPeerConnection.setRemoteDescription(answer);
  console.log('received the answer');
});

socket.on('ice', (ice) => {
  console.log('received candidate');
  myPeerConnection.addIceCandidate(ice);
});

socket.on('room_change', (rooms) => showRoomList(rooms));

// RTC Code

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302',
        ],
      },
    ],
  });
  myPeerConnection.addEventListener('icecandidate', handleIce);
  myPeerConnection.addEventListener('addstream', handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit('ice', data.candidate, roomName);
  console.log('send candidate');
}

function handleAddStream(data) {
  const peersFace = document.getElementById('peersFace');
  peersFace.srcObject = data.stream;
}
