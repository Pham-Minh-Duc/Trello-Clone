import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axios';

const InvitationPage = () => {
  const { inviteId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Đang xử lý lời mời vào thẻ...");

  useEffect(() => {
    const handleAccept = async () => {
      // Nếu không có thông tin trong URL, lấy từ API
      let boardId = searchParams.get('boardId');
      let cardId = searchParams.get('cardId');
      let email = searchParams.get('email');

      if (!boardId || !cardId || !email) {
        // Lấy thông tin từ API
        try {
          const inviteData = await axiosClient.get(`/boards/invitation/${inviteId}`);
          boardId = inviteData.boardId;
          cardId = inviteData.cardId;
          email = inviteData.receiverEmail;
        } catch (error) {
          setStatus("Link mời thiếu thông tin cần thiết." + error.message);
          return;
        }
      }

      if (!boardId || !cardId || !email) {
        setStatus("Link mời thiếu thông tin cần thiết.");
        return;
      }

      try {
        const payload = {
          "invite_id": inviteId,
          "card_id": cardId,
          "member_id": email,
          "status": "accepted"
        };

        // GỌI API CHẤP NHẬN
        await axiosClient.post(`/boards/${boardId}/cards/${cardId}/invite/accept`, payload);

        setStatus("Đã tham gia vào thẻ thành công!");

        // Chuyển hướng về trang đăng nhập sau 2 giây
        setTimeout(() => navigate('/login'), 2000);
      } catch (error) {
        console.error("Lỗi:", error);
        setStatus("Lời mời không hợp lệ hoặc đã hết hạn.");
      }
    };

    if (inviteId) handleAccept();
  }, [inviteId, searchParams, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="p-8 bg-white shadow-lg rounded-xl text-center border">
        <h2 className="text-xl font-bold text-gray-800">{status}</h2>
        <p className="text-sm text-gray-400 mt-2 italic">Dữ liệu card_id: {searchParams.get('cardId')}</p>
      </div>
    </div>
  );
};

export default InvitationPage;