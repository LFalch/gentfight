function Player(side, name){
    this.y = 100;

    if (side == 'left') {
        this.x = 200;
    } else {
        this.x = 1400;
    }

    this.lives = 10;
    this.name = name;
    this.img = loadImage('assets/character_template/stuff.png'),
    this.show =  () => {
        image(this.img, this.x, this.y);
    ;}
}