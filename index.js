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
var HistoryChat = require('./app/models/HistoryChat')
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
router.route('/person/:id').get(function(req, res){
          if(req.params.id>0){
            Person.find({id:req.params.id}).exec(function(err, data){
              res.json({data});
            });
          }else {
            res.json({error:"Cant not GET"})
          }
})
router.route('/person/inactive').post(function(req, res){
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
router.route('/person/offline').post(function(req, res){
          Person.updateOne({id: req.body.id },
           {
               $set: {"offline_at": Date.now()}
           }, function() {
               res.json({code:200,message:'Update successfully!'})
           });
})
router.route('/person/update').post(function(req, res){
          //console.log('/person/update',req.body);
          Person.updateOne({id: req.body.id },
            {
               $set: {
                 "name": req.body.name,
                 "urlhinh": req.body.urlhinh,
                 "email": req.body.email,
                 "phone": req.body.phone,
                 "active": 1,
                 "offline_at": Date.now(),
                 "online_at": Date.now()
               }
           }, function() {
             ListFriend.findOne({id:req.body.id}).exec(function(err, item){
               if(err || item===null){
                 let listfriend = new ListFriend();
                 listfriend.id=req.body.id;
                 listfriend.friends=[];
                 listfriend.save();
               }else {
                 res.json({code:200,message:'Update successfully!'})
               }
             });

           });
})

// /person add/update user when login app
router.route('/person/add').post(function(req, res){
          Person.find({id:req.body.id}).exec(function(err, data){
            if(data.length===0){
              var person = new Person();
              person.id = req.body.id;
              person.name = req.body.name;
              person.urlhinh = req.body.urlhinh;
              person.email = req.body.email;
              person.phone = req.body.phone;
              person.save(function(err){
                if(err){
                   res.json({error:err})
                }
                ListFriend.findOne({id:req.body.id}).exec(function(err, item){
                  if(err || item===null){
                    let listfriend = new ListFriend();
                    listfriend.id=req.body.id;
                    listfriend.friends=[];
                    listfriend.save();
                    res.json({code:200,message:'Data inserted successfully!'})
                  }
                });

              })
            }else {
              res.json({code:200,message:'User existing!'})
            }
          });
})
// .get(function(req, res){
//   Person.find(function(err, person){
//     if(err) res.json({error:err})
//     res.json({person})
//   });
// })

router.route('/history-chat/:id').get(function(req, res){
          var skipping = parseInt(req.query.skip) || 0;
          var limiting = parseInt(req.query.limit) || 0;
          if(req.params.id>0){
            HistoryChat.find({user_id:req.params.id})
            .limit(limiting).skip(skipping).sort('-_update_at').exec(function(err, data){
              res.json({data});
            });
          }else {
            res.json({error:"Cant not GET"})
          }
        })
        .post(function(req, res){
            HistoryChat.find({user_id:req.params.id,friend_id:req.body.friend_id},function(err,item){
              if(item.length>0){
                HistoryChat.updateOne({friend_id: req.body.friend_id },
                  {
                     $set: {
                       "last_message":req.body.last_message,
                       "update_at": Date.now()
                     }
                  }, function() {
                     res.json({code:200,message:'Update successfully!'})
                  });
              }else {
                  var historychat = new HistoryChat();
                  historychat.user_id= req.params.id;
                  historychat.friend_id= req.body.friend_id;
                  historychat.last_message= req.body.last_message;
                  historychat.update_at= Date.now();
                  historychat.save(function(err) {
                    res.json({code:200,message:'Data inserted successful!'})
                  });
              }
            })

        })
router.route('/except-person/:id').get(function(req, res){
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
router.route('/list-friend/:id').get(function(req, res){
          if(req.params.id>0){
            ListFriend.findOne({id:req.params.id}).exec(function(err, item){
              if(err || item===null){
                res.json({data:[]})
              }else {
                res.json({data:item.friends})
              }
            });
          }else {
            res.json({error:"Cant not GET"})
          }
})
router.route('/list-friend/:id/:status').get(function(req, res){
          if(req.params.id>0){
            ListFriend.aggregate([
              { $match : { id : parseInt(req.params.id) } },
              { $project: {
                  friends: {
                    $filter: {
                      input: "$friends",
                      as: "friend",
                      cond: {$eq: ['$$friend.status', req.params.status]}
                  }}}
              }
            ]).exec(function(err, arr){
                  if(arr===null || err){
                      if(err) res.json(err)
                      res.json({code:200,data:[]})
                  }else {
                    //const newData = arr[0].friends;
                    var newData = arr[0].friends.map(function(item){
                        return item.friend_id;
                    });
                    Person.find({ id : { $in: newData } }).exec(function(err, item){
                      res.json({data:item})
                    });

                  }
            });
        }else {
          res.json({error:"Cant not GET"})
        }
})
router.route('/add-friend').post(function(req, res){
        const id = parseInt(req.body.id);
        const friend_id = parseInt(req.body.friend_id);
        if(id<0) res.json({error:"Cant not GET"});
        ListFriend.findOne({id:friend_id,"friends.friend_id":id}).exec(function(err, item){
          ListFriend.findOne({id,"friends.friend_id":friend_id}).exec(function(error, el){
            let conds,setVal,addVal;
              //I not inserte friend yet
              if(err || item===null){
                conds = {id:friend_id};
                setVal = {
                  $addToSet : {
                    "friends" : {
                      friend_id:id,
                      status:"request",
                      update_at: Date.now(),
                      create_at: Date.now()
                  }}
                };
                addVal = {
                  $addToSet : {
                    "friends" : {
                      friend_id:id,
                      status:"accept",
                      update_at: Date.now(),
                      create_at: Date.now()
                  }}
                }
              }else {
                conds = {id:friend_id,"friends.friend_id":id};
                setVal = {
                  $set : {
                    "friends.$.friend_id":id,
                    "friends.$.status":"request",
                    "friends.$.update_at":Date.now(),
                    "friends.$.create_at":Date.now()
                  }
                };
                addVal = {
                  $set : {
                    "friends.$.status":"accept",
                    "friends.$.update_at":Date.now()
                  }
                };

              }
            //friend not requested me yet
            if(error || el===null){
              ListFriend.updateOne(conds,setVal,function(err,rs){
                ListFriend.updateOne({id},{
                  $addToSet : {
                    "friends" : {
                      friend_id,
                      status:"waiting",
                      update_at: Date.now(),
                      create_at: Date.now()
                  }}
                },function(){ res.json({data:el}) });
              });
            }else {
              //res.json({item:item,el:el})
              const index = item.friends.findIndex(e => e.friend_id==id)
              if(item.friends[index].status==='waiting'){
                ListFriend.updateOne(conds,addVal,function(){
                  ListFriend.updateOne({id,"friends.friend_id":friend_id},{
                    $set : {
                      "friends.$.status":"accept",
                      "friends.$.update_at":Date.now()
                    }
                  },function(){ res.json({data:el}) });
                });
              }

           }

          })
      });
})
router.route('/unfriend').post(function(req, res){
        const id = parseInt(req.body.id);
        const friend_id = parseInt(req.body.friend_id);
        ListFriend.updateOne({id} ,
        {
          $pull : {
            "friends" : {friend_id}
          }
        },function(){
          ListFriend.updateOne({id: friend_id} ,
          {
            $pull : {
              "friends" : {friend_id:id}
            }
          },function(){
            res.json({data:'Data updated'})
          });
        });
})

router.route('/conversation/:group')
        .get(function(req, res){
          Conversation.find({group:req.params.group},function(err, data){
            if(err) res.json({error:"Cant not GET"})
            res.json({data})
          });
        })
