var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {pingTimeout: 30000});
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var Person = require('./app/models/person')
var Conversation = require('./app/models/Conversation')
//var BaseController = require('./app/controllers/BaseController')
mongoose.connect('mongodb://localhost:27017/chat');
server.listen(2309,'112.213.94.96');

io.on('connection',function(socket){
  //show handleEnterText
  socket.on('handleEnterText',function(port,data){
    console.log(data);
    io.sockets.emit('replyStatus-'+port, data);
  });
  // handle send message
  socket.on('sendMessage',function(port,data){
    console.log(data);
    if(data.group===undefined){
      Conversation.find({group:port},function(err,item){
        if(item.length===0){
          io.sockets.emit('replyMessage-'+port, data);
        }else {
          io.sockets.emit('replyMessage-'+port, item);
        }
      });
    }else {
      var conversation = new Conversation();
      //conversation = data;
      conversation.group= data.group,
      conversation.user_id= data.user_id,
      conversation.message= data.message,
      conversation.urlhinh= data.urlhinh,
      conversation.save(function(err) {
        console.log('err',err);
      });
      io.sockets.emit('replyMessage-'+port, data);
    }

  })
})

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
          Person.find({id:req.body.id},function(err,item){
            if(err){
               res.json({error:err})
             }
            if(item.length>0){
              Person.updateOne(
                {id: req.body.id },
                {
                   $set: {
                     "name": req.body.name,
                     "urlhinh": req.body.urlhinh,
                   }
               }, function() {
                   res.json({code:200,message:'Data exists!'})
               });
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
router.route('/except-person/:id')
        .get(function(req, res){
          if(req.params.id>0){
            Person.find({id:{$ne : req.params.id}},function(err, data){
              if(err) res.json({error:err})
              let arr = [];
              //res.json({data})
              data.forEach(function(item){
                let param = item.id<req.params.id ? item.id+'_'+req.params.id : req.params.id+'_'+item.id;
                //res.json({param}) .sort('-create_at').limit(1)
                Conversation.find({group:param}).exec(function(err, el){
                  arr = el;
                  // item['message']= el.message;
                  // arr.push(item);
                  // res.json({arr})
                });
                res.json({arr})
              })
              //res.json({arr})
            });
          }else {
            res.json({error:"Cant not GET"})
          }
        })
router.route('/conversation/:group')
        .get(function(req, res){
          Conversation.find({group:req.params.group},function(err, data){
            if(err) res.json({error:"Cant not GET"})
            res.json({data})
          });
        })
