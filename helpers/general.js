const { updateMobSettings } = require('./settings');
const { stopBreakAndClearTimer } = require('./timers');
const {
    bufferResponse,
    createBufferEmbed,
    errorResponse,
} = require('./responses');
const {
    isLengthBelow,
    validateRoundAmount,
    validateRoundLength,
    validateOrder,
} = require('./validators');

const buffers ={};

// internal
const createNewBufferIfNeccesary = mobName => {
    if (buffers[mobName] === undefined) {
        buffers[mobName] = createBufferEmbed(mobName);
    }
  }

const removeItemFromBuffer = (msg, mobName) => {
    const id = +msg.content.split(' ')[2];
    if (!isNaN(id)) { 
        const index = buffers[mobName].fields.findIndex(field => field.name === id);
        index >= 0 && buffers[mobName].fields.splice(index, 1);
    } else {
        throw new Error('removeItemError');
    }
}

const addItemToBuffer = (msg, mobName) => {
    const payload = msg.content.split(' ').slice(2).join(' ');
    if (isLengthBelow(payload, 1024)) {
        const highestId = () => buffers[mobName].fields.reduce( (highest, current) => Math.max(current.name, highest), 0);
        buffers[mobName].fields.push({name: highestId() + 1, value: payload});
    } else {
        throw new Error('tooLong');
    }
}

const clearBuffer = mobName => buffers[mobName].fields = [];

// external
const stopHandler = (msg, mob) => {
    stopBreakAndClearTimer(msg, mob);
}

const bufferHandler = (msg, mobName) => {
    const command = msg.content.split(' ')[1];
    createNewBufferIfNeccesary(mobName);
    try {
        if (command === 'remove' || command === 'delete') {
            removeItemFromBuffer(msg, mobName);
        }
        if ( command === 'add') {
            addItemToBuffer(msg, mobName);
        }
        if ( command === 'clear') {
            clearBuffer(mobName);
        }
        return bufferResponse(msg, buffers[mobName]);
    } catch(error) {
        return errorResponse(msg, error.message);
    }
}

const skipHandler = (msg, mob) => {
    stopBreakAndClearTimer(msg, mob);
    throw new Error('Not fully implemented');
}

const startHandler = (msg, mob, keepSameOrder) => {
    const [newRounds, newRoundTime] = msg.content.split(' ').slice(1,3);
    const newOrder = msg.mentions.users.map(user => user.id);
    try {
        newRounds && validateRoundAmount(newRounds);
        newRoundTime && validateRoundLength(newRoundTime);
        newOrder.length > 0 && validateOrder(newOrder, mob);
        updateMobSettings({newRounds, newRoundTime, newOrder}, keepSameOrder, mob);
    } catch(error) {
        console.log('catch block', error)
        errorResponse(msg, error.message);
    }

    throw new Error('Not fully implemented');
    // try {
    //     if (setRounds !== undefined) {
    //         isValidRoundAmount(setRounds);
    //     }
    //     if (setRoundTime !== undefined) {
    //         isValidRoundLength(setRoundTime);
    //     }
    //     if (setOrder.length > 0) {
    //         updateMobSettings({setRounds, setRoundTime, setOrder}, mob);
    //         // keepSameOrder or randomize order
    //     }
    // } 
    // catch(error) {
    //     return errorResponse(msg, error.message);
    // }
            
    // const { mobSettings } = require(`../settings/${mob.serverName}/${mob.mobName}.json`);
    // if(mobSettings) {
    //     const { rounds, roundTime, order } = mobSettings;
    // }
}

const breakHandler = (msg, mob) => {
    throw new Error('Not implemented');
}

const awayHandler = (msg, mob, isAway) => {
    throw new Error('Not implemented');
}

module.exports = {
    stopHandler,
    skipHandler,
    bufferHandler,
    startHandler,
    breakHandler,
    awayHandler,
}
