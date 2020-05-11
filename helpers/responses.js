const { MessageEmbed } = require('discord.js');

// internal
const breakReactionCollectors = {};
const errors = {
    removeItemError: 'Please remove by id.',
    tooLong: 'Buffer message length may not exceed 1024 characters.',
};

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

const stopResponse = (msg, id) => {
    msg.channel.send(`Mob timer for <@&${id}> stopped.`);
}

const stopBreakReactionCollector = (mobName, reason='force') => {
    breakReactionCollectors[mobName] && breakReactionCollectors[mobName].stop(reason);
}
  
const createBufferEmbed = (mobName) => {
    return new MessageEmbed()
        .setTitle(`Buffer for ${mobName}:`)
        .setColor('#ffff00')
        .addFields();
}

const bufferResponse = (msg, buffer) => msg.channel.send(buffer);

const errorResponse = (msg, error) => {
    const embed = new MessageEmbed()
        .setTitle('Error: ' + errors[error])
        .setColor('#ff0000');
    return msg.channel.send(embed);
}

module.exports = {
    helpResponse,
    muteResponse,
    unmuteResponse,
    stopResponse,
    stopBreakReactionCollector,
    createBufferEmbed,
    bufferResponse,
    errorResponse,
}
