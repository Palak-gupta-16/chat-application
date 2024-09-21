var adduser = document.querySelector("#add-user")
var upperlayer = document.querySelector("#upper-layer")
var layercontainer = document.querySelector("#layer-container")
var close = document.querySelector(".close")

adduser.addEventListener("click", function () {
  upperlayer.style.display = "initial"
})

close.addEventListener("click", function () {
  upperlayer.style.display = "none"
})

window.addEventListener("click", function (event) {
  if (event.target == upperlayer) {
    upperlayer.style.display = "none"
  }
})

var chats = document.querySelector("#chats")
var right = document.querySelector("#right")
var currentOppositeUser = ""

function addChat(username, image) {     //step 1 show friend id
  chats.innerHTML += `<div onclick="openChat('${username}','${image}')"  class="chat">
    <div id="user-pic">
      <img src="${image}" alt="">
    </div>
    <div class="text2">
      <h2>${username}</h2>
    </div>
  </div>`
}

var form = document.querySelector("#findUser")     //step 3 > findUser input ki value ko find krke addChat open hoga nhi toh no user found
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  var friendUser = document.querySelector("#friend-user")

  var response = await axios.post('/findUser', {
    data: friendUser.value
  })

  if (response.data.isUserThere) {
    addChat(response.data.user.username, response.data.user.pic)
  }
  else {
    alert('no user found')
  }
})

async function openChat(username, image) {     //step 2 > show all right div data

  var response = await axios.post('/getChat', {
    oppositeUser: username
  })

  var userChats = response.data.userChats
  var clutter = ''
  userChats.forEach(function (chat) {
    if (chat.fromUser.username == username) {
      clutter += `<div class="conver outgoing">
      <div class="msg">${chat.msg}</div>
      <div class="time">25/2/23</div>
    </div>`
    }
    else {
      clutter += `<div class="conver incoming">
      <div class="msg">${chat.msg}</div>
      <div class="time">25/2/23</div>
    </div>`
    }
  }) 

  currentOppositeUser = username;
  right.innerHTML = `<div id="right-nav">
    <div id="chat2">
      <div id="user-pic">
        <img src="${image}" alt="">
      </div>
      <div class="text3">
        <h2>${username}</h2>
      </div>
    </div>
  </div>
  <div id="conversation">
  ${clutter}
  </div>
  <input type="text" onchange="newmsg()" id="msg-input" placeholder="Start new conversation" />`
}






