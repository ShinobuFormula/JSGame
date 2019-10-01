$(function () {

    const UP = 122;
    const DOWN = 115;
    const RIGHT = 100;
    const LEFT = 113;

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ////Player connection\\\\

    var $InscriptionForm = $('#inscription');
    var $PseudoBox = $('#pseudo');
    var $player_list = $('#player-list');
    var $readyButton = $('#ready');

    var socket = io();
    var player_name = null;
    var player_color = null;
    var direction = null;
    var gameStarted = false;
    var tempPlayer = null;

    $readyButton.hide();

    $InscriptionForm.submit(function (e) {
        e.preventDefault();

        socket.emit('new inscription', new Player($PseudoBox.val(), 0, 0));
        player_name = $PseudoBox.val();
        $InscriptionForm.hide();
        $readyButton.show()
    });

    $readyButton.click(function () {
        socket.emit('player ready', player_name);
        this.remove();
    });

    $(document).keypress((e) => {
        if(gameStarted) {
            if (e.keyCode === UP) {
                direction = "UP";
            } else if (e.keyCode === DOWN) {
                direction = "DOWN";
            } else if (e.keyCode === RIGHT) {
                direction = "RIGHT";
            } else if (e.keyCode === LEFT) {
                direction = "LEFT"
            } else {
                console.log("No valid key enter")
            }
            socket.emit('player move', player_name, direction);
        }
    });

    socket.on('send player_array', (players, gameStarted) => {
        console.log(players);
        players.forEach((player) => {
            $player_list.append("<p class=\""+ player.name + "\">" + player.name + "</p>");
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x,player.y,player.width,player.height);
        });
        if(gameStarted){
            $InscriptionForm.hide();
        }
    });

    socket.on('new player', (player) => {
        $player_list.append("<p class=\""+ player.name + "\">" + player.name + "</p>");
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x,player.y,player.width,player.height);
    });

    socket.on("send ready player", (player) => {
            $('.'+player.name+'').css("color", player.color);
    });

    socket.on("game start", () => {
        $InscriptionForm.hide();

        ctx.font = "100px Arial";
        ctx.fillStyle = "green";
        ctx.fillText("Gooooo !", 450, canvas.height/2);
        ctx.font = "35px Arial";
        ctx.fillText("La partie démarre dans 5 secondes", 400, (canvas.height/2)+50);
        setTimeout(launchGame, 5000);
    });

    socket.on("player has moved", (player) => {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x,player.y, player.width, player.height);
    });

    socket.on("player clear", (player) => {
        ctx.clearRect(player.x,player.y, player.width, player.height);
    });

    socket.on('player disconnect', (player, x, y) =>{
        $('.'+player+'').remove();
        ctx.clearRect(x, y, 100, 100)
    });

    function launchGame(){
        ctx.clearRect(400, (canvas.height/2)-100 , 650, 200);

        gameStarted = true;
    }
});
