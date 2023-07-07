import axiosClient from "./axiosClient";

const messageApi = {
  findMessagesBetweenUsers: (user1Id, user2Id) => axiosClient.get('/messages', { params: { user1Id, user2Id } }),
  // Add more message-related API calls here as needed
};

export default messageApi;
