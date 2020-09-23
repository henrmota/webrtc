const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server, {
    pingInterval: 15000,
    pingTimeout: 30000
});

server.listen(process.env.PORT || 8000 , () => {console.log('Listening on 8000')});

io.on('connection', (socket) => {
    socket.on('join', (room) => {
        const { length, sockets = {} } = io.sockets.adapter.rooms[room] || {length: 0};
        if(length > 1) {
            socket.disconnect();
        }      

        socket.join(room);
        socket.emit('joined');
        
        console.log(length);
        if(length === 1) {
            socket.to(room).emit('polite');
        }
    });

    socket.on('message', (event) => {
        console.log(event);
        socket.to(event.room).emit('message', event);
    });
})
