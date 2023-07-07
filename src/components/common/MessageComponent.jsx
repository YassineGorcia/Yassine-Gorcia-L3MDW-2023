import React, { useState, useEffect } from 'react';
import { Button, Snackbar, InputBase, IconButton, Box, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import authApi from '../../api/authApi';
import messageApi from '../../api/messageApi';

const MessageComponent = ({ receiver }) => {
  const [ws, setWs] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const user = useSelector((state) => state.user.value);
  const [sender, setsender] = useState(null);
  const userId = user.id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getUserById(userId);
        setsender(response);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await messageApi.findMessagesBetweenUsers(userId, receiver.id);
        setMessages(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
    fetchMessages();
    // Establish WebSocket connection
    const clientId = userId; // Replace with the actual client ID
    const socket = new WebSocket('ws://localhost:5000', clientId);

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
      setShowPopup(true);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Clean up WebSocket connection on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [userId, receiver.id]);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const senderId = userId; // Replace with the actual sender ID
      const receiverId = receiver.id; // Replace with the actual receiver ID

      const messageObject = {
        senderId,
        receiverId,
        content: message,
      };

      ws.send(JSON.stringify(messageObject));
      setMessage('');
      setMessages((prevMessages) => [...prevMessages, messageObject]); // Add the sent message to the messages array
    }
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <Box>
      <Box sx={{ height: '70vh', overflow: 'auto' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.senderId === user.id ? 'flex-end' : 'flex-start',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                margin: '5px',
                padding: '5px',
                borderRadius: '5px',
                background: msg.senderId === receiver.id ? '#1e5245' : '#3da58a',
              }}
            >
              {msg.senderId === user.id ? (
                <Box sx={{ width: '300px' }}>
                  <div style={{ textAlign: 'right', justifyContent: 'center', alignItems: 'center' }}>
                    <div>
                      {msg.content}{' '}
                      <img
                        src={`https://robohash.org/${sender.username}`}
                        style={{ width: '30px', borderRadius: '50%', backgroundColor: 'grey' }}
                        alt="User"
                      />{' '}
                    </div>
                  </div>
                </Box>
              ) : (
                <Box sx={{ width: '300px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <div>
                      <img
                        src={`https://robohash.org/${receiver.username}`}
                        style={{ width: '30px', borderRadius: '50%', backgroundColor: 'grey' }}
                        alt="User"
                      />{' '}
                      {msg.content}
                    </div>
                  </div>
                </Box>
              )}
            </div>
          </div>
        ))}
      </Box>
      <Box
        display="flex"
        backgroundColor={'#1D2639'}
        borderRadius="3px"
        height={'50px'}
        width={'auto'}
        marginLeft={'20px'}
      >
        <InputBase sx={{ ml: 2, flex: 1 }} type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
        <IconButton onClick={sendMessage}>
          <ForwardToInboxIcon fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MessageComponent;
