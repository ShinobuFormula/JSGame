const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);


var players = [];
var socketId = [];
var gameStarted = false;
var colision = false;
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
        player.x = players.length * 120;
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
console.log("je teste");
var t = player.x;
console.log(t);
    if(player.x + player.width >= 1270 || player.x <= 0 || player.y <=0 || player.y >= 600){
            die(player);
            console.log("trigger");
    }
}

function die(player) {
    socketId.forEach((elem)=> {
        if (elem[1] === player.name) {
            io.to(elem[0]).emit("you died");
        }
    });
    io.sockets.emit("player died", player);
    player.alive = false;
}

function checkCollision(player, direction){

    players.forEach((elem) => {
        if((player.y >= elem.y) && (player.y <= elem.y + elem.height) && (player.name !== elem.name) && (player.x + player.width >= elem.x) && (player.x + player.width <= elem.x + elem.width)) {
            if(player.y === elem.y+elem.height && direction === "UP"){
                io.sockets.emit("player clear", elem);
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
            else if(player.x + player.width === elem.x && direction === "RIGHT"){
                io.sockets.emit("player clear", elem);
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
        }
        else if((player.y + player.height >= elem.y) && (player.y + player.height <= elem.y + elem.height) && (player.name !== elem.name) && (player.x + player.width >= elem.x) && (player.x + player.width <= elem.x + elem.width)) {
            if(player.y + player.height === elem.y && direction === "DOWN"){
                io.sockets.emit("player clear", elem);
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
            else if(player.x + player.width === elem.x && direction === "RIGHT"){
                io.sockets.emit("player clear", elem);
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
        }
        else if((player.y >= elem.y) && (player.y <= elem.y + elem.height) && (player.name !== elem.name) && (player.x >= elem.x) && (player.x <= elem.x + elem.width)) {
            if(player.y === elem.y + elem.height && direction === "UP"){
                io.sockets.emit("player clear", elem);
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
            else if(player.x === elem.x + elem.width && direction === "LEFT"){
                io.sockets.emit("player clear", elem);
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
        }
        else if((player.y + player.height >= elem.y) && (player.y + player.height  <= elem.y + elem.height) && (player.name !== elem.name) && (player.x >= elem.x) && (player.x <= elem.x + elem.width)) {
            if(player.y + player.height === elem.y && direction === "DOWN"){
                io.sockets.emit("player clear", elem);
                move(elem, direction, playerSpeed+pushPower);
                io.sockets.emit("player has moved", elem);
                checkDeath(elem);
                colision = true;
            }
            else if(player.x === elem.x + elem.width && direction === "LEFT"){
                io.sockets.emit("player clear", elem);
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