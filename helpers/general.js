const fs = require('fs');
const { initialSettings } = require('./settings');
const { stopBreakAndClearTimer } = require('./timers');
const { stopResponse } = require('./responses');

// internal
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

const stopMobbing = (msg, mob) => {
    stopBreakAndClearTimer(mob);
    stopResponse(msg, mob.roleId);
}

const skip = (msg, mob) => {
    stopBreakAndClearTimer(mob);
    console.log('ERROR, NOT COMPLETE FUNCTION')
}

module.exports = {
    init,
    findMob,
    stopMobbing,
    skip,
}
