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
      conversation.group = data.group;
      conversation.id = data.id;
      conversation.message = data.message;
      conversation.create_at = create_at;
      conversation.save(function(err) {
      }); // save conversation
      const dateNow = new Date();
      data = Object.assign(data,{create_at: dateNow})
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
             }
           });

           HistoryChat.findOne({id:req.body.id}).exec(function(err, item){
             if(err || item===null){
               let historychat = new HistoryChat();
               historychat.id=req.body.id;
               historychat.history=[];
               historychat.save();
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
                //res.json({code:200,message:'Data inserted successfully!'})
              }
            });
            HistoryChat.findOne({id:req.body.id}).exec(function(err, item){
              if(err || item===null){
                let historychat = new HistoryChat();
                historychat.id=req.body.id;
                historychat.history=[];
                historychat.save();
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
router.route('/static-friend/:id').get(function(req, res){
          if(req.params.id>0){
            ListFriend.aggregate([
              {"$match":{"id":parseInt(req.params.id)}},
              {$unwind: "$friends" },
              {$group: { _id: "$friends.status", count: { $sum: 1 } }},
              {$project:{_id:0,status:"$_id",count:1}},
              {$group:{newData:{$push:
                {"status":"$status","count":"$count"}
              }}}
            ]).exec(function(err, arr){
                  if(arr===null || err){
                      if(err) res.json(err)
                      res.json({code:200,data:[]})
                  }else {
                    res.json({data:arr})
                  }
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
              {"$match":{"id":parseInt(req.params.id)}},
              { $project: {
                    friends: {
                      $filter: {
                        input: "$friends",
                        as: "friend",
                        cond: {$eq: ['$$friend.status', req.params.status]}
                    }}}
                },{$unwind: "$friends"},{
                  $lookup: {
                      from: "people",
                      localField: "friends.friend_id",
                      foreignField: "id",
                      as: "profile"
                  }
              },{ $project: {
                  id:{ $reduce: {
                      input: "$profile.id",
                      initialValue: 1,
                      in: { $multiply: [ "$$value", "$$this" ] }
                  }},
                  name:{ $reduce: {
                      input: "$profile.name",
                      initialValue: '',
                      in: { $concat: [ "$$value", "$$this" ] }
                  }},
                  urlhinh:{ $reduce: {
                      input: "$profile.urlhinh",
                      initialValue: '',
                      in: { $concat: [ "$$value", "$$this" ] }
                  }},
                  email:{ $reduce: {
                      input: "$profile.email",
                      initialValue: '',
                      in: { $concat: [ "$$value", "$$this" ] }
                  }},
                  phone:{ $reduce: {
                      input: "$profile.phone",
                      initialValue: '',
                      in: { $concat: [ "$$value", "$$this" ] }
                  }},
                  status:"$friends.status"
                }
              }

            ]).exec(function(err, arr){
                  if(arr===null || err){
                      if(err) res.json(err)
                      res.json({code:200,data:[]})
                  }else {
                    res.json({data:arr})
                    // var newData = arr[0].friends.map(function(item){
                    //     return item.friend_id;
                    // });

                  }
            });
        }else {
          res.json({error:"Cant not GET"})
        }

})
router.route('/history-chat/:id').get(function(req, res){
          var skipping = parseInt(req.query.skip) || 0;
          var limiting = parseInt(req.query.limit) || 0;
          if(req.params.id>0){
            // HistoryChat.find({id:req.params.id})
            // .limit(limiting).skip(skipping).sort('-_update_at')
            // .exec(function(err, data){
            //   res.json({data});
            // });

            HistoryChat.aggregate([
              {"$match":{"id":parseInt(req.params.id)}},
              {$unwind: "$history"},{
                  $lookup: {
                      from: "people",
                      localField: "history.friend_id",
                      foreignField: "id",
                      as: "profile"
                  }
              },{ $project: {
                  id:{ $reduce: {
                      input: "$profile.id",
                      initialValue: 1,
                      in: { $multiply: [ "$$value", "$$this" ] }
                  }},
                  name:{ $reduce: {
                      input: "$profile.name",
                      initialValue: '',
                      in: { $concat: [ "$$value", "$$this" ] }
                  }},
                  urlhinh:{ $reduce: {
                      input: "$profile.urlhinh",
                      initialValue: '',
                      in: { $concat: [ "$$value", "$$this" ] }
                  }},
                  last_message:"$history.last_message",
                  update_at:"$history.create_at"
                }
              },{ $sort : { update_at : -1}}
            ]).limit(limiting).skip(skipping).exec(function(err, arr){
                  if(arr===null || err){
                      if(err) res.json(err)
                      res.json({code:200,data:[]})
                  }else {
                    res.json({data:arr})
                  }
            });
          }else {
            res.json({error:"Cant not GET"})
          }
        })
router.route('/add-history').post(function(req,res){
      const id = parseInt(req.body.id);
      const friend_id = parseInt(req.body.friend_id);
      const message = req.body.message;
      if(id>0){
        const dateNow = new Date();
        HistoryChat.findOne({id,"history.friend_id":friend_id}).exec(function(err, item){
          let mycond,friendcond,myVal,friendVal;
          if(item===null){
            mycond = {id};
            friendcond = {id:friend_id};
            myVal = {
              $addToSet : {
                    "history" : {
                        friend_id,
                        last_message: message,
                        create_at:dateNow
              }}
            };
            friendVal = {
              $addToSet : {
                    "history" : {
                        friend_id:id,
                        last_message:message,
                        create_at:dateNow
              }}
            };
          }else {
            mycond = {id,"history.friend_id":friend_id };
            friendcond = {id:friend_id,"history.friend_id":id };
            myVal = { $set: {
                 "history.$.last_message":message,
                 "history.$.create_at":dateNow
               }
            };
            friendVal = { $set: {
                 "history.$.last_message":message,
                 "history.$.create_at":dateNow
               }
            };
          }
          HistoryChat.updateOne(mycond,myVal,function(){
            HistoryChat.updateOne(friendcond,friendVal,function(){
              res.json({data:el})
            });
          });

        })
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
