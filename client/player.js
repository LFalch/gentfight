let imagesFlipped = false;
let originalImage;

function imageFlip() {
    if (!originalImage) {
        originalImage = image;
    }
    if (imagesFlipped) {
        image = originalImage;
    } else {
        image = function(img, x, y, w, h, sx, sy, sw, sh) {
            push();
            scale(-1, 1);
            originalImage(img, -x, y, -(w || img.width), h, sx, sy, sw, sh);
            pop();
        }
    }
    imagesFlipped = !imagesFlipped;
}

function AnimationSpritesheet(img, columns, rows, step) {
    this.resetImg = (img, columns, rows, step) => {
        this.img = img;
        this.i = 0;
        this.j = 0;
        this.step = step || 15;
        this.columns = columns || 1;
        this.rows = rows || 1;
        if (this.rows == 3) {
            console.log('Hello');
        } 

        this.tileWidth = this.img.width / this.columns;
        this.tileHeight = this.img.height / this.rows;
        this.onAnimOver = () => {};
    };
    this.resetImg(img, columns, rows, step);
    this.draw = (x, y, w, h) => {
        let i = Math.floor(this.i++ / this.step);
        image(this.img, x, y, w || this.tileWidth, h || this.tileHeight, i*this.tileWidth, this.j*this.tileHeight, this.tileWidth, this.tileHeight);

        this.i %= this.columns * this.step;
        if (this.i == 0) {
            this.onAnimOver();
        }
    };
    this.onAnimationOver = (callback) => {
        this.onAnimOver = callback;
    }
}

function Player(side, name){
    this.side = side;
    this.state = 'idle';
    this.y = 100;
    this.lives = 10;
    this.resetState = () => {
        this.state = 'idle';
        this.anim.resetImg(this.img_idle, 4, 1, 12);
        console.log('reset');
    }
    if (side == 'left') {
        this.x = 304;
        this.show = () => {
            tint('red');
            this.anim.draw(this.x, this.y);
        };
    } else {
        this.x = 400;
        this.show = () => {
            tint('blue');
            imageFlip();
            this.anim.draw(this.x, this.y);
            imageFlip();
        };
    }
    this.changeState = (state) => {
        switch (state) {
            case 'idle':
            this.resetState();
            break;
            case 'punching':
            if (this.state != 'idle') {
                return
            }
            this.anim.resetImg(this.img_punching, 4, 1, 6);
            this.anim.onAnimationOver(() => {
                doPunch(this.side);
                this.resetState();
            });
            break;
            case 'blocking':
            if (this.state != 'idle') {
                return
            }
            this.anim.resetImg(this.img_blocking, 3, 1, 15);
            this.anim.onAnimationOver(this.resetState);
            break;
        }
        this.state = state;
    }
    this.name = name;
    this.img_blocking = loadImage('assets/character_template/block_temp.png');
    this.img_punching = loadImage('assets/character_template/punch_temp.png');
    this.anim = {
        draw: () => {
            console.log('still loading');
        }
    };
    this.img_idle = loadImage('assets/character_template/idle_temp_2.png', (img) => {
        this.anim = new AnimationSpritesheet(img, 4, 1, 30);
    });
}