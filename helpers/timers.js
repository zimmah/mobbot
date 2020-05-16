const {
    stopBreakReactionCollector,
    stopResponse,
    breakReminderResponse,
    pushReminderResponse,
    continueResponse,
    breakResponse,
} = require('./responses');
const { updateOrder, updateBreakTime } = require('./settings');

//internal
let isVoiceBusy = false;
const queue = [];
const timers = {};

const playNext = async (msg) => {
    isVoiceBusy = true;
    const next = queue.shift();
    const voiceChannel = msg.guild.channels.cache.filter(channel => channel.name === next).first();
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
    if (!isVoiceBusy) {
        playNext(msg);
    }
}

const breakReminder = (msg, mob) => {
    breakReminderResponse(msg, mob.roleId);
    timers[mob.mobName] = setTimeout(() => {
        const settings = require(`../settings/${mob.serverName}/${mob.mobName}.json`);
        if (!settings.mobSettings.breakTime) {
            updateBreakTime(mob);
        }
        breakResponse(msg, mob);
        if (!settings.muted) honk(msg, mob);
    }, 60 * 1000);
}

const pushReminder = (msg, mob, settings) => {
    pushReminderResponse(msg, mob.roleId);
    timers[mob.mobName] = setTimeout(() => {
        const { order } = require(`../settings/${mob.serverName}/${mob.mobName}.json`).mobSettings;
        const { roundTime, rounds } = settings;
        const updatedSettings = {rounds: rounds - 1, roundTime, order};
        continueResponse(msg, mob.roleId, order[0]);
        startMobTimer(msg, mob, updatedSettings);
        if (!settings.muted) honk(msg, mob);
    }, 60 * 1000);
}

// external
const stopBreakAndClearTimer = (msg, mob) => {
    stopBreakReactionCollector(mob.mobName);
    if (timers[mob.mobName]) {
        stopResponse(msg, mob.roleId);
        clearTimeout(timers[mob.mobName]);
    }
}

const startMobTimer = (msg, mob, settings) => {
    const { rounds, roundTime } = settings;
    updateOrder(mob);
    if (rounds === 1) {
        timers[mob.mobName] = setTimeout(() => {
            breakReminder(msg, mob);
        }, (roundTime - 1) * 60 * 1000);
    } else if (rounds > 1) {
        timers[mob.mobName] = setTimeout(() => {
            pushReminder(msg, mob, settings);
        }, (roundTime - 1) * 60 * 1000);
    }
}

module.exports = {
    stopBreakAndClearTimer,
    startMobTimer,
}
