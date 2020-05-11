const { stopBreakReactionCollector, stopResponse } = require('./responses');

//internal
const timers = {};

// external
const stopBreakAndClearTimer = (mob) => {
    stopBreakReactionCollector(mob.mobName);
    if (timers[mob.mobName]) {
        stopResponse(msg, mob.roleId);
        clearTimeout(timers[mob.mobName]);
    }
}

module.exports = {
    stopBreakAndClearTimer,
}
