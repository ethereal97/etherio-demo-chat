const express = require('express');
const socket = require('socket.io');
const path = require('path');

let online = {
    connections: [],
    push(value) {
		if (this.connections.includes(value)) return;
        return this.connections.push(value);
	},
    remove(value) {
		if (!this.connections.includes(value)) return;
		for (let i in this.connections) {
		    if (this.connections[i] === value) {
				delete this.connections[i];
				this.connections = this.connections.filter(n => n !== null);
				return;
			}
		}
	},
    get length() {
		return this.connections.length;
	}
};

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
    var nickname = getCookie(client.handshake.headers.cookie, 'nickname');

    client.on('connected', (data) => {
		online.push(nickname);
		data.online = online.connections;
		io.sockets.emit('connected', data);
	});

    client.on('chat', (data) => io.sockets.emit('chat', data));
    
    client.on('typing', (data) => io.sockets.emit('typing', data));

    client.on('disconnect', () => {
		var data = {
		    online,
		    nickname,
		};
		online.remove(nickname);
		data.online = online.length;
		io.sockets.emit('disconnected', data);
    });
});

function getCookie(cookies, name) {
    cookies = cookies.split(';');
    for(let i in cookies) {
        var [key, value] = cookies[i].split('=');
		if (key === name) return value;
	}
    return null;
}
