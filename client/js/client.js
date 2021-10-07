var socket = io();
	


////////////////////////
//   Chat functions   //
////////////////////////

let chatDiv = $('#chatDiv');
let openchat = $('#openchat');
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

