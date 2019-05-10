let imagesFlipped = false;
let originalImage;

// Denne funktion gør, så det næste billede, der tegnes, bliver flippet.
// Dette skaber en advarelse, da P5.js-funktioner helst ikke vil overrides, men det virker godt.
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

// Objekt til at organisere animationsspritesheets
function AnimationSpritesheet(img, columns, animationTime) {
    // Sæt animation til at køre fra et nyt spritesheet
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
    // Vi kører den for at sætte det første spritesheet op.
    this.resetImg(img, columns, animationTime);
    // Draw-funktion, hvor vi holder øje med om hvilken frame af animationen, der skal tegnes
    this.draw = (x, y, w, h) => {
        let i = Math.floor(this.i++ / this.step);
        image(this.img, x, y, w || this.tileWidth, h || this.tileHeight, i*this.tileWidth, this.j*this.tileHeight, this.tileWidth, this.tileHeight);
        this.i %= this.columns * this.step;
        if (this.i == 0) {
            this.onAnimOver();
        }
    };
    // Sæt et callback på den nuværende animation, som kaldes når animationen har nået sidste frame
    this.onAnimationOver = (callback) => {
        this.onAnimOver = callback;
    }
}
// Hjælpevariabel til understående funktion
let dispUnit;
// Returnerer antal pixels, én playerdisplacement svarer til på skærmen (jf. variablen `playersDisplacement`)
// `raft` er ikke statisk defineret, så dette kan ikke bare være i en konstant.
function displacementUnit() {
    if (!dispUnit) {
        dispUnit = raft.width / (movesToRingOut * 2 + 2);
    }
    return dispUnit || 10;
}

// Player-objektet, som holder styr på, hvad spilleren har gang i, og sørger for at tegne den rigtig
// og holde styr på dens liv
function Player(side, name){
    // Initialisér spilleren state
    this.side = side;
    this.state = 'idle';
    this.y = 100;
    this.lives = 20;

    // Funktion til at gøre spilleren 'idle' igen
    this.resetState = () => {
        this.state = 'idle';
        this.anim.resetImg(this.img_idle, 1, 30);
    }
    // Spillerene tegnes forskelligt alt efter, om den er venstre eller højre
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
    // Funktion til at gøre 
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
    this.isLow = () => {
        return this.state == 'crouched' || this.state.startsWith('low_');
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
            this.anim.resetImg(this.img_punching, 4, 36);
            this.anim.onAnimationOver(() => {
                this.resetState();
                doPunch(this.side, 'high');
            });
            break;
            case 'stunned':
            this.anim.resetImg(this.img_stunned, 3, 48);
            random(this.sounds_stunned).play();
            this.anim.onAnimationOver(() => {
                this.resetState();
            });
            break;
            case 'blocking':
            this.anim.resetImg(this.img_blocking, 3, 27);
            this.anim.onAnimationOver(this.resetState);
            break;
            
            case 'low_punching':
            this.anim.resetImg(this.img_low_punching, 4, 36);
            this.anim.onAnimationOver(() => {
                this.changeState('crouched');
                doPunch(this.side, 'low');
            });
            break;
            case 'low_stunned':
            this.anim.resetImg(this.img_low_stunned, 3, 45);
            random(this.sounds_stunned).play();
            this.anim.onAnimationOver(() => {
                this.changeState('crouched');
            });
            break;
            case 'low_blocking':
            this.anim.resetImg(this.img_low_blocking, 3, 27);
            this.anim.onAnimationOver(() => {
                this.changeState('crouched');
            });
            break;
            case 'damaged':
            this.anim.resetImg(this.img_damaged, 3, 24);
            random(this.sounds_dmg).play();
            this.anim.onAnimationOver(() => {
                this.changeState('idle');
            });
            break;
            case 'low_damaged':
            this.anim.resetImg(this.img_low_damaged, 3, 24);
            random(this.sounds_dmg).play();
            this.anim.onAnimationOver(() => {
                this.changeState('crouched');
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

    this.sounds_dmg = [];
    for (let k = 1; k <= 5; k++){
        this.sounds_dmg.push(loadSound('assets/sound/combat/damage/damage'+ k +'.mp3'));
    }
    this.sounds_stunned = [];
    for (let k = 1; k <= 4; k++){
        this.sounds_stunned.push(loadSound('assets/sound/combat/stunned/stunned'+ k +'.mp3'));
    }
    
    this.img_blocking = loadImage('assets/character_template/block.png');
    this.img_punching = loadImage('assets/character_template/punch.png');
    this.img_stunned = loadImage('assets/character_template/stunned.png');
    this.img_low_punching = loadImage('assets/character_template/low_punch.png');
    this.img_low_blocking = loadImage('assets/character_template/low_block.png');
    this.img_low_stunned = loadImage('assets/character_template/low_stunned.png');
    this.img_damaged = loadImage('assets/character_template/damage.png');
    this.img_low_damaged = loadImage('assets/character_template/low_damage.png');
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