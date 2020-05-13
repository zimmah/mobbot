const fs = require('fs');
const { isSameOrder } = require('./validators');
const { muteResponse, unmuteResponse, initResponse} = require('./responses');

// internal
const randomizeOrder = mob => {
    throw new Error('not implemented');
}

const shouldMobSettingsUpdate = (newSettings, oldSettings) => {
    const { mobSettings } = oldSettings;
    if (mobSettings === undefined) return true;

    const { roundTime, rounds, order } = mobSettings;
    const { newRoundTime, newRounds, newOrder } = newSettings;
    if ( roundTime === newRoundTime && rounds === newRounds && isSameOrder(order, newOrder)) {
        return false;
    }
    return true;
}

const initialSettings = (servers) => {
    servers.forEach(server => {
        fs.existsSync(`./settings/${server.name}`) || fs.mkdirSync(`./settings/${server.name}`);
        server.mobs.forEach(mob => {
            try {
                fs.accessSync(`./settings/${server.name}/${mob.channelName}.json`);
                const existingSettings = require(`../settings/${server.name}/${mob.channelName}.json`);
                if (JSON.stringify({...existingSettings, ...mob}) !== JSON.stringify({existingSettings})) {
                    fs.writeFileSync(`./settings/${server.name}/${mob.channelName}.json`, JSON.stringify({...existingSettings, ...mob}));
                }
            } catch (error) {
                fs.writeFileSync(`./settings/${server.name}/${mob.channelName}.json`, JSON.stringify(mob));
            }
        });
    });
}

const findMembers = (mobId, serverMembers, mobbotId) => {
    const mobMembers = serverMembers
        .filter(member => member._roles.some(role => role === mobId) && member.id !== mobbotId)
        .map(member => ({id: member.user.id, name: member.user.username, nickname: member.displayName}))
        .flat();
    return mobMembers;
}

const findAllMobs = (server, mobbotId) => {
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
            channelId: serverChannels.filter(channel => channel.name === mob.channelName).map(channel => channel.id)[0],
            roleId: mob.id,
            members: findMembers(mob.id, serverMembers, mobbotId),
            serverName: server.name
        }));

    return mobs;
}

// external
const findMob = (msg) => {
    const mob = `./settings/${msg.guild.name}/${msg.channel.name}.json`;
    return fs.existsSync(mob) && require(`.${mob}`);
}

const init = (client, msg = undefined) => {
    const mobbotId = client.user.id;
    const servers = client.guilds.cache.map(server => ({
        name: server.name,
        mobs: findAllMobs(server, mobbotId),
    }));
    
    initialSettings(servers);
    msg && initResponse(msg);
}

const mute = (msg, mob) => {
    fs.writeFileSync(`./settings/${mob.serverName}/${mob.channelName}.json`, JSON.stringify({ ...mob, muted: true }));
    muteResponse(msg);
}

const unmute = (msg, mob) => {
    fs.writeFileSync(`./settings/${mob.serverName}/${mob.channelName}.json`, JSON.stringify({ ...mob, muted: false }));
    unmuteResponse(msg);
}

const updateMobSettings = ({newRounds = 3, newRoundTime = 20, newOrder = []} = newSettings = {}, keepSameOrder, mob) => {
    const oldSettings = require(`../settings/${mob.serverName}/${mob.channelName}.json`);
    if (newOrder.length === 0 && (!keepSameOrder || !oldSettings.mobSettings)) {
        newOrder = randomizeOrder(mob);
    }
    if (shouldMobSettingsUpdate({newRounds, newRoundTime, newOrder}, oldSettings)) {
        const settings = JSON.stringify({...oldSettings, mobSettings: {rounds: newRounds, roundtime: newRoundTime, order: newOrder}});
        fs.writeFileSync(`./settings/${mob.serverName}/${mob.channelName}.json`, settings);
    }
}

module.exports = {
    findMob,
    init,
    mute,
    unmute,
    updateMobSettings,
}
