/*
Skriv denne kommando i terminalen:
node app.js
*/

let socket;

function setup() {
	socket = io.connect('http://localhost:3000');
	background("black");
	createCanvas(400,400);
	socket.on('leftPlayer', movePlayerLeft);
}

function draw() {
	fill("red");
	ellipse(20,20,40,40);
}


function movePlayerLeft(data){
	console.log(data.x, data.y);

}





