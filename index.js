var express = require('express');
var app = express();
var server = require('http').Server(app);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var Person = require('./app/models/person')

mongoose.connect('mongodb://localhost:27017/chat');
//var io = require('socket.io')(server);
server.listen(2309,'112.213.94.96');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.bodyParser());
app.use('/api',router);

router.use(function(req, res, next){
  next();
})

router.get('/',function(req,res){
	res.json({message:"Welcome to RESTFUL API NodeJS"})
})

router.route('/person')
        .post(function(req, res){
          //res.send(req.body)
          Person.find({id:req.body.id},function(err,item){
            //res.json(item.length)
            if(err){
               res.json({error:err})
             }
            if(item.length>0){
              res.json({code:200,message:'Data exists!'})
            }else {
              var person = new Person();
              person.id = req.body.id;
              person.name = req.body.name;
              person.urlhinh = req.body.urlhinh;
              person.save(function(err){
                if(err){
                   res.json({error:err})
                 }
                 res.json({code:200,message:'Data inserted successful!'})
              })
            }
          });
        })
        .get(function(req, res){
          Person.find(function(err, person){
            if(err) res.json({error:err})
            res.json({person})
          });
        })
// router.post('/', function(req, res) {
//     let data = {
//         response: 'You sent: ' + req.body.message
//     };
//
//     res.status(200).send(data);
// });
