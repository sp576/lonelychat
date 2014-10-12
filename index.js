var express = require('express');
var app = express();
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

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
  response.send('Hello World!');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
