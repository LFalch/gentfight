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
function preload() {
    raft = loadImage('assets/scenery/raft.png');
    ocean_tiles = loadImage('assets/scenery/ocean_tiles.png');
}

function setup() {
    pLeft = new Player('left');
    pRight = new Player('right');
    socket = io.connect('http://localhost:3000');
    createCanvas(800, 450);
    socket.on('join', joinPlayer);
    socket.on('action', playerAction);
}

function draw() {
    background('grey');
    image(raft, width/2-raft.width/2, 228, raft.width, raft.height/2);
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

function playerAction(data){
    console.log(data);
    if (data.punch) {
        
        
    } else if (data.block) {
        

    }
}