import axiosClient from './axiosClient';

const roomApi = {
  createRoom: (boardId, members) => axiosClient.post('/rooms/', { boardId, members }),
  getRoomByBoardId: (boardId) => axiosClient.get(`/rooms/${boardId}`),
  addMessageToRoom: (roomId, sender, message) => axiosClient.post(`/rooms/${roomId}/messages`, { sender, message }),
  deleteRoom: (roomId) => axiosClient.delete(`/rooms/${roomId}`),
  getRoomMessages: (roomId) => axiosClient.get(`/rooms/${roomId}/messages`),
};

export default roomApi;
