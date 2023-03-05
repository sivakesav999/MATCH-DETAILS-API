const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
let dataBase = null;
DbPath = path.join(__dirname, "cricketMatchDetails.db");
const initializeDBAndServer = async () => {
  try {
    dataBase = await open({
      filename: DbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB ERROR : ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//player_details, match_details, player_match_score

// API 1
app.get("/players/", async (request, response) => {
  const Query = `SELECT * FROM player_details;`;
  const player_array = await dataBase.all(Query);
  response.send(player_array);
});
// API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const player_array = await dataBase.get(query);
  response.send(player_array);
});
//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const body = request.body;
  const { player_name } = body;
  const query = `UPDATE player_details
    SET player_name = '${player_name}'
    WHERE player_id = ${playerId};`;
  await dataBase.run(query);
  response.send("Player Details Updated");
});
//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const array = await dataBase.get(query);
  response.send(array);
});
//API 5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getMatchId = `SELECT match_Id FROM player_match_score WHERE player_id = ${playerId};`;
  const array_1 = await dataBase.get(getMatchId);
  const query = `SELECT match_id as matchId, match, year FROM match_details WHERE player_id = ${array_1.match_id};`;
  const array_2 = await dataBase.all(query);
  response.send(array_2);
});
//API 6
//Returns a list of players of a specific match...
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerId = `SELECT player_id FROM player_match_score WHERE match_id = ${matchId};`;
  const playerIdResponse = await dataBase.get(getPlayerId);
  const getPlayerDetails = `SELECT * FROM player_details WHERE player_id = ${playerIdResponse.player_id};`;
  response.send({
    playerId: getPlayerDetails.playerId,
    playerName: getPlayerDetails.playerName,
  });
});
//API 7
// Returns the statistics of the total score, fours, sixes of a specific player based on the player ID
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerIdQuery = `SELECT player_id, player_name FROM player_details WHERE player_id = ${playerId};`;
  const QueryArray = await dataBase.get(playerIdQuery);
  const detailsQuery = `SELECT SUM(score) as totalScore, SUM(four) as totalFours, SUM(sixes) as totalSixes FROM player_match_score WHERE player_id = ${QueryArray.player_id};`;
  const detailsArray = await dataBase.get(detailsQuery);
  response.send({
    playerId: QueryArray.playerId,
    playerName: QueryArray.player_name,
    totalScore: detailsArray.totalScore,
    totalFours: detailsArray.totalFours,
    totalSixes: detailsArray.totalSixes,
  });
});

module.exports = app;
