let side;
let socket = null;
let canvasWidth = window.innerWidth-window.innerWidth*1/20;
let canvasHeight = window.innerHeight-window.innerHeight*1/20;

let buttonWidth = 500;
let buttonHeight = 400;
let buttonX;
let buttonY;

let isReady = false;

function socketInit() {
    delete socketInit;
    socket = io.connect(window.location.origin);
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
}

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    frameRate(40);
    buttonX = canvasWidth/2-buttonWidth/2;
    buttonY = canvasHeight/5;
}

function draw() {
    if (!side) {
        background('grey');
    } else if (side == "right") {
        background('blue');
    } else if (side == "left"){
        background('red');
    }
    if (!isReady){
        fill("red");
    } else if (isReady) {
        fill("green");
    }
    rect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    fill("black");
    text("Ready Up", buttonX+buttonWidth/2-40, buttonY+buttonHeight/2);
    

    text('Interval ' + interval + 'ms', 2, 14);
    if (unsupporteds.length > 0) {
        textSize(12);
        text('Unsupported features: ' + unsupporteds, 120, 14);
    }

    textSize(25);
    if (!socket) {
        text('Click to join', canvasWidth/2-50, 100); 
    } else {
        text(side, canvasWidth/2-20, 100);

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

function mouseReleased() {
    if (!socket){
        socketInit();
    }
    //ready button
    if (                            
        mouseX > buttonX &&
        mouseX < buttonX+buttonWidth &&
        mouseY > buttonY &&
        mouseY < buttonY+buttonHeight
      ) {
          isReady = true;
        socket.emit('ready', {side});
      }
}