const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Email của bạn
        pass: process.env.EMAIL_PASS  // Mật khẩu ứng dụng 16 ký tự
    }
});

const sendOTP = async (email, code) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Mã xác thực đăng nhập ứng dụng mini trello app',
        text: `Mã xác thực của bạn là: ${code}. Mã này có hiệu lực trong 5 phút.`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response); // Dòng này sẽ cho biết Google đã nhận thư chưa
        return info;
    } catch (error) {
        console.error("Nodemailer Error: ", error);
        throw error;
    }
};

module.exports = { sendOTP };