const express = require('express');
const app = express();

const ip = require('ip').address();

const server = app.listen(process.env.PORT || 3000, listen);

// This callback just tells us that the server has started
function listen() {
  const port = server.address().port;
  console.log('Example app listening at http://' + ip + ':' + port);
}

app.use(express.static('client'));

// WebSockets
const io = require('socket.io').listen(server);

let sides = ['right', 'left'];
let playerSockets = {};
let serverSocket = null;

// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
    let side;

    if (!serverSocket) {
      console.log('Client connected');
      serverSocket = socket;
      serverSocket.emit('welcome', {addr: ip})
      socket.on('disconnect', function() {
        serverSocket = null;
        console.log("Client has disconnected");
      });
      return
    }
    playerSockets[side] = socket;

    if (sides.length == 0) {
      socket.disconnect();
      return
    } else {
      side = sides.pop();
      console.log("We have a new client ("+side+"): " + socket.id);
      serverSocket.emit('join', {side: side});
      socket.emit('assign', {side: side});
    }
    socket.on('move',
      function(data) {
        console.log('Received from ' + side + ": " + data.action);
      }
    );
    socket.on('disconnect', function() {
      sides.push(side);
      delete playerSockets[side];
      console.log("Phone has disconnected");
    });
  }
);