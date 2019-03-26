let side;

function setup() {
    socket = io.connect('http://localhost:3000');
    socket.on('assign', function(data) {
        console.log('Got a side', data);
        side = data.side;
    });
    createCanvas(800, 450);
    textSize(25);
}

function draw() {
    background('white');
    fill('black');
    text(side, 10, 30);
}
