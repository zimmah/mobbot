const { stopBreakReactionCollector } = require('./responses');

//internal
const timers = {};

// external
const stopBreakAndClearTimer = (mob) => {
    stopBreakReactionCollector(mob.mobName);
    clearTimeout(timers[mob.mobName]);
}

module.exports = {
    stopBreakAndClearTimer,
}
