function imageFlip(img, x, y, w, h, sx, sy, sw, sh) {
    push();
    scale(-1, 1);
    image(img, -x, y, -(w || img.width), h, sx, sy, sw, sh);
    pop();
}

function Player(side, name){

    if (side == 'left'){
        this.x = 200;
    } else {
        this.x = 1200;
    }

    this.y = 100;
    this.sy = 0;
    this.w = 96;
    this.h = 192;
    this.sw = 96;
    this.sh = 192;
    if (side == 'left') {
        this.show = () => {
            image(this.img, this.x, this.y, this.w, this.h, 96*Math.floor(this.i++ / 20), this.sy, this.sw, this.sh);
        };
    } else {
        this.show = () => {
            imageFlip(this.img, this.x, this.y, this.w, this.h, 96*Math.floor(this.i++ / 20), this.sy, this.sw, this.sh);
        };
    }
    this.lives = 10;
    this.name = name;
    this.img = loadImage('assets/character_template/idle_temp_2.png');
}