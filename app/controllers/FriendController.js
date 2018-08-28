var ListFriend = require('../models/ListFriend');

exports.updateFriend = (id,friend_id,status) => {
  return ListFriend.update({id},
  {
    $addToSet : {
      "friends" : {
        friend_id,
        status,
        update_at: Date.now()
    }}
  });
}

exports.addNewFriend = (id,friends) => {
  var listfriend = new ListFriend();
  listfriend.id= id;
  listfriend.friends= friends;
  listfriend.save();
}
