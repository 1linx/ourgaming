var request = require('request');

module.exports = function (req, res, next) {
  // default roll is 2d6
  var matches;
  var times = 1;
  var die = 6;
  var qualifier = 0;
  var rolls = [];
  var total = 0;
  var botPayload = {};

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
      qualifier = parseInt(matches[8]);

    } else {
      // send error message back to user if input is bad UPDATE THIS MESSAGE
      return res.status(200).send('Something went wrong there. Make sure you have a number, followed by \'d\' followed by another number. Right now you\'re sending: ' + req.body.text);

    }
  }

  // roll dice and sum
  for (var i = 0; i < times; i++) {
    var currentRoll = roll(1, die);
    rolls.push(currentRoll);
    total += currentRoll;
  }
  qualifiedTotal = parseInt(total);
  qualifiedTotal += qualifier;
    // write response message and add to payload
  if (times > 1 && qualifier < 1) {
    // if rolling more one than dice, but with no qualifier, show all dice and calculated total
    botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + ':\n' +
                      rolls.join(' + ') + ' = *' + total + '*';
  } else if (times > 1 && qualifier >= 1) {    
    // if rolling more one than dice with qualifier, show all dice in brackets, plus qualifier, and calculated total
    botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + ' + ' + qualifier + ':\n' +
                      '(' + rolls.join(' + ') + ') + ' + qualifier + ' = *' + qualifiedTotal + '*';
  } else if (times == 1 && qualifier >= 1){
    // if rolling one dice,with qualifier, show dice plus qualifier and calculated total
    botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + ' + ' + qualifier + ':\n' +
                      total + ' + ' + qualifier + ' = *' + qualifiedTotal + '*';
  } else {
    // if rolling one dice with no qualifier, show rolled value only.
    botPayload.text = req.body.user_name + ' rolled ' + times + 'd' + die + ':\n' +
                      '*' + total + '*';
  }

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
}


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
