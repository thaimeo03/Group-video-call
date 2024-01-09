const socket = io('http://localhost:3000')

const roomIdElement = document.getElementById('room-id')
const joinButtonElement = document.getElementById('join-button')

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
const handleJoinRoom = () => {
  socket.emit('join-room', { roomId, myId })
}

socket.on('user-connected', async (newUserId) => {
  console.log(`user connected in room with userId ${newUserId}`)

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  })

  // const newPeer = new Peer()
  const call = myPeer.call(newUserId, stream)

  call.on('stream', (incomingStream) => {
    console.log('setting stream for user: ' + newUserId)
    // remoteUsers[newUserId] = incomingStream

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
      // remoteUsers[callerId] = incomingStream
      const video = document.createElement('video')
      video.setAttribute('id', callerId)
      video.srcObject = incomingStream
      video.autoplay = true
      document.getElementById('video-container').appendChild(video)
    })
  })
}

main()
