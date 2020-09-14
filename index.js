const express = require('express');
const socket = require('socket.io');
const path = require('path');

var root = path.join(__dirname, 'public')
var port = process.env.PORT || 4000;

let app = express();
let server = app.listen(port, function () {
    console.log(`running on port ${port} at document root: ${root}`);
});

app.use(
    express.static(root)
);

let io = socket(server);

io.on('connection', function(client) {
    client.on('connected', (data) => io.sockets.emit('connected', data));
    client.on('chat', (data) => io.sockets.emit('chat', data));
    client.on('typing', (data) => io.sockets.emit('typing', data));
});

