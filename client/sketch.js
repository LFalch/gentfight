/*
Skriv denne kommando i terminalen:
node app.js
*/
    
let socket;
let server_address = null;

let pLeft, pRight;
let joined = {
    left: false,
    right: false,
}

function setup() {
    pLeft = new Player('left');
    pRight = new Player('right');
    socket = io.connect(window.location.origin);
    createCanvas(800, 450);
    socket.on('welcome', function({addr}) {
        server_address = addr;
    })
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
        text("Waiting for all players on " + server_address, 150, 100);
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