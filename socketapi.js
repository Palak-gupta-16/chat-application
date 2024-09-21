const io = require("socket.io")();
const userModel = require('./routes/users')
const chatModel = require('./routes/chat')

const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("userConnected", async function (msg) {     //step 1  find id's, or socket.id <<save socket>> in currentUser 
        var currentUser = await userModel.findOne({
            username: msg.user
        })
        currentUser.currentSocket = socket.id
        await currentUser.save();
        console.log(currentUser)
    })

    socket.on("newmsg", async function (msg) {     //for send msg

        var fromUser = await userModel.findOne({     //step 2  >>>  userModel find kr rha both-user ko 
            username: msg.fromUser
        })
        msg.fromUserPic = fromUser.pic

        var toUser = await userModel.findOne({
            username: msg.toUser
        })

        var indexOfTouser = fromUser.chats.indexOf(toUser._id)     // step : 5 chat array
        console.log(indexOfTouser)
        
        if (indexOfTouser == -1) {   //initialize new chat coming
            msg.isNewChat = true
            fromUser.chats.push(toUser._id)
            toUser.chats.push(fromUser._id)
            await fromUser.save()
            await toUser.save()
        }

        var newChat = chatModel.create({     //step 3 require chatModel
            msg: msg.data,
            fromUser: fromUser._id,
            toUser: toUser._id,
            time: Date.now(),
        })

        
        if (toUser.currentSocket) {     // step 4   >>>  user msg emit kr rha toUser ko (for show friend id)
            console.log(toUser.currentSocket)
            socket.to(toUser.currentSocket).emit("newmsg", msg)
        }
        else {
            console.log("to user offline")
        }
        console.log(newChat)

    })

});

// end of socket.io logic

module.exports = socketapi;