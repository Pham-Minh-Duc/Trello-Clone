//bảo vệ API, chỉ cho phép người đã đăng nhập (có Token) mới được tạo bảng.
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Thiếu Token xác thực!" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token không hợp lệ!" });
        req.user = user;
        next();
    });
};