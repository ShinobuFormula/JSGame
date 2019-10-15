const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);


var players = [];
var socketId = [];
var gameStarted = false;
var colision = false;
var colisionBullet = false;
var playerSpeed = 20;
var pushPower = 20;
var numberOfPlayerReady = 0;
var colorIncrement = 0;

app.use(express.static('static'));

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

io.on('connection', (socket) => {
    console.log("Connection ");

    socket.emit('send player_array', players, gameStarted);

    socket.on('new inscription', (player) => {
        console.log(player.name + " has entered the game");
        pickColor(player);
        if(players.length > 0){ player.x = player.x + (players.length * 200); }
        socketId.push([socket.id, player.name]);
        players.push(player);
        io.sockets.emit('new player', player);
    });

    socket.on('player ready', (player_name) => {
        numberOfPlayerReady++;

        players.forEach((player) =>{
            if(player.name === player_name){
                io.sockets.emit("send ready player", player);
            }
        });
        if(numberOfPlayerReady >= players.length*75/100){
            io.sockets.emit("game start");
            gameStarted = true;
        }
    });

    socket.on('player move', (player_name, direction) => {
            players.forEach((player) => {
                if(player.name === player_name && player.alive){
                    checkCollision(player, direction);
                    if(!colision){
                        io.sockets.emit("player clear", player);
                        move(player, direction, playerSpeed);
                        io.sockets.emit("player has moved", player);
                        checkDeath(player);
                    }
                }
            })
    });

    socket.on("player shoot", (direction, bullet) => {
        players.forEach((player) => {
            if(player.name === bullet.player && player.alive){
                bullet.color = player.color;
                bullet.direction = direction;
                bullet.x = player.x+(player.height/2);
                bullet.y = player.y+(player.width/2);
                bullet.shooted = true;
                checkBulletCollision(bullet).then(()=> {
                    console.log("Touché");
                });
            }
        })
    });

    socket.on('disconnect', function () {
        socketId.forEach((elem)=> {
            if(socket.id === elem[0]){
                players.forEach((player, index) =>{
                    if(player.name === elem[1]){
                        io.sockets.emit("player disconnect", player);
                        players.splice(index,1);
                        colorIncrement--;
                    }
                })
            }
        })
    });
});

function move(player, direction, speed){
    player.previousX = player.x;
    player.previousY = player.y;
    switch(direction){
        case "RIGHT": player.x += speed;
            break;
        case "LEFT": player.x += -speed;
            break;
        case "UP": player.y += -speed;
            break;
        case "DOWN": player.y += speed;
            break;
    }
}

function pickColor(player) {
    switch (colorIncrement) {
        case 0: player.color = "#A0522D";
            break;
        case 1: player.color = "#008B8B";
            break;
        case 2: player.color = "#DC143C";
            break;
        case 3: player.color = "#7FFF00";
            break;
        case 4: player.color = "#A52A2A";
            break;
        case 5: player.color = "#FF8C00";
            break;
        case 6: player.color = "#8B008B";
            break;
        case 7: player.color = "#483D8B";
            break;
        case 8: player.color = "#228B22";
            break;
        case 9: player.color = "#20B2AA";
            break;
        case 10: player.color = "#00FA9A";
            break;
        case 11: player.color = "#DA70D6";
            break;
        case 12: player.color = "#2E8B57";
            break;
        case 13: player.color = "#FF6347";
            break;
    }
    colorIncrement++;
}

function checkDeath(player) {
    if(player.x + player.width >= 1270 || player.x <= 0 || player.y <=0 || player.y >= 600){
            die(player);
    }
}

async function checkBulletCollision(bullet) {
    return new Promise(resolve => {
        while (!colisionBullet) {
            players.forEach((elem) => {
                if ((bullet.y >= elem.y) && (bullet.y <= elem.y + elem.height) && (bullet.player !== elem.name) && (bullet.x + bullet.width >= elem.x) && (bullet.x + bullet.width <= elem.x + elem.width)) {
                    colisionBullet = true;
                } else if ((bullet.y + bullet.height >= elem.y) && (bullet.y + bullet.height <= elem.y + elem.height) && (bullet.player !== elem.name) && (bullet.x + bullet.width >= elem.x) && (bullet.x + bullet.width <= elem.x + elem.width)) {
                    colisionBullet = true;
                } else if ((bullet.y >= elem.y) && (bullet.y <= elem.y + elem.height) && (bullet.player !== elem.name) && (bullet.x >= elem.x) && (bullet.x <= elem.x + elem.width)) {
                    colisionBullet = true;
                } else if ((bullet.y + bullet.height >= elem.y) && (bullet.y + bullet.height <= elem.y + elem.height) && (bullet.player !== elem.name) && (bullet.x >= elem.x) && (bullet.x <= elem.x + elem.width)) {
                    colisionBullet = true;
                }
            });
            if (bullet.x + bullet.width >= 1270 || bullet.x <= 0 || bullet.y <= 0 || bullet.y >= 600) {
                colisionBullet = true;
            }

            move(bullet, bullet.direction, bullet.speed);

            io.sockets.emit("player shooted", bullet);
        }
        resolve(bullet);
    })
}

function checkWin() {
    if(players.length === 1){
        gameStarted = false;

        socketId.forEach((elem)=> {
            if (elem[1] === players[0].name) {
                io.to(elem[0]).emit("you won");
            }
        });
        io.sockets.emit("partyIsOver");
    }
    initGame()
}

function initGame() {
    gameStarted = false;
    players = [];
    socketId = [];
    numberOfPlayerReady = 0;
    colorIncrement = 0;
}

function die(player) {
    socketId.forEach((elem)=> {
        if (elem[1] === player.name) {
            io.to(elem[0]).emit("you died");
        }
    });
    io.sockets.emit("player died", player);

    player.y = null;
    player.x = null;
    player.alive = false;

    players.forEach((elem, index) =>{
        if(player.name === elem.name){
            players.splice(index,1);
        }
    });

    checkWin();
}

function checkCollision(player, direction){

    players.forEach((elem) => {
        if((player.y >= elem.y) && (player.y <= elem.y + elem.height) && (player.name !== elem.name) && (player.x + player.width >= elem.x) && (player.x + player.width <= elem.x + elem.width)) {
            if((player.x + player.width === elem.x && player.y === elem.y+elem.height) && (direction === "RIGHT" || direction === "UP") ){
                colision = false;
            }
            else if(player.y === elem.y+elem.height && direction === "UP"){
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
            else if(player.x + player.width === elem.x && direction === "RIGHT"){
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
        }
        else if((player.y + player.height >= elem.y) && (player.y + player.height <= elem.y + elem.height) && (player.name !== elem.name) && (player.x + player.width >= elem.x) && (player.x + player.width <= elem.x + elem.width)) {
            if((player.y + player.height === elem.y && player.x + player.width === elem.x) && (direction === "RIGHT" || direction === "DOWN") ){
                colision = false;
            }
            else if(player.y + player.height === elem.y && direction === "DOWN"){
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
            else if(player.x + player.width === elem.x && direction === "RIGHT"){
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
        }
        else if((player.y >= elem.y) && (player.y <= elem.y + elem.height) && (player.name !== elem.name) && (player.x >= elem.x) && (player.x <= elem.x + elem.width)) {
            if((player.y === elem.y + elem.height && player.x === elem.x + elem.width) && (direction === "UP" || direction === "LEFT") ){
                colision = false;
            }
            else if(player.y === elem.y + elem.height && direction === "UP"){
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
            else if(player.x === elem.x + elem.width && direction === "LEFT"){
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
        }
        else if((player.y + player.height >= elem.y) && (player.y + player.height  <= elem.y + elem.height) && (player.name !== elem.name) && (player.x >= elem.x) && (player.x <= elem.x + elem.width)) {
            if((player.y + player.height === elem.y && player.x === elem.x + elem.width) && (direction === "DOWN" || direction === "LEFT") ){
                colision = false;
            }
            else if(player.y + player.height === elem.y && direction === "DOWN"){
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
            else if(player.x === elem.x + elem.width && direction === "LEFT"){
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
        }
        else{
            colision = false;
        }
    })
}

http.listen(3000, () => {
    console.log("Listening port 3000")
});