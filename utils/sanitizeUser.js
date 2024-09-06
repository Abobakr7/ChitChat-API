module.exports = (user) => {
    return {
        _id: user._id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
    };
};
