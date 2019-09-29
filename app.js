const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io').listen(http);

var players = [];
var socketId = [];
var gameStarted = false;
var numberOfPlayerReady = 0;
app.use(express.static('static'));

app.get('/', function (req, res) {
    res.sendFile('index.html');
});

io.on('connection', (socket) => {
    console.log("Connection ");

    socket.emit('send player_array', players, gameStarted);

    socket.on('new inscription', (player) => {
        console.log(player.name + " has entered the game");
        player.x = players.length * 120;
        socketId.push([socket.id, player.name]);
        players.push(player);
        io.sockets.emit('new player', player);
    });

    socket.on('player ready', (player_name) => {
        numberOfPlayerReady++;
        io.sockets.emit("send ready player", player_name);
        if(numberOfPlayerReady >= players.length*75/100){
            io.sockets.emit("game start");
            gameStarted = true;
        }
    });

    socket.on('disconnect', function () {
        socketId.forEach((elem)=> {
            if(socket.id === elem[0]){
                players.forEach((player, index) =>{
                    if(player.name === elem[1]){
                        io.sockets.emit("player disconnect", elem[1], player.x, player.y);
                        players.splice(index,1);
                    }
                })
            }
        })
    });
});

http.listen(3000, () => {
    console.log("Listening port 3000")
});