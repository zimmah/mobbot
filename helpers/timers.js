const { stopBreak } = require('./responses');

//internal
const timers = {};

// external
const stopBreakAndClearTimer = (mob) => {
    stopBreak(mob.mobName);
    clearTimeout(timers[mob.mobName]);
}

module.exports = {
    stopBreakAndClearTimer,
}
