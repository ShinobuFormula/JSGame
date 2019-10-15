$(function () {

    const UP = 90;
    const DOWN = 83;
    const RIGHT = 68;
    const LEFT = 81;

    const UP_ARROW = 38;
    const DOWN_ARROW = 40;
    const RIGHT_ARROW = 39;
    const LEFT_ARROW = 37;

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ////Player connection\\\\

    var $InscriptionForm = $('#inscription');
    var $PseudoBox = $('#pseudo');
    var $player_list = $('#player-list');
    var $readyButton = $('#ready');


    var socket = io();
    var player_name = null;
    var direction = null;
    var gameStarted = false;

    $readyButton.hide();

    $InscriptionForm.submit(function (e) {
        e.preventDefault();

        socket.emit('new inscription', new Player($PseudoBox.val(), 120, 100));
        player_name = $PseudoBox.val();
        $InscriptionForm.hide();
        $readyButton.show()
    });

    $readyButton.click(function () {
        socket.emit('player ready', player_name);
        $readyButton.hide();
    });

    $(document).keydown((e) => {
        console.log(e.keyCode);
        if(gameStarted) {
            if (e.keyCode === UP) {
                direction = "UP";
                socket.emit('player move', player_name, direction);
            } else if (e.keyCode === DOWN) {
                direction = "DOWN";
                socket.emit('player move', player_name, direction);
            } else if (e.keyCode === RIGHT) {
                direction = "RIGHT";
                socket.emit('player move', player_name, direction);
            } else if (e.keyCode === LEFT) {
                direction = "LEFT";
                socket.emit('player move', player_name, direction);

            } else if (e.keyCode === UP_ARROW) {
                direction = "UP";
                socket.emit('player shoot', direction, new Bullet(player_name));
            } else if (e.keyCode === DOWN_ARROW) {
                direction = "DOWN";
                socket.emit('player shoot', direction, new Bullet(player_name));
            } else if (e.keyCode === RIGHT_ARROW) {
                direction = "RIGHT";
                socket.emit('player shoot', direction, new Bullet(player_name));
            } else if (e.keyCode === LEFT_ARROW) {
                direction = "LEFT";
                socket.emit('player shoot', direction, new Bullet(player_name));
            } else {
                console.log("No valid key enter")
            }
        }
    });

    socket.on('send player_array', (players, gameStarted) => {
        console.log(players);
        players.forEach((player) => {
            $player_list.append("<p class=\""+ player.name + " playerNames\">" + player.name + "</p>");
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x,player.y,player.width,player.height);
        });
        if(gameStarted){
            $InscriptionForm.hide();
        }
    });

    socket.on('new player', (player) => {
        $player_list.append("<p class=\""+ player.name + " playerNames\">" + player.name + "</p>");
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
        ctx.clearRect(player.previousX, player.previousY, player.width, player.height);
        ctx.fillRect(player.x,player.y, player.width, player.height);
    });

    socket.on("player shooted" , (bullet) => {
        ctx.fillStyle = bullet.color;
        ctx.clearRect(bullet.previousX, bullet.previousY, bullet.width, bullet.height);
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    socket.on("you died", () => {
        ctx.font = "100px Arial";
        ctx.fillStyle = "green";
        ctx.fillText("You lost !", 450, canvas.height/2);
    });

    socket.on("player died", (player)=> {
        $('.'+player.name+'').css("text-decoration", "line-through");
        ctx.clearRect(player.x, player.y, player.x+player.width, player.y+player.height)
    });

    socket.on("you won", ()=> {
        gameStarted = false;
        ctx.font = "100px Arial";
        ctx.fillStyle = "green";
        ctx.fillText("You won !", 450, canvas.height/2);
    });

    socket.on("partyIsOver", ()=> {
       setTimeout(finishTheGame,4000);
    });

    socket.on('player disconnect', (player,) =>{
        $('.'+player.name+'').remove();
        ctx.clearRect(player.x, player.y, player.x+player.width, player.y+player.height)
    });

    function finishTheGame(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        $InscriptionForm.show();
        $readyButton.hide();
        $('.playerNames').remove();
        gameStarted = false;
    }
    function launchGame(){
        ctx.clearRect(400, (canvas.height/2)-100 , 650, 200);

        gameStarted = true;
    }
});
