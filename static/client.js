$(function () {

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ////Player connection\\\\

    var $InscriptionForm = $('#inscription');
    var $PseudoBox = $('#pseudo');
    var $player_list = $('#player-list');
    var socket = io();
    var player_name = null;
    $InscriptionForm.submit(function (e) {
        e.preventDefault();

        socket.emit('new inscription', new Player($PseudoBox.val(), 'blue', 0, 0));
        player_name = $PseudoBox.val();
        $InscriptionForm.hide();
    });

    socket.on('send player_array', (players) => {
        players.forEach((player) => {
            $player_list.append("<p class=\""+ player.name + "\">" + player.name + "</p>");
            ctx.fillRect(player.x,player.y,player.height,player.width);
        })
    });

    socket.on('new player', (player) => {
        $player_list.append("<p class=\""+ player.name + "\">" + player.name + "</p>");
        ctx.fillRect(player.x,player.y,player.height,player.width);
    });

    socket.on('player disconnect', (player, x, y) =>{
        $('.'+player+'').remove();
        ctx.clearRect(x, y, 100, 100)
    })


});
