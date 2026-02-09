import React, { useState } from 'react';
import { requestOTP, verifyOTP } from '../api/authApi';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Bước 1: Email, Bước 2: OTP
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestOTP(email);
      setStep(2); // Chuyển sang form nhập OTP
    } catch {
      alert("Không thể gửi OTP. Hãy kiểm tra lại email hoặc backend!");
    } finally {
      setLoading(false);
    }
  };

const handleVerify = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const response = await verifyOTP(email, otp);
    const token = response.accessToken || response.data?.accessToken;

    if (token) {
      localStorage.setItem('token', token);
      console.log("Đã lưu token xịn!");
      navigate('/'); 
    } else {
      alert("Không tìm thấy accessToken trong phản hồi từ server!");
    }
  } catch (err) {
    console.error("Lỗi xác thực OTP:", err);
    alert("Mã OTP không đúng hoặc đã hết hạn.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-6 italic">Trello Clone</h1>
        
        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <h2 className="text-xl font-semibold">Đăng nhập / Đăng ký</h2>
            <input 
              type="email" placeholder="Nhập email của bạn" required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <button disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
              {loading ? "Đang xử lý..." : "Tiếp tục với mã OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Xác nhận mã OTP</h2>
            <p className="text-sm text-gray-500 text-center">Chúng tôi đã gửi mã đến <b>{email}</b></p>
            <input 
              type="text" placeholder="Nhập 6 chữ số" required maxLength="6"
              className="w-full p-3 border rounded-lg text-center text-2xl tracking-widest focus:ring-2 focus:ring-green-500 outline-none"
              value={otp} onChange={(e) => setOtp(e.target.value)}
            />
            <button disabled={loading} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition">
              {loading ? "Đang xác thực..." : "Đăng nhập ngay"}
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-blue-500 text-sm hover:underline">
              Quay lại nhập email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;