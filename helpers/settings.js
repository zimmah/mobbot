const fs = require('fs');
const servers = require('../settings/servers.json');

//internal
const updateServerMuteMob = (server, mob) => {
    const updatedServer = server.mobs.map(m => m.roleId === mob.roleId ? { ...m, muted: true } : m);
    return updatedServer;
}

//external
const initialSettings = (servers) => {
    fs.writeFileSync('./settings/servers.json', JSON.stringify(servers));
}

const mute = (mob) => {
    const serverToUpdate = mob.serverName;
    const updatedServers = servers.map(server => server.name === serverToUpdate ? updateServerMuteMob(server, mob) : server);
    fs.writeFileSync('./settings/servers.json', JSON.stringify(updatedServers));
}

const unmute = (mob) => {

}

module.exports = {
    initialSettings,
    mute,
    unmute,
}