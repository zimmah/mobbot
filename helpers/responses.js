const { MessageEmbed } = require('discord.js');

// internal
const helpMessage = `**help** - *shows this help menu.*
**start <?rounds> <?minutes> <?order>** - *start/resume mobbing.*
**restart <?rounds> <?minutes> <?order>** - *start new mob session.*
**break <?minutes> <?message>** - *take break, length and return message optional. Default 10 minutes.*
**stop** - *stop mobbing.*
**skip** - *skip current driver or skip break when on break.*
**away <?name>** - *marks a mob member as away/sick.*
**return <name>** - *marks a mob member as no longer away.*
**buffer** - *show buffer.*
**buffer add <message>** - *adds message to buffer.*
**buffer remove <id>** - *removes message from buffer. alias: delete.*
**buffer clear** - *clears buffer.*
**mute** - *disables timer sound.*
**unmute** - *enables timer sound.*`;

//external
const helpResponse = (msg) => {
    const embed = new MessageEmbed()
        .setTitle('Type any of the following commands in the chat:')
        .setColor('#00ff00')
        .setDescription(helpMessage);
    msg.channel.send(embed);
}

const muteResponse = (msg) => {
    msg.channel.send(':speak_no_evil:')
}

const unmuteResponse = (msg) => {
    msg.channel.send(':speaking_head:');
}

module.exports = {
    helpResponse,
    muteResponse,
    unmuteResponse,
}