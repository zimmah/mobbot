const { Client } = require('discord.js');
const { token } = require('./key.json');
const { isAdmin } = require('./helpers/validators');
const { init, findMob, stopMobbing, skip } = require('./helpers/general');
const { helpResponse } = require('./helpers/responses');
const { mute, unmute } = require('./helpers/settings');

const client = new Client();

client.on('ready', () => {
    init(client);
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    const mob = findMob(msg);
    if (msg.content === 'init' && isAdmin(msg.member)) {
        init(client);
    } else if (mob) {
        if (msg.content === 'help') {
            return helpResponse(msg);
        }
        if (msg.content === 'mute') {
            return mute(msg, mob);
        }
        if (msg.content === 'unmute') {
            return unmute(msg, mob);
        }
        if (msg.content === 'stop') {
            return stopMobbing(msg, mob);
        }
        if (msg.content === 'skip') {
            return skip(msg, mob);
        }

    }
});

client.login(token);
