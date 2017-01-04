var express = require('express')
var app = express();

app.get('/', function (req, res) {
  res.send('Hello 2')
})

app.get('/hello', function (req, res) {
  res.send('Hello 2')
})

app.listen(3000, function () {
  console.log('Listening on Port:3000')
})
