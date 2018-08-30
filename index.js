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

io.on('connection',function(socket){
  //show handleEnterText
  socket.on('handleEnterText',function(port,data){
    //console.log(data);
    io.sockets.emit('replyStatus-'+port, data);
  });
  // handle send message
  socket.on('sendMessage',function(port,data){
    //chatting...
    if(data.message.trim()!=='' && data.group!==undefined){
      var conversation = new Conversation();
      const create_at = Date.now();
      conversation.group= data.group;
      conversation.user_id= data.user_id;
      conversation.message= data.message;
      conversation.create_at= create_at;
      conversation.save(function(err) {
        console.log('err',err);
      });
      const dateNow = new Date();
      data = Object.assign(data,{create_at: dateNow})
      io.sockets.emit('replyMessage-'+port, data);
    }
    //console.log(data);
    // if(data.notification!==undefined){
    //   io.sockets.emit('replyMessage-'+port, data);
    // }else{
    //   if(data.group===undefined){
    //     Conversation.find({group:port},function(err,item){
    //       if(item.length===0){
    //         //dont send message yet
    //         io.sockets.emit('replyMessage-'+port, data);
    //       }else {
    //         //had even send message and send history chat
    //         io.sockets.emit('replyMessage-'+port, item);
    //       }
    //     });
    //   }else {
    //
    //
    //   }
    // }

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
          const dateNow =Date.now();
          Person.updateOne({id: req.body.id },
            {
               $set: {
                 "name": req.body.name,
                 "urlhinh": req.body.urlhinh,
                 "email": req.body.email,
                 "phone": req.body.phone,
                 "active": 1,
                 "offline_at": dateNow,
                 "online_at": dateNow
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
              const dateNow =Date.now();
              var person = new Person();
              person.id = req.body.id;
              person.name = req.body.name;
              person.urlhinh = req.body.urlhinh;
              person.email = req.body.email;
              person.phone = req.body.phone;
              person.online_at = dateNow;
              person.offline_at = dateNow;
              person.create_at = dateNow;

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
              const dateNow =Date.now();
              if(item.length>0){
                HistoryChat.updateOne({friend_id: req.body.friend_id },
                  {
                     $set: {
                       "last_message":req.body.last_message,
                       "update_at": dateNow
                     }
                  }, function() {
                     res.json({code:200,message:'Update successfully!'})
                  });
              }else {

                  var historychat = new HistoryChat();
                  historychat.user_id= req.params.id;
                  historychat.friend_id= req.body.friend_id;
                  historychat.last_message= req.body.last_message;
                  historychat.update_at= dateNow;
                  historychat.create_at= dateNow;
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
              //{ $match : { id : parseInt(req.params.id) } },
              {$lookup: {
                  from: "people",
                  localField: "id",
                  foreignField: "id",
                  as:"person"
                }
              },
              { $project: {
                  person:"$name"
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
                    res.json({data:arr})
                    // const newData = arr[0].friends;
                    //
                    // //res.json({data:arr})
                    // var newData = arr[0].friends.map(function(item){
                    //     return item.friend_id;
                    // });

                    // Person.find({ id : { $in: arr[0].friends_id } }).exec(function(err, item){
                    //   res.json({data:item})
                    // });

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
              const dateNow = Date.now();
              if(err || item===null){
                conds = {id:friend_id};
                setVal = {
                  $addToSet : {
                    "friends" : {
                      friend_id:id,
                      status:"request",
                      update_at: dateNow,
                      create_at: dateNow
                  }}
                };
                addVal = {
                  $addToSet : {
                    "friends" : {
                      friend_id:id,
                      status:"accept",
                      update_at: dateNow,
                      create_at: dateNow
                  }}
                }
              }else {
                conds = {id:friend_id,"friends.friend_id":id};
                setVal = {
                  $set : {
                    "friends.$.friend_id":id,
                    "friends.$.status":"request",
                    "friends.$.update_at":dateNow,
                    "friends.$.create_at":dateNow
                  }
                };
                addVal = {
                  $set : {
                    "friends.$.status":"accept",
                    "friends.$.update_at":dateNow
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
                      update_at: dateNow,
                      create_at: dateNow
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
                      "friends.$.update_at":dateNow
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

router.route('/conversation/:group').get(function(req, res){
    var skipping = parseInt(req.query.skip) || 0;
    var limiting = parseInt(req.query.limit) || 0;
    Conversation.find({group:req.params.group})
    .limit(limiting).skip(skipping).sort('-_create_at')
    .exec(function(err, data){
      if(err) res.json({error:"Cant not GET"})
      res.json({data})
    });
})
