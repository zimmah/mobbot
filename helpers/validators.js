class ValidationError {
    constructor(message, data) {
        this.message = message;
        this.data = data;
    }
}

const isAdmin = (member) => {
    return member.roles.cache.some(role => {
        const bitfieldHex = role.permissions.bitfield.toString(16);
        const lastBit = bitfieldHex.slice(bitfieldHex.length - 1);
        return `0x${lastBit}`.toString(10) >= 8;
    });
}

const isSameOrder = (order, newOrder) => {
    return order.every((id, index) => id === newOrder[index]);
}

const isLengthBelow = (content, maxLength) => content.length <= maxLength;

const validateRoundAmount = (amount) => {
    if (isNaN(+amount)) {
        throw new ValidationError('roundAmountNaN');
    }
    if (+amount <= 0) {
        throw new ValidationError('roundAmountTooSmall');
    }
    if (+amount%1 !== 0) {
        throw new ValidationError('roundAmountNotInteger');
    }
}

const validateRoundLength = (minutes) => {
    if (isNaN(+minutes)) {
        throw new ValidationError('roundTimeNaN');
    }
    if (+minutes < 1) {
        throw new ValidationError('roundTimeTooSmall');
    }
}

const validateOrder = (newOrder, mob) => {
    const { members } = require(`../settings/${mob.serverName}/${mob.channelName}.json`);
    const memberIdMap = members.map(member => member.id);
    if (!newOrder.every(member => memberIdMap.includes(member))){
        throw new ValidationError('invalidMobMember');
    } 
    const activeMemberIdMap = members.filter(member => member.away !== true).map(member => member.id);
    console.log(activeMemberIdMap);
    if (!newOrder.every(member => activeMemberIdMap.includes(member))) {
        throw new ValidationError('inactiveMobMember');
    }
    if (!activeMemberIdMap.every(member => newOrder.includes(member))) {
        throw new ValidationError('excludedActiveMobMembers');
    }
}

module.exports = {
    isAdmin,
    isSameOrder,
    isLengthBelow,
    validateRoundAmount,
    validateRoundLength,
    validateOrder,
}
