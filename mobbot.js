import { Client } from 'discord.js';
import { isAdmin } from './helpers/validators.js';
import { findMob } from './helpers/settings.js';
import { errorResponse } from './helpers/responses.js';
import { initHandler, helpHandler, muteHandler, stopHandler, skipHandler,
    startHandler, breakHandler, awayHandler, bufferHandler } from './helpers/controllers.js';

const client = new Client();

client.on('ready', () => {
    initHandler(client);
    client.user.setActivity(`ring leader on ${client.guilds.cache.size} servers.`);
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageReactionAdd', (reaction) => {
    const mob = findMob(reaction.message);
    if (mob !== undefined && reaction.emoji.name === '📌') reaction.message.pin();
});

client.on('messageReactionRemove', (reaction) => {
    const mob = findMob(reaction.message);
    if (mob !== undefined && reaction.emoji.name === '📌') {
        reaction.message.unpin();
        reaction.message.channel.send('message unpinned.');
    };
})

client.on('message', (msg) => {
    try {
        if (msg.author.bot) return;
        if (msg.content === 'init' && isAdmin(msg.member)) return initHandler(client, msg);
        
        const mob = findMob(msg);
        if (mob === undefined) return;

        if (msg.content === 'help') return helpHandler(msg);
        if (msg.content === 'mute') return muteHandler(msg, mob, true);
        if (msg.content === 'unmute') return muteHandler(msg, mob, false);
        if (msg.content === 'stop') return stopHandler(msg, mob);
        if (msg.content === 'skip') return skipHandler(msg, mob);
        if (msg.content.startsWith('start')) return startHandler(msg, mob, true);
        if (msg.content.startsWith('restart')) return startHandler(msg, mob, false);
        if (msg.content.startsWith('break')) return breakHandler(msg, mob);
        if (msg.content.startsWith('away')) return awayHandler(msg, mob, true);
        if (msg.content.startsWith('return')) return awayHandler(msg, mob, false);
        if (msg.content.startsWith('buffer')) return bufferHandler(msg, mob);

    } catch (error) {
        errorResponse(msg, error.message);
    }
});

client.login(process.env.TOKEN);
