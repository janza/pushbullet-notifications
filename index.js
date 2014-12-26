var PushBullet = require('pushbullet');
var notify = require('node-notifier');
var util = require('util');
var fs = require('fs');
var path = require('path');

var pusher = new PushBullet(require('./secret'));


var stream = pusher.stream();

stream.connect();

stream.on('connect', function() {
    notify.notify({
        title: 'Connected to Pushbullet stream'
    });
    stream.on('message', handleMessage);
});

stream.on('error', function(err) {
    notify.notify({
        title: 'Pushbullet error',
        body: err
    });
    resetTimer();
});

var timeout;

function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(reconnect, 30000);
}

function handleMessage(message) {
    if (message.type === 'nop') {
        resetTimer();
    } else if (message.type === 'push') {
        var push = message.push;
        fs.writeFile('/tmp/icon.png', push.icon, 'base64', showMessage(push));

    }
}

function showMessage(push) {
    return function() {
        notify.notify({
            title: push.title,
            message: push.body.substr(0, 200),
            icon: '/tmp/icon.png'
        });
    };
}

function reconnect() {
    stream.connect();
}
