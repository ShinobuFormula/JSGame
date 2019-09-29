class Player{
    constructor(name, color, x, y){
        this.name = name;
        this.color = color;

        this.x = x;
        this.y = y;

        this.height = 100;
        this.width = 100;
    }

    move(direction, speed){
        switch(direction) {
            case "right": this.x += speed;
                break;
            case "left": this.x += -speed;
                break;
            case "up": this.y += -speed;
                break;
            case "left": this.y += speed;
                break;
        }
    }
}
