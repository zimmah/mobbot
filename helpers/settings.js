const fs = require('fs');
const { muteResponse, unmuteResponse } = require('./responses');

const initialSettings = (servers) => {
    servers.forEach(server => {
        fs.existsSync(`./settings/${server.name}`) || fs.mkdirSync(`./settings/${server.name}`);
        server.mobs.forEach(mob => {
            fs.writeFileSync(`./settings/${server.name}/${mob.channelName}.json`, JSON.stringify(mob));
        });
    });
}

const mute = (msg, mob) => {
    fs.writeFileSync(`./settings/${mob.serverName}/${mob.channelName}.json`, JSON.stringify({ ...mob, muted: true }));
    muteResponse(msg);
}

const unmute = (msg, mob) => {
    fs.writeFileSync(`./settings/${mob.serverName}/${mob.channelName}.json`, JSON.stringify({ ...mob, muted: false }));
    unmuteResponse(msg);
}

module.exports = {
    initialSettings,
    mute,
    unmute,
}
