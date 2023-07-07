import axiosClient from "./axiosClient";

const authApi = {
  signup: (params) => axiosClient.post('/auth/signup', params),
  login: (params) => axiosClient.post('/auth/login', params),
  verifyToken: () => axiosClient.post('/auth/verify-token'),
  getAllUsers: () => axiosClient.get('/auth/users'),
  getUserById: (userId) => axiosClient.get(`/auth/users/${userId}`),
  updateUser: (userId, params) => axiosClient.put(`/auth/users/${userId}`, params),
  deleteUser: (userId) => axiosClient.delete(`/auth/users/${userId}`),
  searchUsers: (searchQuery) => axiosClient.get('/auth/search', { params: { search: searchQuery } })
};

export default authApi;
