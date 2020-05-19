// internal
const settings = {};

const initializeMob = (mob, server) => {
    let existingMobSettings;
    const serverName = server.name;
    const { channelName } = mob;
    if (settings[serverName] !== undefined) {
        existingMobSettings = settings[serverName][channelName];
        settings[serverName][channelName] = { ...existingMobSettings, ...mob };
    } else {
        settings[serverName] = {};
        settings[serverName][channelName] = { ...mob };
    }
}

const initializeServer = (server) => server.mobs.forEach( (mob) => initializeMob(mob, server) );

const findMembers = (mobId, serverMembers, mobbotId) => {
    const mobMembers = serverMembers
        .filter( (member) => 
            member._roles.some( (role) => role === mobId) && member.id !== mobbotId )
        .map( (member) => (
            { id: member.user.id, name: member.user.username, nickname: member.displayName } ))
        .flat();
    return mobMembers;
}

const randomizeOrder = (mob) => {
    const settings = getSettings(mob);
    const { members } = settings;
    const activeMembers = members.filter((member) => !member.isAway);
    let currentIndex = activeMembers.length;
    let tempValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        tempValue = activeMembers[currentIndex];
        activeMembers[currentIndex] = activeMembers[randomIndex];
        activeMembers[randomIndex] = tempValue;
    }
    return activeMembers.map(member => member.id);
}

// exports
const findAllMobs = (server ) => {
    const serverRoles = server.roles.cache;
    const serverMembers = server.members.cache;
    const serverChannels = server.channels.cache;
    const channelNames = serverChannels.map( (channel) => channel.name).flat();

    const mobbot = server.me;
    const mobbotRoles = mobbot._roles;

    const potentialMobRoles = serverRoles
        .filter( (role) => mobbotRoles.includes(role.id))
        .map( (role) => ({
            name: role.name,
            id: role.id,
            channelName: role.name.replace(' ', '-').toLowerCase(),
        }));

    const mobs = potentialMobRoles
        .filter( (role) => channelNames.includes(role.channelName))
        .map( (mob) => ({
            serverName: server.name,
            channelName: mob.channelName,
            mobName: mob.name,
            channelId: serverChannels
                .findKey( (channel) => channel.name === mob.channelName),
            roleId: mob.id,
            members: findMembers(mob.id, serverMembers, mobbot.id),
            mobSettings: { rounds: 4, roundTime: 15, breakTime: 10 },
        }));

    return mobs;
}

const initializeSettings = (servers) => servers.forEach(initializeServer);
const findMob = (msg) => settings[msg.guild.name][msg.channel.name];

const updateOrder = (mob) => {
    const { mobSettings } = getSettings(mob);
    const { order } = mobSettings;
    const [ first, ...rest ] = order;
    const newOrder = [ ...rest, first ];
    mobSettings.order = newOrder;
    return newOrder;
}

const resetCurrentRound = (mob)  => {
    const { mobSettings } = getSettings(mob);
    mobSettings.currentRound = 0;
}

const incrementCurrentRound = (mob) => {
    const { mobSettings } = getSettings(mob);
    return mobSettings.currentRound += 1;
}

const updateMobSettings = ({ newRounds, newRoundTime, newOrder } = newSettings = {}, keepOrder, mob) => {
    const { mobSettings } = getSettings(mob);
    mobSettings.currentRound = 1;
    if (newOrder.length === 0 && (mobSettings.order === undefined || keepOrder === false)) {
        mobSettings.order = randomizeOrder(mob);
    } else if (newOrder.length > 0) {
        mobSettings.order = newOrder;
    }
    if (newRounds === undefined) return;
    mobSettings.rounds = newRounds;
    if (newRoundTime === undefined) return;
    mobSettings.roundTime = newRoundTime;
}

const updateAwayStatus = (mob, awayMembers, isAway) => {
    const { members, mobSettings } = getSettings(mob);
    for (let awayMember of awayMembers) {
        const member = members.find(member => member.id === awayMember);
        member.isAway = isAway;
    }
    if (isAway) {
        awayMembers.forEach(awayMember => {
            const index = mobSettings.order.findIndex(id => awayMember === id);
            mobSettings.order.splice(index, 1);
        });
    } else {
        mobSettings.order.push(...awayMembers);
    }
    return members.filter(member => member.isAway).map(member => member.id);
}

const setBreakTime = (mob, breakTime) => {
    const { mobSettings } = getSettings(mob);
    mobSettings.breakTime = breakTime;
}

const setBreakMessage = (mob, breakMessage) => {
    const { mobSettings } = getSettings(mob);
    mobSettings.breakMessage = breakMessage;
}

const getSettings = (mob) => {
    const { channelName, serverName } = mob;
    return settings[serverName][channelName];
}

export {
    findAllMobs, initializeSettings, findMob, updateOrder, resetCurrentRound, incrementCurrentRound,
    updateMobSettings, setBreakTime, setBreakMessage, getSettings, updateAwayStatus,
};
