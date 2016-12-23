var express = require('express')
var app = express()
var handler = require('./handler');

app.get('/', function (req, res) {
  handler.hello({},{},function(err, result){
    // res.send('Hello World!')
    res.send(result)
  });
  // res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Listening on Port:3000')
})
