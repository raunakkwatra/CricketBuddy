-- ============================================================
-- CRICKET TOURNAMENT DATABASE
-- DATABASE SETUP
-- ============================================================

CREATE DATABASE IF NOT EXISTS CricketTournamentDB;

USE CricketTournamentDB;


-- ============================================================
-- 1. CRICKET TEAM
-- ============================================================

CREATE TABLE IF NOT EXISTS CricketTeam (
    TeamID INT PRIMARY KEY AUTO_INCREMENT,
    TeamName VARCHAR(100) NOT NULL,
    Coach VARCHAR(100),
    HomeGround VARCHAR(100),
    Owner VARCHAR(100)
);


-- ============================================================
-- 2. CRICKET PLAYER
-- ============================================================

CREATE TABLE IF NOT EXISTS CricketPlayer (
    PlayerID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerName VARCHAR(100) NOT NULL,
    Age INT,
    Role VARCHAR(50),
    Nationality VARCHAR(50),
    JerseyNo INT,
    TeamID INT,

    FOREIGN KEY (TeamID)
        REFERENCES CricketTeam(TeamID)
);


-- ============================================================
-- 3. TEAM SPONSOR
-- ============================================================

CREATE TABLE IF NOT EXISTS TeamSponsor (
    SponsorID INT PRIMARY KEY AUTO_INCREMENT,
    SponsorName VARCHAR(100) NOT NULL,
    Industry VARCHAR(100),
    ContractAmount DECIMAL(12,2),
    TeamID INT,

    FOREIGN KEY (TeamID)
        REFERENCES CricketTeam(TeamID)
);


-- ============================================================
-- 4. CRICKET STADIUM
-- ============================================================

CREATE TABLE IF NOT EXISTS CricketStadium (
    StadiumID INT PRIMARY KEY AUTO_INCREMENT,
    StadiumName VARCHAR(100) NOT NULL,
    City VARCHAR(100),
    Capacity INT
);


-- ============================================================
-- 5. CRICKET UMPIRE
-- ============================================================

CREATE TABLE IF NOT EXISTS CricketUmpire (
    UmpireID INT PRIMARY KEY AUTO_INCREMENT,
    UmpireName VARCHAR(100) NOT NULL,
    Country VARCHAR(50),
    Experience INT
);


-- ============================================================
-- 6. TOURNAMENT MATCH
-- ============================================================

CREATE TABLE IF NOT EXISTS TournamentMatch (
    MatchID INT PRIMARY KEY AUTO_INCREMENT,
    MatchDate DATE NOT NULL,
    MatchType VARCHAR(50) NOT NULL,
    Result VARCHAR(100),
    StadiumID INT,

    FOREIGN KEY (StadiumID)
        REFERENCES CricketStadium(StadiumID)
);


-- ============================================================
-- 7. MATCH SCORECARD
-- ============================================================

CREATE TABLE IF NOT EXISTS MatchScorecard (
    ScorecardID INT PRIMARY KEY AUTO_INCREMENT,
    Runs INT NOT NULL DEFAULT 0,
    BallsFaced INT NOT NULL DEFAULT 0,
    Wickets INT NOT NULL DEFAULT 0,
    Overs DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    PlayerID INT NOT NULL,
    MatchID INT NOT NULL,

    FOREIGN KEY (PlayerID)
        REFERENCES CricketPlayer(PlayerID),

    FOREIGN KEY (MatchID)
        REFERENCES TournamentMatch(MatchID)
);


-- ============================================================
-- 8. TEAM PARTICIPATION
-- Many-to-Many relationship:
-- CricketTeam <--> TournamentMatch
-- ============================================================

CREATE TABLE IF NOT EXISTS TeamParticipation (
    TeamID INT,
    MatchID INT,

    PRIMARY KEY (TeamID, MatchID),

    FOREIGN KEY (TeamID)
        REFERENCES CricketTeam(TeamID),

    FOREIGN KEY (MatchID)
        REFERENCES TournamentMatch(MatchID)
);


-- ============================================================
-- 9. MATCH OFFICIALS
-- Many-to-Many relationship:
-- TournamentMatch <--> CricketUmpire
-- ============================================================

CREATE TABLE IF NOT EXISTS MatchOfficials (
    MatchID INT,
    UmpireID INT,

    PRIMARY KEY (MatchID, UmpireID),

    FOREIGN KEY (MatchID)
        REFERENCES TournamentMatch(MatchID),

    FOREIGN KEY (UmpireID)
        REFERENCES CricketUmpire(UmpireID)
);


-- ============================================================
-- 10. DATABASE VIEWS (VIRTUAL TABLES)
-- Encapsulating complex multi-table JOINs for simplified querying
-- ============================================================

-- View 1: Complete Team Profiles
CREATE OR REPLACE VIEW TeamDetails AS
SELECT
    TeamID,
    TeamName,
    Coach,
    HomeGround,
    Owner
FROM CricketTeam;

-- View 2: Player Profiles with Franchise Team Association
CREATE OR REPLACE VIEW PlayerDetails AS
SELECT
    p.PlayerID,
    p.PlayerName,
    p.Age,
    p.Role,
    p.Nationality,
    p.JerseyNo,
    t.TeamName
FROM CricketPlayer p
LEFT JOIN CricketTeam t
    ON p.TeamID = t.TeamID;

-- View 3: Match Schedules with Host Stadium and City
CREATE OR REPLACE VIEW MatchDetails AS
SELECT
    m.MatchID,
    m.MatchDate,
    m.MatchType,
    m.Result,
    s.StadiumName,
    s.City
FROM TournamentMatch m
LEFT JOIN CricketStadium s
    ON m.StadiumID = s.StadiumID;

-- View 4: Commercial Team Sponsorships & Contract Valuations
CREATE OR REPLACE VIEW TeamSponsorDetails AS
SELECT
    s.SponsorID,
    s.SponsorName,
    s.Industry,
    s.ContractAmount,
    t.TeamName
FROM TeamSponsor s
LEFT JOIN CricketTeam t
    ON s.TeamID = t.TeamID;

-- View 5: Comprehensive Match Scorecards with Player and Team Details
CREATE OR REPLACE VIEW MatchScorecardDetails AS
SELECT
    sc.ScorecardID,
    p.PlayerName,
    t.TeamName,
    m.MatchID,
    m.MatchDate,
    sc.Runs,
    sc.BallsFaced,
    sc.Wickets,
    sc.Overs
FROM MatchScorecard sc
JOIN CricketPlayer p
    ON sc.PlayerID = p.PlayerID
LEFT JOIN CricketTeam t
    ON p.TeamID = t.TeamID
JOIN TournamentMatch m
    ON sc.MatchID = m.MatchID;

-- View 6: Team Match Participation and Results
CREATE OR REPLACE VIEW TeamMatchParticipation AS
SELECT
    t.TeamName,
    m.MatchID,
    m.MatchDate,
    m.MatchType,
    m.Result
FROM TeamParticipation tp
JOIN CricketTeam t
    ON tp.TeamID = t.TeamID
JOIN TournamentMatch m
    ON tp.MatchID = m.MatchID;

-- View 7: Match Officiating Umpires and International Accreditation
CREATE OR REPLACE VIEW MatchOfficialsDetails AS
SELECT
    m.MatchID,
    m.MatchDate,
    u.UmpireName,
    u.Country,
    u.Experience
FROM MatchOfficials mo
JOIN TournamentMatch m
    ON mo.MatchID = m.MatchID
JOIN CricketUmpire u
    ON mo.UmpireID = u.UmpireID;


-- ============================================================
-- CHECK TABLES & VIEWS
-- ============================================================

SHOW FULL TABLES;
