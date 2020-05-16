require('dotenv').config();
const { Client } = require('discord.js');
const { isAdmin } = require('./helpers/validators.js');
const { stopHandler, skipHandler, bufferHandler, startHandler, breakHandler, awayHandler } = require('./helpers/general.js');
const { helpResponse } = require('./helpers/responses.js');
const { mute, unmute, init, findMob } = require('./helpers/settings.js');

const client = new Client();

client.on('ready', () => {
    init(client);
    client.user.setActivity(`ring leader on ${client.guilds.cache.size} servers.`);
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message',async (msg) => {
    if (msg.author.bot) return;
    const mob = findMob(msg);
    if (msg.content === 'init' && isAdmin(msg.member)) {
        init(client, msg);
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
            return stopHandler(msg, mob);
        }
        if (msg.content === 'skip') {
            return skipHandler(msg, mob);
        }
        if (msg.content.startsWith('start')) {
            return startHandler(msg, mob, true);
        }
        if (msg.content.startsWith('restart')) {
            return startHandler(msg, mob, false);
        }
        if (msg.content.startsWith('break')) {
            return breakHandler(msg, mob);
        }
        if (msg.content.startsWith('away')) {
            return awayHandler(msg, mob, true);
        }
        if (msg.content.startsWith('return')) {
            return awayHandler(msg, mob, false);
        }
        if (msg.content.startsWith('buffer')) {
            return bufferHandler(msg, mob.mobName);
        }
    }
});

client.login(process.env.TOKEN);
