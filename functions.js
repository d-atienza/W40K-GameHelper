// counts how many times the number appears in the dice rolls

// returns an object of how many times a number occurs
//in the array that is generated from the diceRolling function
function countNumOccurences(diceRolls) {
  let resultObj = {};

  for (let diceRoll of diceRolls) {
    if (diceRoll in resultObj) {
      resultObj[diceRoll] += 1;
    } else {
      resultObj[diceRoll] = 1;
    }
  }
  return resultObj;
}

// determines the rolls for x amount of dice
function diceRolling(stringOfDice) {
  let numberOfDice = parseInt(stringOfDice);
  let sixSided = [1, 2, 3, 4, 5, 6];
  let diceRolls = [];
  let count = 0;

  if (Number.isInteger(numberOfDice)) {
    while (count < numberOfDice) {
      const index = Math.floor(Math.random() * sixSided.length);
      diceRolls.push(sixSided[index]);
      count++;
    }
    return countNumOccurences(diceRolls);
  } else {
    return {
      instructions:
        "please input the amount of dice you will use at the top of the page",
    };
  }
}

//
/**
 * increases or decreases the turn counter by using the response(s) from the html form and action it within a case-switch statement
 * @param {"increase" |"decrease"} direction
 * @param {number} increment
 * @param {number} currTurnNum - this will take the stored counter from the SQL table and we'll update it to the number that's returned
 * @return {number} turnCount will be returned as it will represent either an increase or decrease in the turn count
 */
function adjustTurnCounterInMemory(direction, increment, currTurnNum) {
  let newTurnNum;
  if (currTurnNum < 0) {
    return 0;
  }

  console.warn(adjustTurnCounterInMemory.name, {
    direction,
    increment,
    currTurnNum,
  });
  if (direction == "increase") {
    newTurnNum = currTurnNum + increment;
  } else if (direction == "decrease") {
    newTurnNum = Math.max(0, currTurnNum - increment);
  } else {
    throw new Error("unrecognised direction");
  }
  return newTurnNum;
}

module.exports = { diceRolling, adjustTurnCounterInMemory };
