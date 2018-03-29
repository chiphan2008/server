var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {pingTimeout: 30000});
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router();
var Person = require('./app/models/person')
var Conversation = require('./app/models/Conversation')
//var ListFriend = require('./app/models/ListFriend')
var BaseController = require('./app/controllers/BaseController')
mongoose.connect('mongodb://localhost:27017/chat');
server.listen(2309,'112.213.94.96');

io.on('connection',function(socket){
  //show handleEnterText
  socket.on('handleEnterText',function(port,data){
    //console.log(data);
    io.sockets.emit('replyStatus-'+port, data);
  });
  // handle send message
  socket.on('sendMessage',function(port,data){
    //console.log(data);
    if(data.group===undefined){
      Conversation.find({group:port},function(err,item){
        if(item.length===0){
          //dont send message yet
          io.sockets.emit('replyMessage-'+port, data);

        }else {
          //had even send message and send history chat
          io.sockets.emit('replyMessage-'+port, item);
        }

      });
    }else {
      //chatting...
      var conversation = new Conversation();
      //conversation = data;
      conversation.group= data.group;
      conversation.user_id= data.user_id;
      conversation.message= data.message;
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
  if(req.headers.authorization!=='NKbqe8ovfMetW8WYimVN7MtNHSsy6tCo6mm7WU9Y'){
    res.send("Can't not GET/POST");
  }
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
                     "online_at": Date.now()
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
            Person.find({id:{$ne : req.params.id}}).sort('-_id').exec(function(err, data){
              res.json({data});
            });
          }else {
            res.json({error:"Cant not GET"})
          }
        })
router.route('/list-friend/:id')
        .get(function(req, res){
          if(req.params.id>0){
            Person.findOne({id:req.params.id}).exec(function(err, arr){
              var data = [];
              arr.friends.forEach((item,index)=>{
              var p1 = new Promise(function (resolve, reject) {
                    Person.findOne({id:item.user_id}).exec(function(err, el){
                      if(err) return reject(err)
                      data.push(el)
                      return resolve(data)
                    });
                  })
              })
              p1.then(function(data) {
                 res.json({data})
              });
            });
          }else {
            res.json({error:"Cant not GET"})
          }
        })
router.route('/add-friend')
        .post(function(req, res){
          Person.update({id: req.body.id} ,
            {
              $addToSet : {
                "friends" : {user_id:req.body.user_id,status:1}
              }
            },function(){
              res.json({data:'Data updated'})
            });
})
router.route('/unfriend')
        .post(function(req, res){
          Person.updateOne({id: req.body.id} ,
            {
              $pull : {
                "friends" : {user_id:req.body.user_id}
              }
            },function(){
              res.json({data:'Data updated'})
            });
        })

router.route('/conversation/:group')
        .get(function(req, res){
          Conversation.find({group:req.params.group},function(err, data){
            if(err) res.json({error:"Cant not GET"})
            res.json({data})
          });
        })
