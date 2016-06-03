var
  server = require('http').createServer(),
  express = require('express'),
  app = express();
  // port = 3000;
var 
  WebSocketServer = require('ws').Server,
  wss = new WebSocketServer({ server: server });  

var Bot = require("../app/bot.js");

//Websocket接続を保存しておく
var connections = [];

app.use(express.static('app')); 
 
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

wss.on('connection', function(ws) {

  console.log('connection start');

  //配列にWebSocket接続を保存
  connections.push(ws);

  ws.on('message', function(message) {
    console.log('message:', message);
    broadcast(JSON.stringify({data: message}));
    var msgAr = message.split(' ');
    if (msgAr[0] == 'bot' && msgAr.length == 3) {
      var cmdData = {
        "command": msgAr[1],
        "data": msgAr[2], 
      };
      var bot = new Bot(cmdData);
      bot.generateHash();
      broadcast(JSON.stringify({data: bot.hash}));
    }
  });

  ws.on('close', function () {
    connections = connections.filter(function (conn, i) {
      return (conn === ws) ? false : true;
    });
  });

});

//ブロードキャストを行う
function broadcast(message) {
  connections.forEach(function (con, i) {
    con.send(message);
  });
};

server.on('request', app);
server.listen(port, function () { console.log('Listening on ' + server.address().port) });
