/*
Skriv denne kommando i terminalen:
node app.js
*/
    
let socket;

let players = [];


function setup() {
    socket = io.connect('http://localhost:3000');
    createCanvas(800, 450);
    socket.on('join', joinPlayer);
    socket.on('leftPlayer', actionPlayerLeft);
    socket.on('rightPlayer', actionPlayerRight);
}

function draw() {
    background('grey');

    for (player of players) {
        player.show();
    }
}

function joinPlayer(data) {
    players.push(new Player(data.side));
}

function actionPlayerLeft(data){
    console.log(data);

}

function actionPlayerRight(data){
    console.log(data);

}




