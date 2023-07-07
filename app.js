const express = require('express');
const app = express();
const server = require("http").Server(app);
const debug = require('debug')('server:server');
const WebSocket = require('ws');
const Message = require('../server/src/v1/models/message');

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');



function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

const port = normalizePort('5000');
app.set('port', port);

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/', require('./src/v1/routes'));

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// Handle incoming WebSocket connections
wss.on('connection', (ws) => {
  // Extract the client ID sent from the front end
  const clientId = ws.protocol;

  // Store the WebSocket connection with the provided client ID
  clients.set(clientId, ws);

  // Handle messages received from clients
  ws.on('message', async (message) => {
    try {
      const { senderId, receiverId, content } = JSON.parse(message);
      // Process the received message
      console.log(`Received message from ${senderId} to ${receiverId}: ${content}`);
  
      // Save the message to the database
      const newMessage = new Message({
        senderId,
        receiverId,
        content,
      });
      await newMessage.save();
  
      // Send the message to the receiver
      const receiver = clients.get(receiverId);
      if (receiver) {
        receiver.send(JSON.stringify({ senderId, content }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle WebSocket connection close
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`WebSocket connection closed for client ${clientId}`);
  });
});

server.listen(port, () => {
  console.log("Server running on port " + port);
});
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = app;