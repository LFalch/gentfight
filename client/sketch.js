/*
Skriv denne kommando i terminalen:
node app.js
*/
    
let socket;

let pLeft, pRight;
let joined = {
    left: false,
    right: false,
}

function setup() {
    pLeft = new Player('left');
    pRight = new Player('right');
    socket = io.connect('http://localhost:3000');
    createCanvas(800, 450);
    socket.on('join', joinPlayer);
    socket.on('leftPlayer', actionPlayerLeft);
    socket.on('rightPlayer', actionPlayerRight);
}

function draw() {
    background('grey');

    pLeft.show();
    pRight.show();

    if (!(joined.left || joined.right)) {
        textSize(30);
        text("Waiting for all players", 250, 100);
    }
}

function joinPlayer(data) {
    joined[data.side] = true;
    console.log(data.side + ' joined');
}

function actionPlayerLeft(data){
    console.log(data);
}

function actionPlayerRight(data){
    console.log(data);
}