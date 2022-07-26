const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
//Set static folder
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static("public"));
//const PORT = process.env.PORT || 3000;
//const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//const io = socketio(server);
const botName = "ChatBot";
//Run when client connects

io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username , room);
        socket.join(user.room);
         //single client emit ,,, welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to CHAT!!'));
    //Broadcast when a user connects.... all clients except the user itself
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat.`));
    //all clients emit
    //io.emit();
    // Send users and room info
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    });
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
    
    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if(user)
        {
           io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

           // Send users and room info
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
            });
        }
    });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//https://my-pepoard.herokuapp.com/