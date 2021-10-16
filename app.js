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
	/*db.account.find({username:data.username}, function(err, res){
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
	});*/	
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

	/*db.account.find({username:data.username}, function(err, res){
		if(res[0]){
			cb(true);
		}else{
			cb(false);
		}
	});*/
}

var addUser = function(data, cb){
	bcrypt.hash(data.password, 10).then(hash=>{
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var dbo = db.db("mydb");
			var myobj = {username:data.username, hash:hash};
			dbo.collection("account").insertOne(myobj, function(err, res) {
			  if (err) throw err;
			 
			  cb(res);
			  db.close();
			});
		  });
	});
	/*bcrypt.hash(data.password, 10).then(hash=>{
		db.account.insert({username:data.username, hash:hash}, function(err){
			cb(true);
		});
	});*/	
}

//socket io
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = shortid.generate();
	
	socket_list[socket.id] = socket;
	
	//login and signup
	socket.on('login', function(data){
		isValidPassword(data, function(res){
			if(res){
				socket.name = data.username;
				Player.onconnect(socket);
				socket.emit('loginResponse', {success:true});
			}else {
				socket.emit('loginResponse', {success:false});
			}

		});
	});

	socket.on('signup', function(data){
		isUsernameTaken(data, function(res){
			if (res){
				socket.emit('nameTaken');
			}else{
				addUser(data, function(res){
					socket.emit('debug', {result:res});
					/*if(res){
						socket.emit('signupResponse', {success:true});
					}else{
						socket.emit('signupResponse', {success:false});
					}*/
				});	
			}	
		});
	});

	
	
//	serverMsg("A new player joined the game: "+socket.id);
	
	socket.on('chatMsg', function(data){
		for(var i in socket_list){
			socket_list[i].emit('addToChat', {user:socket.name, msg: data.chatMsg});
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