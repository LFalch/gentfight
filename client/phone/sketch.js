let side;
let socket = null;
const canvasWidth = window.innerWidth*0.90;
const canvasHeight = window.innerHeight*0.90;

let gameRunning = false; 

let isReady = false;

function socketInit() {
    delete socketInit;
    socket = io.connect(window.location.origin);
    socket.on('unready', unready);
    socket.on('gamestarted', gamestarted);
    socket.on('assign', function(data) {
        console.log('Got a side', data);
        side = data.side;
    });
}

let unsupporteds = [];
let orientation = {
    alpha: 0,
    beta: 0,
    gamma: 0,
    absolute: false,
};
let rotationRate = {
    alpha: 0,
    beta: 0,
    gamma: 0,
};
let acceleration = new Vector(0, 0, 0);
let accelerationWithGrav = new Vector(0, 0, 0);
let interval = 0;
let img_ready, img_unready, cx, cy;

function checkFeature(feature, cb) {
    if (!('on' + feature in window)) {
        unsupporteds.push(feature);
    } else {
        window.addEventListener(feature, cb);
    }
}

function preload() {
    checkFeature('deviceorientation', (event) => {
        orientation.alpha = event.alpha;
        orientation.beta = event.beta;
        orientation.gamma = event.gamma;
        orientation.absolute = event.absolute;
    });
    checkFeature('devicemotion', (event) => {
        rotationRate = event.rotationRate;
        acceleration = new Vector(event.acceleration);
        accelerationWithGrav = new Vector(event.accelerationIncludingGravity);
        interval = event.interval;
    });
    checkFeature('compassneedscalibration', () => {
        alert('Please calibrate your compass: Wave your phone around like an idiot.');
    })
    img_ready = loadImage('../assets/UI/ready.png');
    img_unready = loadImage('../assets/UI/unready.png');
}

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    frameRate(40);
    cx = canvasWidth/2;
    cy = canvasHeight/5+200;
    textSize(30);
}

function draw() {
    if (!side) {
        background('grey');
    } else if (side == 'right') {
        background('blue');
    } else if (side == 'left'){
        background('red');
    }
    textSize(18);
    textAlign(LEFT);
    text('Interval ' + interval + 'ms', 2, 20);
    textSize(12);
    text('Unsupported features: ' + unsupporteds, 2, 30);

    textSize(30);
    textAlign(CENTER);
    fill('black')
    if (socket){
        if (!gameRunning){
            text(isReady?'You are Ready':'Ready up', cx, cy);
            rect(cx-img_ready.width*2/2,cy+50, 120,120);
            image(isReady?img_ready:img_unready, cx-img_ready.width*2/2, cy+50, img_ready.width*2, img_ready.height*2);
        } else {
            text('Click to crouch/stand up', cx, cy);
        }
    }

    if (!socket) {
        text('Click screen to join', canvasWidth/2, 200);
    } else {
        text('You are: ' + side, cx, canvasHeight/5);

        const downDir = accelerationWithGrav.sub(acceleration).normalise();
        const downMotion = acceleration.dot(downDir ? downDir : new Vector(0, 0, 0));
        const sidewaysMotion = Math.sqrt(acceleration.lengthSq() - downMotion*downMotion);
        
        if (downMotion && sidewaysMotion) {
            const packet = {
                downMotion,
                sidewaysMotion
            };
            socket.emit('motion', packet);
        }
    }
}

function unready(){
    isReady = false;
    gameRunning = false;
}
function gamestarted(){
    gameRunning = true;
}

function mouseReleased() {
    if (!socket){
        socketInit();
    } else if (!gameRunning){
        socket.emit('ready', {});
        isReady = true;
    } else {
        socket.emit('crouch', {});
    }
}
