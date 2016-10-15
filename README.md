# socket.io 实现在线聊天室
### 开发语言、环境
* node.js
* win7

### 
> 在学习WebSocket的时候，发现node.js的socket.io模块对WebSocket进行了封装更加方便开发者使用，便开始学习socket.io并以在线聊天室作为学习项目。

### node.js
> node.js是一个JavaScript运行环境，简单的说就是运行在服务端的node.js

* 基础教程推荐[Node.js菜鸟教程](http://www.runoob.com/nodejs/nodejs-tutorial.html)
* 安装包推荐4.6.0LTS[Node.js官网](https://nodejs.org/en/)
* 本项目代码主要参考[socket.io官网的例子](http://socket.io/get-started/chat/)
* 界面则采用CSS框架[bootstrap](http://v3.bootcss.com/)

> node.js是通过事件和回调来支持并发的，所以很好的理解它的事件机制有助于接下来的编程。

### 业务逻辑
1. 用户需登录后才能发生消息，如未登陆则弹出登陆框
2. 用户发送消息，服务端接收后转发给所有用户
3. 当有用户离线，服务端群发询问还有谁在线，并更新用户列表

### 项目目录结构
	chat
  	  --node_modules
  	  --static
	  --views
      app.js

* node_modules主要是存放node.js的各种模块
* static用来存放一些静态资源，这里放的是bootstrap
* views用来存放页面，本项目放的是chat.html
* app.js则是服务端，监听各种事件并处理

### express模块
> express是一个基于Node.js平台的极简、灵活的 web 应用开发框架，它提供一系列强大的特性，帮助你创建各种 Web 和移动设备应用。

* 本聊天室的应用


		var express = require('express');
		var app = express();
		var http = require('http').Server(app);
		var io = require('socket.io')(http);
		
		var userList = new Array();
		
		app.use("/static",express.static(__dirname + '/static'));
		
		app.get('/', function(req, res){
		  res.sendFile(__dirname + '/views/chat.html');
		});


### 代码
> 代码主要在chat.html和app.js两个文件


#### app.js
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

#### chat.html
	<!doctype html>
	<html>
	  <head>
	    <title>聊天室</title>
	    <meta name="viewport" content="width=device-width,initial-scale=1">
	    <link rel="stylesheet" href="/static/css/bootstrap.min.css">
	    <link rel="stylesheet" href="/static/css/bootstrap-theme.min.css">
	    
	    <style></style>
	  </head>
	  <body>
	    <div class="container">
	      <div class="page-header">
	        <h1>聊天室 <small>——畅所欲言</small></h1>
	      </div>
	      <div class="row">
	        <div class="col-xs-3 panel panel-default">
	          <div class="panel-body" id="userListDiv" style="overflow-y:auto;height:350px;">
	
	            <table class="table table-striped" id="userList">
	              
	            </table>
	          </div>
	        </div>
	
	        <div class="col-xs-9 panel panel-default">
	          <div class="panel-body" id="messagesDiv" style="overflow-y:auto;height:350px;">
	            <table class="table table-striped" id="messages">
	            </table>
	    
	          </div>
	        </div>
	      </div>
	
	      <form action="" class="form">
	        <div class="form-group">
	          <div class="col-xs-offset-3 col-xs-7">
	            <input id="m" class="form-control"  autocomplete="off" />
	          </div>
	          <div class="col-xs-1">
	            <button class="btn btn-default">Send</button>
	          </div>
	        </div>
	      </form>
	    </div>
	
	    <div id="myModal" class="modal fade bs-example-modal-sm" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
	      <div class="modal-dialog modal-sm">
	        <div class="modal-content">
	          <div class="modal-header">
	            <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
	            <h4 class="modal-title">登录</h4>
	          </div>
	          <div class="modal-body">
	            <form class="form" role="form">
	              <div class="form-group">
	                <input type="email" class="form-control" id="inputUserName" placeholder="用户名">
	              </div>
	            </form>
	          </div>
	          <div class="modal-footer">
	            <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
	            <button type="button" class="btn btn-primary" id="login">确定</button>
	          </div>
	        </div>
	      </div>
	      
	    </div>
	    <script src="/socket.io/socket.io.js"></script>
	    <script src="/static/js/jquery.min.js"></script>
	    <script src="/static/js/bootstrap.min.js"></script>
	    <script>
	      var userName = '';
	      var userList = new Array();
	      $(function(){
	        $('#myModal').modal('show');
	      });
	      //用户登录
	      $('#login').click(function(){
	        userName = $('#inputUserName').val();
	        if(!userName) return false;
	        socket.emit('userLogin', userName);
	        $('#myModal').modal('hide');
	      });
	
	      var socket = io();
	      //用户发送消息
	      $('form').submit(function(){
	        if(!userName) {
	          $('#myModal').modal('show');
	          return false;
	        }
	        socket.emit('chat message', userName, $('#m').val());
	        $('#m').val('');
	        return false;
	      });
	      //绑定用户登录列表事件
	      socket.on('userLoginList', function(userList){
	        $('#userList').empty();
	        for (i=0, len=userList.length; i<len; i++){
	          $('#userList').append($('<tr>').append($('<td>').text(userList[i])));
	        }
	        document.getElementById('userListDiv').scrollTop=document.getElementById('userListDiv').scrollHeight;
	      });
	      //绑定用户发送信息事件
	      socket.on('chat message', function(userName,msg){
	        $('#messages').append($('<tr>').append($('<td>').html(showMessage(userName,msg))));
	        document.getElementById('messagesDiv').scrollTop=document.getElementById('messagesDiv').scrollHeight;
	      });
	      //绑定用户在线事件
	      socket.on('who_online', function(){
	        socket.emit('userLogin', userName);
	      });
	
	      function showMessage(userName,msg){
	        var content = '<span class="label label-info">'+ currentTime() +'</span>'+
	        '<span class="label label-primary">'+ userName +'</span><br>' +
	        '<strong>'+ msg +'</strong>';
	        return content;
	      }
	      
	      function currentTime(){
	        var date = new Date();
	        var year = date.getFullYear();
	        var month = date.getMonth()+1;
	        var d = date.getDate();
	        var h = date.getHours();
	        var m = date.getMinutes();
	        var s = date.getSeconds();
	        month = month>9?month:('0'+month);
	        d = d>9?d:('0'+d);
	        h = h>9?h:('0'+h);
	        m = m>9?m:('0'+m);
	        s = s>9?s:('0'+s);
	        var time = ''+year+'-'+month+'-'+d+' '+h+':'+m+':'+s;
	        return time;      
	      }
	    </script>
	  </body>
	</html>