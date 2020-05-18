import { MessageEmbed } from 'discord.js';

// internal
const buffers = {};

const helpMessage = `**help** - *shows this help menu.*
**start <?rounds> <?minutes> <?order>** - *start/resume mobbing.*
**restart <?rounds> <?minutes> <?order>** - *start new mob session.*
**break <?minutes> <?message>** - *take break, length and return message optional.*
**stop** - *stop mobbing.*
**skip** - *skip current driver or skip break when on break.*
**away <?name>** - *marks a mob member as away/sick.*
**return <?name>** - *marks a mob member as no longer away.*
**buffer** - *show buffer.*
**buffer add <message>** - *adds message to buffer.*
**buffer remove <id>** - *removes message from buffer. alias: delete.*
**buffer clear** - *clears buffer.*
**mute** - *disables timer sound.*
**unmute** - *enables timer sound.*

**Reaction features**:
React 📌 to any message in your mob channel to pin it. Remove the 📌 to unpin it.
React 👍 to the break message to show that you're ready for the next round.
A new round starts when all active members are marked as ready.`;

const errors = {
    NO_ID: 'Please remove by id.',
    TOO_LONG: 'Message length may not exceed 1024 characters.',
    AMOUNT_NAN: 'Round amount should be a number.',
    AMOUNT_TOO_SMALL: 'Round amount should be 1 or more.',
    AMOUNT_NOT_INT: 'Round amount should be an integer.',
    TIME_NAN: 'Time should be a number.',
    TIME_TOO_SMALL: 'Time should be at least 1 minute.',
    INVALID_MEMBER: 'Invalid mob member, not all tagged persons are recognized as members of your mob.',
    INACTIVE_MEMBER: 'One or more mob selected mob members are flagged as away, please mark them as returned.',
    EXCLUDED_MEMBER: 'One or more active mob members are left out, please mark them as away.',
};

const startMessage = (roleId, {order, rounds, roundTime} = mobSettings) => (
    `Starting mob timer for <@&${roleId}>.
    Settings: ${rounds} round${rounds>1?'s':''} of ${roundTime} minute${roundTime>1?'s each':''}.
    Order: ${order.map( (id) => '<@' + id + '>').join(', ')}.
    Driver: <@${order[0]}>.`
);

// exports
const initResponse = (msg) => msg.reply('all set.');
const muteResponse = (msg, isMuted) => msg.channel.send(isMuted ? '🙊' : '🔊');
const stopResponse = (msg, id) => msg.channel.send(`Mob timer for <@&${id}> stopped.`);
const nothingToStopResponse = (msg) => msg.channel.send(`There's nothing to stop.`);
const nothingToSkipResponse = (msg) => msg.channel.send(`There's nothing to skip.`);
const nextResponse = (msg, next) => msg.channel.send(`Next driver: <@${next}>.`);
const startResponse = (msg, id, mobSettings) => msg.channel.send(startMessage(id, mobSettings));
const bufferResponse = (msg, buffer) => msg.channel.send(buffer);

const awayResponse = (msg, away) => {
    if (away.length === 0) return msg.channel.send('The whole mob is complete, great!');
    msg.channel.send(`The following members are away: ${away.map(member => '<@' + member + '>').join(', ')}`);
}

const helpResponse = (msg) => {
    const embed = new MessageEmbed()
        .setTitle('Type any of the following commands in the chat:')
        .setColor('#00ff00')
        .setFooter('Mobbot, by Zimri Leijen.')
        .setURL('https://github.com/zimmah/mobbot#readme')
        .setDescription(helpMessage);
    msg.channel.send(embed);
}

const errorResponse = (msg, error) => {
    const errorMessage = errors[error];
    const embed = new MessageEmbed()
        .setTitle(`Error: ${errorMessage || error}`)
        .setColor('#ff0000');
    msg.channel.send(embed);
}

const breakResponse = async (msg, mob, settings) => {
    const { breakTime } = settings.mobSettings;
    const responseText = `<@&${mob.roleId}> Time for a ${breakTime} minute break, react 👍 to this message to show you're ready to continue.`;
    const response = await msg.channel.send(responseText);
    return response;
}

const reminderResponse = (msg, roleId) => {
    msg.channel.send(`<@&${roleId}> 1 minute left on current driver session, don't forget to push to github.`);
}

const createBufferEmbed = (mobName) => {
    return new MessageEmbed()
        .setTitle(`Buffer for ${mobName}:`)
        .setColor('#ffff00')
        .addFields();
}

const createNewBufferIfNeccesary = mobName => {
    if (buffers[mobName] === undefined) {
        buffers[mobName] = createBufferEmbed(mobName);
    }
    return buffers[mobName];
}

const addItemToBuffer = (item, mobName) => {
    const highestId = () => buffers[mobName].fields
        .reduce( (highest, current) => Math.max(current.name, highest), 0);
    buffers[mobName].fields.push({name: highestId() + 1, value: item});
    return buffers[mobName];
}

const removeItemFromBuffer = (id, mobName) => {
    const index = buffers[mobName].fields.findIndex(field => field.name === id);
    console.log(index);
    index >= 0 && buffers[mobName].fields.splice(index, 1);
    return buffers[mobName];
}

const clearBuffer = (mobName) => { 
    buffers[mobName].fields = [];
    return buffers[mobName];
}

export { 
    initResponse, muteResponse, stopResponse, nothingToStopResponse, nothingToSkipResponse, nextResponse,
    startResponse, bufferResponse, awayResponse, helpResponse, errorResponse, breakResponse, reminderResponse,
    createBufferEmbed, createNewBufferIfNeccesary, addItemToBuffer, removeItemFromBuffer, clearBuffer,
}
