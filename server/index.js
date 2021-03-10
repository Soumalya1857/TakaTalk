const express = require('express');
const socketio = require('socket.io');
const http = require('http');


const {addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const PORT = process.env.PORT || 5000;
const router = require('./router');
const app = express();
const server = http.createServer(app);
const io = socketio(server,{
    cors:
    {
        origin: "*",
        methods: ["GET","POST"],
        credentials: true
    }
});

app.use(router); 


io.on('connect', (socket)=>{
    console.log("We have a new connection!!");

    socket.on('join',({name, room}, callback)=>{
        //callback(); // basically for error handling and needed to pass as 3rd argument in the client part
        const { error, user } = addUser({id: socket.id, name:name, room: room}); // it can return 2 things
        if(error) return callback(error);

        // for no error
        socket.join(user.room);

        // user inside the room
        socket.emit('message', {user: 'admin', text: `Welcome ${user.name}!!`});
        socket.broadcast.to(user.room).emit('message', {user: 'admin', text: `${user.name} just slid into the room!`});

        io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
        callback();
    });


    socket.on('sendMessage', (message, callback)=> {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', {user: user.name, text: message});
        //io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});

        callback();
    });

    socket.on('disconnect', ()=>{
        console.log("User left!!");
        const user = removeUser(socket.id);

        if(user)
        {
            io.to(user.room).emit('message', {user:'admin', text: `${user.name} left the room!!`});
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    });
});

server.listen(PORT, ()=> console.log(`Server has started on port ${PORT}`));