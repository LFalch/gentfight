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
    this.action = (action) => {
        console.log('I am do thing now ' + action);
        const up = this.state == 'idle';
        if (up || this.state == 'crouched') {
            switch (action) {
                case 'punch':
                this.changeState(up?'punching':'low_punching');
                break;
                case 'block':
                this.changeState(up?'blocking':'low_blocking');
                break;
                case 'crouch':
                this.changeState(up?'crouched':'idle');
                break;
            }
        }
    };
    this.changeState = (state) => {
        switch (state) {
            case 'idle':
            this.resetState();
            break;
            case 'crouched':
            this.anim.resetImg(this.img_crouched, 1, 100);
            break;
            case 'punching':
            this.anim.resetImg(this.img_punching, 4, 32);
            this.anim.onAnimationOver(() => {
                this.resetState();
                doPunch(this.side, 'high');
            });
            break;
            case 'stunned':
            this.anim.resetImg(this.img_stunned, 3, 48);
            this.anim.onAnimationOver(() => {
                this.resetState();
            });
            break;
            case 'blocking':
            this.anim.resetImg(this.img_blocking, 3, 27);
            this.anim.onAnimationOver(this.resetState);
            break;
            
            case 'low_punching':
            this.anim.resetImg(this.img_low_punching, 4, 44);
            this.anim.onAnimationOver(() => {
                this.changeState('crouched');
                doPunch(this.side, 'low');
            });
            break;
            case 'low_stunned':
            this.anim.resetImg(this.img_low_stunned, 3, 60);
            this.anim.onAnimationOver(() => {
                this.changeState('crouched');
            });
            break;
            case 'low_blocking':
            if (this.state != 'idle') {
                return
            }
            this.anim.resetImg(this.img_low_blocking, 3, 39);
            this.anim.onAnimationOver(() => {
                this.changeState('crouched');
            });
            break;
            case 'damaged':
            let nextState = 'crouched';
            if (this.state.startsWith('low_') || this.state == 'crouched') {
                nextState = 'crouched;'
            }
            this.anim.resetImg(this.img_damaged, 3, 24);
            this.anim.onAnimationOver(() => {
                this.changeState(nextState);
            });
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
    this.img_blocking = loadImage('assets/character_template/block.png');
    this.img_punching = loadImage('assets/character_template/punch.png');
    this.img_stunned = loadImage('assets/character_template/stunned.png');
    this.img_low_punching = loadImage('assets/character_template/low_punch.png');
    this.img_low_blocking = loadImage('assets/character_template/low_block.png');
    this.img_low_stunned = loadImage('assets/character_template/low_stunned.png');
    this.img_damaged = loadImage('assets/character_template/damage.png');
    this.img_dying = loadImage('assets/character_template/death.png');
    this.img_dead = loadImage('assets/character_template/dead.png');
    this.img_crouched = loadImage('assets/character_template/crouched.png');
    this.anim = {
        draw: () => {
            console.log('still loading');
        }
    };
    this.img_idle = loadImage('assets/character_template/idle.png', (img) => {
        this.anim = new AnimationSpritesheet(img, 1, 1, 30);
    });
}