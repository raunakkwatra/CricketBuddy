
CREATE DATABASE IF NOT EXISTS CRICKET;
USE CRICKET;
CREATE TABLE TEAM (
    TeamID INT PRIMARY KEY AUTO_INCREMENT,
    TeamName VARCHAR(100) NOT NULL,
    Coach VARCHAR(100),
    HomeGround VARCHAR(100),
    Owner VARCHAR(100)
);

CREATE TABLE PLAYER (
    PlayerID INT PRIMARY KEY AUTO_INCREMENT,
    PlayerName VARCHAR(100) NOT NULL,
    Age INT,
    Role VARCHAR(50),
    Nationality VARCHAR(50),
    JerseyNo INT,
    TeamID INT,

    FOREIGN KEY (TeamID)
        REFERENCES TEAM(TeamID)
);


-- =========================================
-- SPONSOR TABLE
-- =========================================

CREATE TABLE SPONSOR (
    SponsorID INT PRIMARY KEY AUTO_INCREMENT,
    SponsorName VARCHAR(100) NOT NULL,
    Industry VARCHAR(100),
    ContractAmount DECIMAL(18,2),
    TeamID INT,

    FOREIGN KEY (TeamID)
        REFERENCES TEAM(TeamID)
);


-- =========================================
-- STADIUM TABLE
-- =========================================

CREATE TABLE STADIUM (
    StadiumID INT PRIMARY KEY AUTO_INCREMENT,
    StadiumName VARCHAR(100) NOT NULL,
    City VARCHAR(100),
    Capacity INT
);


-- =========================================
-- UMPIRE TABLE
-- =========================================

CREATE TABLE UMPIRE (
    UmpireID INT PRIMARY KEY AUTO_INCREMENT,
    UmpireName VARCHAR(100) NOT NULL,
    Country VARCHAR(50),
    Experience INT
);


-- =========================================
-- MATCH TABLE
-- =========================================

CREATE TABLE `MATCH` (
    MatchID INT PRIMARY KEY AUTO_INCREMENT,
    MatchDate DATE,
    MatchType VARCHAR(50),
    Result VARCHAR(100),
    StadiumID INT,

    FOREIGN KEY (StadiumID)
        REFERENCES STADIUM(StadiumID)
);


-- =========================================
-- SCORECARD TABLE
-- =========================================

CREATE TABLE SCORECARD (
    ScorecardID INT PRIMARY KEY AUTO_INCREMENT,
    Runs INT DEFAULT 0,
    BallsFaced INT DEFAULT 0,
    Wickets INT DEFAULT 0,
    Overs DECIMAL(5,2),
    PlayerID INT,
    MatchID INT,

    FOREIGN KEY (PlayerID)
        REFERENCES PLAYER(PlayerID),

    FOREIGN KEY (MatchID)
        REFERENCES `MATCH`(MatchID)
);


-- =========================================
-- TEAM_MATCH
-- M:N relationship between TEAM and MATCH
-- =========================================

CREATE TABLE TEAM_MATCH (
    TeamID INT,
    MatchID INT,

    PRIMARY KEY (TeamID, MatchID),

    FOREIGN KEY (TeamID)
        REFERENCES TEAM(TeamID),

    FOREIGN KEY (MatchID)
        REFERENCES `MATCH`(MatchID)
);


-- =========================================
-- MATCH_UMPIRE
-- M:N relationship between MATCH and UMPIRE
-- =========================================

CREATE TABLE MATCH_UMPIRE (
    MatchID INT,
    UmpireID INT,

    PRIMARY KEY (MatchID, UmpireID),

    FOREIGN KEY (MatchID)
        REFERENCES `MATCH`(MatchID),

    FOREIGN KEY (UmpireID)
        REFERENCES UMPIRE(UmpireID)
);
INSERT INTO TEAM
(TeamName, Coach, HomeGround, Owner)
VALUES
('Mumbai Indians', 'Mark Boucher', 'Wankhede Stadium', 'Reliance Industries'),
('Chennai Super Kings', 'Stephen Fleming', 'MA Chidambaram Stadium', 'India Cements'),
('Royal Challengers Bengaluru', 'Andy Flower', 'M. Chinnaswamy Stadium', 'United Spirits'),
('Rajasthan Royals', 'Rahul Dravid', 'Sawai Mansingh Stadium', 'Royal Multisport Pvt Ltd');
SELECT * FROM TEAM;
INSERT INTO PLAYER
(PlayerName, Age, Role, Nationality, JerseyNo, TeamID)
VALUES
('Rohit Sharma', 38, 'Batsman', 'Indian', 45, 1),
('Hardik Pandya', 32, 'All Rounder', 'Indian', 33, 1),
('MS Dhoni', 45, 'Wicket Keeper', 'Indian', 7, 2),
('Ruturaj Gaikwad', 29, 'Batsman', 'Indian', 31, 2),
('Virat Kohli', 37, 'Batsman', 'Indian', 18, 3),
('Rajat Patidar', 32, 'Batsman', 'Indian', 97, 3),
('Sanju Samson', 31, 'Wicket Keeper', 'Indian', 9, 4),
('Yashasvi Jaiswal', 24, 'Batsman', 'Indian', 64, 4);
SELECT * FROM PLAYER;
INSERT INTO SPONSOR
(SponsorName, Industry, ContractAmount, TeamID)
VALUES
('Samsung', 'Electronics', 25000000, 1),
('Pepsi', 'Beverages', 18000000, 1),
('TVS Motors', 'Automobile', 22000000, 2),
('India Cements', 'Cement', 15000000, 2),
('Muthoot Finance', 'Finance', 20000000, 3),
('Red Bull', 'Beverages', 17000000, 4);
INSERT INTO STADIUM
(StadiumName, City, Capacity)
VALUES
('Wankhede Stadium', 'Mumbai', 33000),
('MA Chidambaram Stadium', 'Chennai', 50000),
('M. Chinnaswamy Stadium', 'Bengaluru', 40000),
('Sawai Mansingh Stadium', 'Jaipur', 30000);
INSERT INTO UMPIRE
(UmpireName, Country, Experience)
VALUES
('Richard Kettleborough', 'England', 15),
('Kumar Dharmasena', 'Sri Lanka', 20),
('Nitin Menon', 'India', 10),
('Joel Wilson', 'West Indies', 18);
INSERT INTO `MATCH`
(MatchDate, MatchType, Result, StadiumID)
VALUES
('2026-04-05', 'T20', 'Mumbai Indians won by 6 wickets', 1),
('2026-04-08', 'T20', 'Chennai Super Kings won by 5 wickets', 2),
('2026-04-12', 'T20', 'Royal Challengers Bengaluru won by 20 runs', 3),
('2026-04-15', 'T20', 'Rajasthan Royals won by 7 wickets', 4);
INSERT INTO TEAM_MATCH
(TeamID, MatchID)
VALUES
(1, 1),
(2, 1),
(2, 2),
(3, 2),
(3, 3),
(4, 3),
(1, 4),
(4, 4);
INSERT INTO MATCH_UMPIRE
(MatchID, UmpireID)
VALUES
(1, 1),
(1, 3),
(2, 2),
(2, 3),
(3, 1),
(3, 4),
(4, 2),
(4, 4);
INSERT INTO SCORECARD
(Runs, BallsFaced, Wickets, Overs, PlayerID, MatchID)
VALUES
(85, 52, 0, 0.00, 1, 1),
(42, 25, 2, 4.00, 2, 1),
(35, 28, 0, 0.00, 3, 2),
(78, 55, 0, 0.00, 4, 2),
(92, 58, 0, 0.00, 5, 3),
(30, 22, 1, 3.00, 6, 3),
(65, 45, 0, 0.00, 7, 4),
(71, 48, 0, 0.00, 8, 4);
SELECT * FROM TEAM;

SELECT * FROM PLAYER;

SELECT * FROM SPONSOR;

SELECT * FROM STADIUM;

SELECT * FROM UMPIRE;

SELECT * FROM `MATCH`;

SELECT * FROM SCORECARD;

SELECT * FROM TEAM_MATCH;

SELECT * FROM MATCH_UMPIRE;
SELECT
    P.PlayerID,
    P.PlayerName,
    P.Role,
    T.TeamName
FROM PLAYER P
JOIN TEAM T
ON P.TeamID = T.TeamID;
SELECT
    M.MatchID,
    M.MatchDate,
    M.MatchType,
    M.Result,
    S.StadiumName,
    S.City
FROM `MATCH` M
JOIN STADIUM S
ON M.StadiumID = S.StadiumID;
SELECT
    M.MatchID,
    M.MatchDate,
    T.TeamName
FROM TEAM_MATCH TM
JOIN TEAM T
ON TM.TeamID = T.TeamID
JOIN `MATCH` M
ON TM.MatchID = M.MatchID
ORDER BY M.MatchID;
SELECT
    M.MatchID,
    M.MatchDate,
    U.UmpireName,
    U.Country
FROM MATCH_UMPIRE MU
JOIN `MATCH` M
ON MU.MatchID = M.MatchID
JOIN UMPIRE U
ON MU.UmpireID = U.UmpireID;
SELECT
    SC.ScorecardID,
    P.PlayerName,
    T.TeamName,
    M.MatchID,
    M.MatchDate,
    SC.Runs,
    SC.BallsFaced,
    SC.Wickets,
    SC.Overs
FROM SCORECARD SC
JOIN PLAYER P
ON SC.PlayerID = P.PlayerID
JOIN TEAM T
ON P.TeamID = T.TeamID
JOIN `MATCH` M
ON SC.MatchID = M.MatchID;
SELECT
    T.TeamName,
    COUNT(P.PlayerID) AS TotalPlayers
FROM TEAM T
LEFT JOIN PLAYER P
ON T.TeamID = P.TeamID
GROUP BY T.TeamID, T.TeamName;
SELECT
    T.TeamName,
    COUNT(S.SponsorID) AS TotalSponsors
FROM TEAM T
LEFT JOIN SPONSOR S
ON T.TeamID = S.TeamID
GROUP BY T.TeamID, T.TeamName;
SELECT
    P.PlayerName,
    MAX(SC.Runs) AS HighestRuns
FROM SCORECARD SC
JOIN PLAYER P
ON SC.PlayerID = P.PlayerID
GROUP BY P.PlayerID, P.PlayerName
ORDER BY HighestRuns DESC;
SELECT
    T.TeamName,
    SUM(S.ContractAmount) AS TotalSponsorship
FROM TEAM T
JOIN SPONSOR S
ON T.TeamID = S.TeamID
GROUP BY T.TeamID, T.TeamName;
SELECT * FROM TEAM;
SELECT * FROM PLAYER;
SELECT * FROM SCORECARD;
SELECT * FROM `MATCH`;
SHOW TABLES;