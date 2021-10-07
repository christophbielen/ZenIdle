//express server
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var shortid = require('shortid');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);

var socket_list = {};
var player_list = {};

var Player = function(id){
	var self = {
		id:id,
	}
	serverMsg("A new Player joined the game: "+self.id);
	return self;
};

//socket io
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = shortid.generate();
	
	socket_list[socket.id] = socket;
	
	var player = Player(socket.id);
	player_list[socket.id] = player;
	
//	serverMsg("A new player joined the game: "+socket.id);
	
	socket.on('chatMsg', function(data){
		for(var i in socket_list){
			socket_list[i].emit('addToChat', {user:socket.id, msg: data.chatMsg});
		}
	});
	
	socket.on('disconnect', function(){
		delete socket_list[socket.id];
		delete player_list[socket.id];
		serverMsg("Player "+socket.id + " left the game");
	});
});

function serverMsg(data){
	for(var i in socket_list){
		socket_list[i].emit('serverMsg', {msg:data});
	}
}