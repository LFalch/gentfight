let side;
let socket;

function socketInit() {
    socket = io.connect('http://localhost:3000');
    socket.on('assign', function(data) {
        console.log('Got a side', data);
        side = data.side;
    });
}

function setup() {
    createCanvas(800, 450);
    textSize(25);
}

function draw() {
    background('white');
    fill('black');
    if (!socket) {
        text('Click to join', 10, 30); 
    } else {
        text(side, 10, 30);
    }
}

function mouseClicked() {
    socketInit()
}