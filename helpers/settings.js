const fs = require('fs');
const servers = require('../settings/servers.json');

//internal
const muteMob = (server, mob) => {
    
    return updatedServer;
}

//external
const initialSettings = (servers) => {
    fs.writeFileSync('./settings/servers.json', JSON.stringify(servers));
}

const mute = (mob) => {
    updatedServers = servers.map(server => server.mobs.roleId === mob.roleId ? muteMob(server, mob) : server)
    fs.writeFileSync('./settings/servers.json', JSON.stringify(updatedServers));
}

const unmute = (mob) => {

}

module.exports = {
    initialSettings,
    mute,
    unmute,
}