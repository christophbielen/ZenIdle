//express server and database
var MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI;


const bcrypt = require("bcrypt");

const express = require('express');
const app = express();
const serv = require('http').Server(app);
const shortid = require('shortid');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 2000;
}
serv.listen(port);

// sockets and players
var socket_list = {};
var player_list = {};

var serverUpdate = false;
var serverUpdateCount = 0;
var updateCountInterval = 0;

var Player = function(socket){
	var self = {
		id:socket.id,
		name:socket.name
	}
	serverMsg("A new Player joined the game: "+self.name);
	return self;
};

Player.onconnect = function(socket){
	var player = Player(socket);
	player_list[socket.id] = player;
};

//check passwords
var isValidPassword = function(data, cb){
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("ZenIdle");

		dbo.collection("account").find({username:data.username}).toArray(function(err, res) {
			if (err) throw err;
			
			if(res[0]){
				bcrypt.compare(data.password, res[0].hash, function(err, isMatch) {
	
					if (err) {
						throw err
						} else if (!isMatch) {
						cb(false);
						} else {
						cb(true);
						}
				});
			} else{
				cb(false);
			}

			db.close();
		  });
	  });	
}

var isUsernameTaken = function(data, cb){
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		var dbo = db.db("ZenIdle");

		dbo.collection("account").find({username:data.username}).toArray(function(err, res) {
			if (err) throw err;
			
			if(res[0]){
				cb(true);
			}else{
				cb(false);
			}

			db.close();
		  });
	  });
}

var addUser = function(data, cb){
	bcrypt.hash(data.password, 10).then(hash=>{
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("ZenIdle");
			dbo.collection("account").insertOne({username:data.username, hash:hash}, function(err, res) {
			  if (err) throw err;
				cb(true);
			  db.close();
			});
			
		  });
	});	
}


//socket io
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = shortid.generate();
	
	socket_list[socket.id] = socket;
	
	//login and signup
	socket.on('login', function(data){
		let playerArray = Object.values(player_list);
		let onlineArray = playerArray.find(x => x.name == data.username);
		if(!onlineArray){
			isValidPassword(data, function(res){
				if(res){
					socket.name = data.username;
					Player.onconnect(socket);
					socket.emit('loginResponse', {success:true, loggedin:false});
					if(serverUpdate){
						socket_list[i].emit('update', {msg: serverUpdateCount});
					}
				}else {
					socket.emit('loginResponse', {success:false, loggedin:false});
				}

			});
		}else {
			socket.emit('loginResponse', {success:false, loggedin:true});
		}
	});

	socket.on('signup', function(data){
		isUsernameTaken(data, function(res){
			if (res){
				socket.emit('nameTaken');
			}else{
				addUser(data, function(res){
					if(res){
						socket.emit('signupResponse', {success:true});
					}else{
						socket.emit('signupResponse', {success:false});
					}
				});	
			}	
		});
	});

	
	
	socket.on('chatMsg', function(data){
		data.chatMsg = data.chatMsg.replace( /(<([^>]+)>)/ig, '');
		if(data.chatMsg.includes("***adminwarning***:")){
			let str = data.chatMsg.replace("***adminwarning***:","");
			for(var i in socket_list){
				socket_list[i].emit('warning', {user:socket.name, msg: str});
			}
		}else if(data.chatMsg.includes("***serverupdate***:")){
			let str = data.chatMsg.replace("***serverupdate***:","");
			serverUpdateCount = parseInt(str);
			updateCountInterval = setInterval(startUpdateCount,1000);
			serverUpdate = true;
			for(var i in socket_list){
				socket_list[i].emit('update', {msg: parseInt(str)});
			}
		}else{
			for(var i in socket_list){
				socket_list[i].emit('addToChat', {user:socket.name, msg: data.chatMsg});
			}
		}
	});
	
	socket.on('disconnect', function(){
		delete socket_list[socket.id];
		delete player_list[socket.id];
		serverMsg("Player "+socket.name + " left the game");
	});
});

function serverMsg(data){
	for(var i in socket_list){
		socket_list[i].emit('serverMsg', {msg:data});
	}
}

function startUpdateCount(){
	if(serverUpdateCount>0){
		serverUpdateCount=serverUpdateCount-1;
	}else {
		clearInterval(updateCountInterval);
		for(var i in socket_list){
			socket_list[i].emit('stopUpdateCount');
		}
	}
}