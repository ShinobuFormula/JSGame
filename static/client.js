$(function () {

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ////Player connection\\\\

    var $InscriptionForm = $('#inscription');
    var $PseudoBox = $('#pseudo');
    var $player_list = $('#player-list');
    var $readyButton = $('#ready');

    var socket = io();
    var player_name = null;
    var gameStarted = false;

    $readyButton.hide();

    $InscriptionForm.submit(function (e) {
        e.preventDefault();

        socket.emit('new inscription', new Player($PseudoBox.val(), 'blue', 0, 0));
        player_name = $PseudoBox.val();
        $InscriptionForm.hide();
        $readyButton.show()
    });

    $readyButton.click(function () {
        socket.emit('player ready', player_name);
        $('.'+player_name+'').css("color", "red");
        this.remove();
    });

    socket.on('send player_array', (players, gameStarted) => {
        players.forEach((player) => {
            $player_list.append("<p class=\""+ player.name + "\">" + player.name + "</p>");
            ctx.fillRect(player.x,player.y,player.height,player.width);
        });
        if(gameStarted){
            $InscriptionForm.hide();
        }
    });

    socket.on('new player', (player) => {
        $player_list.append("<p class=\""+ player.name + "\">" + player.name + "</p>");
        ctx.fillRect(player.x,player.y,player.height,player.width);
    });

    socket.on("send ready player", (player) => {
        if(player !== player_name){
            $('.'+player+'').css("color", "blue");
        }
    });

    socket.on("game start", () => {
        $InscriptionForm.hide();

        ctx.font = "100px Arial";
        ctx.fillStyle = "green";
        ctx.fillText("Gooooo !", 450, canvas.height/2);
        setTimeout(clearGameText, 5000);

        gameStarted = true;
    });

    socket.on('player disconnect', (player, x, y) =>{
        $('.'+player+'').remove();
        ctx.clearRect(x, y, 100, 100)
    });

    function clearGameText(){
        ctx.clearRect(450, (canvas.height/2)-100 , 500, 120)
    }
});
