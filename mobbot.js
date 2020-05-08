const { Client } = require('discord.js');
const { token } = require('./key.json');
const { isAdmin } = require('./helpers/validators');
const { init } = require ('./helpers/general');

const client = new Client();

client.on('ready', ()=> {
    console.log(`Logged in as ${client.user.tag}!`);
    init(client);
});

client.on('message', async msg => {
    if (msg.content === 'init' && isAdmin(msg.member)) {
        init(client);
    }
});

client.login(token);
