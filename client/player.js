function Player(side, name){
    let x, y = 100;

    if (side == 'left') {
        x = 200;
    } else {
        x = 1400;
    }

    return {
        w: 32,
        h: 64,
        lives: 10,
        name: name,
        x: x,
        y: y,
        img: loadImage('assets/character' + side + '.png'),
        show: () => {
            image(this.img, x, y);
        }
    };
}