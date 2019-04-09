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

let outputCbs = [];

osc_server.on('message', function (msg) {
  if (msg[0] == '/wek/outputs') {
    const cb = outputCbs.shift();
    if (cb) {
      cb(msg[1]);
    }
  }
});

app.use(express.static('client'));

// WebSockets
const io = require('socket.io').listen(server);

let sides = ['right', 'left'];
let playerSockets = {};
let serverSocket = null;

let isRecording = false;

// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
    let side;

    // If we don't have a server, assume first connector is the server
    if (!serverSocket) {
      console.log('Client connected');
      socket.emit('welcome', {addr: ip + ':' + server.address().port, joinedSides: Object.keys(playerSockets)});
      serverSocket = socket;
      serverSocket.emit('welcome', {addr: ip})
      serverSocket.on('record', () => {
        wekControl('stopRunning');
        wekControl('startRecording');
        isRecording = true;
      });
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
    
    socket.motionData = {
      downs: [],
      sides: [],
    };
    playerSockets[side] = socket;

    socket.on('record', function() {
      isRecording = true;
      wekControl('startRecording');
    });
    socket.on('motion',
      function(data) {
        if (data.downMotion) {
          socket.motionData.downs.push(data.downMotion);
          socket.motionData.sides.push(data.sidewaysMotion);
          if (socket.motionData.downs.length > 20) {
            socket.motionData.downs.shift();
            socket.motionData.sides.shift();
            socket.motionData.side = side;
            serverSocket.emit('motionData', socket.motionData);
          }
          const msg = new osc.Message('/wek/inputs', socket.motionData.downs, socket.motionData.downs);
          osc_client.send(msg);
          if (isRecording) {
            isRecording = false;
            wekControl('stopRecording');
            wekControl('train');
            wekControl('startRunning');
          } else {
            outputCbs.push((wekClass) => {
              switch (wekClass) {
                case 2:
                serverSocket.emit('action', {side, action: 'punch'});
                break;
                case 3:
                serverSocket.emit('action', {side, action: 'block'});
                break;
              } 
            });
            while (outputCbs.length > 2) {
              outputCbs.shift();
            }
          }

          // if (data.downMotion > 25) {
          //   serverSocket.emit('action', {side, action: 'block'});
          // } else if (data.sidewaysMotion > 25) {
          //   serverSocket.emit('action', {side, action: 'punch'});
          // }
        }
      }
    );
    socket.on('disconnect', 
      function() {
        delete playerSockets[side];
        sides.push(side);
        console.log("Phone has disconnected");
      }
    );
    socket.on('action', 
      function (data) {
        serverSocket.emit('action', data);
      }
    );
  }
);

function wekControl(msg, ...args) {
  const msg_obj = new osc.Message('/wekinator/control/' + msg, args);
  return osc_client.send(msg_obj);
}