class Player{
    constructor(name, x, y){
        this.name = name;
        this.color = "black";

        this.x = x;
        this.y = y;

        this.previousX = this.x;
        this.previousY = this.y;

        this.height = 100;
        this.width = 100;

        this.alive = true;

        this.bullet = true;

        this.isShooting = false;
    }
}

class Bullet{
    constructor(player){
        this.player = player;
        this.playerHit = null;
        this.color = "black";

        this.direction = null;

        this.speed = 5;

        this.x = null;
        this.y = null;

        this.previousX = this.x;
        this.previousY = this.y;

        this.height = 30;
        this.width = 30;
    }
}



