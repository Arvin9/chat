var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var userList = new Array();

app.use("/static",express.static(__dirname + '/static'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/chat.html');
});

io.on('connection', function(socket){
  //绑定用户登录事件
  socket.on('userLogin', function(userName){
  	userList.push(userName);
    io.emit('userLoginList', userList);
  });
  //绑定用户发送消息事件
  socket.on('chat message', function(userName, msg){
  	//
    io.emit('chat message', userName, msg);
  });
  //绑定断开连接事件
  socket.on('disconnect',function(){
    console.log('disconnect');
    //有人断开连接，询问还有谁在线，更新用户列表
    userList = new Array();
    io.emit('who_online');
  });


});

http.listen(8765, function(){
  console.log('listening on *:8765');
});