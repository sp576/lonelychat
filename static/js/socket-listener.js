
var socket = io.connect();
var typing = false;
var typing_username = '';
var focused_tab = true;
var original_title = document.title;
var blink = null;
var unreadMsgCount = 0;
var numUsers = 0;
var imageUploader;


socket.on('news', function(data) {
	var username = data.username;
	var msg = data.msg;
	var is_me = numUsers == 0 ? true : false;
	try {
		appendChatLog(data.chatLog);
	} catch (e) {
		// void is the Di0v
	}
	try {
		console.log(data.usernames);
		appendUsers(data.usernames);
	} catch (e) {
		// void is the Di0v
	}
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
	});

	$('#left-tab').height($('.container').height());
	$('#toggle-user').click(function(e) {
		e.preventDefault();
		$("#wrapper").toggleClass("toggled");
	});

	imageUploader = document.getElementById('imageUploader');
	imageUploader.addEventListener('change', handleImage, false);
});

function refocusedAction()
{
	if (blink != null) {
		clearInterval(blink);
		blink = null;
	}
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
	var newChat = $('<p></p>');
	var usernameChat = $('<strong></strong>').addClass(nameColor).text(username + ": ");
	var newMsg = $('<span></span>').text(msg);
	newChat.append(usernameChat);
	newChat.append(newMsg);
	$("#board").append(newChat);
	if (!focused_tab) 
	{
		unreadMsgCount++;
		var new_title = original_title + " (" + unreadMsgCount + ")";
		if (blink != null) 
		{
			clearInterval(blink);
		}
		blinkTitle(new_title);
		blink = setInterval(function(){blinkTitle(new_title)}, 1500);		
	}
	var board = document.getElementById("board");
	if (board.scrollHeight != null) { board.scrollTop = board.scrollHeight; }
}

function blinkTitle(title) 
{
	document.title = title == document.title ? ' ' : title;
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function appendChatLog(chatLog)
{
	chatLog.forEach(function(entry) {
		var is_me = entry.username == username ? true : false;
		appendMsg(entry.username, entry.msg, is_me);
	});
}

function appendUsers(userlist)
{
	userlist = JSON.parse(userlist);
	$(".username").remove()
	for (var key in userlist) 
	{
		$("#user-list").append("<li class='username'><strong>"+key+"</strong></li>");
	}
}

function handleImage(e) {
	var reader = new FileReader();
	reader.onload = function(event) 
	{
		var img = new Image();
		img.onload = function() 
		{
			img.onload = function() 
			{
				$("#board").append()
			}
		}
	}
}

socket.emit("join", {
	username: username,
	msg: "browser"
});