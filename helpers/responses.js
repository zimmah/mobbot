const { MessageEmbed } = require('discord.js');

// internal
const breakReactionCollectors = {};
const errors = {
    removeItemError: 'Please remove by id.',
    tooLong: 'Buffer message length may not exceed 1024 characters.',
    roundAmountNaN: 'Round amount should be a number.',
    roundAmountTooSmall: 'Round amount should be 1 or more.',
    roundAmountNotInteger: 'Round amount should be an integer.',
    roundTimeNaN: 'Round time should be a number.',
    roundTimeTooSmall: 'Round time should be at least 1 minute.',
    invalidMobMember: 'Invalid mob member, not all tagged persons are recognized as members of your mob.',
    inactiveMobMember: 'One or more mob selected mob members are flagged as away, please mark them as returned.',
    excludedActiveMobMembers: 'One or more active mob members are left out, please mark them as away.',
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

const initResponse = (msg) => msg.reply('all set.');
const muteResponse = (msg) => msg.channel.send(':speak_no_evil:');
const unmuteResponse = (msg) => msg.channel.send(':speaking_head:');
const stopResponse = (msg, id) => msg.channel.send(`Mob timer for <@&${id}> stopped.`);
const bufferResponse = (msg, buffer) => msg.channel.send(buffer);
const breakReminderResponse = (msg, id) => msg.channel.send(`<@&${id}> 1 minute left before break. Don't forget to push to github.`);
const pushReminderResponse = (msg, id) => msg.channel.send(`<@&${id}> 1 minute left before driver change. Don't forget to push to github.`);
const continueResponse = (msg, id, next) => msg.channel.send(`<@${id} next up, <@${next}>!`);

const breakResponse = (msg, id) => {
    
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

const errorResponse = (msg, error, args = []) => {
    const errorMessage = args.length ? errors[error](args) : errors[error];
    const embed = new MessageEmbed()
        .setTitle(`Error: ${errorMessage || error}`)
        .setColor('#ff0000');
    msg.channel.send(embed);
}

module.exports = {
    helpResponse,
    initResponse,
    muteResponse,
    unmuteResponse,
    stopResponse,
    bufferResponse,
    breakReminderResponse,
    pushReminderResponse,
    continueResponse,
    breakResponse,
    stopBreakReactionCollector,
    createBufferEmbed,
    errorResponse,
}
