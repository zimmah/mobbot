class ValidationError { constructor(message) { this.message = message } }

const isAdmin = (member) => member.hasPermission('ADMINISTRATOR');

const validateRoundAmount = (amount) => {
    if (amount === undefined) return;
    if (isNaN(+amount)) throw new ValidationError('AMOUNT_NAN');
    if (+amount <= 0) throw new ValidationError('AMOUNT_TOO_SMALL');
    if (+amount%1 !== 0) throw new ValidationError('AMOUNT_NOT_INT');
}

const validateTime = (minutes) => {
    if (minutes === undefined) return;
    if (isNaN(+minutes)) throw new ValidationError('TIME_NAN');
    if (+minutes < 1) throw new ValidationError('TIME_TOO_SMALL');
}

const validateOrder = (newOrder, settings) => {
    if (newOrder.length === 0) return;
    const { members } = settings;
    const memberIdMap = members.map(member => member.id);
    if (!newOrder.every(member => memberIdMap.includes(member))){
        throw new ValidationError('INVALID_MEMBER');
    }
    const activeMemberIdMap = members.reduce((acc, cur) => !cur.isAway ? [...acc, cur.id] : acc, []);
    if (!newOrder.every(member => activeMemberIdMap.includes(member))) {
        throw new ValidationError('INACTIVE_MEMBER');
    }
    if (!activeMemberIdMap.every(member => newOrder.includes(member))) {
        console.log(activeMemberIdMap)
        throw new ValidationError('EXCLUDED_MEMBER');
    }
}

const validateMobMembers = (tagged, members) => {
    if (tagged.length === 0) return;
    const memberIdMap = members.map(member => member.id);
    if (!tagged.every(tagged => memberIdMap.includes(tagged))){
        throw new ValidationError('INVALID_MEMBER');
    }
}

const validateMessageLength = (item) => { if (item.length > 1024) throw new ValidationError('TOO_LONG') };
const validateBufferId = id => { if (isNaN(id)) throw new ValidationError('NO_ID') };

export { 
    isAdmin, validateRoundAmount, validateTime, validateOrder, validateMobMembers, validateMessageLength, 
    validateBufferId,
 }
