
var socket = io.connect();


socket.on('news', function(data) {
	console.log(data);
	var username = data.username;
	var msg = data.msg;
	appendMsg(username, msg);
});

$(document).ready(function() 
{
	$('#chatMsgTextInput').keyup(function(event) 
	{
		if (event.keyCode == 13) 
		{
			var message = this.value;
			appendMsg(username, message);
			socket.emit('chatMsgTextInput', {msg: message});
			console.log(message);	
			this.value = '';
		}
	});
});

function appendMsg(username, msg) 
{
	$("#board").append("<p><strong>"+username+":</strong> "+msg+"</p>");
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
socket.emit("join", {
	username: username,
	msg: "browser"
});