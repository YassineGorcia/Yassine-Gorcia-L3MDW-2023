import axiosClient from './axiosClient';

const commentApi = {
  createComment: (taskId, userId, content) => axiosClient.post('/comments', { taskId, userId, content }),
  getAllComments: () => axiosClient.get('/comments'),
  getCommentById: (commentId) => axiosClient.get(`/comments/${commentId}`),
  updateComment: (commentId, content) => axiosClient.put(`/comments/${commentId}`, { content }),
  deleteComment: (commentId) => axiosClient.delete(`/comments/${commentId}`),
  getCommentsByTaskId: (taskId) => axiosClient.get(`/comments/task/${taskId}/comments`),
};

export default commentApi;
