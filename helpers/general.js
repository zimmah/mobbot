const fs = require('fs');
const { initialSettings } = require('./settings');
const { stopBreakAndClearTimer } = require('./timers');
const { stopResponse, bufferResponse, createBufferEmbed, errorResponse } = require('./responses');
const { isLengthBelow } = require('./validators');

const buffers ={};

// internal
const createNewBufferIfNeccesary = mobName => {
    if (buffers[mobName] === undefined) {
        buffers[mobName] = createBufferEmbed(mobName);
    }
  }

const removeItemFromBuffer = (msg, mobName) => {
    const id = +msg.content.split(' ')[2];
    if (!isNaN(id)) { 
        const index = buffers[mobName].fields.findIndex(field => field.name === id);
        index >= 0 && buffers[mobName].fields.splice(index, 1);
    } else {
        throw new Error('removeItemError');
    }
}

const addItemToBuffer = (msg, mobName) => {
    const payload = msg.content.split(' ').slice(2).join(' ');
    if (isLengthBelow(payload, 1024)) {
        const highestId = () => buffers[mobName].fields.reduce( (highest, current) => Math.max(current.name, highest), 0);
        buffers[mobName].fields.push({name: highestId() + 1, value: payload});
    } else {
        throw new Error('tooLong');
    }
}

const clearBuffer = mobName => buffers[mobName].fields = [];

const findMembers = (mobId, serverMembers, mobbotId) => {
    const mobMembers = serverMembers
        .filter(member => member._roles.some(role => role === mobId) && member.id !== mobbotId)
        .map(member => ({id: member.user.id, name: member.user.username}))
        .flat();
    return mobMembers;
}

const findMobs = (server, mobbotId) => {
    const mobbot = server.members.cache.filter(member => member.user.id === mobbotId);
    const mobbotRoles = mobbot.map(member => member._roles).flat();
    const serverRoles = server.roles.cache;
    const serverChannels = server.channels.cache;
    const serverMembers = server.members.cache;
    const channelNames = serverChannels.map(channel => channel.name).flat();

    const filteredRoles = serverRoles
        .filter(role => mobbotRoles.includes(role.id))
        .map(role => ({name: role.name, id: role.id, channelName: role.name.replace(' ', '-').toLowerCase()}));

    const mobs = filteredRoles
        .filter(role => channelNames.includes(role.channelName))
        .map(mob => ({
            mobName: mob.name,
            channelName: mob.channelName,
            roleId: mob.id,
            members: findMembers(mob.id, serverMembers, mobbotId),
            serverName: server.name
        }));

    return mobs;
}

// external
const init = (client) => {
    const mobbotId = client.user.id;
    const servers = client.guilds.cache.map(server => ({
        name: server.name,
        mobs: findMobs(server, mobbotId),
    }));
    
    initialSettings(servers);
}

const findMob = (msg) => {
    const mob = `./settings/${msg.guild.name}/${msg.channel.name}.json`;
    return fs.existsSync(mob) && require(`.${mob}`);
}

const stopHandler = (msg, mob) => {
    stopBreakAndClearTimer(mob);
    stopResponse(msg, mob.roleId);
}

const skipHandler = (msg, mob) => {
    stopBreakAndClearTimer(mob);
    console.log('ERROR, NOT COMPLETE FUNCTION')
}

const bufferHandler = (msg, mobName) => {
    const command = msg.content.split(' ')[1];
    createNewBufferIfNeccesary(mobName);
    try {
        if (command === 'remove' || command === 'delete') {
            removeItemFromBuffer(msg, mobName);
        }
        if ( command === 'add') {
            addItemToBuffer(msg, mobName);
        }
        if ( command === 'clear') {
            clearBuffer(mobName);
        }
        return bufferResponse(msg, buffers[mobName]);
    } catch(error) {
        return errorResponse(msg, error.message);
    }
}

module.exports = {
    init,
    findMob,
    stopHandler,
    skipHandler,
    bufferHandler,
}
