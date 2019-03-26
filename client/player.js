function imageFlip(img, x, y, w, h, sx, sy, sw, sh) {
    push();
    scale(-1, 1);
    image(img, -x, y, -(w || img.width), h, sx, sy, sw, sh);
    pop();
}

function Player(side, name){
    this.y = 100;

    if (side == 'left') {
        this.x = 200;
        this.show = () => {
            image(this.img, this.x, this.y);
        };
    } else {
        this.x = 600;
        this.show = () => {
            imageFlip(this.img, this.x, this.y);
        };
    }

    this.lives = 10;
    this.name = name;
    this.img = loadImage('assets/character_template/idle_temp.png');
}