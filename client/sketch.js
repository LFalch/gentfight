// Web-socket til node-serveren
let socket;
// Web-serverens addresse
let server_address = null;

// Spiller-objekterne
let pLeft, pRight;
// Booleske værdier om hvorvidt hver spiller er joined
let joined = {
    left: false,
    right: false,
}
// Booleske værdier om hvorvidt spillerene har tilkendegivet, at de er klar
let ready = {
    left: false,
    right: false,
}

// QR-kode objekt, der knytter sig til et HTML-element-id
let qrcode; 
// Objekt til at lave en HTML-div til at vise QR-koden
let qrDiv;
let gameRunning = false;

// P5Image-objekter
let raft;
let img_ready;
let img_unready;

// Antal displacements, man skal skubbes, for at man dør af at ryge ud af banen.
const movesToRingOut = 8;
// Antal "displacements" spillerene er på, negative displacements betyder at spillerene står mod venstre side,
// mens positive værdier betyder at spillerene står mod højre. Bliver tallet over `movesToRingOut` antages en spiller død.
let playersDisplacement = 0;

// Data omkring bevægelser fra hver spillers telefoner
let motionDatas = {};

// Indlæs medie-filer
function preload() {
    raft = loadImage('assets/scenery/raft1.png');
    img_ready = loadImage('assets/UI/ready.png');
    img_unready = loadImage('assets/UI/unready.png');
    sound_KO = loadSound('assets/sound/KO/KOsound.mp3')
}

function setup() {
    // Opret en web-socket forbindelse til node-serveren
    socket = io.connect(window.location.origin);
    // Lav et canvas, spillet vises på
    createCanvas(800, 450);
    // Denne besked sendes fra node-serveren når en forbindelse laves
    socket.on('welcome', function({addr, joinedSides}) {
        // Sæt op hvilke sider, der er joinede
        if (joinedSides) {
            for (side of joinedSides) {
                joined[side] = true;
            }
        }
        server_address = addr;
        // Modtag addressen til serveren, så vi kan lave en URL at skrive i QR-koden
        const url = `https://${server_address}:3000/phone/`;

        qrcode.makeCode(url);
    })
    // Sæt callbacks til beskeder op
    socket.on('ready', readyPlayer);
    socket.on('join', joinPlayer);
    socket.on('action', playerAction);
    socket.on('motionData', ({side, sides, downs}) => {
        motionDatas[side] = {sides, downs};
    });

    // QR-kode-divs opsætning og placering
    qrDiv = createDiv('');
    qrDiv.id('qrcode');
    
    qrDiv.style('width', '256px');
    qrDiv.style('height', '256px');
    qrDiv.style('padding', '2px');
    qrDiv.position(300,160);

    // Knyt QRCode-objektet til HTML-ID'et 'qrcode'
    qrcode = new QRCode('qrcode');

    // Initialisér spiller-objekter
    pLeft = new Player('left');
    pRight = new Player('right');
}

// Kaldes for at genstarte spillet
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
    textAlign(CENTER);

    if (!(joined.left && joined.right)) {
        // Hvis begge spillere ikke er joined endnu,
        // skrives hvordan man joiner på skærmen
        text('Waiting for all players to join on \n'+`https://${server_address}:3000/phone/`+ '\n Scan QR code to join', width/2, 50);
        textSize(16);
        text('Then press your phone screen to join the game', width/2, height-height/20);
        // Return da spillet ikke skal tegnes når det ikke kører
        return;
    } else {
        // Når begge spillere er joinet, fjernes QR-koden, og vi tjekker om spillet kan starte
        qrDiv.remove();
        textSize(30);
        if (!(ready.left && ready.right)) {
            // Hvis begge spillere ikke er klar endnu, kan spillet ikke startes endnu
            // Instrukser skrives til hvordan man erklærer sig klar til at spille
            image(ready.left?img_ready:img_unready, pLeft.x-50, 125);
            image(ready.right?img_ready:img_unready, pRight.x+50, 125);
            text('Waiting for all players ready up', width/2, 75);
            text('Ready up by pressing your phone screen', width/2, 225);
            textSize(16);
            text('left player:', pLeft.x-25, 110);
            text('right player:', pRight.x+75, 110);
            // Instruktioner til, hvordan man styrer spillerne tegnes også
            text('To punch in game, jab/punch forward hard', width/2, 370);
            text('To block in game, jab/punch up hard', width/2, 400);
            text('Once the game has started, press your phone screen to crouch', width/2, 430);    
            // Return da spillet ikke skal tegnes når det ikke kører
            return;
        }
        if (!gameRunning){
            // Hvis spillet kan startes, men ikke er startet endnu, startes det
            socket.emit('gamestarted', {});
            gameRunning = true;
        }
    }

    noStroke();
    // Background for right player health bar
    rect(width-20-10*30, 20, 10*30, 40);
    //Background for left player health bar
    rect(20, 20, 10*30, 40);

    //Left player health bar
    let hBarLeft = map(pLeft.lives,20,0,255,10);
    fill(255-hBarLeft, hBarLeft, 0);
    rect(20, 20, pLeft.lives*15, 40);

    // Right player health bar
    let hBarRight = map(pRight.lives,20,0,255,10);
    fill(255-hBarRight,hBarRight,0);
    rect(width-20-pRight.lives*15, 20, pRight.lives*15, 40);

    // Tegn data fra højre spiller, så man kan se, om der modtages data
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
    // Tegn data fra venstre spiller, så man kan se, om der modtages data
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

    // Tegn båden
    noFill();
    image(raft, width/2-raft.width/2, 228, raft.width, raft.height/2);

    // Tegn spillerne
    pLeft.show();
    pRight.show();
    noTint();
}

// Callback, når "ready"-beskeden modtages
function readyPlayer(data) {
    // Notér at spilleren fra den pågældende side har tilkendegivet sig som klar
    ready[data.side] = true;
    console.log(data.side + ' is ready');
}

// Callback, når "join"-beskeden modtages
function joinPlayer(data) {
    // Notér at spilleren fra den pågældende side har tilsluttet sig spillet
    joined[data.side] = true;
    console.log(data.side + ' joined');
}

// Callback, når 'action'-beskeden modtages
function playerAction(data){
    // Tjek af hvilken side, "actionen" kommer fra
    let player = data.side == 'left' ? pLeft : pRight;

    // Spilleren fra den pågældende side modtager så denne "action" 
    player.action(data.action);
}

// Denne funktion kaldes fra `Player.action` når en "punch"-action gennemføres
function doPunch(side, stance) {
    // Objekt for den spiller, som har udført angrebet
    let player;
    // Objekt for den spiller, der udsættes for angrebet
    let otherPlayer;
    // Ændring af `playersDisplacement`, hvis angrebet går igennem
    let dispDelta;
    // Sæt variablerne alt efter, hvilken side angrebet udføres fra
    if (side == 'left'){
        player = pLeft;
        otherPlayer = pRight;
        dispDelta = 1;
    } else {
        player = pRight;
        otherPlayer = pLeft;
        dispDelta = -1;
    }
    // Døde spillere kan ikke skubbes eller skades
    if (otherPlayer.state == 'dead') {
        return;
    }

    // Deles op alt efter om angrebet udførtes siddende eller stående
    if (stance == 'high') {
        // Herefter tjekker vi den angrebede spillers stadie
        switch (otherPlayer.state) {
            case 'blocking':
            // Slaget blokeres og angriberen bliver 'stunned'
            playersDisplacement -= dispDelta;
            player.changeState('stunned');
            break;
            case 'crouched':
            case 'low_blocking':
            // Den angrebede slås i hovedet og tager ekstra skade
            otherPlayer.lives -= 2;
            otherPlayer.changeState('low_damaged');
            break;
            case 'low_punching':
            // Den angrebede slåes i hovedet og bliver 'stunned' og tager lidt skade
            otherPlayer.lives -= 1;
            otherPlayer.changeState('low_stunned');
            break;
            default:
            // Angrebet går igennem almindeligt og giver én skade og skubber
            otherPlayer.lives -= 1;
            playersDisplacement += 2*dispDelta;
            otherPlayer.changeState(otherPlayer.isLow() ? 'low_damaged' : 'damaged');
            break;
        }
    } else if (stance == 'low') {
        // Herefter tjekker vi den angrebede spillers stadie
        switch (otherPlayer.state) {
            case 'blocking':
                // Hvis et lavt slagt forsøges blokeret oppefra, gives ekstra skade samt et lille skub
                playersDisplacement += dispDelta;
                otherPlayer.lives -= 2;
                otherPlayer.changeState('damaged');
                break;
            case 'low_blocking':
                // Slaget blokeres, og angriberen bliver 'stunned'
                player.changeState('low_stunned');
                break;
            default:
                // Går slaget igennem ublokeret uddeles skade alt efter om den angrebede også sidder ned eller ej
                const low = otherPlayer.isLow();
                otherPlayer.lives -= low ? 1 : 2;
                otherPlayer.changeState(low ? 'low_damaged' : 'damaged');
            break;
        }
    }

    // En variabel til at tjekke om en spiller er død denne tur
    let deadPlayer = null;
    if (otherPlayer.lives <= 0) {
        // Hvis en spillers livspoint når 0 eller under, erklæres den død
        otherPlayer.lives = 0;
        deadPlayer = otherPlayer;
    } else if (playersDisplacement >= movesToRingOut) {
        // Hvis spillerene når over højre kant, erklæres højre spiller død
        deadPlayer = pRight;
    } else if (playersDisplacement <= -movesToRingOut) {
        // Hvis spillerene når over venstre kant, erklæres venstre spiller død
        deadPlayer = pLeft;
    }

    // Hvis en spiller er død
    if (deadPlayer) {
        // Sættes en timeout, så spillet genstartes efter 5 sekunder
        setTimeout(resetGameState, 5000);
        // Spil KO-lydeffekten
        sound_KO.play();
        // Sæt den døde spillers stadie til 'dead'
        deadPlayer.changeState('dead');
    }
}

let wekinatorRecordEnabled = false;

// Developer controls til at optage eksempeldata og kontrollerer spillerne med keyboardet
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