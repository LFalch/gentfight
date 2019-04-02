let socket;
let server_address = null;

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
    socket.on('welcome', function({addr}) {
        server_address = addr;
    })
    socket.on('join', joinPlayer);
    socket.on('action', playerAction);
}

function draw() {
    background(0, 119, 190);

    stroke('black');
    textSize(16);
    text("life: " + pLeft.lives, pLeft.x, pLeft.y-20);
    text("life: " + pRight.lives, pRight.x, pRight.y-20);
    rect(width-20-10*30-1, 19, 10*30+1, 41);
    rect(19, 19, 10*30+1, 41);
    noStroke();
    let hBarRight = map(pRight.lives,10,0,255,10);
    fill(255-hBarRight,hBarRight,0);
    rect(width-20-pRight.lives*30, 20, pRight.lives*30, 40);

    let hBarLeft = map(pLeft.lives,10,0,255,10);
    fill(255-hBarLeft, hBarLeft, 0);
    rect(20, 20, pLeft.lives*30, 40);

    noFill();
    image(raft, width/2-raft.width/2, 228, raft.width, raft.height/2);

    pLeft.show();
    pLeft.changeState();
    pRight.show();
    pRight.changeState();

    
    if (!(joined.left && joined.right)) {
        textSize(30);
        fill('black');
        text('Waiting for all players on ' + server_address, 150, 125);
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
    console.log(side + " is attacking");
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
