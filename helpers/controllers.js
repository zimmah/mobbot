import { findAllMobs, initializeSettings, updateMobSettings, getSettings, updateAwayStatus,
    incrementCurrentRound, updateOrder, resetCurrentRound, setBreakTime, setBreakMessage } from './settings.js';
import { initResponse, helpResponse, muteResponse, nextResponse, startResponse, stopResponse,
    bufferResponse, createNewBufferIfNeccesary, addItemToBuffer, removeItemFromBuffer, clearBuffer,
    nothingToSkipResponse, nothingToStopResponse, awayResponse } from './responses.js';
import { startTimer, stopTimer, startBreak, stopBreak } from './timers.js';
import { validateRoundAmount, validateTime, validateOrder,
    validateMessageLength, validateBufferId, validateMobMembers } from './validators.js';

const nextDriver = (msg, mob) => {
    const settings = getSettings(mob);
    const { mobSettings } = settings;
    const { rounds } = mobSettings;
    const currentRound = incrementCurrentRound(mob);
    if ( currentRound > rounds ) return startBreak(msg, mob, settings);
    const next = updateOrder(mob)[0];
    startTimer(msg, mob, settings);
    nextResponse(msg, next);
}

const initHandler = (client, msg = undefined) => {
    const servers = client.guilds.cache.map((server) => ({
        name: server.name,
        mobs: findAllMobs(server),
    }));

    initializeSettings(servers);
    if (msg !== undefined) initResponse(msg);
}

const helpHandler = (msg) => helpResponse(msg);

const muteHandler = (msg, mob, isMuted) => {
    const settings = getSettings(mob);
    settings.isMuted = isMuted;
    muteResponse(msg, isMuted);
}

const stopHandler = (msg, mob) => {
    const { roleId } = mob;
    const didBreakStop = stopBreak(roleId);
    const didTimerStop = stopTimer(roleId);
    if (!didBreakStop && !didTimerStop) return nothingToStopResponse(msg);
    if (didTimerStop) stopResponse(msg, roleId);
}

const skipHandler = (msg, mob) => {
    const stoppedBreak = stopBreak(mob.roleId);
    const stoppedTimer = stopTimer(mob.roleId);
    if (!stoppedBreak && !stoppedTimer) return nothingToSkipResponse(msg);
    if (stoppedBreak) resetCurrentRound(mob);
    nextDriver(msg, mob);
}

const startHandler = (msg, mob, keepOrder) => {
    const settings = getSettings(mob);
    const { roleId } = mob;
    if (stopBreak(roleId)) updateOrder(mob);
    stopTimer(roleId);

    const [newRounds, newRoundTime] = msg.content.split(' ').slice(1,3);
    const newOrder = msg.mentions.users.map(user => user.id);

    validateRoundAmount(newRounds);
    validateTime(newRoundTime);
    validateOrder(newOrder, settings);

    updateMobSettings({newRounds, newRoundTime, newOrder}, keepOrder, mob);
    startResponse(msg, roleId, settings.mobSettings);
    startTimer(msg, mob, settings);
}

const breakHandler = (msg, mob) => {
    if (!stopTimer(mob.roleId)) throw new Error('Can\'t start a break if you\'re not mobbing.');
    const [ breakTime, ...breakMessage] = msg.content.split(' ').slice(1);
    validateTime(breakTime);
    validateMessageLength(breakMessage.join(' '));
    if (breakTime) setBreakTime(mob, breakTime);
    if (breakMessage.join(' ').length > 0) setBreakMessage(mob, breakMessage.join(' '));
    const settings = getSettings(mob);
    startBreak(msg, mob, settings);
}

const awayHandler = (msg, mob, isAway) => {
    const tagged = msg.mentions.users.map(user => user.id);
    const { members } = getSettings(mob);
    validateMobMembers(tagged, members);
    const updatedMembers = members
        .filter(member => tagged.includes(member.id))
        .map(member => member.id);
    const awayMembers = updateAwayStatus(mob, updatedMembers, isAway);
    awayResponse(msg, awayMembers);
}

const bufferHandler = (msg, mob) => {
    const { mobName } = mob;
    const command = msg.content.split(' ')[1];
    let buffer = createNewBufferIfNeccesary(mobName);

    if (command === 'remove' || command === 'delete') {
        const id = +msg.content.split(' ')[2];
        validateBufferId(id);
        buffer = removeItemFromBuffer(id, mobName);
    } else if ( command === 'add') {
        const newBufferItem = msg.content.split(' ').slice(2).join(' ');
        validateMessageLength(newBufferItem);
        buffer = addItemToBuffer(newBufferItem, mobName);
    } else if ( command === 'clear') {
        buffer = clearBuffer(mobName);
    }
    console.log(buffer);
    return bufferResponse(msg, buffer);
}

export { 
    nextDriver, initHandler, helpHandler, muteHandler, stopHandler, skipHandler,
    startHandler, breakHandler, awayHandler, bufferHandler,
}
