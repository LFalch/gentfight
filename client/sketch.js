let socket;
let addr;

let pLeft, pRight;
let joined = {
    left: false,
    right: false,
}

let raft, ocean_tiles;

function preload() {
    raft = loadImage('assets/scenery/raft.png');
    ocean_tiles = loadImage('assets/scenery/ocean_tiles.png');
}

function setup() {
    pLeft = new Player('left');
    pRight = new Player('right');
    socket = io.connect(window.location.origin);
    createCanvas(800, 450);
    socket.on('welcome', (data) => {
        addr = data.addr;
    });
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
        text('Waiting for all players' + (addr ? (' on ' + addr):''), 250, 100);
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