const { Client } = require('discord.js');
const { token } = require('./key.json');
const { isAdmin } = require('./helpers/validators');
const { init, findMob } = require('./helpers/general');
const { helpResponse, muteResponse, unmuteResponse } = require('./helpers/responses');
const { mute, unmute } = require('./helpers/settings');

const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    init(client);
});

client.on('message', msg => {
    const mob = findMob(msg);
    if (msg.content === 'init' && isAdmin(msg.member)) {
        init(client);
    } else if (mob !== undefined) {

        if (msg.content === '.') {
            msg.channel.send(`<@&${mob.roleId}> hello mob`);
        }
        
        if (msg.content === 'help') {
            return helpResponse(msg);
        }

        if (msg.content === 'mute') {
            mute(mob);
            return muteResponse(msg);
        }

        if (msg.content === 'unmute') {
            unmute(mob);
            return unmuteResponse(msg);
        }

        if (msg.content === '') {

        }

        if (msg.content === '') {

        }

    }
});

client.login(token);
