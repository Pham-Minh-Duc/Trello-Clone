import axiosClient from './axios';

// Lấy danh sách card theo Board ID
export const fetchCards = (boardId) => {
  return axiosClient.get(`/boards/${boardId}/cards`);
};

// Tạo card mới
export const createCard = (boardId, data) => {
  return axiosClient.post(`/boards/${boardId}/cards`, data);
};

// Cập nhật card (Dùng để đổi cột khi kéo thả hoặc đổi tên card)
export const updateCard = (boardId, cardId, data) => {
  return axiosClient.patch(`/boards/${boardId}/cards/${cardId}`, data);
};

// Xóa card
export const deleteCard = (boardId, cardId) => {
  return axiosClient.delete(`/boards/${boardId}/cards/${cardId}`);
};