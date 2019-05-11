let socket;
let server_address = null;

let pLeft, pRight;
let joined = {
    left: false,
    right: false,
}
let ready = {
    left: false,
    right: false,
}

//det her er en variable som vi bruger om lidt
let qrcode; 
let qrDiv;
let gameRunning = false;

let raft;
let img_ready;
let img_unready;
const movesToRingOut = 8;
let playersDisplacement = 0;

let motionDatas = {};

function preload() {
    raft = loadImage('assets/scenery/raft1.png');
    img_ready = loadImage('assets/UI/ready.png');
    img_unready = loadImage('assets/UI/unready.png');
    sound_KO = loadSound('assets/sound/KO/KOsound.mp3')
}

function setup() {
    socket = io.connect(window.location.origin);
    createCanvas(800, 450);
    socket.on('welcome', function({addr, joinedSides}) {
        if (joinedSides) {
            for (side of joinedSides) {
                joined[side] = true;
            }
        }
        server_address = addr;
        
        const url = `https://${server_address}:3000/phone/`;

        qrcode.makeCode(url);
    })
    socket.on('ready', readyPlayer);
    socket.on('join', joinPlayer);
    socket.on('action', playerAction);
    socket.on('motionData', ({side, sides, downs}) => {
        motionDatas[side] = {sides, downs};
    });
    
    qrDiv = createDiv('');
    qrDiv.id('qrcode');
    
    qrDiv.style('width', '256px');
    qrDiv.style('height', '256px');
    qrDiv.style('padding', '2px');
    qrDiv.position(300,160);
    
    
    qrcode = new QRCode('qrcode');

    pLeft = new Player('left');
    pRight = new Player('right');
}

function resetGameState() {
    pLeft.changeState('idle');
    pLeft.lives = 20;
    pRight.changeState('idle');
    pRight.lives = 20;
    ready = {left: false, right: false};
    playersDisplacement = 0;
    gameRunning = false;
    socket.emit('unready',{});
}

function draw() {
    background(0, 119, 190);
    fill('black');
    textSize(30);
    textAlign(CENTER, BASELINE);
    if (!(joined.left && joined.right)) {
        text('Waiting for all players to join on \n'+`https://${server_address}:3000/phone/`+ '\n Scan QR code to join', width/2, 50);
        textSize(16);
        text('Then press your phone screen to join the game', width/2, height-height/20);
        return;
    } else {
        qrDiv.remove();
        textSize(30);
        if (!(ready.left && ready.right)) {
            image(ready.left?img_ready:img_unready, pLeft.x, 125);
            image(ready.right?img_ready:img_unready, pRight.x, 125);
            text('Waiting for all players ready up', width/2, 75);
            text('Ready up by pressing your phone screen', width/2, 225);
            textSize(16);
            text('left',pLeft.x+25, 110);
            text('right',pRight.x+25, 110);
            text('To punch in game, jab/punch forward hard', width/2, 370);
            text('To block in game, jab/punch up hard', width/2, 400);
            text('To crouch in game, press your phone screen once game has started', width/2, 430);    
            return;
        }
        if (!gameRunning){
            socket.emit('gamestarted', {});
            gameRunning = true;
        }
    }

    noStroke();
    rect(width-20-10*30, 20, 10*30, 40); //Background for right player health bar
    rect(20, 20, 10*30, 40);    //Background for left player health bar

    //Right player health bar
    let hBarRight = map(pRight.lives,20,0,255,10);
    fill(255-hBarRight,hBarRight,0);
    rect(width-20-pRight.lives*15, 20, pRight.lives*15, 40);

    if (motionDatas.right) {
        stroke(0);
        const rect = {
            x: width-55,
            y: 250,
            w: 50,
            h: 200,
        };
        const sidesData = motionDatas.right.sides;
        const downData = motionDatas.right.downs;

        for (let i = 0; i < sidesData.length - 1; i++) {
            const sidesX_1 = map(i, 0, sidesData.length, rect.x, rect.x + rect.w);
            const sidesX_2 = map(i + 1, 0, sidesData.length, rect.x, rect.x + rect.w);
            const sidesY_1 = map(sidesData[i], 0, 10, rect.y + rect.h / 2, rect.y);
            const sidesY_2 = map(sidesData[i + 1], 0, 10, rect.y + rect.h / 2, rect.y);
            line(sidesX_1, sidesY_1, sidesX_2, sidesY_2);

            const downX_1 = map(i, 0, downData.length, rect.x, rect.x + rect.w);
            const downX_2 = map(i + 1, 0, downData.length, rect.x, rect.x + rect.w);
            const downY_1 = map(downData[i], -5, 5, rect.y + rect.h, rect.y + rect.h/2);
            const downY_2 = map(downData[i + 1], -5, 5, rect.y + rect.h, rect.y + rect.h/2);
            line(downX_1, downY_1, downX_2, downY_2);
        }
        noStroke();
    }
    
    //Left player health bar
    let hBarLeft = map(pLeft.lives,20,0,255,10);
    fill(255-hBarLeft, hBarLeft, 0);
    rect(20, 20, pLeft.lives*15, 40);
    
    if (motionDatas.left) {
        stroke(0);
        const rect = {
            x: 5,
            y: 250,
            w: 50,
            h: 200,
        };
        const sidesData = motionDatas.left.sides;
        const downData = motionDatas.left.downs;

        for (let i = 0; i < sidesData.length - 1; i++) {
            const sidesX_1 = map(i, 0, sidesData.length, rect.x, rect.x + rect.w);
            const sidesX_2 = map(i + 1, 0, sidesData.length, rect.x, rect.x + rect.w);
            const sidesY_1 = map(sidesData[i], 0, 10, rect.y + rect.h / 2, rect.y);
            const sidesY_2 = map(sidesData[i + 1], 0, 10, rect.y + rect.h / 2, rect.y);
            line(sidesX_1, sidesY_1, sidesX_2, sidesY_2);

            const downX_1 = map(i, 0, downData.length, rect.x, rect.x + rect.w);
            const downX_2 = map(i + 1, 0, downData.length, rect.x, rect.x + rect.w);
            const downY_1 = map(downData[i], -5, 5, rect.y + rect.h, rect.y + rect.h / 2);
            const downY_2 = map(downData[i + 1], -5, 5, rect.y + rect.h, rect.y + rect.h / 2);
            line(downX_1, downY_1, downX_2, downY_2);
        }
        noStroke();
    }

    noFill();
    image(raft, width/2-raft.width/2, 228, raft.width, raft.height/2);

    pLeft.show();
    pRight.show();
    noTint();
}

function readyPlayer(data) {
    ready[data.side] = true;
    console.log(data.side + ' is ready');
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
    player.action(data.action);
}

/// Decreases life of other player if punch succeeds.
function doPunch(side, stance) {
    let otherPlayer;
    let player;
    let dispDelta;
    if (side == 'left'){
        player = pLeft;
        otherPlayer = pRight;
        dispDelta = 1;
    } else {
        player = pRight;
        otherPlayer = pLeft;
        dispDelta = -1;
    }
    if (otherPlayer.state == 'dead') {
        return;
    }
    if (stance == 'high') {
        switch (otherPlayer.state) {
            case 'blocking':
                playersDisplacement -= dispDelta;
                player.changeState('stunned');
                break;
            case 'crouched':
            case 'low_blocking':
                otherPlayer.lives -= 2;
                otherPlayer.changeState('low_damaged');
                break;
            case 'low_punching':
                otherPlayer.lives -= 1;
                otherPlayer.changeState('low_stunned');
                break;
            default:
                otherPlayer.lives -= 1;
                playersDisplacement += 2*dispDelta;
                otherPlayer.changeState(otherPlayer.isLow() ? 'low_damaged' : 'damaged');
                break;
            }
        } else if (stance == 'low') {
            switch (otherPlayer.state) {
            case 'blocking':
                playersDisplacement += dispDelta;
                otherPlayer.lives -= 2;
                otherPlayer.changeState('damaged');
                break;
            case 'low_blocking':
                player.changeState('low_stunned');
                break;
            default:
                const low = otherPlayer.isLow();
                otherPlayer.lives -= low ? 1 : 2;
                otherPlayer.changeState(low ? 'low_damaged' : 'damaged');
            break;
        }
    }

    let deadPlayer = null;
    if (otherPlayer.lives <= 0) {
        otherPlayer.lives = 0;
        deadPlayer = otherPlayer;
    } else if (playersDisplacement >= movesToRingOut) {
        deadPlayer = pRight;
    } else if (playersDisplacement <= -movesToRingOut) {
        deadPlayer = pLeft;
    }

    if (deadPlayer) {
        setTimeout(resetGameState, 5000);
        sound_KO.play();
        deadPlayer.changeState('dead');
    }
}

let wekinatorRecordEnabled = false;

function keyPressed () {
    if (key == 'R' && wekinatorRecordEnabled) {
        socket.emit('record', {});
    }
    if (key == 'p' || key == 'P') {
        wekinatorRecordEnabled = !wekinatorRecordEnabled;
        console.log('Wekinator enabled: ', wekinatorRecordEnabled);
    }
    if (key == 'W') {
        playerAction({side:'left',action:'block'});
    }
    if (key == 'D') {
        playerAction({side:'left',action:'punch'});
    }
    if (key == 'S') {
        playerAction({side:'left',action:'crouch'});
    }
    if (key == 'I') {
        playerAction({side:'right',action:'block'});
    }
    if (key == 'J') {
        playerAction({side:'right',action:'punch'});
    }
    if (key == 'K') {
        playerAction({side:'right',action:'crouch'});
    }
}