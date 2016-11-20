$(document).ready(function(e) {

	var username;
	var diceTypeTrack = {"sw_boost": 6, "sw_ability": 8, "sw_proficiency": 12, "sw_setback": 6, "sw_difficulty": 8, "sw_challenge": 12};
	var dicePositionTrack = [1,2,3,4,5,6];
	var diceActiveLevel = {"sw_boost" : 0, "sw_ability" : 0, "sw_proficiency" : 0, "sw_setback" : 0, "sw_difficulty" : 0, "sw_challenge" : 0};
	var diceColorMap = {"sw_boost": "Blue", "sw_ability": "Green", "sw_proficiency": "Yellow", "sw_setback": "Black", "sw_difficulty": "Purple", "sw_challenge": "Red"};
	var swDiceJson = {
		"dieType" : {
			"sw_boost" : {"1":[], "2":[], "3":["success"], "4":["success", "advantage"], "5":["advantage", "advantage"], "6":["advantage"]},
			"sw_ability" : {"1":[], "2":["success"], "3":["success"], "4":["success", "success"], "5":["advantage"], "6":["advantage"], "7":["success", "advantage"], "8":["advantage", "advantage"]},
			"sw_proficiency" : {"1":[], "2":["success"], "3":["success"], "4":["success", "success"], "5":["success", "success"], "6":["advantage"], "7":["success", "advantage"], "8":["success", "advantage"], "9":["success", "advantage"], "10":["advantage", "advantage"], "11":["advantage", "advantage"], "12":["triumph"]},
			"sw_setback" : {"1":[], "2":[], "3":["failure"], "4":["failure"], "5":["threat"], "6":["threat"]},
			"sw_difficulty" : {"1":[], "2":["failure"], "3":["failure", "failure"], "4":["threat"], "5":["threat"], "6":["threat"], "7":["threat", "threat"], "8":["failure", "threat"]},
			"sw_challenge" : {"1":[], "2":["failure"], "3":["failure"], "4":["failure", "failure"], "5":["failure", "failure"], "6":["threat"], "7":["threat"], "8":["failure", "threat"], "9":["failure", "threat"], "10":["threat", "threat"], "11":["threat", "threat"], "12":["despair"]},
			"sw_force" : {"1":["black"], "2":["black"], "3":["black"], "4":["black"], "5":["black"], "6":["black"], "7":["black", "black"], "8":["white"], "9":["white"],
			"10":["white", "white"], "11":["white", "white"], "12":["white", "white"]}
		}
	}
	var forceQuotes = {
		"1": "The dark side I sense in you.",
		"2": "Don't try to frighten us with your sorcerer's ways.",
		"3": "Your hate has made you powerful.",
		"4": "If once you start down the dark path, forever it will dominate your destiny.",
		"5": "You don't know the power of the dark side.",
		"6": "Your feeble skills are no match for the power of the dark side!",
		"7": "Beware of the dark side.",
		"8": "Hokey religions and ancient weapons are no match for a good blaster at your side, kid.",
		"9": "The force is strong with this one.",
		"10": "There is something strong than fear — far stronger. The Force.",
		"11": "My ally is the Force, and a powerful ally it is.",
		"12": "I am one with the Force, and the Force will guide me."
	}


	// ----------------------------------------------------------- Standard rolls -----------------------------------------------------------

	function diceRoll(number, min, max) {
		var diceRunningTotal = 0;
		// console.log("Rolling a D" + max);
		for (var numberOfRolls = 0; numberOfRolls < number; numberOfRolls++) {
			var aSingleDie = (Math.random() * ((max + 1) - min) + min);
			aSingleDie = Math.floor(aSingleDie);
			// console.log("You rolled a " + aSingleDie);
			diceRunningTotal += aSingleDie;
		}
		// console.log("running total is " + diceRunningTotal);

	return diceRunningTotal;

	}

	function buildPayload(diceType, numberRolled, modifierValue, username) {
		var payload = 'payload={';
		payload += '"channel": "#rolldembones"';
		payload += ',"username": "' + username + '"';
		payload += ',"icon_emoji": ":game_die:"';
		payload += ',"text": "Rolled ' + diceType;

		// only show modifier value if set
		if (modifierValue != 0) {

			payload += encodeURIComponent('+') + modifierValue;
			payload += ' for a result of: *' + (numberRolled + modifierValue)  + '*"';

		} else {
			payload += ' for a result of: *' + numberRolled  + '*"';

		}

		payload += '}';
		return payload;
	}

	var rollResult;

	$(".roll-btn").on("tap", function() {
		var btn_id = this.id;
		var diceNum = parseInt(btn_id[0]);
		var diceMax = parseInt(btn_id.slice(2));
		var modifierValue = parseInt($("#modifierValue").val());
		if (isNaN(modifierValue)) {
			modifierValue = 0;
		}

		rollResult = diceRoll(diceNum,1,diceMax);

		username = $('#nameInput').val();
		if (username === "") {
			username = "dicebot";
		}
		var payload = buildPayload(btn_id, rollResult, modifierValue, username);
		$.post(slackLink, payload
		);
		console.log(payload);
	});
	// --------------------------------------------------------- End Standard rolls ---------------------------------------------------------

	// ----------------------------------------------------------- SW Rolls -----------------------------------------------------------
	function swDiceRoll(activeDice) {
		var diceRunningTotal = {"success": 0, "advantage": 0, "triumph": 0, "failure": 0, "threat": 0, "despair": 0};

		for (var swDiceType in activeDice) {
			var val = activeDice[swDiceType];
			//  console.log(swDiceType + ": " + val);
		}

		for (var swDiceType in activeDice) {
			var rolls = activeDice[swDiceType];
			// console.log("rolls: " + rolls);
			for (var numberOfRolls = 0; numberOfRolls < rolls; numberOfRolls++) {
				var aSingleDie = (Math.random() * ((diceTypeTrack[swDiceType] + 1) - 1) + 1);
				aSingleDie = Math.floor(aSingleDie);
				console.log("Your dice is: " + swDiceType + ", " + "You rolled a " + aSingleDie);
				var results = getDiceFaces(swDiceType, aSingleDie);
				for (var result in results) {
					var symbol = results[result];
					console.log("result: " + results[result]);
					diceRunningTotal[symbol]++;

					// add extra success or failiure for triumphs and despair
					if (symbol == "triumph") { diceRunningTotal["success"]++; }
					if (symbol == "despair") { diceRunningTotal["failure"]++; }
				}

			}

		}

	console.log(diceRunningTotal);
	var finalRunningTotal = adjustDiceTotals(diceRunningTotal);
	console.log(finalRunningTotal);
	return finalRunningTotal;

	}

	function adjustDiceTotals(diceRunningTotal) {
		if (diceRunningTotal["success"] > diceRunningTotal["failure"] ) {
			diceRunningTotal["success"] -= diceRunningTotal["failure"];
			diceRunningTotal["failure"] = 0;
		  } else if (diceRunningTotal["failure"] > diceRunningTotal["success"] ) {
			diceRunningTotal["failure"] -= diceRunningTotal["success"];
			diceRunningTotal["success"] = 0;
		  } else {
			  diceRunningTotal["success"] = 0;
			  diceRunningTotal["failure"] = 0;
		  }

		if (diceRunningTotal["advantage"] > diceRunningTotal["threat"] ) {
			diceRunningTotal["advantage"] -= diceRunningTotal["threat"];
			diceRunningTotal["threat"] = 0;
		  } else if (diceRunningTotal["threat"] > diceRunningTotal["advantage"] ) {
			diceRunningTotal["threat"] -= diceRunningTotal["advantage"];
			diceRunningTotal["advantage"] = 0;
		  } else {
			  diceRunningTotal["advantage"] = 0;
			  diceRunningTotal["threat"] = 0;
		  }

		return diceRunningTotal;

	}

	function getDiceFaces(type, side) {
		return swDiceJson["dieType"][type][side];
	}

	function toggleClassesOnSwDice(elementId, position){
		console.log("input: " + elementId + ", " + position);
		var newDiceCountValue = position;

		// clear all faded classes selected set of dice
		for	(var i = 1; i <= 6; i++) {
			$("#"+elementId + i).addClass("faded");
		}

		// if same dice clicked as previously, clear eveything and move on
		if (position == diceActiveLevel[elementId]) {
			diceActiveLevel[elementId] = 0;
			return;
		}

		// toggle all dice below and including the one clicked
		while (position >= 0) {
			$("#"+elementId + position).toggleClass("faded");
			position--;
		}

		diceActiveLevel[elementId] = newDiceCountValue;
		console.log(diceActiveLevel);
	}

	function addClickActionToSwDiceIcons(diceTypeTrack) {
		var typeHolderArr = [];
		for (var type in diceTypeTrack) {
			typeHolderArr.push(type);
		}
		typeHolderArr.forEach( function(dieType) {
			dicePositionTrack.forEach( function(position){
				$("#"+ dieType + position).on("tap", function(){
					toggleClassesOnSwDice(dieType, position);
				});
			});
		});
	}
	addClickActionToSwDiceIcons(diceTypeTrack);

	// build payload to sent to Slack link
	function buildSwPayload(diceActiveLevel, rollResults, username, force) {

		// different function for force dice. If not force dice do this...
		if (force == false) {

			var payload = 'payload={';
			payload += '"channel": "#rolldembones"';
			payload += ',"username": "' + username + '"';
			payload += ',"icon_emoji": ":sw_lightsabers:"';
			payload += ',"text": "';

			payload += 'Rolled:';

			// outputs all the dice rolled by the user
			for (var die in diceActiveLevel) {
				var dieVal = diceActiveLevel[die];
				if (diceActiveLevel[die] > 0 ) {
					payload += ' ' + diceActiveLevel[die] + ' ' +  diceColorMap[die];
				}
			}
			payload += '. ';

			// clarify whether more than 0 succeses have been achieved. Otherwise can get confusing
			// especially with the extra success added by triumphs
			if (rollResults.success > 0) {
				payload += '*Success*';
			} else {
				payload += '*Failure*';
			}

			// Ends witha full stop if no symbols to display
			if (rollResults.success > 0 || rollResults.advantage > 0 || rollResults.failure > 0 || rollResults.threat > 0  || rollResults.triumph > 0  || rollResults.despair > 0) {
				payload += ': ';
			} else {
				payload += '.';
			}

			// inserts name of dice (e.g. "advantage") and wraps it up in the emoji format (e.g. :sw_advantage:)
			for (var resultKey in rollResults) {
				var resultVal = rollResults[resultKey];
				for (var r = 0; r < resultVal; r++)
				payload += ':sw_' + resultKey + ':'
			}

			payload += '"';
			payload += '}';
			return payload;

		} else { // ... otherwise it is a force dice, so do this

			var payload = 'payload={';
			payload += '"channel": "#rolldembones"';
			payload += ',"username": "' + username + '"';
			payload += ',"icon_emoji": ":sw_lightsabers:"';
			payload += ',"text": "';

			if (rollResults[0] == "black" ) {
					payload += '_\\\"' + forceQuotes[diceRoll(1,1,7)] + '\\\"_ ';
			} else if (rollResults[0] == "white") {
					payload += '_\\\"' + forceQuotes[diceRoll(1,8,12)] + '\\\"_ ';
			}

			for (var result in rollResults) {
				var resultVal = rollResults[result]
				payload += ':sw_f_' + resultVal + ':'
			}

			payload += '"';
			payload += '}';
			return payload;
		}
	}

	$("#sw_roll").on("tap", function() {

		// make sure some dice have actually been selected before firing a post to slack...
		var diceCounter = 0;
		$.each(diceActiveLevel, function(index, value) {
			diceCounter += value;
		});

		// ...then do this
		if (diceCounter !== 0) {

			var rollResults = swDiceRoll(diceActiveLevel);

			username = $('#nameInput').val();
			if (username === "") { username = "R2D20"; }

			var payload = buildSwPayload(diceActiveLevel, rollResults, username, false); // false refers to 'force' boolean used by force dice
			$.post(slackLink, payload
			);

			console.log(payload);
		}
	});

	$("#sw_force").on("tap", function() {

		// use simple roller for this
		var rollResult = getDiceFaces("sw_force", diceRoll(1,1,12));

		username = $('#nameInput').val();
		if (username === "") { username = "R2D20"; }

		// shares same buildSwPayload function as other dice, so pass empty array because there is no dice active level, the result array, username and force == true.
		var payload = buildSwPayload([], rollResult, username, true);
		$.post(slackLink, payload
		);

		console.log(payload);
	});

	$("#sw_percentile").on("tap", function() {

		var btn_id = "percentiles";


		rollResult = diceRoll(1,1,100);

		username = $('#nameInput').val();
		if (username === "") {
			username = "R2D20";
		}

		// Note: empty array needed in buildPayload function, otherwise it will attempt to use username as modifier.
		var payload = buildPayload(btn_id, rollResult, "", username);
		$.post(slackLink, payload
		);
		console.log(payload);
	});


	// --------------------------------------------------------- End SW rolls ---------------------------------------------------------

});
