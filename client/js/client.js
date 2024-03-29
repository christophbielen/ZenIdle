var socket = io();
	
////////////////////////
//   Login / Sign up  //
////////////////////////
let loginScreen = $('#loginScreen');
let openchat = $('#openchat');

let usernamea = $('#username');
let passworda = $('#password');
let loginbutton = $('#loginbutton');

let usernamesignup = $('#usernamesignup');
let passwordsignup = $('#passwordsignup');
let passwordbsignup = $('#passwordbsignup');
let signupbutton = $('#signupbutton');

let loadingScreen = $('#loadingScreen');
let loadingText = $('#loadingText');

loginbutton.on('click', function(){
	setLoadingScreen("Logging in ...");
	socket.emit('login', {username:usernamea.val(), password:passworda.val()});
});

passworda.keypress(function(event) {
	if (event.keyCode == 13) {
		setLoadingScreen("Logging in ...");
		socket.emit('login', {username:usernamea.val(), password:passworda.val()});
	}
});

socket.on('loginResponse', function(data){
	if (data.success){
		loginScreen.hide();
		openchat.show();
		usernamea.val("");
		passworda.val("");
		loadingScreen.css({"display": "none"});
	}else{
		if(!data.loggedin){
			loadingScreen.css({"display": "none"});
			alert("Username or password is not correct. Try again.");
		} else{
			loadingScreen.css({"display": "none"});
			alert("You are already logged in.");
		}
	}
});

signupbutton.on('click', function(){
	if((passwordsignup.val()!="")&&(passwordsignup.val() == passwordbsignup.val())){
		setLoadingScreen("Signing up ...");
		socket.emit('signup', {username:usernamesignup.val(), password:passwordsignup.val()});
	}else{
		alert("Passwords don't match or are empty.");
	}
});

passwordbsignup.keypress(function(event) {
	if (event.keyCode == 13) {
		if((passwordsignup.val()!="")&&(passwordsignup.val() == passwordbsignup.val())){
			setLoadingScreen("Signing up ...");
			socket.emit('signup', {username:usernamesignup.val(), password:passwordsignup.val()});
		}else{
			alert("Passwords don't match or are empty.");
		}
	}
});

socket.on('signupResponse', function(data){
	if(data.success){
		usernamea.val("");
		passworda.val("");
		usernamesignup.val("");
		passwordsignup.val("");
		loadingScreen.css({"display": "none"});
		alert("Sign up was successful. You can login now.");
	}else {
		usernamea.val("");
		passworda.val("");
		usernamesignup.val("");
		passwordsignup.val("");
		loadingScreen.css({"display": "none"});
		alert("Sign up did not succeed. Try again.");
	}
});

socket.on('nameTaken', function(data){
		alert("This name is already taken. Try again with another name.");
		loadingScreen.css({"display": "none"});
});

socket.on('disconnect', function(){
	loginScreen.show();
	alert('The server is down. Maybe for an update. Try again later.');
});

function setLoadingScreen(text){
	loadingText.text(text);
	loadingScreen.css({"display": "grid"});
}




////////////////////////
//   Chat functions   //
////////////////////////

let chatDiv = $('#chatDiv');
let chatTextDiv = $('#chatTextDiv');
let chatinput = $('#chatinput');
let updatecounter = $('#updatecounter');
let updatecountertext = $('#updatecountertext');
let updateTime = 0;
let updateTimeInterval = 0;

chatDiv.resizable();

openchat.on('click', function(){
	chatDiv.toggle();
	chatinput.focus();
	chatTextDiv.scrollTop(chatTextDiv[0].scrollHeight);
});

socket.on('addToChat', function(data){
	chatTextDiv.append("<div><span class='chatname'>"+data.user+": </span><span class='chattext'>"+data.msg+"</span></div>");
	setTimeout(function(){ chatTextDiv.scrollTop(chatTextDiv[0].scrollHeight); }, 100);
});

socket.on('warning', function(data){
	chatTextDiv.append("<div><span class='chatname'>"+data.user+": </span><span class='chattext'>"+data.msg+"</span></div>");
	setTimeout(function(){ chatTextDiv.scrollTop(chatTextDiv[0].scrollHeight); }, 100);
	alert(data.msg);
});

socket.on('update', function(data){
	updateTime = data.msg;
	updatecounter.show();
	updateTimeInterval = setInterval(startUpdateCounter,1000);
});

chatinput.keypress(function(event) {
	if (event.keyCode == 13) {
		let chatText = chatinput.val();
		socket.emit('chatMsg',{chatMsg:chatText});
		chatinput.val(""); 
		setTimeout(function(){ chatTextDiv.scrollTop(chatTextDiv[0].scrollHeight); }, 100);	
	}
});

socket.on('serverMsg', function(data){
	chatTextDiv.append("<div><span style='color:green;'>"+data.msg+"</span></div>");
	setTimeout(function(){ chatTextDiv.scrollTop(chatTextDiv[0].scrollHeight); }, 100);
});

function startUpdateCounter(){
	if(updateTime>0){
		updateTime = updateTime-1;
		var minutes = Math.floor(updateTime/60);
		var seconds = updateTime%60;
		updatecountertext.text(minutes+":"+seconds);
	}else {
		clearInterval(updateTimeInterval);
		updatecounter.hide();
		alert("server is updating. Reload page before you login after the update.");
	}
}


///////////// DEBUG //////////
socket.on('debug', function(data){
	console.log(data.result);
});