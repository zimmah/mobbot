import { MessageEmbed } from 'discord.js';
import { nextDriver } from './controllers.js';
import { reminderResponse, breakResponse } from './responses.js';
import { resetCurrentRound } from './settings.js';

// internal
let isVoiceBusy = false;
const queue = [];
const timers = {};
const breakReactionCollectors = {};

const playNext = async (msg) => {
    isVoiceBusy = true;
    const next = queue.shift();
    const voiceChannel = msg.guild.channels.cache.find(channel => channel.name === next);
    const connection = await voiceChannel.join();
    const dispatcher = connection.play('./sounds/honk-sound.mp3');
    dispatcher.on('finish', () => {
        connection.disconnect();
        dispatcher.destroy();
        if (queue.length > 0) {
            setTimeout(() => playNext(), 250);
        } else {
            isVoiceBusy = false;
        }
    });
}

const honk = (msg, mob) => {
    queue.push(mob.mobName);
    if (!isVoiceBusy) playNext(msg);
}

const stopBreakReactionCollector = (id, reason='force') => {
    if (breakReactionCollectors[id]) {
        breakReactionCollectors[id].stop(reason);
        return true;
    }
    return false;
}

const addReactionCollector = (msg, mob, settings) => {
    const { members, mobSettings, roleId } = settings;
    const { breakTime, breakMessage } = mobSettings;
    const activeMemberIdMap = members.reduce((acc, cur) => !cur.away ? [ ...acc, cur.id] : acc, []);
    const filter = (reaction, user) => {
        return reaction.emoji.name === '👍' && activeMemberIdMap.includes(user.id);
    }

    const collector = msg.createReactionCollector(filter, { time: breakTime * 60 * 1000, dispose: true });
    breakReactionCollectors[roleId] = collector;

    collector.on('collect', (reaction, user) => {
        if (reaction.count === activeMemberIdMap.length) {
            collector.stop('thumbs');
        } else {
            msg.channel.send(`<@${user.id}> is ready.`);
        }
    });

    collector.on('remove', (_, user) => {
        console.log(user)
        msg.channel.send(`<@${user.id}> is not ready.`);
    })
      
    collector.on('end', (_, reason) => {
        if (breakMessage) {
            const embed = new MessageEmbed()
            .setTitle('End of break message:')
            .setColor('#00ff00')
            .setDescription(breakMessage);
            msg.channel.send(embed);
            mobSettings.breakMessage = undefined;
        }
        if (reason === 'thumbs') {
            msg.channel.send('Everyone is ready, let\'s roll!');
            resetCurrentRound(mob);
            nextDriver(msg, mob);
        } else {
            msg.channel.send(`<@&${mob.roleId}> break ended, type start or restart when you're ready for the next round.`);
        }
        breakReactionCollectors[mob.roleId] = undefined;
    });
}

const reminder = (msg, mob, settings) => {
    const { roleId } = mob;
    reminderResponse(msg, roleId);
    timers[roleId] = setTimeout(() => {
        const { isMuted } = settings;
        if (!isMuted) honk(msg, mob);
        timers[roleId] = undefined;
        nextDriver(msg, mob);
    }, 60 * 1000);
}

// exports
const startTimer = (msg, mob, settings) => {
    const { roundTime } = settings.mobSettings;
    timers[mob.roleId] = setTimeout(() => {
        reminder(msg, mob, settings);
        timers[mob.roleId] = undefined;
    }, (roundTime - 1) * 60 * 1000);
}

const stopTimer = (id) => {
    if (!timers[id]) return false;
    clearTimeout(timers[id]);
    timers[id] = undefined;
    return true;
}

const startBreak = async (msg, mob, settings) => {
    const breakMessage = await breakResponse(msg, mob, settings);
    addReactionCollector(breakMessage, mob, settings);
} 

const stopBreak = (id) => {
    const didStop =  stopBreakReactionCollector(id);
    return didStop;
}

export { startTimer, stopTimer, startBreak, stopBreak, addReactionCollector };
