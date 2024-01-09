const socket = io('http://localhost:3000')

const roomIdElement = document.getElementById('room-id')
const joinButtonElement = document.getElementById('join-button')
const controlsElement = document.getElementById('controls')
const videoButtonElement = document.getElementById('video-button')
const leaveButtonElement = document.getElementById('leave-button')

let roomId
let myPeer = new Peer()
let myId
let remoteUsers = {}

// Get room id
joinButtonElement.addEventListener('click', () => {
  roomId = roomIdElement.value

  handleJoinRoom()
})

// Handle events
// Join room
socket.on('user-connected', async (newUserId) => {
  console.log(`user connected in room with userId ${newUserId}`)

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })

  const call = myPeer.call(newUserId, stream)

  call.on('stream', (incomingStream) => {
    console.log('setting stream for user: ' + newUserId)
    remoteUsers[newUserId] = incomingStream
    console.log(remoteUsers)

    const existingVideoElement = document.getElementById(newUserId)
    if (existingVideoElement) {
      // Remove the existing video element if it exists
      console.log('existing video element found for user: ' + newUserId)
      existingVideoElement.remove()
    }
    // Create video element
    const video = document.createElement('video')
    video.setAttribute('id', newUserId)
    video.srcObject = incomingStream
    video.autoplay = true
    document.getElementById('video-container').appendChild(video)
  })
})

const handleJoinRoom = () => {
  controlsElement.style.display = 'flex'
  socket.emit('join-room', { roomId, myId })
}

// End join room

// Leave room
const handleLeaveRoom = () => {
  socket.emit('user-leave', { myId, roomId })
  myPeer.disconnect()
  window.location.reload()
}

socket.on('user-leave', (userLeavedId) => {
  console.log(`user ${userLeavedId} left the room`)
  delete remoteUsers[userLeavedId]
  document.getElementById(userLeavedId).remove()
})

leaveButtonElement.addEventListener('click', handleLeaveRoom)

// End leave room

// Video toggle
socket.on('video-toggle', (userToggleId) => {
  const videoTrack = document.getElementById(userToggleId).srcObject.getVideoTracks()[0]
  if (videoTrack.enabled) {
    videoTrack.enabled = false
  } else {
    videoTrack.enabled = true
  }
})

videoButtonElement.addEventListener('click', () => {
  const videoTrack = document.getElementById(myId).srcObject.getVideoTracks()[0]
  if (videoTrack.enabled) {
    videoTrack.enabled = false
  } else {
    videoTrack.enabled = true
  }
  socket.emit('video-toggle', { myId, roomId })
})

// End video toggle

// Initialize
const main = async () => {
  myPeer.on('open', async (id) => {
    console.log('My peer ID is: ' + id)
    myId = id
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    const video = document.createElement('video')
    video.setAttribute('id', myId)
    video.srcObject = stream
    video.autoplay = true
    document.getElementById('video-container').appendChild(video)
  })

  myPeer.on('call', async (call) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    const { peer: callerId } = call
    call.answer(stream)

    call.on('stream', (incomingStream) => {
      const existingVideoElement = document.getElementById(callerId)
      if (existingVideoElement) {
        // Remove the existing video element if it exists
        console.log('existing video element found for user: ' + callerId)
        existingVideoElement.remove()
      }
      remoteUsers[callerId] = incomingStream
      console.log(remoteUsers)
      const video = document.createElement('video')
      video.setAttribute('id', callerId)
      video.srcObject = incomingStream
      video.autoplay = true
      document.getElementById('video-container').appendChild(video)
    })
  })
}

main()
