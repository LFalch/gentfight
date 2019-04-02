let side;
let socket = null;
let buttonStartY = window.innerHeight/2;
let canvasWidth = window.innerWidth-window.innerWidth*1/20;
let canvasHeight = window.innerHeight-window.innerHeight*1/20;

let sidesData = [];
let downData = [];

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
    punchButtonX = 0;
    blockButtonX = canvasWidth/2;
    buttonWidth = canvasWidth/2;
    buttonHeight = canvasHeight-buttonStartY;
}

function draw() {
    background('grey');
    //Punch button
    fill('red');
    rect(punchButtonX,buttonStartY,buttonWidth,buttonHeight); 
    //Block Button
    fill('green');
    rect(blockButtonX,buttonStartY,buttonWidth,buttonHeight);
    fill('black');
    textSize(32);
    text('Punch',punchButtonX+200,buttonStartY+canvasHeight/4);
    text('Block',blockButtonX+200,buttonStartY+canvasHeight/4);
    fill('white');
    
    rect(0,canvasHeight/6,canvasWidth/2,canvasHeight/3);                //box for sideData
    rect(0+canvasWidth/2,canvasHeight/6,canvasWidth/2,canvasHeight/3);    //box for downData

    if (unsupporteds.length > 0) {
        textSize(12);
        text('Unsupported features: ' + unsupporteds, 2, 14);
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
            text('down: ' + Math.round(downMotion*10)/10, 10, 55);
            text('side: ' + Math.round(sidewaysMotion*10)/10, 10, 80);

            text('sidesdata: ' + sidesData.length, 20, 100);
            text('downData: ' + downData.length, 20, 200);
            sidesData.push(sidewaysMotion);
            downData.push(downMotion);
            if (sidesData.length >= 16) {
                sidesData.shift();
            }
            if (downData.length >= 16) {
                downData.shift();
            }
            for (let i = 0; i < 15; i++){
                let sidesX_1 = map(i, 0, 14, 0, canvasWidth/2);
                let sidesX_2 = map(i+1, 0, 14, 0, canvasWidth/2);
                let sidesY_1 = map(sidesData[i], -5, 5,canvasHeight/6, canvasHeight/3);
                let sidesY_2 = map(sidesData[i+1], -5, 5,canvasHeight/6, canvasHeight/3);
                line(sidesX_1,sidesY_1,sidesX_2,sidesY_2);

                let downX_1 = map(i, 0, 14, canvasWidth/2, canvasWidth);
                let downX_2 = map(i+1, 0, 14, canvasWidth/2, canvasWidth);
                let downY_1 = map(downData[i], -5, 5, canvasHeight/6, canvasHeight/3);
                let downY_2 = map(downData[i+1], -5, 5, canvasHeight/6, canvasHeight/3);
                line(downX_1,downY_1,downX_2,downY_2);

            }

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
    if (                            //punch button
        mouseX > punchButtonX &&
        mouseX < punchButtonX+buttonWidth &&
        mouseY > buttonStartY &&
        mouseY < buttonStartY+buttonHeight
      ) {
        const data = {
            side: side,
            action: 'punch',
        }
        socket.emit('action', data);
      } else if (                            //Block button
        mouseX > blockButtonX &&
        mouseX < blockButtonX+buttonWidth &&
        mouseY > buttonStartY &&
        mouseY < buttonStartY+buttonHeight
      ) {
        const data = {
            side: side,
            action: 'block',
        }
        socket.emit('action', data);
      }
}