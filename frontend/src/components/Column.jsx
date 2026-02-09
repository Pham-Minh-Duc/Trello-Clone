import React, { useState } from 'react';
import { Droppable, Draggable } from "@hello-pangea/dnd";

const Column = ({ title, id, cards, onAddCard, onCardClick }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [cardTitle, setCardTitle] = useState("");

  const handleCreate = () => {
    if (cardTitle.trim()) {
      onAddCard(cardTitle);
      setCardTitle("");
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#ebedf0] w-[272px] max-h-full rounded-xl shadow-md flex-shrink-0 border border-gray-300">
      {/* Header Column */}
      <h2 className="p-4 font-bold text-gray-700 text-sm uppercase tracking-wide cursor-default">
        {title}
      </h2>

      {/* Droppable Area */}
      <Droppable droppableId={id}>
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className="flex-grow overflow-y-auto px-2 space-y-2 min-h-[10px] custom-scrollbar"
          >
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onCardClick(card)}
                    className="group bg-white p-3 rounded-lg shadow-sm hover:shadow-md hover:ring-2 hover:ring-blue-400 cursor-pointer transition-all relative"
                  >
                    {/* Tiêu đề Card */}
                    <div className="text-sm text-gray-800 break-words pr-4 mb-2">
                      {card.title}
                    </div>

                    {/* Footer của Card: Avatar & Icons */}
                    <div className="flex items-center justify-between mt-2">
                      {/* Danh sách Avatar nhân viên được giao task */}
                      <div className="flex -space-x-2 overflow-hidden">
                        {card.list_member && card.list_member.map((email, idx) => (
                          <div 
                            key={idx}
                            className="h-6 w-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold uppercase shadow-sm"
                            title={email}
                          >
                            {email.charAt(0)}
                          </div>
                        ))}
                      </div>

                      {/* Icon trạng thái (Chỉ hiện khi có nội dung task) */}
                      <div className="flex items-center gap-2 text-gray-400">
                        {(card.tasks && card.tasks.length > 0) && (
                          <span title="Thẻ này có mô tả nội dung" className="text-sm">
                            ☰
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Icon bút chì khi hover */}
                    <span className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity">
                      ✎
                    </span>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {/* Input thêm thẻ mới */}
            {isAdding && (
              <div className="bg-white p-2 rounded-lg shadow-md border-2 border-blue-400 mt-2">
                <textarea
                  autoFocus
                  placeholder="Nhập nội dung thẻ..."
                  className="w-full text-sm outline-none resize-none p-1"
                  rows="3"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleCreate()}
                />
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Nút Footer Thêm thẻ */}
      <div className="p-2">
        {isAdding ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCreate} 
              className="bg-[#0079bf] text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-[#026aa7]"
            >
              Thêm thẻ
            </button>
            <button 
              onClick={() => setIsAdding(false)} 
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)} 
            className="w-full flex items-center gap-2 p-2 hover:bg-gray-300 rounded-lg text-gray-600 text-sm font-medium transition-all"
          >
            <span className="text-xl">+</span> Thêm thẻ
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;