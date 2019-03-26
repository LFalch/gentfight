function Player(side, name, character){
    let x, y = 100;

    if (side == 'left') {
        x = 200;
    } else {
        x = 1400;
    }

    return {
        x: x,
        y: y,
        img: loadImage('assets/character' + side + '.png'),
        show: () => {
            image(this.img, x, y);
        }
    };
}