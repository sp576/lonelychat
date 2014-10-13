var express = require('express')
  , session = require('express-session')
  , http    = require('http')
  , path    = require('path')
  , db      = require('./models')
  , socketio= require('socket.io')
  , redis   = require('redis')
  , bodyParser = require('body-parser')
  , RedisSession = require('connect-redis')(session)
  , passport= require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , utils   = require('./utils');

var app = express();

// Redis as WebSocket message queue
var redis_client = redis.createClient(17754, "pub-redis-17754.us-east-1-4.1.ec2.garantiadata.com");
//var redis_client = redis.createClient(6379, 'localhost');
redis_client.auth('1SYLvTVmKTHsKuCJ');
//redis_client.psubscribe('chat_*');

// App env
app.set('port', (process.env.PORT || 5000));
app.use("/static", express.static(__dirname + '/static'));
app.set('views', './templates');
app.set('view engine', 'jade');
app.use( bodyParser.json());
app.use( bodyParser.urlencoded());
app.engine('jade', require('jade').__express);
var sessionMiddleware = session({ 
    secret: 'adfa49802VJLKA89r0Avbdfsaz',
    store: new RedisSession({
        client: redis_client
    })
});
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());


//var server = http.Server(app);

var server;
db.sequelize.sync().complete(function(err) 
{
    if (err) 
    {
        console.log("error" + err);
        throw err[0];
    } 
    else 
    {
        // VOID
    }
});

// Passport
passport.serializeUser(function(user, done) 
{
    done(null, user.username);
});

passport.deserializeUser(function(user, done) 
{
    done(null, user);
})

passport.use(new LocalStrategy(
    function(username, password, done) 
    {   
        db.User.find({ where: { username: username}})
            .success(function(user) 
            {           
                if (!user || !utils.checkPasswordHash(password, user.password)) 
                {
                    console.log("Invalid");
                    return done(null, false, { message: 'Invalid username or password.'});
                }
                console.log("login : " + user.username);
                return done(null, user);
            })
            .error(function (err) {         
                console.log("Error " + err);
                return done(err);
            });
    }
));


// HTTP Request Handlers
app.get('/', function(request, response) 
{
    if (request.user) 
    {
        response.redirect('/chatroom');
    }
    else
    {
        response.render('index', {title: 'LonelyChat'});
    }
});

app.get('/chatroom', function(request, response) 
{
    if (request.user)
    {
        response.render('chatroom', {
            title: 'LC - ' + request.user,
            username: request.user
        }); 
    }
    else
    {
        response.redirect('/');
    }
    
});

app.post('/signin', passport.authenticate('local', 
                    { successRedirect: '/chatroom',
                      failureRedirect: '/'      
                    }));

app.get('/signout', function(request, response) 
{
    request.logout();
    response.redirect('/');
});

app.post('/signup', function(request, response) 
{
    var username = request.body.newusername;
    var password1 = request.body.password1;
    var password2 = request.body.password2;
    
    if (password1 != password2) 
    {
        return response.render('index', {title: 'LonelyChat', signup_error: 'Password did not match.'});
    }
    db.User.find({where: {username: username}})
        .success(function(user)
        {   
            if (!user) 
            {
                var hash = utils.generatePasswordHash(password1);           
                db.User.create({
                    username: username,
                    password: hash
                })
                .success(function(new_user) 
                {
                    request.login(new_user, function(err) {
                        if (err) { console.log("signup-login : " + err);}
                        return response.redirect('/chatroom');
                    })
                })
                .error(function (err) 
                {   
                    console.log("create error : " + err);
                    return response.render('index', {title: 'LonelyChat', signup_error: 'Unknown Error'}); 
                });
            } 
            else 
            {
                return response.render('index', {title: 'LonelyChat', signup_error: 'Username has been taken.'}); 
            }
        })
        .error(function (err) 
        {
            return response.render('index', {title: 'LonelyChat', signup_error: 'Unknown Error 0X21'}); 
        });

})

server = app.listen(app.get('port'), function() 
{
  console.log("Node app is running at localhost:" + app.get('port'));
});


// Socket.io server side
var usernames = {};
var numUsers = 0;

var io = socketio.listen(server);
io.on('connection', function(socket) 
{
    socket.on("join", function(data) 
        {       
            var timestamp = new Date().toLocaleString();
            socket.username = data.username;
            usernames[socket.username] = socket.username;
            ++numUsers;
            socket.broadcast.emit("news", {
                username: socket.username,
                msg: timestamp + ": " + socket.username + " joined to chat from " + data.msg + ".",
                numUsers: numUsers
            });
            socket.emit("news", {
                username: socket.username,
                msg: timestamp + ": " + socket.username + " joined to chat from " + data.msg + ".",
                numUsers: numUsers
            });
        });

    socket.on("disconnect", function() 
        {
            delete usernames[socket.username];
            --numUsers;
            var timestamp = new Date().toLocaleString();
            socket.broadcast.emit("news", {
                username: socket.username,
                msg: "Left the chatroom at " + timestamp,
                numUsers: numUsers
            });
        });

    socket.on('chatMsg', function(data) 
        {
            socket.broadcast.emit('news', { 
                username: socket.username,
                msg: data.msg,
                numUsers: numUsers
            });
        }); 

    socket.on('start typing', function(data)
        {
            socket.broadcast.emit('start typing', {
                username: socket.username
            });
        });
    /*
    redis_client.on('pmessage', function(pattern, channel, key) {
        msg = JSON.parse(key);
        socket.broadcast.emit(channel, msg);
    });
    */
});
