-- ============================================================================
-- DATABASE CREATION & SCHEMA DEFINITION: CricketTournamentDB
-- CricketBuddy - Tournament Management System
-- ============================================================================

CREATE DATABASE IF NOT EXISTS CricketTournamentDB;
USE CricketTournamentDB;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables to allow safe re-runs
DROP TABLE IF EXISTS MatchOfficials;
DROP TABLE IF EXISTS TeamParticipation;
DROP TABLE IF EXISTS MatchScorecard;
DROP TABLE IF EXISTS TeamSponsor;
DROP TABLE IF EXISTS TournamentMatch;
DROP TABLE IF EXISTS CricketPlayer;
DROP TABLE IF EXISTS CricketStadium;
DROP TABLE IF EXISTS CricketUmpire;
DROP TABLE IF EXISTS CricketTeam;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. CricketTeam Table
-- Stores participating tournament teams
-- ============================================================================
CREATE TABLE CricketTeam (
    TeamID INT AUTO_INCREMENT PRIMARY KEY,
    TeamName VARCHAR(100) NOT NULL,
    Coach VARCHAR(100),
    HomeGround VARCHAR(100),
    Owner VARCHAR(100)
);

-- ============================================================================
-- 2. CricketStadium Table
-- Stores venues hosting matches
-- ============================================================================
CREATE TABLE CricketStadium (
    StadiumID INT AUTO_INCREMENT PRIMARY KEY,
    StadiumName VARCHAR(100) NOT NULL,
    City VARCHAR(100),
    Capacity INT
);

-- ============================================================================
-- 3. CricketPlayer Table
-- Stores players, roles, squad affiliations and jersey numbers
-- ============================================================================
CREATE TABLE CricketPlayer (
    PlayerID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerName VARCHAR(100) NOT NULL,
    Age INT,
    Role VARCHAR(50),
    Nationality VARCHAR(50),
    JerseyNo INT,
    TeamID INT,
    FOREIGN KEY (TeamID) REFERENCES CricketTeam (TeamID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ============================================================================
-- 4. CricketUmpire Table
-- Stores certified match referees and umpires
-- ============================================================================
CREATE TABLE CricketUmpire (
    UmpireID INT AUTO_INCREMENT PRIMARY KEY,
    UmpireName VARCHAR(100) NOT NULL,
    Country VARCHAR(50),
    Experience INT
);

-- ============================================================================
-- 5. TournamentMatch Table
-- Stores scheduled and completed tournament matches
-- ============================================================================
CREATE TABLE TournamentMatch (
    MatchID INT AUTO_INCREMENT PRIMARY KEY,
    MatchDate DATE NOT NULL,
    MatchType VARCHAR(50) NOT NULL,
    Result VARCHAR(100) DEFAULT 'Scheduled',
    StadiumID INT,
    FOREIGN KEY (StadiumID) REFERENCES CricketStadium (StadiumID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ============================================================================
-- 6. TeamSponsor Table
-- Stores team sponsorship agreements
-- ============================================================================
CREATE TABLE TeamSponsor (
    SponsorID INT AUTO_INCREMENT PRIMARY KEY,
    SponsorName VARCHAR(100) NOT NULL,
    Industry VARCHAR(100),
    ContractAmount DECIMAL(18,2),
    TeamID INT,
    FOREIGN KEY (TeamID) REFERENCES CricketTeam (TeamID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- ============================================================================
-- 7. MatchScorecard Table
-- Detailed player performance per match (Runs, Balls, Wickets, Overs)
-- ============================================================================
CREATE TABLE MatchScorecard (
    ScorecardID INT AUTO_INCREMENT PRIMARY KEY,
    Runs INT NOT NULL DEFAULT 0,
    BallsFaced INT NOT NULL DEFAULT 0,
    Wickets INT NOT NULL DEFAULT 0,
    Overs DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    PlayerID INT NOT NULL,
    MatchID INT NOT NULL,
    FOREIGN KEY (PlayerID) REFERENCES CricketPlayer (PlayerID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (MatchID) REFERENCES TournamentMatch (MatchID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================================
-- 8. TeamParticipation Table
-- Resolves relationship between Teams and Matches
-- ============================================================================
CREATE TABLE TeamParticipation (
    TeamID INT NOT NULL,
    MatchID INT NOT NULL,
    PRIMARY KEY (TeamID, MatchID),
    FOREIGN KEY (TeamID) REFERENCES CricketTeam (TeamID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (MatchID) REFERENCES TournamentMatch (MatchID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================================
-- 9. MatchOfficials Table
-- Assigns umpires to matches
-- ============================================================================
CREATE TABLE MatchOfficials (
    MatchID INT NOT NULL,
    UmpireID INT NOT NULL,
    PRIMARY KEY (MatchID, UmpireID),
    FOREIGN KEY (MatchID) REFERENCES TournamentMatch (MatchID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (UmpireID) REFERENCES CricketUmpire (UmpireID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================================
-- SEED DATA INSERTION
-- Populates initial tournament records
-- ============================================================================

-- 1. Insert Teams
INSERT INTO CricketTeam (TeamID, TeamName, Coach, HomeGround, Owner) VALUES
(1, 'Mumbai Indians', 'Mahela Jayawardene', 'Wankhede Stadium', 'Indiawin Sports'),
(2, 'Delhi Capitals', 'Sourav Ganguly', 'Arun Jaitley Stadium', 'JSW Steel'),
(3, 'Rajasthan Royals', 'Rahul Dravid', 'Sawai Mansingh Stadium', 'Royal Multisport Private Limited'),
(4, 'Punjab Kings', 'Ricky Ponting', 'New Chandigarh Stadium', 'Preity Zinta'),
(6, 'Gujarat Titans', 'Ashish Nehra', 'Narendra Modi Stadium', 'Tata');

-- 2. Insert Stadiums
INSERT INTO CricketStadium (StadiumID, StadiumName, City, Capacity) VALUES
(1, 'Wankhede Stadium', 'Mumbai', 35000),
(2, 'Arun Jaitley Stadium', 'Delhi', 30000);

-- 3. Insert Players
INSERT INTO CricketPlayer (PlayerID, PlayerName, Age, Role, Nationality, JerseyNo, TeamID) VALUES
(3, 'Sachin Tendulkar', 53, 'Batsman', 'India', 10, 1),
(4, 'Rohit Sharma', 39, 'Batsman', 'India', 45, 1),
(5, 'Vatsal Trivedi', 19, 'All-Rounder', 'India', 7, 1),
(6, 'Raunak Kwatra', 19, 'All-Rounder', 'India', 19, 1),
(7, 'Virat Kohli', 38, 'Batsman', 'India', 18, NULL);

-- 4. Insert Umpires
INSERT INTO CricketUmpire (UmpireID, UmpireName, Country, Experience) VALUES
(1, 'Nitin Menon', 'India', 15);

-- 5. Insert Matches
INSERT INTO TournamentMatch (MatchID, MatchDate, MatchType, Result, StadiumID) VALUES
(1, '2026-09-15', 'ODI', 'Scheduled', 1),
(2, '2026-10-22', 'ODI', 'Scheduled', 1);

-- 6. Insert Sponsors
INSERT INTO TeamSponsor (SponsorID, SponsorName, Industry, ContractAmount, TeamID) VALUES
(1, 'Tata', 'Steel', 25000000000.00, 1);

-- 7. Insert Match Scorecards
INSERT INTO MatchScorecard (ScorecardID, Runs, BallsFaced, Wickets, Overs, PlayerID, MatchID) VALUES
(1, 100, 35, 0, 0.00, 4, 1);

-- 8. Team Participations
INSERT INTO TeamParticipation (TeamID, MatchID) VALUES
(1, 1),
(2, 1);

-- 9. Match Officials
INSERT INTO MatchOfficials (MatchID, UmpireID) VALUES
(1, 1);


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
