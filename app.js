var express = require('express')
  , app = express()
  , http = require('http')
  , path = require('path')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
server.listen(3000);

app.configure(function() {
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ cookie: { maxAge: 60000 }}));
  //app.use(flash());
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
//app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
//app.use(express.session({ secret: "OZhCLfxlGp9TtzSXmJtq" }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



var nicknames = [];

var mongoose = require('mongoose');
//mongoose.set('debug', true);
    mongoose.connect('mongodb://localhost/profback');
    var db = mongoose.connection;
     db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', function callback () {
       // var Schema = mongoose.Schema;
        var feedbackSchema = mongoose.Schema({
          professor_name: String,
          professor_email: String,
          professor_message: String,
          student_name: String,
          student_email: String,
          student_message: String
          });

          var feedback = mongoose.model('feedback', feedbackSchema);

          //var silence = new feedback({ professor_name: 'Johnny', professor_message: 'MEW'});
          //console.log(silence.professor_name);

          var fluffy = new feedback({ professor_name: 'Flufster', professor_message: 'Hi'});

          fluffy.save(function (err, fluffy) {
            if(err)
            console.log('error');
          else {
            console.log(fluffy.professor_name);
              };
          });
        });


io.sockets.on('connection', function (socket) {
    
    socket.emit('connected');

    socket.on('loadmessages', function (data) {
      var messages = [];
    });

  socket.on('nickname', function (data, callback) {
    if (nicknames.indexOf(data) != -1) { 
      callback(false);
    } else {
      callback(true);
      nicknames.push(data);
      socket.nickname = data;
      console.log('Nicknames are ' + nicknames);
      io.sockets.emit('nicknames', nicknames);
    }
  });
    
  socket.on('user message', function (data) {
    new feedback({
      student_message: data.student_message
    }).save(function(err, docs) { if(err) { return console.log("error"); }
    socket.emit('callback', {done: 'Done', data: data});
    });
  });

    //save messages+nicknames here then output them again above
    //in load messages

  io.sockets.emit('user message', { 
    nick: socket.nickname, 
    message: data 
    });
  });

 // socket.on('disconnect', function () {
   // if (!socket.nickname) return;
    // if (nicknames.indexOf(socket.nickname) > -1) {
     // nicknames.splice(nicknames.indexOf(socket.nickname), 1);
   // }
   // console.log('Nicknames are ' + nicknames);
   // });

app.get('/', function(req,res){
  feedback.find({}, function(err, docs) {
    res.sendfile(__dirname + '/views/index.html'), {
      //title: 'KITTEz',
     docs: docs
    };
  });
});

//app.get('/styles', function(req,res){
 //   res.sendfile(__dirname + '/public/styles.css');
//});


