const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// set statci folder
app.use(express.static(path.join(__dirname, 'public')))

const botname = 'Chat Cord'

// run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // message to current user
    socket.emit('message', formatMessage(botname, 'welcome to chatcord'))

    //broacast to users when a new user joins except the new useer
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botname, ` ${user.username}  has joined the chat`)
      )

    //send users and room info

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })
  })

  // to broadcast every user -> io.emit()

  //Listen for chatMessages
  socket.on('chatMessage', (msg) => {
    const users = getCurrentUser(socket.id)

    io.to(users.room).emit('message', formatMessage(users.username, msg))
  })

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botname, `${user.username} has left the chat`)
      )
      //send users and room info

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      })
    }
  })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => {
  console.log(`Server ruuning on port ${PORT}`)
})
