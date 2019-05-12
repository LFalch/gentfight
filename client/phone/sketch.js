// Hvilken side, spilleren, denne sketch styerer, hører til
let side;
// web socket til node-serveren
let socket = null;
const canvasWidth = window.innerWidth*0.90;
const canvasHeight = window.innerHeight*0.90;

let gameRunning = false; 

let isReady = false;

function socketInit() {
    // slet funktionen, så den ikke køres flere gange.
    delete socketInit;
    // web-socketen har samme addresse som den side, man er på
    // så vi tilslutter også den addressse
    socket = io.connect(window.location.origin);
    // Opsætning af beskeder, sketchen skal lytte efter
    socket.on('unready', unready);
    socket.on('gamestarted', gamestarted);
    socket.on('assign', function(data) {
        console.log('Got a side', data);
        side = data.side;
    });
}

// Hvor hurtigt telefonen roterer i forskellige retninger
let rotationRate = {
    alpha: 0,
    beta: 0,
    gamma: 0,
};
// Acceleration af hele telefonen
let acceleration = new Vector(0, 0, 0);
// Acceleration med tyngdekraft
let accelerationWithGrav = new Vector(0, 0, 0);
// Tid i ms mellem hver opdatering af ovenstående data
let interval = 0;

let img_ready, img_unready, cx, cy;

// Funktion til at tjekke efter en feature og tilføje et listener-callback, hvis den findes
function checkFeature(feature, cb) {
    if (!('on' + feature in window)) {
        // Findes den ikke, skriver vi kun en besked lige nu
        console.log(feature + ' missing!');
    } else {
        window.addEventListener(feature, cb);
    }
}

function preload() {
    // Tilføj listener for "devicemotion"-featuren, hvis den findes
    checkFeature('devicemotion', (event) => {
        rotationRate = event.rotationRate;
        acceleration = new Vector(event.acceleration);
        accelerationWithGrav = new Vector(event.accelerationIncludingGravity);
        interval = event.interval;
    });
    img_ready = loadImage('../assets/UI/ready.png');
    img_unready = loadImage('../assets/UI/unready.png');
}

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    // Sæt frameraten ned for at homogenisere data
    // Nogle browsere på telefoner (særlig Android) sender devicemotion-data med langsommere interval
    frameRate(40);
    cx = canvasWidth/2;
    cy = canvasHeight/5+200;
}

function draw() {
    // Tegn baggrunden samme farve, som den spiller, man styrer
    if (!side) {
        background('grey');
    } else if (side == 'right') {
        background('blue');
    } else if (side == 'left'){
        background('red');
    }
    textSize(18);
    textAlign(LEFT);
    // Skriv interval til debugging. Nogle lave intervaller giver dårlig respons
    text('Interval ' + interval + 'ms', 2, 20);
    
    textSize(30);
    textAlign(CENTER);
    fill('black');
    // Tjek først om vi er tilsuttet serveren
    if (socket){
        if (!gameRunning){
            // Når spillet ikke kører endnu, fungerer skærmen som "ready"-knap
            // Ens nuværende "ready"-status skrives på skærmen og markeres med enten flueben eller rødt kryds
            text(isReady?'You are ready':'Press to ready up', cx, cy);
            rect(cx-img_ready.width*2/2,cy+50, 120,120);
            image(isReady?img_ready:img_unready, cx-img_ready.width*2/2, cy+50, img_ready.width*2, img_ready.height*2);
        } else {
            // Når spillet er i gang, er skærmen en crouch-toggle knap
            text('Click to crouch/stand up', cx, cy);
        }
        // Skriv hvilken side på hovedskærmen, ens spiller er
        text('You are: ' + side, cx, canvasHeight / 5);

        // Hér skal vi udregne hvor meget telefonen har acceleret hhv. opad og til siden

        // Først udregner vi en retningsvektor, der går direkte ned ved at trække acceleration fra acceleration med tyngdekraft
        // Det håber vi nemlig giver en tyngdekraftsvektor, som vil gå lige nedad. Herefter normaliseres den, hvilket betyder at længden gøres én.
        const downDir = accelerationWithGrav.sub(acceleration).normalise();
        // Herefter beregner vi acceleration med fortegn i nedadgående retning, som skalar-produktet mellem `downDir` og acceleration.
        // Dette svarer til at finde størrelsen af `acceleration` projiceret på `downDir`, da `downDir` er en enhedsvektor
        const downMotion = acceleration.dot(downDir ? downDir : new Vector(0, 0, 0));
        // Herefter beregner vi sidegående acceleration ved brug af pythagoras, siden denne er vinkelret på den nedadgående acceleration.
        const sidewaysMotion = Math.sqrt(acceleration.lengthSq() - downMotion * downMotion);

        // Hvis der findes nogen data, sender vi den til serveren via web-socketen.
        if (downMotion && sidewaysMotion) {
            const packet = {
                downMotion,
                sidewaysMotion
            };
            socket.emit('motion', packet);
        }
    } else {
        // Hvis ikke, skriver vi instrukser til at blive tilsluttet.
        text('Click screen to join', canvasWidth/2, 200);
    }
}

// Denne køres, når et spil er afsluttet, så "ready-up"-skærmen vises igen
function unready(){
    isReady = false;
    gameRunning = false;
}
// Denne køres, når den anden spiller også er 'ready', så "crouch"-teksten vises i stedet
function gamestarted(){
    gameRunning = true;
}

function mouseReleased() {
    // Hvis, socketen, ikke er connectet endnu, køres `socketInit`
    if (!socket){
        socketInit();
    // Hvis spillet, ikke er startet endnu: send en "ready"-besked til serveren
    } else if (!gameRunning){
        socket.emit('ready', {});
        isReady = true;
    // Hvis spillet er i gang, fungerer skærmen som crouch-knap, så en 'crouch'-besked sendes
    } else {
        socket.emit('crouch', {});
    }
}
