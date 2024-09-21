var mongoose = require("mongoose");

var plm = require("passport-local-mongoose");

const userSchema = mongoose.Schema({
  username: String,
  pic: String,
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  chats: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  currentSocket: String,
})

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema)