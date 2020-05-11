const isAdmin = (member) => {
    return member.roles.cache.some(role => {
        const bitfieldHex = role.permissions.bitfield.toString(16);
        const lastBit = bitfieldHex.slice(bitfieldHex.length - 1);
        return `0x${lastBit}`.toString(10) >= 8;
    });
}

const isLengthBelow = (content, maxLength) => content.length <= maxLength;

module.exports = {
    isAdmin,
    isLengthBelow,
}
