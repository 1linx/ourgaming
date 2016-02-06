var randomOrgApiData = [];
var request = require('request');
var https = require('https');


module.exports = function (req, res, next) {
  // default roll is 1d6
  var matches;
  var times = 1;
  var die = 6;
  var modifier = 0;
  var rolls = [];
  var total = 0;
  var botPayload = {};
  var rollText = "1d6";


  function roll (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }


  function send (payload, callback) {
    var path = process.env.INCOMING_WEBHOOK_PATH;
    var uri = 'https://hooks.slack.com/services' + path;

    request({
      uri: uri,
      method: 'POST',
      body: JSON.stringify(payload)
    }, function (error, response, body) {
      if (error) {
        return callback(error);
      }

      callback(null, response.statusCode, body);
    });
  }


  if (req.body.text) {
    // remove spaces from incoming text
    rollText = req.body.text.replace(/\s+/g, '');
    // parse roll type if specified
    matches = rollText.match(/^(\d{1,3})(d|D)(\d{1,3})$|^(\d{1,3})(d|D)(\d{1,3})(\+|\-)(\d{1,3})$/);

    if (matches && matches[1] && matches[2] && matches[3]) {
      times = matches[1];
      die = matches[3];

    } else if (matches && matches[4] && matches[5] && matches[6] && matches[7] && matches[8]) {
      times = matches[4];
      die = matches[6];
      modifier = parseInt(matches[8]);

    } else {
      // send error message back to user if input is bad 
      return res.status(200).send('Something went wrong there. Make sure you have a number, followed by \'d\' followed by another number. Right now you\'re sending: ' + req.body.text);

    }
  }

var params = {
        "apiKey": "deb0a73d-9211-4a7c-a194-7633d23d5193",
        "n": times,
        "min": 1,
        "max": die,
        "replacement": true,
        "base": 10
    };

// Random.org api call controls:
// create the JSON object
jsonObject = {
    "jsonrpc": "2.0",
    "method": "generateIntegers",
    params,
    "id": 1337

}

jsonObject = JSON.stringify(jsonObject);
 
// prepare the header
var postheaders = {
    'Content-Type' : 'application/json',
    'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
};
 
// the post options
var optionspost = {
    host : 'api.random.org',
    port : 443,
    path : '/json-rpc/1/invoke',
    method : 'POST',
    headers : postheaders
};
 
console.info('Options prepared:');
console.info(optionspost);
console.info('Do the POST call');
 var rollData;
// do the POST call
var reqPost = https.request(optionspost, function(res) {
 
    res.on('data', function(d) {
        process.stdout.write(d);
        rollData = JSON.parse(d);

        // organising returned roll data
        for (var i = 0; i < times; i++) {          
          rolls.push(rollData.result.random.data[i]);
          total += parseInt(rolls[i]);
          modifiedTotal = parseInt(total);
        }



        //if roll was sent with plus sign, add it to total, else subtract it.
        if (matches[7] == "+") {
           modifiedTotal += modifier;
        } else if (matches[7] == "-") {
            modifiedTotal -= modifier;
          // write response message and add to payload
        }
        if (times > 1 && modifier < 1) {
          // if rolling more one than dice, but with no modifier, show all dice and calculated total
          botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + ':\n' +
                            rolls.join(' + ') + ' = *' + total + '*';
        } else if (times > 1 && modifier >= 1) {    
          // if rolling more one than dice with modifier, show all dice in brackets, plus modifier, and calculated total
          botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + ' ' + matches[7]+ ' ' + modifier+ ':\n' +
                            '(' + rolls.join(' + ') + ') '+ matches[7]+ ' ' + modifier + ' = *' + modifiedTotal + '*';
        } else if (times == 1 && modifier >= 1){
          // if rolling one dice,with modifier, show dice plus modifier and calculated total
          botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + ' ' + matches[7]+ ' ' + modifier + ':\n' +
                            total + ' ' + matches[7]+ ' ' + modifier + ' = *' + modifiedTotal + '*';
        } else {
          // if rolling one dice with no modifier, show rolled value only.
          botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + ':\n' +
                            '*' + total + '*';
        }

    });
});


// write the json data
reqPost.write(jsonObject);
reqPost.end();
reqPost.on('error', function(e) {
     botPayload.text = e;

});

  // // roll dice and sum
  // for (var i = 0; i < times; i++) {
  //   var currentRoll = roll(1, die);
  //   rolls.push(currentRoll);
  //   total += currentRoll;
  // }

setTimeout(function() {

        botPayload.username = 'dicebot';
        botPayload.channel = req.body.channel_id;
        botPayload.icon_emoji = ':game_die:';

        // send dice roll
        send(botPayload, function (error, status, body) {
          if (error) {
            return next(error);

          } else if (status !== 200) {
            // inform user that our Incoming WebHook failed
            return next(new Error('Incoming *WebHook*: ' + status + ' ' + body));

          } else {
            return res.status(200).end();
          }
        });
        }, 3000);
}

