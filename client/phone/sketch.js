let side;
let socket;

function socketInit() {
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

let acceleration = { x: 0, y: 0, z: 0 };
let accelerationIncludingGravity = { x: 0, y: 0, z: 0 };
let rotationRate = { alpha: 0, beta: 0, gamma: 0 };
let interval = 0;

function preload() {
    if (!('ondeviceorientation' in window)) {
        unsupporteds.push('deviceorientation');
    } else {
        window.addEventListener('deviceorientation', function (event) {
            orientation.alpha = event.alpha;
            orientation.beta = event.beta;
            orientation.gamma = event.gamma;
            orientation.absolute = event.absolute;
        });
    }

    if (!('ondevicemotion' in window)) {
        unsupporteds.push('devicemotion');
    } else {
        window.addEventListener('devicemotion', function (event) {
            acceleration = event.acceleration;
            accelerationIncludingGravity = event.accelerationIncludingGravity;
            rotationRate = event.rotationRate;
            interval = event.interval;
        });
    }

    if (!('oncompassneedscalibration' in window)) {
        unsupporteds.push('compassneedscalibration');
    } else {
        window.addEventListener('compassneedscalibration', function (event) {
            alert('Compass needs calibrating! Wave your device in a figure-eight motion!');
        });
    }
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
    }
    
    textSize(16);
    text('Coordinates: (' + orientation.alpha + ', ' + orientation.beta + ', ' + orientation.gamma + ')', 5, 50);
    text('Absolute? ' + orientation.absolute, 5, 66);
    text('Acceleration: (' + acceleration.x + ', ' + acceleration.y + ', ' + acceleration.z + ') m/s²', 5, 82);
    text('Acceleration w/ grav: (' + accelerationIncludingGravity.x + ', ' + accelerationIncludingGravity.y + ', ' + accelerationIncludingGravity.z + ') m/s²', 5, 98);
    text('Rotation rate: (' + rotationRate.alpha + ', ' + rotationRate.beta + ', ' + rotationRate.gamma + ')', 5, 114);
    text('Interval: ' + interval + ' ms', 5, 130);
}

function mouseClicked() {
    socketInit()
}