import axiosClient from './axios';

export const fetchBoards = () => {
  return axiosClient.get('/boards'); // Endpoint lấy danh sách boards
};

export const createBoard = (data) => {
  return axiosClient.post('/boards', data);
};

export const deleteBoard = (id) => {
  return axiosClient.delete(`/boards/${id}`);
};

export const updateBoard = (id, data) => {
  return axiosClient.patch(`/boards/${id}`, data);
};

export const inviteMemberToBoard = (boardId, email) => {
  axiosClient.post(`/boards/${boardId}/invite`, { email });
}