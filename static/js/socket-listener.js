
var socket = io.connect();


socket.on('news', function(data) {
	console.log(data);
	$("#board").append("<li>"+data.msg+"</li>");
});

$(document).ready(function() {
	$('#chatMsg').keyup(function(event) {
		if (event.keyCode == 13) {
			var message = this.value;
			$("#board").append("<li>"+message+"</li>");
			socket.emit('chatMsg', {msg: message});
			console.log(message);	
			this.value = '';
		}
	});
});


socket.emit("join", {msg: "browser"});