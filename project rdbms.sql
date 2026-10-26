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
-- CHECK TABLES
-- ============================================================

SHOW TABLES;