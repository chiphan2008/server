var express = require('express');
var app = express();
var server = require('http').Server(app);
const bodyParser = require('body-parser');
//var io = require('socket.io')(server);
server.listen(2309,'112.213.94.96');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/',function(req,res){
	res.send(JSON.stringify({message:"Welcome to RESTFUL API NodeJS"}))
})

app.post('/', function(req, res) {
    let data = {
        response: 'You sent: ' + req.body.message
    };

    res.status(200).send(data);
});
