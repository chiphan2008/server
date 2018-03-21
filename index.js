var express = require('express');
var app = express();
var server = require('http').Server(app);
//var io = require('socket.io')(server);
server.listen(2309,'112.213.94.96');
console.log('Server running at http://112.213.94.96:2309');

app.get('/',function(req,res){
	res.end(JSON.stringify({message:"Welcome to NodeJS"}))
})

