var express = require('express');
var router = express.Router();
var userModel = require("./users");
const passport = require("passport");
var localStrategy = require("passport-local")
passport.use(new localStrategy(userModel.authenticate()));
const mongoose = require("mongoose");
const chatModel = require("./chat");

mongoose.connect("mongodb://0.0.0.0/n14-finalproject")
  .then(function () {
    console.log("connected to database")
  }).catch(function (err) {
    console.log(err)
  })

/* GET home page. */
router.get('/', isLoggedIn, async function (req, res, next) { //login user can success this page
  var currentUser = await userModel.findOne({
    username: req.user.username
  }).populate("chats")  // when u code step : 3 populate chats
  res.render('index', { user: currentUser });
});

router.post('/findUser', async (req, res, next) => {     // for finding friend-id > step 1
  var findUser = await userModel.findOne({
    username: req.body.data
  })
  if (findUser) {
    res.status(200).json({
      isUserThere: true,
      user: findUser,
    })
  }
  else {
    res.status(200).json({
      isUserThere: false,
    })
  }
})

async function socketsClear() {     // step : 2 if user is offline close socket id 
  var alluser = await userModel.find({})

  await Promise.all(alluser.map(async user => {
    user.currentSocket = ""
    await user.save()
  }))
}
socketsClear()

router.post("/getChat", isLoggedIn, async function (req, res, next) {     // step : 3 both each other sending messages
  var currentUsername = req.user._id
  var oppositeUser = await userModel.findOne({
    username: req.body.oppositeUser
  })

  var userChats = await chatModel.find({
    $or: [
      {
        fromUser: currentUsername
      }, {
        fromUser: oppositeUser._id
      }
    ],
    $or: [
      {
        toUser: currentUsername
      }, {
        toUser: oppositeUser._id
      }
    ]
  }).populate("fromUser").populate("toUser")
  res.status(200).json({
    userChats
  })
  console.log(userChats)
})

router.get('/register', function (req, res, next) {
  res.render('register');
});

router.post('/register', function (req, res, next) {
  var newUser = new userModel({
    username: req.body.username,
    pic: req.body.pic
  })
  userModel.register(newUser, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/') //register user go to / page
      })
    })
});
//user can register this express app

router.post("/login", passport.authenticate("local",
  {
    successRedirect: "/",  // --> / = chatpage-profile
    failureRedirect: "/login"
  }), function (req, res, next) { });
//existing user -> login

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect("/login");  //change route
  }
}
//for those loggedin who is authenticated or not

module.exports = router;
