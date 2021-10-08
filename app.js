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

Player.onconnect = function(socketid){
	var player = Player(socketid);
	player_list[socketid] = player;
};

//socket io
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = shortid.generate();
	
	socket_list[socket.id] = socket;
	
	socket.on('login', function(data){console.log(data.username);
		if(data.username=="Bob"&&data.password=="Bob"){
			Player.onconnect(socket.id);
			socket.emit('loginResponse', {success:true});
		}else{
			socket.emit('loginResponse', {success:false});
		}
	});

	
	
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