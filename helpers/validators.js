const isAdmin = (member) => {
    return member.roles.cache.some(role => {
        const bitfield = role.permissions.bitfield.toString(16);
        const lastBit = bitfield.slice(bitfield.length - 1);
        return `0x${lastBit}`.toString(10) >= 8;
    });
}

module.exports = {
    isAdmin
}
