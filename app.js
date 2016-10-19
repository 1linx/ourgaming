var hellobot = require('./hellobot');
var dicebot = require('./dicebot');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var port = process.env.PORT || 3000;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));


// test route
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// route that listens for a POST to /hello
app.post('/hello', hellobot);

// route that listens for a POST to /roll
app.post('/roll', dicebot);

//static route for images
// app.use(express.static('./imgs'));
app.use('/static', express.static('./imgs'));


// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});


app.listen(port, function () {
  console.log('Slack bot listening on port ' + port);
});