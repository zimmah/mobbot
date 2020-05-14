const {
    stopBreakReactionCollector,
    stopResponse,
    breakReminderResponse,
    pushReminderResponse,
} = require('./responses');

//internal
const timers = {};

const breakReminder = (msg, mob) => {
    breakReminderResponse(msg, mob.roleId);
    timers[mob.mobName] = setTimeout(() => {
        breakResponse(msg, mob.roleId);
    }, 60 * 1000);
}

const pushReminder = (msg, mob) => {
    pushReminderResponse(msg, mob.roleId);
    timers[mob.mobName] = setTimeout(() => {
        const { order } = require(`./settings/${mob.serverName}/${mob.mobName}.json`).mobSettings;
        const updatedSettings = {rounds: rounds - 1, roundTime, order};
        continueResponse(msg, mob.roleId, order[0]);
        startMobTimer(msg, mob, updatedSettings);
    }, 60 * 1000);
}

// external
const stopBreakAndClearTimer = (mob) => {
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
            pushReminder(msg, mob);
        }, (roundTime - 1) * 60 * 1000);
    }
}

module.exports = {
    stopBreakAndClearTimer,
    startMobTimer,
}
