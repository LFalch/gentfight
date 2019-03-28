function imageFlip(img, x, y, w, h, sx, sy, sw, sh) {
    push();
    scale(-1, 1);
    image(img, -x, y, -(w || img.width), h, sx, sy, sw, sh);
    pop();
}

function Player(side, name){
    this.i = 0;
    this.state = "idle";
    this.x = 400;
    this.y = 100;
    w = 96;
    h = 192;
    this.img_total = 4;
    this.speed = 30;
    this.attackTime = 50;
    this.blockTime = 70;
    this.isBlocking = false;
    this.lives = 10;
    this.resetState = () => {
        this.state = "idle";
        this.i = 0;
        this.img = this.img_idle;
        this.img_total = 4;
        this.speed = 30;
    }
    if (side == 'left') {
        this.show = () => {
            this.x = 250;
            image(this.img, this.x, this.y, w, h, w * Math.floor(this.i++ / this.speed), 0, w, h);
            this.i %= this.speed*this.img_total;
        };
    } else {
        this.show = () => {
            this.x = 450;
            imageFlip(this.img, this.x, this.y, w, h, w * Math.floor(this.i++ / this.speed), 0, w, h);
            this.i %= this.speed*this.img_total;
        };
    }
    // if (this.state != 'idle'){
    //     if (this.i >= this.speed*this.img_total-1) {
    //         this.resetState();
    //     }
    // }
    this.changeState = () => {
        if (this.state != 'idle'){
            if (this.i >= this.speed*this.img_total-1) {
                this.resetState();
            }
            if (this.state == 'punching'){
                if (this.attackTime <= this.i) {
                    fight(side);
                }
            }
            // if (this.state == 'blocking'){}
        }
    }
    this.name = name;
    this.img_blocking = loadImage('assets/character_template/block_temp.png');
    this.img_punching = loadImage('assets/character_template/punch_temp.png');
    this.img_idle = loadImage('assets/character_template/idle_temp_2.png');
    this.img = this.img_idle;
}