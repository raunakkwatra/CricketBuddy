require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Query with fallback for alternative table naming conventions (e.g., CricketTeam vs TEAM)
async function executeQuery(primarySql, fallbackSql, params = []) {
  try {
    return await pool.query(primarySql, params);
  } catch (err) {
    if ((err.code === 'ER_NO_SUCH_TABLE' || err.errno === 1146) && fallbackSql) {
      return await pool.query(fallbackSql, params);
    }
    throw err;
  }
}

// Helper: Standard error response handler with foreign key detection
function handleDbError(res, error, actionMessage) {
  console.error(`${actionMessage}:`, error.message);
  if (error.code === 'ER_ROW_IS_REFERENCED_2' || (error.message && error.message.includes('foreign key constraint fails'))) {
    return res.status(409).json({
      error: 'Cannot delete or modify this record because related tournament data references it (Foreign Key constraint). Please remove or reassign associated records first.'
    });
  }
  return res.status(500).json({ error: actionMessage });
}

// ==========================================================================
// 1. Health & Database Status
// ==========================================================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    res.status(500).json({ status: 'error', database: false });
  }
});

// ==========================================================================
// 2. Teams API (CRUD)
// ==========================================================================
app.get('/api/teams', async (req, res) => {
  try {
    const [rows] = await executeQuery(
      'SELECT * FROM CricketTeam ORDER BY TeamID ASC',
      'SELECT * FROM TEAM ORDER BY TeamID ASC'
    );
    res.json(rows);
  } catch (error) {
    handleDbError(res, error, 'Could not fetch teams');
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const { TeamName, Coach, HomeGround, Owner } = req.body;
    if (!TeamName || !TeamName.trim()) {
      return res.status(400).json({ error: 'TeamName is required' });
    }

    const [result] = await executeQuery(
      `INSERT INTO CricketTeam (TeamName, Coach, HomeGround, Owner) VALUES (?, ?, ?, ?)`,
      `INSERT INTO TEAM (TeamName, Coach, HomeGround, Owner) VALUES (?, ?, ?, ?)`,
      [TeamName.trim(), Coach || null, HomeGround || null, Owner || null]
    );

    res.status(201).json({
      TeamID: result.insertId,
      TeamName: TeamName.trim(),
      Coach,
      HomeGround,
      Owner
    });
  } catch (error) {
    handleDbError(res, error, 'Could not create team');
  }
});

app.put('/api/teams/:id', async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const { TeamName, Coach, HomeGround, Owner } = req.body;

    if (!TeamName || !TeamName.trim()) {
      return res.status(400).json({ error: 'TeamName is required' });
    }

    const [result] = await executeQuery(
      `UPDATE CricketTeam SET TeamName = ?, Coach = ?, HomeGround = ?, Owner = ? WHERE TeamID = ?`,
      `UPDATE TEAM SET TeamName = ?, Coach = ?, HomeGround = ?, Owner = ? WHERE TeamID = ?`,
      [TeamName.trim(), Coach || null, HomeGround || null, Owner || null, teamId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({
      message: 'Team updated successfully',
      TeamID: teamId,
      TeamName: TeamName.trim(),
      Coach,
      HomeGround,
      Owner
    });
  } catch (error) {
    handleDbError(res, error, 'Could not update team');
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    const [result] = await executeQuery(
      `DELETE FROM CricketTeam WHERE TeamID = ?`,
      `DELETE FROM TEAM WHERE TeamID = ?`,
      [teamId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ message: 'Team deleted successfully', TeamID: teamId });
  } catch (error) {
    handleDbError(res, error, 'Could not delete team');
  }
});

// ==========================================================================
// 3. Players API (CRUD)
// ==========================================================================
app.get('/api/players', async (req, res) => {
  try {
    const [rows] = await executeQuery(
      `SELECT P.*, T.TeamName 
       FROM CricketPlayer P 
       LEFT JOIN CricketTeam T ON P.TeamID = T.TeamID 
       ORDER BY P.PlayerID ASC`,
      `SELECT P.*, T.TeamName 
       FROM PLAYER P 
       LEFT JOIN TEAM T ON P.TeamID = T.TeamID 
       ORDER BY P.PlayerID ASC`
    );
    res.json(rows);
  } catch (error) {
    handleDbError(res, error, 'Could not fetch players');
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const { PlayerName, Age, Role, Nationality, JerseyNo, TeamID } = req.body;

    if (!PlayerName || !PlayerName.trim()) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const age = Age === '' || Age == null ? null : Number(Age);
    const jerseyNo = JerseyNo === '' || JerseyNo == null ? null : Number(JerseyNo);
    const teamId = TeamID === '' || TeamID == null ? null : Number(TeamID);

    const [result] = await executeQuery(
      `INSERT INTO CricketPlayer (PlayerName, Age, Role, Nationality, JerseyNo, TeamID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      `INSERT INTO PLAYER (PlayerName, Age, Role, Nationality, JerseyNo, TeamID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [PlayerName.trim(), age, Role || null, Nationality || null, jerseyNo, teamId]
    );

    res.status(201).json({
      message: 'Player created successfully',
      PlayerID: result.insertId,
      PlayerName: PlayerName.trim(),
      Age: age,
      Role: Role || null,
      Nationality: Nationality || null,
      JerseyNo: jerseyNo,
      TeamID: teamId
    });
  } catch (error) {
    handleDbError(res, error, 'Could not create player');
  }
});

app.put('/api/players/:id', async (req, res) => {
  try {
    const playerId = Number(req.params.id);
    const { PlayerName, Age, Role, Nationality, JerseyNo, TeamID } = req.body;

    if (!PlayerName || !PlayerName.trim()) {
      return res.status(400).json({ error: 'Player name is required' });
    }

    const age = Age === '' || Age == null ? null : Number(Age);
    const jerseyNo = JerseyNo === '' || JerseyNo == null ? null : Number(JerseyNo);
    const teamId = TeamID === '' || TeamID == null ? null : Number(TeamID);

    const [result] = await executeQuery(
      `UPDATE CricketPlayer 
       SET PlayerName = ?, Age = ?, Role = ?, Nationality = ?, JerseyNo = ?, TeamID = ?
       WHERE PlayerID = ?`,
      `UPDATE PLAYER 
       SET PlayerName = ?, Age = ?, Role = ?, Nationality = ?, JerseyNo = ?, TeamID = ?
       WHERE PlayerID = ?`,
      [PlayerName.trim(), age, Role || null, Nationality || null, jerseyNo, teamId, playerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({
      message: 'Player updated successfully',
      PlayerID: playerId,
      PlayerName: PlayerName.trim(),
      Age: age,
      Role: Role || null,
      Nationality: Nationality || null,
      JerseyNo: jerseyNo,
      TeamID: teamId
    });
  } catch (error) {
    handleDbError(res, error, 'Could not update player');
  }
});

app.delete('/api/players/:id', async (req, res) => {
  try {
    const playerId = Number(req.params.id);
    const [result] = await executeQuery(
      `DELETE FROM CricketPlayer WHERE PlayerID = ?`,
      `DELETE FROM PLAYER WHERE PlayerID = ?`,
      [playerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ message: 'Player deleted successfully', PlayerID: playerId });
  } catch (error) {
    handleDbError(res, error, 'Could not delete player');
  }
});

// ==========================================================================
// 4. Stadiums API (CRUD)
// ==========================================================================
app.get('/api/stadiums', async (req, res) => {
  try {
    const [rows] = await executeQuery(
      'SELECT * FROM CricketStadium ORDER BY StadiumID ASC',
      'SELECT * FROM STADIUM ORDER BY StadiumID ASC'
    );
    res.json(rows);
  } catch (error) {
    handleDbError(res, error, 'Could not fetch stadiums');
  }
});

app.post('/api/stadiums', async (req, res) => {
  try {
    const { StadiumName, City, Capacity } = req.body;
    if (!StadiumName || !StadiumName.trim()) {
      return res.status(400).json({ error: 'StadiumName is required' });
    }

    const capacity = Capacity === '' || Capacity == null ? null : Number(Capacity);

    const [result] = await executeQuery(
      `INSERT INTO CricketStadium (StadiumName, City, Capacity) VALUES (?, ?, ?)`,
      `INSERT INTO STADIUM (StadiumName, City, Capacity) VALUES (?, ?, ?)`,
      [StadiumName.trim(), City || null, capacity]
    );

    res.status(201).json({
      StadiumID: result.insertId,
      StadiumName: StadiumName.trim(),
      City,
      Capacity: capacity
    });
  } catch (error) {
    handleDbError(res, error, 'Could not create stadium');
  }
});

app.put('/api/stadiums/:id', async (req, res) => {
  try {
    const stadiumId = Number(req.params.id);
    const { StadiumName, City, Capacity } = req.body;

    if (!StadiumName || !StadiumName.trim()) {
      return res.status(400).json({ error: 'StadiumName is required' });
    }

    const capacity = Capacity === '' || Capacity == null ? null : Number(Capacity);

    const [result] = await executeQuery(
      `UPDATE CricketStadium SET StadiumName = ?, City = ?, Capacity = ? WHERE StadiumID = ?`,
      `UPDATE STADIUM SET StadiumName = ?, City = ?, Capacity = ? WHERE StadiumID = ?`,
      [StadiumName.trim(), City || null, capacity, stadiumId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stadium not found' });
    }

    res.json({
      message: 'Stadium updated successfully',
      StadiumID: stadiumId,
      StadiumName: StadiumName.trim(),
      City,
      Capacity: capacity
    });
  } catch (error) {
    handleDbError(res, error, 'Could not update stadium');
  }
});

app.delete('/api/stadiums/:id', async (req, res) => {
  try {
    const stadiumId = Number(req.params.id);
    const [result] = await executeQuery(
      `DELETE FROM CricketStadium WHERE StadiumID = ?`,
      `DELETE FROM STADIUM WHERE StadiumID = ?`,
      [stadiumId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stadium not found' });
    }

    res.json({ message: 'Stadium deleted successfully', StadiumID: stadiumId });
  } catch (error) {
    handleDbError(res, error, 'Could not delete stadium');
  }
});

// ==========================================================================
// 5. Sponsors API (CRUD)
// ==========================================================================
app.get('/api/sponsors', async (req, res) => {
  try {
    const [rows] = await executeQuery(
      `SELECT S.*, T.TeamName 
       FROM TeamSponsor S 
       LEFT JOIN CricketTeam T ON S.TeamID = T.TeamID 
       ORDER BY S.SponsorID ASC`,
      `SELECT S.*, T.TeamName 
       FROM SPONSOR S 
       LEFT JOIN TEAM T ON S.TeamID = T.TeamID 
       ORDER BY S.SponsorID ASC`
    );
    res.json(rows);
  } catch (error) {
    handleDbError(res, error, 'Could not fetch sponsors');
  }
});

app.post('/api/sponsors', async (req, res) => {
  try {
    const { SponsorName, Industry, ContractAmount, TeamID } = req.body;
    if (!SponsorName || !SponsorName.trim()) {
      return res.status(400).json({ error: 'SponsorName is required' });
    }

    const contractAmount = ContractAmount === '' || ContractAmount == null ? null : Number(ContractAmount);
    const teamId = TeamID === '' || TeamID == null ? null : Number(TeamID);

    const [result] = await executeQuery(
      `INSERT INTO TeamSponsor (SponsorName, Industry, ContractAmount, TeamID) VALUES (?, ?, ?, ?)`,
      `INSERT INTO SPONSOR (SponsorName, Industry, ContractAmount, TeamID) VALUES (?, ?, ?, ?)`,
      [SponsorName.trim(), Industry || null, contractAmount, teamId]
    );

    res.status(201).json({
      SponsorID: result.insertId,
      SponsorName: SponsorName.trim(),
      Industry,
      ContractAmount: contractAmount,
      TeamID: teamId
    });
  } catch (error) {
    handleDbError(res, error, 'Could not create sponsor');
  }
});

app.put('/api/sponsors/:id', async (req, res) => {
  try {
    const sponsorId = Number(req.params.id);
    const { SponsorName, Industry, ContractAmount, TeamID } = req.body;

    if (!SponsorName || !SponsorName.trim()) {
      return res.status(400).json({ error: 'SponsorName is required' });
    }

    const contractAmount = ContractAmount === '' || ContractAmount == null ? null : Number(ContractAmount);
    const teamId = TeamID === '' || TeamID == null ? null : Number(TeamID);

    const [result] = await executeQuery(
      `UPDATE TeamSponsor SET SponsorName = ?, Industry = ?, ContractAmount = ?, TeamID = ? WHERE SponsorID = ?`,
      `UPDATE SPONSOR SET SponsorName = ?, Industry = ?, ContractAmount = ?, TeamID = ? WHERE SponsorID = ?`,
      [SponsorName.trim(), Industry || null, contractAmount, teamId, sponsorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    res.json({
      message: 'Sponsor updated successfully',
      SponsorID: sponsorId,
      SponsorName: SponsorName.trim(),
      Industry,
      ContractAmount: contractAmount,
      TeamID: teamId
    });
  } catch (error) {
    handleDbError(res, error, 'Could not update sponsor');
  }
});

app.delete('/api/sponsors/:id', async (req, res) => {
  try {
    const sponsorId = Number(req.params.id);
    const [result] = await executeQuery(
      `DELETE FROM TeamSponsor WHERE SponsorID = ?`,
      `DELETE FROM SPONSOR WHERE SponsorID = ?`,
      [sponsorId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sponsor not found' });
    }

    res.json({ message: 'Sponsor deleted successfully', SponsorID: sponsorId });
  } catch (error) {
    handleDbError(res, error, 'Could not delete sponsor');
  }
});

// ==========================================================================
// 6. Matches API (CRUD)
// ==========================================================================
app.get('/api/matches', async (req, res) => {
  try {
    const [rows] = await executeQuery(
      `SELECT M.*, S.StadiumName, S.City 
       FROM TournamentMatch M 
       LEFT JOIN CricketStadium S ON M.StadiumID = S.StadiumID 
       ORDER BY M.MatchID ASC`,
      `SELECT M.*, S.StadiumName, S.City 
       FROM \`MATCH\` M 
       LEFT JOIN STADIUM S ON M.StadiumID = S.StadiumID 
       ORDER BY M.MatchID ASC`
    );
    res.json(rows);
  } catch (error) {
    handleDbError(res, error, 'Could not fetch matches');
  }
});

app.post('/api/matches', async (req, res) => {
  try {
    const { MatchDate, MatchType, Result, StadiumID } = req.body;
    const stadiumId = StadiumID === '' || StadiumID == null ? null : Number(StadiumID);

    const [result] = await executeQuery(
      `INSERT INTO TournamentMatch (MatchDate, MatchType, Result, StadiumID) VALUES (?, ?, ?, ?)`,
      `INSERT INTO \`MATCH\` (MatchDate, MatchType, Result, StadiumID) VALUES (?, ?, ?, ?)`,
      [MatchDate || null, MatchType || 'T20', Result || null, stadiumId]
    );

    res.status(201).json({
      MatchID: result.insertId,
      MatchDate,
      MatchType,
      Result,
      StadiumID: stadiumId
    });
  } catch (error) {
    handleDbError(res, error, 'Could not create match');
  }
});

app.put('/api/matches/:id', async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const { MatchDate, MatchType, Result, StadiumID } = req.body;
    const stadiumId = StadiumID === '' || StadiumID == null ? null : Number(StadiumID);

    const [result] = await executeQuery(
      `UPDATE TournamentMatch SET MatchDate = ?, MatchType = ?, Result = ?, StadiumID = ? WHERE MatchID = ?`,
      `UPDATE \`MATCH\` SET MatchDate = ?, MatchType = ?, Result = ?, StadiumID = ? WHERE MatchID = ?`,
      [MatchDate || null, MatchType || 'T20', Result || null, stadiumId, matchId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({
      message: 'Match updated successfully',
      MatchID: matchId,
      MatchDate,
      MatchType,
      Result,
      StadiumID: stadiumId
    });
  } catch (error) {
    handleDbError(res, error, 'Could not update match');
  }
});

app.delete('/api/matches/:id', async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    const [result] = await executeQuery(
      `DELETE FROM TournamentMatch WHERE MatchID = ?`,
      `DELETE FROM \`MATCH\` WHERE MatchID = ?`,
      [matchId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json({ message: 'Match deleted successfully', MatchID: matchId });
  } catch (error) {
    handleDbError(res, error, 'Could not delete match');
  }
});

// ==========================================================================
// 7. Umpires API (CRUD)
// ==========================================================================
app.get('/api/umpires', async (req, res) => {
  try {
    const [rows] = await executeQuery(
      'SELECT * FROM CricketUmpire ORDER BY UmpireID ASC',
      'SELECT * FROM UMPIRE ORDER BY UmpireID ASC'
    );
    res.json(rows);
  } catch (error) {
    handleDbError(res, error, 'Could not fetch umpires');
  }
});

app.post('/api/umpires', async (req, res) => {
  try {
    const { UmpireName, Country, Experience } = req.body;
    if (!UmpireName || !UmpireName.trim()) {
      return res.status(400).json({ error: 'UmpireName is required' });
    }

    const exp = Experience === '' || Experience == null ? 0 : Number(Experience);

    const [result] = await executeQuery(
      `INSERT INTO CricketUmpire (UmpireName, Country, Experience) VALUES (?, ?, ?)`,
      `INSERT INTO UMPIRE (UmpireName, Country, Experience) VALUES (?, ?, ?)`,
      [UmpireName.trim(), Country || null, exp]
    );

    res.status(201).json({
      UmpireID: result.insertId,
      UmpireName: UmpireName.trim(),
      Country,
      Experience: exp
    });
  } catch (error) {
    handleDbError(res, error, 'Could not create umpire');
  }
});

app.put('/api/umpires/:id', async (req, res) => {
  try {
    const umpireId = Number(req.params.id);
    const { UmpireName, Country, Experience } = req.body;

    if (!UmpireName || !UmpireName.trim()) {
      return res.status(400).json({ error: 'UmpireName is required' });
    }

    const exp = Experience === '' || Experience == null ? 0 : Number(Experience);

    const [result] = await executeQuery(
      `UPDATE CricketUmpire SET UmpireName = ?, Country = ?, Experience = ? WHERE UmpireID = ?`,
      `UPDATE UMPIRE SET UmpireName = ?, Country = ?, Experience = ? WHERE UmpireID = ?`,
      [UmpireName.trim(), Country || null, exp, umpireId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Umpire not found' });
    }

    res.json({
      message: 'Umpire updated successfully',
      UmpireID: umpireId,
      UmpireName: UmpireName.trim(),
      Country,
      Experience: exp
    });
  } catch (error) {
    handleDbError(res, error, 'Could not update umpire');
  }
});

app.delete('/api/umpires/:id', async (req, res) => {
  try {
    const umpireId = Number(req.params.id);
    const [result] = await executeQuery(
      `DELETE FROM CricketUmpire WHERE UmpireID = ?`,
      `DELETE FROM UMPIRE WHERE UmpireID = ?`,
      [umpireId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Umpire not found' });
    }

    res.json({ message: 'Umpire deleted successfully', UmpireID: umpireId });
  } catch (error) {
    handleDbError(res, error, 'Could not delete umpire');
  }
});

// ==========================================================================
// 8. Scorecards API (CRUD)
// ==========================================================================
app.get('/api/scorecards', async (req, res) => {
  try {
    const [rows] = await executeQuery(
      `SELECT SC.*, P.PlayerName 
       FROM MatchScorecard SC 
       LEFT JOIN CricketPlayer P ON SC.PlayerID = P.PlayerID 
       ORDER BY SC.ScorecardID ASC`,
      `SELECT SC.*, P.PlayerName 
       FROM SCORECARD SC 
       LEFT JOIN PLAYER P ON SC.PlayerID = P.PlayerID 
       ORDER BY SC.ScorecardID ASC`
    );
    res.json(rows);
  } catch (error) {
    handleDbError(res, error, 'Could not fetch scorecards');
  }
});

app.post('/api/scorecards', async (req, res) => {
  try {
    const { Runs, BallsFaced, Wickets, Overs, PlayerID, MatchID } = req.body;
    const [result] = await executeQuery(
      `INSERT INTO MatchScorecard (Runs, BallsFaced, Wickets, Overs, PlayerID, MatchID) VALUES (?, ?, ?, ?, ?, ?)`,
      `INSERT INTO SCORECARD (Runs, BallsFaced, Wickets, Overs, PlayerID, MatchID) VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(Runs) || 0, Number(BallsFaced) || 0, Number(Wickets) || 0, Number(Overs) || 0, PlayerID, MatchID]
    );
    res.status(201).json({
      ScorecardID: result.insertId,
      Runs, BallsFaced, Wickets, Overs, PlayerID, MatchID
    });
  } catch (error) {
    handleDbError(res, error, 'Could not create scorecard entry');
  }
});

app.put('/api/scorecards/:id', async (req, res) => {
  try {
    const scorecardId = Number(req.params.id);
    const { Runs, BallsFaced, Wickets, Overs, PlayerID, MatchID } = req.body;
    const [result] = await executeQuery(
      `UPDATE MatchScorecard SET Runs = ?, BallsFaced = ?, Wickets = ?, Overs = ?, PlayerID = ?, MatchID = ? WHERE ScorecardID = ?`,
      `UPDATE SCORECARD SET Runs = ?, BallsFaced = ?, Wickets = ?, Overs = ?, PlayerID = ?, MatchID = ? WHERE ScorecardID = ?`,
      [Number(Runs) || 0, Number(BallsFaced) || 0, Number(Wickets) || 0, Number(Overs) || 0, PlayerID, MatchID, scorecardId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Scorecard entry not found' });
    }
    res.json({ message: 'Scorecard updated successfully', ScorecardID: scorecardId });
  } catch (error) {
    handleDbError(res, error, 'Could not update scorecard entry');
  }
});

app.delete('/api/scorecards/:id', async (req, res) => {
  try {
    const scorecardId = Number(req.params.id);
    const [result] = await executeQuery(
      `DELETE FROM MatchScorecard WHERE ScorecardID = ?`,
      `DELETE FROM SCORECARD WHERE ScorecardID = ?`,
      [scorecardId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Scorecard entry not found' });
    }
    res.json({ message: 'Scorecard entry deleted', ScorecardID: scorecardId });
  } catch (error) {
    handleDbError(res, error, 'Could not delete scorecard entry');
  }
});

// ==========================================================================
// 9. Statistics & Aggregations
// ==========================================================================
app.get('/api/statistics', async (req, res) => {
  try {
    // 1. Top scorers
    let topScorers = [];
    try {
      const [tsRows] = await executeQuery(
        `SELECT P.PlayerName, MAX(SC.Runs) AS HighestRuns 
         FROM CricketPlayer P 
         JOIN MatchScorecard SC ON P.PlayerID = SC.PlayerID 
         GROUP BY P.PlayerID, P.PlayerName 
         ORDER BY HighestRuns DESC LIMIT 5`,
        `SELECT P.PlayerName, MAX(SC.Runs) AS HighestRuns 
         FROM PLAYER P 
         JOIN SCORECARD SC ON P.PlayerID = SC.PlayerID 
         GROUP BY P.PlayerID, P.PlayerName 
         ORDER BY HighestRuns DESC LIMIT 5`
      );
      topScorers = tsRows;
    } catch (e) {
      console.warn('Could not query top scorers:', e.message);
    }

    // 2. Team player counts
    let teamPlayerCounts = [];
    try {
      const [tpcRows] = await executeQuery(
        `SELECT T.TeamName, COUNT(P.PlayerID) AS TotalPlayers 
         FROM CricketTeam T 
         LEFT JOIN CricketPlayer P ON T.TeamID = P.TeamID 
         GROUP BY T.TeamID, T.TeamName`,
        `SELECT T.TeamName, COUNT(P.PlayerID) AS TotalPlayers 
         FROM TEAM T 
         LEFT JOIN PLAYER P ON T.TeamID = P.TeamID 
         GROUP BY T.TeamID, T.TeamName`
      );
      teamPlayerCounts = tpcRows;
    } catch (e) {
      console.warn('Could not query team player counts:', e.message);
    }

    // 3. Team sponsorship totals
    let teamSponsorships = [];
    try {
      const [tsponsorRows] = await executeQuery(
        `SELECT T.TeamName, COALESCE(SUM(S.ContractAmount), 0) AS TotalSponsorship 
         FROM CricketTeam T 
         JOIN TeamSponsor S ON T.TeamID = S.TeamID 
         GROUP BY T.TeamID, T.TeamName`,
        `SELECT T.TeamName, COALESCE(SUM(S.ContractAmount), 0) AS TotalSponsorship 
         FROM TEAM T 
         JOIN SPONSOR S ON T.TeamID = S.TeamID 
         GROUP BY T.TeamID, T.TeamName`
      );
      teamSponsorships = tsponsorRows;
    } catch (e) {
      console.warn('Could not query sponsorships:', e.message);
    }

    res.json({
      topScorers,
      teamPlayerCounts,
      teamSponsorships
    });
  } catch (error) {
    handleDbError(res, error, 'Could not fetch tournament statistics');
  }
});

// Fallback to serve SPA index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = Number(process.env.PORT || 3000);

// Only listen directly when not running in Vercel serverless environment
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`🏏 CricketBuddy Tournament Control running at http://localhost:${port}`);
  });
}

module.exports = app;
