/*
Skriv denne kommando i terminalen:
node app.js
*/
	
let socket;

var players = [];
var player_left_avatar = [];
var player_right_avatar = [];



function setup() {
	socket = io.connect('http://localhost:3000');
	background("black");
	createCanvas(400,400);
	socket.on('leftPlayer', actionPlayerLeft);
	socket.on('rightPlayer', actionPlayerRight);

}

function draw() {
    fill("red");
    ellipse(20,20,40,40);
}


function actionPlayerLeft(data){
	console.log(data);

}

function actionPlayerRight(data){
	console.log(data);

}




