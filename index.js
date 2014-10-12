var express = require('express');
var app = express();
var pg = require('pg');
var server = require('http').Server(app);
var socketio = require('socket.io');

// Redis as WebSocket message queue
var redis = require('redis');
var redis_client = redis.createClient(17754, "pub-redis-17754.us-east-1-4.1.ec2.garantiadata.com");
redis_client.auth('1SYLvTVmKTHsKuCJ');
redis_client.psubscribe('chat_*');


app.set('port', (process.env.PORT || 5000));
app.use("/static", express.static(__dirname + '/static'));
app.set('views', './templates');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

app.get('/', function(request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
  	/*client.query('SELECT * FROM ', function(err, result) {
		done();
		if (err) {
			console.error(err);
		} else {
			response.send(result.rows);
		}
  	});
	*/
  });
  response.render('index', {title: 'LonelyChat'});
});

var server = app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

var io = socketio.listen(server);
io.on('connection', function(socket) {
	socket.on("join", function(data) {		
		var timestamp = new Date().toLocaleString();
		socket.broadcast.emit("news", {msg: timestamp + ": " + data.msg + " joined to chat."});
		socket.emit("news", {msg: timestamp + ": " + data.msg + " joined to chat."});
	});

	socket.on('chatMsg', function(data) {
		console.log(data);
		socket.broadcast.emit('news', { msg: data.msg});
	});

	redis_client.on('pmessage', function(pattern, channel, key) {
		msg = JSON.parse(key);
		socket.broadcast.emit(channel, msg);
	});
})