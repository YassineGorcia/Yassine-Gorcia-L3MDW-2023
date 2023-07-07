import axiosClient from './axiosClient';

const boardApi = {
  create: (user, position) => axiosClient.post('boards', { user, position }),
  getAll: () => axiosClient.get('boards'),
  updatePosition: (params) => axiosClient.put('boards', params), // Corrected method name
  getOne: (id) => axiosClient.get(`boards/${id}`),
  delete: (id) => axiosClient.delete(`boards/${id}`),
  update: (id, params) => axiosClient.put(`boards/${id}`, params),
  getFavourites: () => axiosClient.get('boards/favourites'),
  updateFavouritePosition: (params) => axiosClient.put('boards/favourites', params),
  addUserToBoard: (boardId, username) => axiosClient.post(`boards/${boardId}/users`, { username }),
  removeUserFromBoard: (boardId, userId) => axiosClient.delete(`boards/${boardId}/users/${userId}`),

};

export default boardApi;
