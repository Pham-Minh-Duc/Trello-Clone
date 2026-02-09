import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { fetchBoards, createBoard, deleteBoard, updateBoard } from "../api/boardApi"; // Giả định bạn đã thêm 2 hàm này vào api

const Boards = () => {
  const [boards, setBoards] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  
  // State mới cho chức năng sửa/xóa
  const [menuBoard, setMenuBoard] = useState(null); // Lưu board đang được chọn để mở menu
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const getBoards = async () => {
      try {
        const data = await fetchBoards();
        setBoards(data);
      } catch (err) {
        console.error(err);
      }
    };
    getBoards();
  }, []);

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    try {
      const newBoard = await createBoard({ title: newBoardTitle });
      setBoards(prevBoards => [...prevBoards, newBoard]);
      setNewBoardTitle("");
      setIsAdding(false);
    } catch (err) {
      console.error("❌ Lỗi tạo board:", err);
    }
  };

  // Hàm xử lý Xóa
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bảng này không?")) {
      try {
        await deleteBoard(id);
        setBoards(prev => prev.filter(b => b.id !== id));
        setMenuBoard(null);
      } catch (err) {
        console.error("Lỗi xóa board:", err);
      }
    }
  };

  // Hàm xử lý Đổi tên
  const handleUpdate = async () => {
    if (!editTitle.trim()) return;
    try {
      await updateBoard(menuBoard.id, { title: editTitle });
      setBoards(prev => prev.map(b => b.id === menuBoard.id ? { ...b, title: editTitle } : b));
      setIsEditing(false);
      setMenuBoard(null);
    } catch (err) {
      console.error("Lỗi cập nhật board:", err);
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(boards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setBoards(items);
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <Header />
      <main className="p-8">
        <h1 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-700">
          <span className="p-2 bg-blue-100 rounded">📋</span> Bảng làm việc
        </h1>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="boards-grid" direction="horizontal" type="board">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-wrap gap-4 items-start">
                {boards.map((board, index) => {
                  if (!board?.id) return null;
                  return (
                    <Draggable key={board.id} draggableId={board.id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="group relative w-60 h-32 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-lg shadow-lg cursor-pointer transition-all"
                          onClick={() => navigate(`/board/${board.id}`)}
                        >
                          <h3 className="font-bold text-lg leading-tight break-words pr-6">
                            {board.title}
                          </h3>

                          {/* NÚT 3 DẤU CHẤM: Chỉ hiện rõ khi hover vào board nhờ class 'group-hover' */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Ngăn sự kiện click vào board
                              setMenuBoard(board);
                              setEditTitle(board.title);
                            }}
                            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}

                {/* FORM TẠO BẢNG */}
                <div className="w-60">
                  {isAdding ? (
                    <div className="bg-white p-3 rounded-lg shadow-md border-2 border-blue-500">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Nhập tiêu đề bảng..."
                        className="w-full p-2 rounded border border-gray-300 outline-none mb-2 text-sm text-black"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateBoard()}
                      />
                      <div className="flex items-center gap-2">
                        <button onClick={handleCreateBoard} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-700">Thêm bảng</button>
                        <button onClick={() => { setIsAdding(false); setNewBoardTitle(""); }} className="text-gray-500 text-2xl font-bold px-2">×</button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setIsAdding(true)} className="h-32 bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-300 cursor-pointer transition-all">
                      <span className="font-semibold">+ Tạo bảng mới</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {/* MODAL TÙY CHỌN (XÓA/SỬA) */}
      {menuBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setMenuBoard(null); setIsEditing(false); }}>
          <div className="bg-white rounded-xl shadow-2xl w-80 overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-700">Tùy chọn bảng</h2>
              <button onClick={() => { setMenuBoard(null); setIsEditing(false); }} className="text-gray-400 hover:text-black">✕</button>
            </div>
            
            <div className="p-4 flex flex-col gap-2">
              {isEditing ? (
                <>
                  <input 
                    autoFocus
                    className="w-full p-2 border-2 border-blue-500 rounded outline-none"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleUpdate} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Lưu</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 py-2 rounded font-bold">Hủy</button>
                  </div>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-lg text-blue-600 font-medium transition-colors">
                    ✏️ Đổi tên bảng
                  </button>
                  <button onClick={() => handleDelete(menuBoard.id)} className="flex items-center gap-3 w-full p-3 hover:bg-red-50 rounded-lg text-red-600 font-medium transition-colors">
                    🗑️ Xóa bảng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Boards;