-- MySQL dump 10.13  Distrib 9.7.1, for macos15 (arm64)
--
-- Host: localhost    Database: CricketTournamentDB
-- ------------------------------------------------------
-- Server version	9.7.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '53560d0a-8814-11f1-af98-4a940b793ec9:1-283';

--
-- Table structure for table `AppUser`
--

DROP TABLE IF EXISTS `AppUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AppUser` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `Role` enum('admin','user') NOT NULL DEFAULT 'user',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AppUser`
--

LOCK TABLES `AppUser` WRITE;
/*!40000 ALTER TABLE `AppUser` DISABLE KEYS */;
INSERT INTO `AppUser` VALUES (1,'root','$2b$12$6e778qbLbfNqc8EwbMacsuBPCu2QVrkIwo0dfFPf17bD/K.csBEj6','admin','2026-10-13 14:27:31');
/*!40000 ALTER TABLE `AppUser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CricketPlayer`
--

DROP TABLE IF EXISTS `CricketPlayer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CricketPlayer` (
  `PlayerID` int NOT NULL AUTO_INCREMENT,
  `PlayerName` varchar(100) NOT NULL,
  `Age` int DEFAULT NULL,
  `Role` varchar(50) DEFAULT NULL,
  `Nationality` varchar(50) DEFAULT NULL,
  `JerseyNo` int DEFAULT NULL,
  `TeamID` int DEFAULT NULL,
  PRIMARY KEY (`PlayerID`),
  KEY `TeamID` (`TeamID`),
  CONSTRAINT `cricketplayer_ibfk_1` FOREIGN KEY (`TeamID`) REFERENCES `CricketTeam` (`TeamID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CricketPlayer`
--

LOCK TABLES `CricketPlayer` WRITE;
/*!40000 ALTER TABLE `CricketPlayer` DISABLE KEYS */;
INSERT INTO `CricketPlayer` VALUES (3,'SACHIN TENDULKAR',53,'Batsman','INDIA',10,1),(4,'ROHIT SHARMA',39,'Batsman','INDIA',45,1),(5,'Vatsal Trivedi',19,'All-Rounder','INDIA',7,1),(6,'Raunak Kwatra',19,'All Rounder','Indian',19,1),(7,'virat kohli',38,'Batsman','Indian',18,NULL);
/*!40000 ALTER TABLE `CricketPlayer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CricketStadium`
--

DROP TABLE IF EXISTS `CricketStadium`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CricketStadium` (
  `StadiumID` int NOT NULL AUTO_INCREMENT,
  `StadiumName` varchar(100) NOT NULL,
  `City` varchar(100) DEFAULT NULL,
  `Capacity` int DEFAULT NULL,
  PRIMARY KEY (`StadiumID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CricketStadium`
--

LOCK TABLES `CricketStadium` WRITE;
/*!40000 ALTER TABLE `CricketStadium` DISABLE KEYS */;
INSERT INTO `CricketStadium` VALUES (1,'Wankhede Statdium','Mumbai',35000),(2,'arun jaitley','delhi',30000);
/*!40000 ALTER TABLE `CricketStadium` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CricketTeam`
--

DROP TABLE IF EXISTS `CricketTeam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CricketTeam` (
  `TeamID` int NOT NULL AUTO_INCREMENT,
  `TeamName` varchar(100) NOT NULL,
  `Coach` varchar(100) DEFAULT NULL,
  `HomeGround` varchar(100) DEFAULT NULL,
  `Owner` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`TeamID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CricketTeam`
--

LOCK TABLES `CricketTeam` WRITE;
/*!40000 ALTER TABLE `CricketTeam` DISABLE KEYS */;
INSERT INTO `CricketTeam` VALUES (1,'Mumbai Indians','Mahela Jayawardene','Wankhede Stadium','Indiawin Sports'),(2,'delhi capitals','sourav gangulay','arun jaitley stadium','jsw steel'),(3,'Rajasthan Royals','Rahul Dravid','Sawai Mansingh Stadium','Royal Multisport Private Limited'),(4,'punjab kings','ricky pointing','new chandigarh','preity zinda'),(6,'gujarat titans','ashish nehra','narendra modi stadium','tata');
/*!40000 ALTER TABLE `CricketTeam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CricketUmpire`
--

DROP TABLE IF EXISTS `CricketUmpire`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CricketUmpire` (
  `UmpireID` int NOT NULL AUTO_INCREMENT,
  `UmpireName` varchar(100) NOT NULL,
  `Country` varchar(50) DEFAULT NULL,
  `Experience` int DEFAULT NULL,
  PRIMARY KEY (`UmpireID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CricketUmpire`
--

LOCK TABLES `CricketUmpire` WRITE;
/*!40000 ALTER TABLE `CricketUmpire` DISABLE KEYS */;
INSERT INTO `CricketUmpire` VALUES (1,'NITION MENON','INDIA',15);
/*!40000 ALTER TABLE `CricketUmpire` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MatchOfficials`
--

DROP TABLE IF EXISTS `MatchOfficials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MatchOfficials` (
  `MatchID` int NOT NULL,
  `UmpireID` int NOT NULL,
  PRIMARY KEY (`MatchID`,`UmpireID`),
  KEY `UmpireID` (`UmpireID`),
  CONSTRAINT `matchofficials_ibfk_1` FOREIGN KEY (`MatchID`) REFERENCES `TournamentMatch` (`MatchID`),
  CONSTRAINT `matchofficials_ibfk_2` FOREIGN KEY (`UmpireID`) REFERENCES `CricketUmpire` (`UmpireID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MatchOfficials`
--

LOCK TABLES `MatchOfficials` WRITE;
/*!40000 ALTER TABLE `MatchOfficials` DISABLE KEYS */;
/*!40000 ALTER TABLE `MatchOfficials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MatchScorecard`
--

DROP TABLE IF EXISTS `MatchScorecard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MatchScorecard` (
  `ScorecardID` int NOT NULL AUTO_INCREMENT,
  `Runs` int NOT NULL DEFAULT '0',
  `BallsFaced` int NOT NULL DEFAULT '0',
  `Wickets` int NOT NULL DEFAULT '0',
  `Overs` decimal(5,2) NOT NULL DEFAULT '0.00',
  `PlayerID` int NOT NULL,
  `MatchID` int NOT NULL,
  PRIMARY KEY (`ScorecardID`),
  KEY `PlayerID` (`PlayerID`),
  KEY `MatchID` (`MatchID`),
  CONSTRAINT `matchscorecard_ibfk_1` FOREIGN KEY (`PlayerID`) REFERENCES `CricketPlayer` (`PlayerID`),
  CONSTRAINT `matchscorecard_ibfk_2` FOREIGN KEY (`MatchID`) REFERENCES `TournamentMatch` (`MatchID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MatchScorecard`
--

LOCK TABLES `MatchScorecard` WRITE;
/*!40000 ALTER TABLE `MatchScorecard` DISABLE KEYS */;
INSERT INTO `MatchScorecard` VALUES (1,100,35,0,0.00,4,1);
/*!40000 ALTER TABLE `MatchScorecard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TeamParticipation`
--

DROP TABLE IF EXISTS `TeamParticipation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TeamParticipation` (
  `TeamID` int NOT NULL,
  `MatchID` int NOT NULL,
  PRIMARY KEY (`TeamID`,`MatchID`),
  KEY `MatchID` (`MatchID`),
  CONSTRAINT `teamparticipation_ibfk_1` FOREIGN KEY (`TeamID`) REFERENCES `CricketTeam` (`TeamID`),
  CONSTRAINT `teamparticipation_ibfk_2` FOREIGN KEY (`MatchID`) REFERENCES `TournamentMatch` (`MatchID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TeamParticipation`
--

LOCK TABLES `TeamParticipation` WRITE;
/*!40000 ALTER TABLE `TeamParticipation` DISABLE KEYS */;
/*!40000 ALTER TABLE `TeamParticipation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TeamSponsor`
--

DROP TABLE IF EXISTS `TeamSponsor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TeamSponsor` (
  `SponsorID` int NOT NULL AUTO_INCREMENT,
  `SponsorName` varchar(100) NOT NULL,
  `Industry` varchar(100) DEFAULT NULL,
  `ContractAmount` decimal(18,2) DEFAULT NULL,
  `TeamID` int DEFAULT NULL,
  PRIMARY KEY (`SponsorID`),
  KEY `TeamID` (`TeamID`),
  CONSTRAINT `teamsponsor_ibfk_1` FOREIGN KEY (`TeamID`) REFERENCES `CricketTeam` (`TeamID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TeamSponsor`
--

LOCK TABLES `TeamSponsor` WRITE;
/*!40000 ALTER TABLE `TeamSponsor` DISABLE KEYS */;
INSERT INTO `TeamSponsor` VALUES (1,'tata','steel',25000000000.00,1);
/*!40000 ALTER TABLE `TeamSponsor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TournamentMatch`
--

DROP TABLE IF EXISTS `TournamentMatch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TournamentMatch` (
  `MatchID` int NOT NULL AUTO_INCREMENT,
  `MatchDate` date NOT NULL,
  `MatchType` varchar(50) NOT NULL,
  `Result` varchar(100) DEFAULT NULL,
  `StadiumID` int DEFAULT NULL,
  PRIMARY KEY (`MatchID`),
  KEY `StadiumID` (`StadiumID`),
  CONSTRAINT `tournamentmatch_ibfk_1` FOREIGN KEY (`StadiumID`) REFERENCES `CricketStadium` (`StadiumID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TournamentMatch`
--

LOCK TABLES `TournamentMatch` WRITE;
/*!40000 ALTER TABLE `TournamentMatch` DISABLE KEYS */;
INSERT INTO `TournamentMatch` VALUES (1,'2026-09-15','ODI','Scheduled',1),(2,'2026-10-22','ODI','Scheduled',1);
/*!40000 ALTER TABLE `TournamentMatch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'CricketTournamentDB'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-19  1:43:32
