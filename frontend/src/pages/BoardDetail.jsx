import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from "@hello-pangea/dnd";
import axiosClient from '../api/axios';
import { fetchCards, updateCard, createCard, deleteCard } from '../api/cardApi';
import Header from '../components/Header';
import Column from '../components/Column';
import CardModal from '../components/CardModal';

const BoardDetail = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  
  const [cards, setCards] = useState([]);
  const [boardName, setBoardName] = useState("");
  const [members, setMembers] = useState([]); 
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const columns = ["To Do", "In Progress", "Done"];

  // Fetch dữ liệu khởi tạo
  useEffect(() => {
    const fetchData = async () => {
      if (!boardId) return;
      try {
        setLoading(true);
        const [boardRes, cardsRes] = await Promise.all([
          axiosClient.get(`/boards/${boardId}`),
          fetchCards(boardId)
        ]);

        // Đảm bảo boardRes là object data trực tiếp từ axiosClient (tùy cấu trúc interceptor của bạn)
        const bData = boardRes.data || boardRes;
        setBoardName(bData.title || "Board");
        setMembers(bData.members || []);

        // Đồng nhất cấu trúc Cards
        const cData = cardsRes.cards || (Array.isArray(cardsRes) ? cardsRes : []);
        setCards(cData);
      } catch (err) {
        console.error("Lỗi fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [boardId]);

  // Cập nhật card (bao gồm cả cập nhật list_member)
  const handleUpdateCard = async (cardId, updateData) => {
    try {
      // Cập nhật UI ngay lập tức (Optimistic)
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updateData } : c));
      
      // Đồng bộ card đang mở nếu có
      if (selectedCard?.id === cardId) {
        setSelectedCard(prev => ({ ...prev, ...updateData }));
      }

      await updateCard(boardId, cardId, updateData);
    } catch (err) {
      console.error("Lỗi cập nhật card:", err);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("Xóa thẻ này?")) return;
    try {
      setCards(prev => prev.filter(c => c.id !== cardId));
      setSelectedCard(null);
      await deleteCard(boardId, cardId);
    } catch (err) {
      console.error("Lỗi xóa:", err);
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
    handleUpdateCard(draggableId, { column: destination.droppableId });
  };

  if (loading) return <div className="h-screen bg-[#0079bf] flex items-center justify-center text-white">Đang tải...</div>;

  return (
    <div className="h-screen flex flex-col bg-[#0079bf] overflow-hidden font-sans">
      <Header />
      
      <div className="p-3 flex items-center justify-between bg-black/10 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="bg-white/20 px-3 py-1.5 rounded hover:bg-white/30 text-sm font-medium transition-all">
            ← Quay lại
          </button>
          <div className="h-6 w-[1px] bg-white/30 mx-1" />
          <h1 className="font-bold text-lg uppercase tracking-wider">{boardName}</h1>
          
          {/* Render Members Avatar */}
          <div className="flex -space-x-2 ml-4">
            {members.map((m, i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-blue-600 bg-gray-500 flex items-center justify-center text-[10px] font-bold shadow-sm" title={m.email || m}>
                {(m.email || m).charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-1.5 rounded text-sm font-bold transition-all shadow-md"
        >
          + Mời thành viên
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <main className="flex-grow p-4 flex gap-4 overflow-x-auto items-start custom-scrollbar">
          {columns.map(col => (
            <Column 
              key={col} id={col} title={col}
              cards={cards.filter(c => c.column === col)}
              onCardClick={(card) => setSelectedCard(card)}
              onAddCard={async (title) => {
                const response = await createCard(boardId, { title, column: col });
                setCards(prev => [...prev, (response.card || response)]);
              }}
            />
          ))}
        </main>
      </DragDropContext>

      {/* MODAL CHI TIẾT CARD & GIAO TASK */}
      {selectedCard && (
        <CardModal 
          card={selectedCard} 
          boardMembers={members} // Quan trọng để hiển thị danh sách chọn nhân viên
          onClose={() => setSelectedCard(null)} 
          onUpdate={handleUpdateCard} 
          onDelete={handleDeleteCard}
        />
      )}

      {/* MODAL MỜI THÀNH VIÊN */}
      {isInviteModalOpen && (
        <InviteMemberModal 
          boardId={boardId} 
          onClose={() => setIsInviteModalOpen(false)} 
          // Cập nhật lại danh sách members sau khi mời thành công
          onSuccess={(newMember) => setMembers(prev => [...prev, newMember])}
        />
      )}
    </div>
  );
};

export default BoardDetail;