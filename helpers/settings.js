const fs = require('fs');

const initialSettings = (servers) => {
    servers.forEach(server => {
        fs.existsSync(`./settings/${server.name}`) || fs.mkdirSync(`./settings/${server.name}`);
        server.mobs.forEach(mob => {
            fs.writeFileSync(`./settings/${server.name}/${mob.channelName}.json`, JSON.stringify(mob));
        });
    });
}

const mute = (mob) => {
    fs.writeFileSync(`./settings/${mob.serverName}/${mob.channelName}.json`, JSON.stringify({ ...mob, muted: true }));
}

const unmute = (mob) => {
    fs.writeFileSync(`./settings/${mob.serverName}/${mob.channelName}.json`, JSON.stringify({ ...mob, muted: false }));
}

module.exports = {
    initialSettings,
    mute,
    unmute,
}
