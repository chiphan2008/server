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
<<<<<<< HEAD

app.get('/',function(req,res){
	res.send(JSON.stringify({message:"Welcome to RESTFUL API NodeJS"}))
=======
app.use('/api',router);
router.get('/',function(req,res){
	res.json({message:"Welcome to RESTFUL API NodeJS"})
>>>>>>> 6e4e744479933a35d3161a85ff1407b0ea97d048
})

router.post('/', function(req, res) {
    let data = {
        response: 'You sent: ' + req.body
    };

    res.status(200).send(data);
});
