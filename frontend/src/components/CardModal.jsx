import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const CardModal = ({ card, onClose, onUpdate, onDelete }) => {
  const { boardId } = useParams(); 
  const [title, setTitle] = useState("");
  const [taskContent, setTaskContent] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Lấy thông tin user hiện tại từ JWT token
  const token = localStorage.getItem('token');
  let currentUserEmail = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUserEmail = decoded.email;
    } catch (error) {
      console.error('Lỗi giải mã token:', error);
    }
  }

  useEffect(() => {
    if (card) {
      setTitle(card.title || "");
      const content = Array.isArray(card.tasks) ? card.tasks.map(t => t.content).join("\n") : (card.tasks || "");
      setTaskContent(content);
    }
  }, [card?.id]);

  const handleInvite = async () => {
  if (!inviteEmail) return alert("Vui lòng nhập email");
  
  // 1. Log kiểm tra boardId và cardId
  console.log("--- DEBUG INVITE ---");
  console.log("Board ID từ URL:", boardId);
  console.log("Card ID hiện tại:", card?.id);
  console.log("Email người mời (Owner):", currentUserEmail);
  console.log("Email được mời (Member):", inviteEmail);

  if (!boardId || boardId === 'undefined') {
    return alert("Lỗi: Không tìm thấy Board ID.");
  }

  setIsInviting(true);
  try {
    // 2. Tạo Payload
    const payload = {
      board_owner_id: currentUserEmail || "unknown",
      member_id: inviteEmail,
      email_member: inviteEmail,
      status: "pending",
      card_id: card?.id // Gửi kèm card_id để backend xử lý
    };

    // 3. Log Payload trước khi gửi
    console.log("Payload gửi đi:", JSON.stringify(payload, null, 2));

    const apiUrl = `/boards/${boardId}/invite`;
    console.log("Đường dẫn API:", apiUrl);

    // 4. Thực hiện gửi
    const response = await axiosClient.post(apiUrl, payload);
    
    console.log("Phản hồi từ Server:", response.data);
    alert("Đã gửi lời mời thành công!");
    setInviteEmail("");

  } catch (error) {
    // 5. Log chi tiết lỗi từ Server
    console.error("LỖI KHI GỌI API:");
    if (error.response) {
      console.error("Data lỗi từ Server:", error.response.data);
      console.error("Status lỗi:", error.response.status);
      alert(`Lỗi ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    } else {
      console.error("Lỗi Network/Cấu hình:", error.message);
      alert("Lỗi: " + error.message);
    }
  } finally { 
    setIsInviting(false); 
  }
};

  if (!card) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0" onClick={() => { onUpdate(card.id, { title, tasks: taskContent }); onClose(); }}></div>
      <div className="bg-[#f4f5f7] w-full max-w-2xl rounded-lg shadow-2xl z-10 overflow-hidden flex flex-col">
        <div className="p-4 flex justify-between bg-white border-b">
          <input className="text-xl font-bold bg-transparent w-full outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500">
            <p className="font-bold mb-2 text-gray-700">👤 Mời thành viên vào bảng này</p>
            <div className="flex gap-2">
              <input className="flex-grow p-2 border rounded text-sm outline-none focus:border-blue-500" placeholder="Email người tham gia..." value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              <button onClick={handleInvite} disabled={isInviting} className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700">
                {isInviting ? "..." : "Mời"}
              </button>
            </div>
          </div>
          <textarea className="w-full p-4 bg-white rounded min-h-[150px] outline-none border border-gray-200" value={taskContent} onChange={(e) => setTaskContent(e.target.value)} />
        </div>
        <div className="p-4 bg-gray-100 flex justify-between">
          <button onClick={() => { if(window.confirm("Xóa thẻ?")) { onDelete(card.id); onClose(); } }} className="text-red-600 font-medium">Xóa thẻ</button>
          <button onClick={() => { onUpdate(card.id, { title, tasks: taskContent }); onClose(); }} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Hoàn tất</button>
        </div>
      </div>
    </div>
  );
};
export default CardModal;