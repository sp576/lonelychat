
var socket = io.connect();
var typing = false;
var typing_username = '';
var focused_tab = true;
var original_title = document.title;
var unreadMsgCount = 0;
var numUsers = 0;

socket.on('news', function(data) {
	console.log(data);
	var username = data.username;
	var msg = data.msg;
	var is_me = numUsers == 0 ? true : false;
	numUsers = data.numUsers;
	if (typing_username == username)
	{
		notifyTyping(username, false);
	}

	appendMsg(username, msg, is_me);
});

socket.on('start typing', function(data) {
	var username = data.username;	
	typing_username = username;
	notifyTyping(username, true);
});

socket.on('end typing', function(data) {
	var username = data.username;
	if (typing_username == username) 
	{
		notifyTyping(username, false);
	}
})

$(document).ready(function() 
{
	$('#chatMsgTextInput').keyup(function(event) 
	{
		if (event.keyCode == 13) 
		{
			var message = this.value;
			if (message.length > 0) 
			{		
				appendMsg(username, message, true);
				socket.emit('chatMsg', {msg: message});				
				console.log(message);	
				this.value = '';	
				typing = false;
			}
		}
		else if (!typing)
		{
			typing = true;
			socket.emit('start typing', {});
		}
	});

	window.addEventListener('focus', function() {
		refocusedAction();
	});

	window.addEventListener('blur', function() {
		blurredAction();
	})
});

function refocusedAction()
{
	focused_tab = true;
	unreadMsgCount = 0;
	document.title = original_title;
}

function blurredAction()
{
	focused_tab = false;
}

function notifyTyping(username, start) 
{
	if (start) 
	{
		$("#notify").text(username + " is typing...");		
	}
	else
	{
		$("#notify").text("");		
	}
}

function appendMsg(username, msg, me) 
{
	var nameColor = "";
	if (me)
	{
		nameColor = "text-success";
	}
	$("#board").append("<p><strong class='"+nameColor+"'>"+username+":</strong> "+msg+"</p>");
	if (!focused_tab) {
		unreadMsgCount++;
		document.title = original_title + " (" + unreadMsgCount + ") "
	}
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