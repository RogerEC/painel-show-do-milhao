const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIo = require('socket.io')(server);
const path = require('path');

server.listen(7070, '0.0.0.0', () => {
    console.log("Servidor conectado na porta 7070!");
});

app.use(express.static(path.join(__dirname, 'public')));

socketIo.on('connection', socket => {

    socket.on('switch-video-slide', () => {
        socket.broadcast.emit('switch-video-slide');
    });

    socket.on('show-next-question', () => {
        socket.broadcast.emit('show-next-question');
    });

    socket.on('show-next-alternative', (code) => {
        socket.broadcast.emit('show-next-alternative', code);
    });

    socket.on('clean-screen', () => {
        socket.broadcast.emit('clean-screen');
    });

    socket.on('select-alternative', (alternative) => {
        socket.broadcast.emit('select-alternative', alternative);
    });

    socket.on('clear-selected-alternatives', () => {
        socket.broadcast.emit('clear-selected-alternatives');
    });

    socket.on('disable-alternative', (alternative) => {
        socket.broadcast.emit('disable-alternative', alternative);
    });

    socket.on('clear-disabled-alternatives', () => {
        socket.broadcast.emit('clear-disabled-alternatives');
    });

    socket.on('draw-card', () => {
        socket.broadcast.emit('draw-card');
    });

    socket.on('check-question', () => {
        socket.broadcast.emit('check-question');
    });

    socket.on('delete-alternative', (code) => {
        socket.broadcast.emit('delete-alternative', code);
    });

    socket.on('reset-alternative', () => {
        socket.broadcast.emit('reset-alternative');
    });

    socket.on('deleted-alternative', (index) => {
        socket.broadcast.emit('deleted-alternative', index);
    });
    
});