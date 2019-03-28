const express = require('express');
const osc = require('node-osc');
const app = express();

const server = app.listen(3000, '0.0.0.0', listen);
const ip = require('ip').address();

const osc_client = new osc.Client('127.0.0.1', 6448);
const osc_server = new osc.Server(12000, '127.0.0.1');

// This callback just tells us that the server has started
function listen() {
  const port = server.address().port;
  console.log('App listening at http://' + ip + ':' + port);
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

    // If we don't have a server, assume first connector is the server
    if (!serverSocket) {
      console.log('Client connected');
      socket.emit('welcome', {addr: ip + ':' + server.address().port});
      serverSocket = socket;
      serverSocket.emit('welcome', {addr: ip})
      socket.on('disconnect', function() {
        serverSocket = null;
        console.log("Client has disconnected");
      });
      return
    }
    // Otherwise, check if there are sides left and save the socket
    
    if (sides.length == 0) {
      socket.disconnect();
      return
    } else {
      side = sides.pop();
      console.log("We have a new client ("+side+"): " + socket.id);
      serverSocket.emit('join', {side: side});
      socket.emit('assign', {side: side});
    }
    
    playerSockets[side] = socket;

    socket.on('motion',
      function(data) {
        if (data.downMotion) {
          const msg = new osc.Message('/wek/inputs', data.downMotion, data.sidewaysMotion);
          osc_client.send(msg);
        }
      }
    );
    socket.on('disconnect', function() {
      delete playerSockets[side];
      sides.push(side);
      console.log("Phone has disconnected");
    });
  }
);