const { db } = require('../config/firebase');
const { sendOTP } = require('../services/emailService');
const jwt = require('jsonwebtoken');

exports.requestOTP = async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60000; // 5 phút

    try {
        // Thay vì User.findOneAndUpdate, ta dùng Firestore:
        await db.collection('users').doc(email).set({
            verificationCode: code,
            codeExpires: expires,
            email: email
        }, { merge: true }); // merge: true để không xóa các data cũ của user

        await sendOTP(email, code);
        res.status(200).json({ message: "Mã OTP đã được gửi!" });
    } catch (error) {
        // Log lỗi chi tiết ra console để bạn dễ debug
        console.error("Firebase Error:", error);
        res.status(500).json({ error: "Lỗi hệ thống Firebase: " + error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        const userDoc = await db.collection('users').doc(email).get();
        if (!userDoc.exists) return res.status(404).json({ error: "User không tồn tại" });

        const userData = userDoc.data();

        if (userData.verificationCode === verificationCode && userData.codeExpires > Date.now()) {
            // Tạo Token
            const token = jwt.sign(
                { id: email, email: email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Reset mã OTP sau khi dùng
            await db.collection('users').doc(email).update({
                verificationCode: null,
                codeExpires: null
            });

            return res.json({ accessToken: token });
        }
        res.status(401).json({ error: "Mã OTP sai hoặc hết hạn" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi xác thực: " + error.message });
    }
};