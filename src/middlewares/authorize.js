module.exports = function (roles = []) {
    // roles bisa berupa array atau string
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        const userRole = req.user?.role?.name; // diasumsikan role name dimuat di token JWT

        if (!roles.length || roles.includes(userRole)) {
            return next();
        } else {
            return res.status(403).json({ message: 'Akses ditolak. Anda tidak memiliki izin.' });
        }
    };
};