let side;

function setup() {
    socket = io.connect('http://localhost:3000');
    createCanvas(800, 450);
    textSize(25);
    socket.on('assign', function(data) {
        side = data.side;
    });
}

function draw() {
    background('grey');
    fill('black');
    text(side, 10, 30);
}
