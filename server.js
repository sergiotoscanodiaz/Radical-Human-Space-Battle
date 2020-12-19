let express = require('express');
let app = express();//referencia a lo de arriba
var path = require('path');
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let port = process.env.PORT || 3000;

//we will store the player data in memory on the server
var  players = {};

var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50
};
var scores = {
  blue: 0,
  red: 0
};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


//SERVER: Listener for every new CLIENT connections
io.on('connection', function (socket) {
  
  console.log('a user connected:' + socket.id);

  //creata a new PLAYER OBJECT with the KEY (socket.id)
  players[socket.id] = {  
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    score:0,
    active: false, 
    texture: ""
  };
  //Send to everybody including me
  socket.emit('currentPlayers', players);

  socket.broadcast.emit('newPlayer', players[socket.id]);

  //LISTENERS FOR Each CLIENT 
  socket.on('playerStartLevel1',function(data){
    players[socket.id].active = true;  
    players[socket.id].texture = data;  
    io.emit('currentPlayers', players);
    io.emit('currentPlayersLevel1', players);
    io.emit('starLocation', star);
    socket.emit('scoreUpdate', scores);
  });

  //DISCONNECT
  socket.on('disconnect', function () {
    console.log('user disconnected:' + socket.id);
    delete players[socket.id];
    io.emit('disconnect', socket.id);

  });


socket.on('playerMovement', function (movementData) {
  players[socket.id].x = movementData.x;
  players[socket.id].y = movementData.y;
  players[socket.id].rotation = movementData.rotation;
  socket.broadcast.emit('playerMoved', players[socket.id]);
});


socket.on('starCollected', function () {
  players[socket.id].score ++
  star.x = Math.floor(Math.random() * 700) + 50;
  star.y = Math.floor(Math.random() * 500) + 50;
  io.emit('starLocation', star);
  io.emit('scoreUpdate', players);
});


});

var server_port = 5051;
var server_host = process.env.YOUR_HOST || '0.0.0.0';
server.listen(server_port, server_host, function() {
    console.log('Listening on port %d', server_port);
});

