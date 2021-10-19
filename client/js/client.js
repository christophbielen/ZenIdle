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
		loadingScreen.css({"display": "none"});
		alert("Username or password is not correct. Try again.");
	}
});

signupbutton.on('click', function(){
	if(passwordsignup.val() == passwordbsignup.val()){
		setLoadingScreen("Signing up ...");
		socket.emit('signup', {username:usernamesignup.val(), password:passwordsignup.val()});
	}else{
		alert("Passwords don't match.");
	}
});

passwordbsignup.keypress(function(event) {
	if (event.keyCode == 13) {
		if(passwordsignup.val() == passwordbsignup.val()){
			setLoadingScreen("Signing up ...");
			socket.emit('signup', {username:usernamesignup.val(), password:passwordsignup.val()});
		}else{
			alert("Passwords don't match.");
		}
	}
});

socket.on('signupResponse', function(data){
	if(data.success){
		usernamesignup.val("");
		passwordsignup.val("");
		loadingScreen.css({"display": "none"});
		alert("Sign up was successful. You can login now.");
	}else {
		usernamesignup.val("");
		passwordsignup.val("");
		loadingScreen.css({"display": "none"});
		alert("Sign up did not succeed. Try again.");
	}
});

socket.on('nameTaken', function(data){
		alert("This name is already taken. Try again with another name.");
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


///////////// DEBUG //////////
socket.on('debug', function(data){
	console.log(data.result);
});