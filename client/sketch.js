let socket;
let server_address = null;

let pLeft, pRight;
let joined = {
    left: false,
    right: false,
}

//det her er en variable som vi bruger om lidt
let qrcode; 
let div;

let raft;

function preload() {
    raft = loadImage('assets/scenery/raft.png');
}

function setup() {
    
    pLeft = new Player('left');
    pRight = new Player('right');
    socket = io.connect(window.location.origin);
    createCanvas(800, 450);
    socket.on('welcome', function({addr, joinedSides}) {
        if (joinedSides) {
            for (side of joinedSides) {
                joined[side] = true;
            }
        }
        server_address = addr;

        const url = `http://${server_address}:3000/phone/`;

        qrcode.makeCode(url);
    })
    socket.on('join', joinPlayer);
    socket.on('action', playerAction);

    div = createDiv("");
    div.id("qrcode");

    div.style("width", "256px");
    div.style("height", "256px");
    div.style("padding", "2px");
    div.position(300,160);


    qrcode = new QRCode("qrcode");

   
}


function draw() {
    background(0, 119, 190);
    fill("black");
    textSize(16);
    text("life: " + pLeft.lives, pLeft.x, pLeft.y-20);
    text("life: " + pRight.lives, pRight.x, pRight.y-20);

    noStroke();
    rect(width-20-10*30, 20, 10*30, 40); //Background for right player health bar
    rect(20, 20, 10*30, 40);    //Background for left player health bar

    //Right player health bar
    let hBarRight = map(pRight.lives,10,0,255,10);
    fill(255-hBarRight,hBarRight,0);
    rect(width-20-pRight.lives*30, 20, pRight.lives*30, 40);

    //Left player health bar
    let hBarLeft = map(pLeft.lives,10,0,255,10);
    fill(255-hBarLeft, hBarLeft, 0);
    rect(20, 20, pLeft.lives*30, 40);

    noFill();
    image(raft, width/2-raft.width/2, 228, raft.width, raft.height/2);

    pLeft.show();
    pRight.show();
    noTint();
    
    if (!(joined.left && joined.right)) {
        textSize(30);
        fill('black');
        text('Waiting for all players on ' + server_address, 150, 125);
    } else {
        div.remove();
    }
}

function joinPlayer(data) {
    joined[data.side] = true;
    console.log(data.side + ' joined');
}
function leavePlayer(data) {
    joined[data.side] = false;
    console.log(data.side + ' left');
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
    switch (data.action) {
        case "punch":
            player.changeState('punching');
        break;
        case "block":
            player.changeState('blocking');
        break;
    }
}

/// Decreases life of other player if punch succeeds.
function doPunch(side) {
    let otherPlayer;
    let player;
    if (side == 'left'){
        player = pLeft;
        otherPlayer = pRight;
    } else {
        player = pRight;
        otherPlayer = pLeft;
    }
    if (otherPlayer.state == 'blocking'){
        player.changeState('stunned');
    }
    if (otherPlayer.state != 'blocking'){
        otherPlayer.lives -= 1;
        if (otherPlayer.lives <= 0) {
            otherPlayer.changeState('dead');
        } else {
            otherPlayer.changeState('damaged');
        }
    }
}

function keyPressed () {
    if(key == '0') {
    
        div.remove();
        
        div = createDiv("");
        div.id("qrcode");
        
        div.position(300,160);
      
          qrcode = new QRCode("qrcode");
      }
      else if (key == '1') {
        makeCode();
      }



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