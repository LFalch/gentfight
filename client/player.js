function imageFlip(img, x, y, w, h, sx, sy, sw, sh) {
    push();
    scale(-1, 1);
    image(img, -x, y, -(w || img.width), h, sx, sy, sw, sh);
    pop();
}

function Player(side, name){
    this.i = 0;
    y = 100;
    w = 96;
    h = 192;
    if (side == 'left') {
        this.show = () => {
            image(this.img, 200, 100, w, h, 96*Math.floor(this.i++ / 20), 0, w, h);
            this.i %= 20*4;
        };
    } else {
        this.show = () => {
            imageFlip(this.img, 600, 100, w, h, 96 * Math.floor(this.i++ / 20), 0, w, h);
            this.i %= 20*4;
        };
    }
    this.lives = 10;
    this.name = name;
    this.img = loadImage('assets/character_template/idle_temp_2.png');
}