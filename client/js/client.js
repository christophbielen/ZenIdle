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

loginbutton.on('click', function(){
	socket.emit('login', {username:usernamea.val(), password:passworda.val()});
});

socket.on('loginResponse', function(data){
	if (data.success){
		loginScreen.hide();
		openchat.show();
	}else{
		alert("Username or password is not correct. Try again.");
	}
});

signupbutton.on('click', function(){
	if(passwordsignup.val() == passwordbsignup.val()){
		socket.emit('signup', {username:usernamesignup.val(), password:passwordsignup.val()});
	}else{
		alert("Passwords don't match.");
	}
});

socket.on('signupResponse', function(data){
	if(data.success){
		alert("Sign up was successful. You can login now.");
	}else {
		alert("Sign up did not succeed. Try again.");
	}
});

socket.on('nameTaken', function(data){
		alert("This name is already taken. Try again with another name.");
});

////////////////////////
//   Chat functions   //
////////////////////////

let chatDiv = $('#chatDiv');
let chatTextDiv = $('#chatTextDiv');
let chatinput = $('#chatinput');

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

