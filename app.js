const express = require("express");
const sqlite3 = require("sqlite3");

const { open } = require("sqlite");
const path = require("path");

const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000);
  } catch (err) {
    console.log(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// API - 1 : return a list of all the players from the team

const convertDbObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
    jerseyNumber: objectItem.jersey_number,
    role: objectItem.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id`;
  const getPlayersQueryResponse = await db.all(getPlayersQuery);
  response.send(
    getPlayersQueryResponse.map((eachPlayer) => convertDbObject(eachPlayer))
  );
});

// API - 2 : Create (or) Add a player into team

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = ` INSERT INTO cricket_team(player_name,
    jersey_number,role) 
    values('${playerName}',${jerseyNumber},'${role}');`;
  const createPlayerQueryResponse = await db.run(createPlayerQuery);
  response.send(`Player Added to Team`);
});

// API - 3 : Get the player details based on the player id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `SELECT * FROM cricket_team WHERE 
  player_id = ${playerId};`;
  const getPlayerDetailsQueryResponse = await db.get(getPlayerDetailsQuery);
  response.send(convertDbObject(getPlayerDetailsQueryResponse));
});

//API - 4 update the details of the player using player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerDetailsQuery = `UPDATE cricket_team SET 
  player_name = '${playerName}' , jersey_number = ${jerseyNumber} , role = '${role}' 
  where player_id = ${playerId};`;
  await db.run(updatePlayerDetailsQuery);
  response.send("Player Details Updated");
});

// API - 5 : delete the player details

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
