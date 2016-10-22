var hellobot = require('./hellobot');
var dicebot = require('./dicebot');
var express = require('express');
var bodyParser = require('body-parser');

var app = require('express')();
var port = process.env.PORT || 3000;


// set the view engine to ejs
app.set('view engine', 'ejs');

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));


// original roll, deprecated
// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/index.html');
// });

// testing views
var slackLink = "https://hooks.slack.com/services/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";
app.get('/', function (req, res) {
    res.render('roller', {
        slackLink: slackLink
    });
});

// test route
// app.get('/test', function (req, res) {
//     res.render('test');
// });

// route that listens for a POST to /hello
app.post('/hello', hellobot);

// route that listens for a POST to /roll
app.post('/roll', dicebot);

//static route for images
// app.use(express.static('./imgs'));
app.use('/static', express.static('./public'));


// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});


app.listen(port, function () {
  console.log('Slack bot listening on port ' + port);
  
});