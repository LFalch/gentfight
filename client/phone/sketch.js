let side;
let socket = null;

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
    createCanvas(800, 450);
}

function draw() {
    background('white');
    fill('black');
    
    if (unsupporteds.length > 0) {
        textSize(12);
        text('Unsupported features: ' + unsupporteds, 2, 14);
    }
    textSize(25);
    if (!socket) {
        text('Click to join', 10, 34); 
    } else {
        text(side, 10, 30);

        const downDir = accelerationWithGrav.sub(acceleration).normalise();
        const downMotion = acceleration.dot(downDir ? downDir : new Vector(0, 0, 0));
        const sidewaysMotion = Math.sqrt(acceleration.lengthSq() - downMotion*downMotion);

        if (downMotion && sidewaysMotion) {
            text('down: ' + Math.round(downMotion*10)/10, 10, 55);
            text('side: ' + Math.round(sidewaysMotion*10)/10, 10, 80);

            const packet = {
                downMotion,
                sidewaysMotion
            };
            socket.emit('motion', packet);
        }
    }
}

function mouseReleased() {
    socketInit()
}