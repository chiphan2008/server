const fs = require("fs"),
  https = require("https"),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  express = require('express');
var app = express();
//var server = require('http').Server(app);
var router = express.Router();
var Person = require('./app/models/person')
var Conversation = require('./app/models/Conversation')
var ListFriend = require('./app/models/ListFriend')
//var BaseController = require('./app/controllers/BaseController')
var privateKey = fs.readFileSync('/etc/ssl/private/apache-selfsigned.key').toString();
var certificate = fs.readFileSync('/etc/ssl/certs/apache-selfsigned.crt').toString();
//const hostname = 'node.kingmap.vn';
const port = 2309;
var server = https.createServer({
    key: privateKey,
    cert: certificate
}, app);
var io = require('socket.io').listen(server, {secure: true,pingTimeout: 30000});
server.listen(port);

mongoose.connect('mongodb://localhost:27017/chat');
//server.setSecure(credentials);
// server.listen(port, hostname, () => {
//   console.log(`Server running at https://${hostname}:${port}/`);
// });

io.on('connection',function(socket){
  //show handleEnterText
  socket.on('handleEnterText',function(port,data){
    //console.log(data);
    io.sockets.emit('replyStatus-'+port, data);
  });
  // handle send message
  socket.on('sendMessage',function(port,data){
    //console.log(data);
    if(data.notification!==undefined){
      io.sockets.emit('replyMessage-'+port, data);
    }else{
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
//check info person
router.route('/person/:id')
        .get(function(req, res){
          if(req.params.id>0){
            Person.find({id:req.params.id}).exec(function(err, data){
              if(data.length>0){
                res.json({data:data[0]});
              }else {
                res.json({data:{}});
              }
            });
          }else {
            res.json({error:"Cant not GET"})
          }
})
router.route('/person/inactive')
        .post(function(req, res){
          res.json({req.body})
          Person.updateOne(
            {id: req.body.id },
            {
               $set: {
                 "active": 0,
               }
           }, function() {
               res.json({code:200,message:'User inactived!'})
          });
})
// /person add/update user when login app
router.route('/person/add')
        .post(function(req, res){
          var person = new Person();
          person.id = req.body.id;
          person.name = req.body.name;
          person.urlhinh = req.body.urlhinh;
          person.save(function(err){
            if(err){
               res.json({error:err})
             }
             res.json({code:200,message:'Data inserted successfully!'})
          })
})
// .get(function(req, res){
//   Person.find(function(err, person){
//     if(err) res.json({error:err})
//     res.json({person})
//   });
// })
router.route('/person/update')
        .post(function(req, res){
          Person.updateOne(
            {id: req.body.id },
            {
               $set: {
                 "name": req.body.name,
                 "urlhinh": req.body.urlhinh,
                 "active": 1,
                 "online_at": Date.now()
               }
           }, function() {
               res.json({code:200,message:'Update successfully!'})
          });
})

router.route('/except-person/:id')
        .get(function(req, res){
          var skipping = parseInt(req.query.skip) || 0;
          var limiting = parseInt(req.query.limit) || 0;
          if(req.params.id>0){
            Person.find({id:{$ne : req.params.id} ,active:1})
            .limit(limiting).skip(skipping).sort('-_id')
            .exec(function(err, data){
              res.json({data});
            });
          }else {
            res.json({error:"Cant not GET"})
          }
        })
router.route('/list-friend/:id')
        .get(function(req, res){
          if(req.params.id>0){
            ListFriend.findOne({id:req.params.id}).exec(function(err, arr){
              if(arr!==null){
                res.json({data:arr.friends})
              }
              res.json({code:200,data:[]})
            });
          }else {
            res.json({error:"Cant not GET"})
          }
})
router.route('/list-friend/:id/:status')
        .get(function(req, res){
          if(req.params.id>0){
            ListFriend.aggregate(
              {$match: {id:req.params.id}},
              { $project: {
                  friends: {$filter: {
                      input: '$friends',
                      as: 'friend',
                      cond: {$eq: ['$$friend.status', req.params.status]}
                  }}}
              }
            	// {$addFields : {"friends":{$filter:{ // We override the existing field!
            	// 	input: "$friends",
            	// 	as: "friend",
            	// 	cond: {$eq: ["$$friend.status", req.params.status]}
            	// }}}}
            ).exec(function(err, arr){
                  if(arr!==null){
                      res.json({arr})
                  }else {
                    res.json({code:200,data:[]})
                  }
            });
        }else {
          res.json({error:"Cant not GET"})
        }
})
router.route('/add-friend')
        .post(function(req, res){
          ListFriend.find({id:req.body.id},function(err,item){
            if(item.length>0){
              ListFriend.update({id: req.body.id} ,
              {
                $addToSet : {
                  "friends" : {
                    user_id:req.body.user_id,
                    name:req.body.name,
                    urlhinh:req.body.urlhinh,
                    status:0
                  }
                }
              },function(){ res.json({data:'Data updated'}) });
            }else {
              let friends = [{
                  user_id:req.body.user_id,
                  name:req.body.name,
                  urlhinh:req.body.urlhinh,
                  status:0,
                }]
                var listfriend = new ListFriend();
                listfriend.id= req.body.id;
                listfriend.friends= friends;
                listfriend.save(function(err) {
                  res.json({code:200,message:'Data inserted successful!'})
                });
            }
          })

})
router.route('/unfriend')
        .post(function(req, res){
          ListFriend.updateOne({id: req.body.id} ,
            {
              $pull : {
                "friends" : {user_id:req.body.user_id}
              }
            },function(){
              res.json({data:'Data updated'})
            });
})
router.route('/acept-friend')
    .post(function(req, res){
            ListFriend.updateOne({id: req.body.id,"friends.user_id":req.body.user_id} ,
            {
              $set : {"friends.$.status":1}
            },function(){ res.json({data:'Data updated'}) });
})

router.route('/conversation/:group')
        .get(function(req, res){
          Conversation.find({group:req.params.group},function(err, data){
            if(err) res.json({error:"Cant not GET"})
            res.json({data})
          });
        })
