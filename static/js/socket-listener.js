
var socket = io.connect();

socket.on('news', function(data) {
	console.log(data);
	$("#board").append("<li>"+data.msg+"</li>");
});

$(document).ready(function() {
	$('#clickme').click(function() {
		socket.emit('another news', {msg: "hey"});
		console.log("yo");
	});
});
