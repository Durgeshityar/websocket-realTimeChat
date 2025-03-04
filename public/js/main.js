const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

// Get username and room from URL

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

const socket = io()

//Join Chatroom

socket.emit('joinRoom', { username, room })

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outptRoomName(room)
  outputUsers(users)
})

// message from server
socket.on('message', (message) => {
  console.log(message)
  outputMessage(message)

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

// message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  //get message text
  const msg = e.target.elements.msg.value

  // emi message to the server
  socket.emit('chatMessage', msg)

  //clear input
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

// Output message to dom
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta"> ${message.username} <span> ${message.time}</span> </p>
  <p class="text">  ${message.text} </p>`

  document.querySelector('.chat-messages').appendChild(div)
}

// add room name to DOM

function outptRoomName(room) {
  roomName.innerText = room
}

// Add users to DOM

function outputUsers(users) {
  userList.innerHTML = `
  
  ${users.map((user) => `<li> ${user.username}</li>`).join('')}

  `
}
