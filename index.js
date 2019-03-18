import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressValidator from 'express-validator';
import flash from 'connect-flash';
import session from 'express-session';
import fileupload from 'express-fileupload';

/** */
import SERVER_CONFIG from './configs/server_config.json';
import controller from './src/controllers/index';

/** */
var app=express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

/**config MiddleAware */
app.use(express.static(__dirname+'/public'));
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(expressValidator());
app.use(flash());
app.use(fileupload());

app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true,
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});


app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

app.use(function(req, res, next){
	res.locals.success_message = req.flash('success_message');
	res.locals.error_message = req.flash('error_message');
	res.locals.error = req.flash('error');
	res.locals.errors = req.flash('errors');
	res.locals.user = req.user || null;
  	next();
});

app.use('/', controller);


// a websocket, log that a user has connected
io.on("connection", function(socket) {
	console.log("connectionID="+socket.id+" is connected");
	
	//disconnection
	socket.on("disconnect",function(){
		console.log("connectionID="+socket.id+ " is disconnected");
	});

	//receive data
	socket.on("client-send-data",function(data){
		console.log("from connectionID=" + socket.id + " send data is :"+data);

		switch(data) {
			case "me_to_me":
				socket.emit("server-send-data",data);
			  	break;
			case "me_to_all":
				io.sockets.emit("server-send-data",data);
			  	break;
			case "me_to_other":
				socket.broadcast.emit("server-send-data",data);
				break;
			default:
				io.to("connection_ID").emit("server-send-data",data);
		  }
	})
  });

/** */
server.listen(SERVER_CONFIG.server_port,()=>{
    console.log(`Server running at http://${SERVER_CONFIG.server_ip}:${server.address().port}/`);
});

