/*
Skriv denne kommando i terminalen:
node app.js
*/
    
let socket;

let pLeft, pRight;


function setup() {
    pLeft, pRight = new Player('left'), new Player('right');

    socket = io.connect('http://localhost:3000');
    createCanvas(800, 450);
    socket.on('leftPlayer', actionPlayerLeft);
    socket.on('rightPlayer', actionPlayerRight);
}

function draw() {
    background('grey');
    pLeft.show();
	pRight.show();
	
}


function actionPlayerLeft(data){
    console.log(data);

}

function actionPlayerRight(data){
    console.log(data);

}




