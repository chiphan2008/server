var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
mongoose.connect('mongodb://localhost:27017/chat');
//var io = require('socket.io')(server);
server.listen(2309,'112.213.94.96');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.bodyParser());
app.use('/api',router);
router.get('/',function(req,res){
	res.json({message:"Welcome to RESTFUL API NodeJS"})
})

router.post('/', function(req, res) {
    let data = {
        response: 'You sent: ' + req.body.message
    };

    res.status(200).send(data);
});
