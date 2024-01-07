const socket = io('http://localhost:3000')

const roomIdElement = document.getElementById('room-id')
const joinButtonElement = document.getElementById('join-button')

let roomId
let myPeer

// Get room id
joinButtonElement.addEventListener('click', () => {
  roomId = roomIdElement.value

  handlePeer()
})

// Initialize
const main = async () => {
  myPeer = new Peer()

  myPeer.on('open', (id) => {
    console.log('My peer ID is: ' + id)
  })
}

main()
