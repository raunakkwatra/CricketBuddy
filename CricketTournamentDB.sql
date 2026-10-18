-- ============================================================================
-- DATABASE CREATION & SCHEMA DEFINITION: CricketTournamentDB
-- CricketBuddy - Premier Cricket Tournament Management System
-- Compatible with MySQL 8.0+ / 9.x / MariaDB / Cloud Databases (Aiven, PlanetScale)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS CricketTournamentDB;
USE CricketTournamentDB;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables to allow safe idempotent re-runs
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
-- Stores participating tournament franchises and clubs
-- ============================================================================
CREATE TABLE CricketTeam (
    TeamID INT AUTO_INCREMENT PRIMARY KEY,
    TeamName VARCHAR(100) NOT NULL,
    Coach VARCHAR(100),
    HomeGround VARCHAR(100),
    Owner VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. CricketStadium Table
-- Stores venues hosting tournament fixtures
-- ============================================================================
CREATE TABLE CricketStadium (
    StadiumID INT AUTO_INCREMENT PRIMARY KEY,
    StadiumName VARCHAR(100) NOT NULL,
    City VARCHAR(100),
    Capacity INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. CricketPlayer Table
-- Stores roster athletes, playing roles, squad affiliations and jersey numbers
-- ============================================================================
CREATE TABLE CricketPlayer (
    PlayerID INT AUTO_INCREMENT PRIMARY KEY,
    PlayerName VARCHAR(100) NOT NULL,
    Age INT,
    Role VARCHAR(50),
    Nationality VARCHAR(50),
    JerseyNo INT,
    TeamID INT,
    CONSTRAINT fk_player_team FOREIGN KEY (TeamID)
        REFERENCES CricketTeam (TeamID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. CricketUmpire Table
-- Stores certified match referees and on-field arbiters
-- ============================================================================
CREATE TABLE CricketUmpire (
    UmpireID INT AUTO_INCREMENT PRIMARY KEY,
    UmpireName VARCHAR(100) NOT NULL,
    Country VARCHAR(50),
    Experience INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. TournamentMatch Table
-- Stores scheduled and completed tournament fixtures
-- ============================================================================
CREATE TABLE TournamentMatch (
    MatchID INT AUTO_INCREMENT PRIMARY KEY,
    MatchDate DATE NOT NULL,
    MatchType VARCHAR(50) NOT NULL,
    Result VARCHAR(100) DEFAULT 'Scheduled',
    StadiumID INT,
    CONSTRAINT fk_match_stadium FOREIGN KEY (StadiumID)
        REFERENCES CricketStadium (StadiumID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. TeamSponsor Table
-- Stores corporate financial partnerships and commercial agreements
-- ============================================================================
CREATE TABLE TeamSponsor (
    SponsorID INT AUTO_INCREMENT PRIMARY KEY,
    SponsorName VARCHAR(100) NOT NULL,
    Industry VARCHAR(100),
    ContractAmount DECIMAL(18,2),
    TeamID INT,
    CONSTRAINT fk_sponsor_team FOREIGN KEY (TeamID)
        REFERENCES CricketTeam (TeamID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. MatchScorecard Table
-- Detailed player performance logs per match (Runs, Balls, Wickets, Overs)
-- ============================================================================
CREATE TABLE MatchScorecard (
    ScorecardID INT AUTO_INCREMENT PRIMARY KEY,
    Runs INT NOT NULL DEFAULT 0,
    BallsFaced INT NOT NULL DEFAULT 0,
    Wickets INT NOT NULL DEFAULT 0,
    Overs DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    PlayerID INT NOT NULL,
    MatchID INT NOT NULL,
    CONSTRAINT fk_scorecard_player FOREIGN KEY (PlayerID)
        REFERENCES CricketPlayer (PlayerID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_scorecard_match FOREIGN KEY (MatchID)
        REFERENCES TournamentMatch (MatchID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. TeamParticipation Table
-- Resolves many-to-many relationship between Teams and Matches
-- ============================================================================
CREATE TABLE TeamParticipation (
    TeamID INT NOT NULL,
    MatchID INT NOT NULL,
    PRIMARY KEY (TeamID, MatchID),
    CONSTRAINT fk_participation_team FOREIGN KEY (TeamID)
        REFERENCES CricketTeam (TeamID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_participation_match FOREIGN KEY (MatchID)
        REFERENCES TournamentMatch (MatchID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. MatchOfficials Table
-- Assigns certified umpires to tournament matches
-- ============================================================================
CREATE TABLE MatchOfficials (
    MatchID INT NOT NULL,
    UmpireID INT NOT NULL,
    PRIMARY KEY (MatchID, UmpireID),
    CONSTRAINT fk_official_match FOREIGN KEY (MatchID)
        REFERENCES TournamentMatch (MatchID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_official_umpire FOREIGN KEY (UmpireID)
        REFERENCES CricketUmpire (UmpireID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SEED DATA INSERTION
-- Populates authentic initial tournament records
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

-- 8. Team Participations (Mumbai Indians vs Delhi Capitals in Match 1)
INSERT INTO TeamParticipation (TeamID, MatchID) VALUES
(1, 1),
(2, 1);

-- 9. Match Officials (Nitin Menon presiding over Match 1)
INSERT INTO MatchOfficials (MatchID, UmpireID) VALUES
(1, 1);

-- Reset AUTO_INCREMENT counters to maximum IDs
ALTER TABLE CricketTeam AUTO_INCREMENT = 7;
ALTER TABLE CricketStadium AUTO_INCREMENT = 3;
ALTER TABLE CricketPlayer AUTO_INCREMENT = 8;
ALTER TABLE CricketUmpire AUTO_INCREMENT = 2;
ALTER TABLE TournamentMatch AUTO_INCREMENT = 3;
ALTER TABLE TeamSponsor AUTO_INCREMENT = 2;
ALTER TABLE MatchScorecard AUTO_INCREMENT = 2;
