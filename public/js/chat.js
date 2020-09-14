try {
// start of TRY-CATCH BLOCK
let nickname;
let typing = {
    delay: 1200,
    el: null,
    status: false,
    timeout: null,
    create(name) {
		this.el = document.createElement('p');
		this.el.innerHTML = `<em>${name} is typing...</em>`;
		return this.el;
	},
    clear() {
		if (!this.timeout) return;
		clearTimeout(this.timeout);
		this.timeout = null;
	},
    remove() {
        if(!this.el) return;
		this.el.remove();
		this.el = null;
	},
    start(_parent, name) {
		this.el ||this.create(name);
		_parent && this.appendTo(_parent);
		var _self = this;
		var end = () => {
		  _self.el.remove();
		  _self.el = null;
		};
		this.timeout = setTimeout(() => end(), this.delay);
	},
    restart(name) {
		this.clear();
		this.start(null, name);
	},
    appendTo(elem) {
        if (this.el instanceof HTMLElement) {
            elem.appendChild(this.el);
		}
	}
};

let url = `${location.protocol}//${location.host}`;
let el = {
    nickname: document.getElementById('nickname'),
    message: document.getElementById('message'),
    send: document.getElementById('send'),
    output: document.getElementById('output'),
    feedback: document.getElementById('feedback'),
};

const socket = io.connect(url);

el.send.setAttribute('disabled', '1');

socket.on('connect', function () {
    socket.on('chat', function (data) {
		var output = document.createElement('p');
		output.innerHTML = `<strong>${data.nickname}:</strong> ${data.message}`;
        el.output.appendChild(output);
	});

    socket.on('typing', function (data) {
		typing.el ? typing.restart(data.nickname) : typing.start(el.feedback, data.nickname);
	});

    socket.on('connected', function (data) {
		var output = document.createElement('p');
		output.innerHTML = `<em><strong>${data.nickname}</strong> has joined.</em>`;
		el.output.appendChild(output);
	});	

    nickname = getCookie('nickname');
    if (nickname) {
        el.nickname.value = nickname;
		el.nickname.setAttribute('disabled', '1');
        socket.emit('connected', { nickname });
    }
    el.send.removeAttribute('disabled');
});


el.send.addEventListener('click', function() {
     nickname = el.nickname.value;
     socket.emit('chat', {
        nickname,
		message: el.message.value,
		timestamp: (new Date).getTime(),
	});
    el.message.value = '';
    el.nickname.setAttribute('disabled', '1');
    var max = 7 * 24 * 60 * 60;
    document.cookie = `nickname=${nickname};max-age=${max}`;
});

el.message.addEventListener('keyup', function(event) {
    if (event.key.toLowerCase() === 'enter') {
        return el.send.click();
	}
    socket.emit('typing', {
        nickname: el.nickname.value
	});
});

function getCookie(name) {
    if (!document.cookie) return false;
    var cookies = document.cookie.split(';');
    for (let i in cookies) {
        var cookie = cookies[i].split('=');
		if (cookie[0] === name) return cookie[1];
	}
    return null;
}

//* end of TRY-CATCH BLOCK
} catch (error) {
    alert('[ERR] ' + error.message);
}

