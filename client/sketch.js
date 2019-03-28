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
    textSize(16);
    text("i: " + pLeft.i,600,50);
    text("life: " + pLeft.lives, pLeft.x, pLeft.y+20);
    text("life: " + pRight.lives, pRight.x, pRight.y+20);
    image(raft, width/2-raft.width/2, 228, raft.width, raft.height/2);
    pLeft.show();
    pLeft.changeState();
    pRight.show();
    pRight.changeState();

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
    let player;
    let otherPlayer;
    if (data.side == 'left'){
        player = pLeft;
        otherPlayer = pRight;
    } else {
        player = pRight;
        otherPlayer = pLeft;
    }
    player.i = 0;
    switch (data.action) {
        case "punch":
            player.state = "punching";
            player.img = player.img_punching;
            player.speed = 15;
        break;
        case "block":
            player.state = "blocking";
            player.img = player.img_blocking;
            player.speed = 22;
            player.img_total = 3;
        break;
        
        default:
        break;
    }
}
function fight(side) {
    console.log(side);
    let otherPlayer;
    let player;
    if (side == 'left'){
        player = pLeft;
        otherPlayer = pRight;
    } else {
        player = pRight;
        otherPlayer = pLeft;
    }
    if (otherPlayer.state != 'blocking'){
        player.resetState();
        otherPlayer.lives -= 1;
    }

    // if (player.state != 'idle'){
    //     if (player.i >= player.speed*player.img_total-1) {
    //         player.resetState();
    //     }
    // }
}

function keyPressed () {
    if (keyCode == LEFT_ARROW) {
        let data = {
            side: 'left',
            action: 'punch',
        }
        playerAction(data);
    }
    if (keyCode == UP_ARROW) {
        let data = {
            side: 'left',
            action: 'block',
        }
        playerAction(data);
    }
    if (keyCode == RIGHT_ARROW) {
        let data = {
            side: 'right',
            action: 'punch',
        }
        playerAction(data);
    }
    if (keyCode == DOWN_ARROW) {
        let data = {
            side: 'right',
            action: 'block',
        }
        playerAction(data);
    }
}
