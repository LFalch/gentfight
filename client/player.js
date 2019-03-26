function imageFlip(img, x, y, w, h, sx, sy, sw, sh) {
    push();
    scale(-1, 1);
    image(img, -x, y, -(w || img.width), h, sx, sy, sw, sh);
    pop();
}

function Player(side, name){
    if (side == 'left') {
        this.show = () => {
            image(this.img, 200, 100);
        };
    } else {
        this.show = () => {
            imageFlip(this.img, 600, 100);
        };
    }

    this.lives = 10;
    this.name = name;
    this.img = loadImage('assets/character_template/idle_temp.png');
}