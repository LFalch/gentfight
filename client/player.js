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

function AnimationSpritesheet(img, columns, animationTime) {
    this.resetImg = (img, columns, animationTime) => {
        this.img = img;
        this.i = 0;
        this.j = 0;
        this.step = animationTime / columns || 15;
        this.columns = columns || 1;

        this.tileWidth = this.img.width / this.columns;
        this.tileHeight = this.img.height;
        this.onAnimOver = () => {};
    };
    this.resetImg(img, columns, animationTime);
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
let dispUnit;
function displacementUnit() {
    if (!dispUnit) {
        dispUnit = raft.width / (movesToRingOut * 2 + 2);
    }
    return dispUnit || 10;
}

function Player(side, name){
    this.side = side;
    this.state = 'idle';
    this.y = 100;
    this.lives = 20;
    this.resetState = () => {
        this.state = 'idle';
        this.anim.resetImg(this.img_idle, 1, 30);
    }
    if (side == 'left') {
        this.x = 352 - 36;
        this.show = () => {
            tint('red');
            let x_override;
            if (this.state == 'dead'){
                x_override = this.x - 96;
            } else {
                x_override = this.x + playersDisplacement * displacementUnit();
            }
            this.anim.draw(x_override, this.y);
        };
    } else {
        this.x = 352 + 36;
        this.show = () => {
            tint('blue');
            imageFlip();
            let x_override;
            if (this.state == 'dead'){
                x_override = this.x + 96;
            } else {
                x_override = this.x + playersDisplacement * displacementUnit();
            }
            this.anim.draw(x_override, this.y);
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
            this.anim.resetImg(this.img_punching, 4, 36);
            this.anim.onAnimationOver(() => {
                this.resetState();
                doPunch(this.side);
            });
            break;
            case 'damaged':
            if (this.state == 'blocking') {
                return
            }
            this.anim.resetImg(this.img_damaged, 3, 30);
            this.anim.onAnimationOver(() => {
                this.resetState();
            });
            break;
            case 'stunned':
            this.anim.resetImg(this.img_stunned, 3, 45);
            this.anim.onAnimationOver(() => {
                this.resetState();
            });
            break;
            case 'blocking':
            if (this.state != 'idle') {
                return
            }
            this.anim.resetImg(this.img_blocking, 3, 39);
            this.anim.onAnimationOver(this.resetState);
            break;
            case 'dead':
            if (this.state != 'dead') {
                this.anim.resetImg(this.img_dying, 3, 60);
                this.anim.onAnimationOver(() => {
                    this.anim.resetImg(this.img_dead, 1, 100);
                });
            }
            break;
        }
        this.state = state;
    }
    this.name = name;
    this.img_blocking = loadImage('assets/character_template/block_temp.png');
    this.img_punching = loadImage('assets/character_template/punch_temp.png');
    this.img_stunned = loadImage('assets/character_template/stunned.png');
    this.img_damaged = loadImage('assets/character_template/damage.png');
    this.img_dying = loadImage('assets/character_template/death.png');
    this.img_dead = loadImage('assets/character_template/dead.png');
    this.anim = {
        draw: () => {
            console.log('still loading');
        }
    };
    this.img_idle = loadImage('assets/character_template/idle_temp.png', (img) => {
        this.anim = new AnimationSpritesheet(img, 1, 1, 30);
    });
}