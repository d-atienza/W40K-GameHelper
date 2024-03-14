const { app } = require("./support/setupExpress");
const { query } = require("./support/db");
const { diceRolling, adjustTurnCounterInMemory } = require("./functions");

////////////////////////////

app.get("/", async (req, res) => {
  await query("DELETE FROM points;");
  await query("DELETE FROM turn_number;");

  res.render("index");
});

////////////////////////////

app.post("/tabledata", async (req, res) => {
  const player1 = req.body.player1;
  const player2 = req.body.player2;

  await query(
    "INSERT INTO points (player, primaryPoints, secondaryPoints, commandPoints) VALUES ($1, 0, 0, 0), ($2, 0, 0, 0)",
    [player1, player2]
  ); // inserts into points table

  await query("insert into turn_number (turnNum) values (1);"); // inserts into turn table, begins at turn 1

  res.redirect("points");
});

////////////////////////////

// MUST FIGURE OUT WHAT REQ.QUERY IS AND WHY IT COMES UP AS BLAHHH

app.get("/points", async (req, res) => {
  console.log({ "req.query": req.query });
  if (!("direction" in req.query)) {
    showStartingPointsPage(req, res);
  } else {
    processPointsUpdateAndShowUpdatedPage(req, res);
  }
});

//TURN COUNTER FUNCTIONS
// grabs turn number from database
async function getCurrentTurnNumber(req) {
  const dbResult = await query("SELECT turnNum from turn_number");
  const dbArray = dbResult.rows;
  return dbArray[0].turnnum;
}

// displays turn number as the page initially renders
async function showStartingPointsPage(req, res) {
  const currTurnNum = await getCurrentTurnNumber(req);
  const pointsTableDetails = await getCurrentPointsNumbers(req);

  res.render("points", { currTurnNum, pointsTableDetails });
}

// processes current turn number as it updates
async function processPointsUpdateAndShowUpdatedPage(req, res) {
  const pointsTableDetails = await getCurrentPointsNumbers(req);
  const currTurnNum = await getCurrentTurnNumber(req);

  // takes query from page and determines if increase or decrease
  let direction = req.query.direction?.toString() ?? "";
  let increment = parseInt(req.query.increment?.toString() ?? "");

  //validate user input: req.query could contain ANYTHING from a malicious user.
  if (direction !== "increase" && direction !== "decrease") {
    res.status(400).send("bad direction" + direction);
    return;
  }

  if (isNaN(increment)) {
    return res.status(400).send("bad increment" + increment);
  }

  // increases or decreases the turn number
  let newTurnNum = adjustTurnCounterInMemory(direction, increment, currTurnNum);

  console.log({ where: "in app.js", newTurnNum });
  // inserts into turn table
  await query("UPDATE turn_number SET turnNum = $1 WHERE turnNum = $2", [
    newTurnNum,
    currTurnNum,
  ]);

  res.render("points", { currTurnNum, pointsTableDetails });
}

////////////////////////////
// GET POINTS FUNCTIONS (add these into the existing points page functions)
// grabs points number from database
async function getCurrentPointsNumbers(req) {
  const dbResult = await query("SELECT * from points"); //pulls all the data including names!
  const dbArray = dbResult.rows;
  return dbArray; //NEED TO DOUBLECHECK
}

// displays points number as the page initially renders
// async function showStartingPointsPage(req, res) {
//   const pointsTableDetails = await getCurrentPointsNumbers(req);
//   res.render("points", { pointsTableDetails });
// }

////////////////////////////

app.get("/diceroll", (req, res) => {
  let inputDice = req.query.diceNumber;

  res.render("diceroll", { resultObj: diceRolling(inputDice) });
});

////////////////////////////

// use the environment variable PORT, or 3000 as a fallback if it is undefined
const PORT_NUMBER = process.env.PORT ?? 3000;

//start the server listening indefinitely
app.listen(PORT_NUMBER, () => {
  console.log(
    `Your express app started listening on ${PORT_NUMBER} at ${new Date()}`
  );
});

//////
