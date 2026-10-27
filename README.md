# 🏏 CricketBuddy — Tournament Management System

A full-stack, responsive Cricket Tournament Management System featuring complete CRUD functionality, Role-Based Access Control (Admin / Viewer), dark/light theme switching, and real-time tournament analytics.

---

## 🚀 Tech Stack

- **Frontend**: Vanilla JavaScript (SPA), HTML5, CSS3 with Custom CSS Variables (Light & Dark mode), Lucide Icons
- **Backend**: Node.js & Express REST API
- **Database**: MySQL 9.7 (Catalog: `CricketTournamentDB`, normalized to BCNF, with 7 SQL Views)

---

## 📁 Project Structure

```
├── public/
│   ├── index.html                  # Main SPA interface
│   ├── style.css                   # Master stylesheet (Dark/Light themes)
│   ├── app.js                      # Frontend logic (State, RBAC, CRUD modals)
│   └── lucide.min.js               # Offline local Lucide icon library
├── CricketTournamentDB.sql         # Master DDL with 9 tables, seed records & 7 views
├── project rdbms.sql               # Normalized MySQL schema DDL & seed data
├── db.js                           # MySQL connection pool (with SSL support)
├── server.js                       # Express REST API routes, controllers & view endpoints
├── er_diagram.png                  # Chen-notation ER Diagram (9 relations)
├── CricketBuddy_Project_Report.docx# Official academic project report (MUJ)
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
└── package.json                    # Project dependencies and start scripts
```

---

## 💻 Local Development & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/raunakkwatra/CricketBuddy.git
   cd CricketBuddy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your local MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=CricketTournamentDB
   PORT=3000
   DB_SSL=false
   ```

4. **Import Database Schema**:
   In your MySQL client or terminal:
   ```bash
   mysql -u root -p < "project rdbms.sql"
   ```

5. **Start the Server**:
   ```bash
   npm start
   ```
   Open **http://localhost:3000** in your browser.

---

## 🛡️ Role-Based Access Control (RBAC)

- **Admin**: Full CRUD access. Create, edit, and delete teams, players, stadiums, sponsors, matches, umpires, and scorecards (Password: `admin123`).
- **Viewer**: Read-only exploration access. Search, filter, inspect match statistics, and browse squad rosters without password authentication.

---

## 🔍 Database Views (Virtual Tables)

The database includes 7 pre-compiled MySQL Views simplifying multi-table JOINs, accessible via the backend API at `/api/views` or `/api/views/:viewName`:

| View Name | Base Tables Joined | Description |
|---|---|---|
| `TeamDetails` | `CricketTeam` | Complete team profiles, coaches, grounds & owners |
| `PlayerDetails` | `CricketPlayer`, `CricketTeam` | Full player roster with franchise team names |
| `MatchDetails` | `TournamentMatch`, `CricketStadium` | Match schedules with stadium names & host cities |
| `TeamSponsorDetails` | `TeamSponsor`, `CricketTeam` | Brand partnerships & commercial contract values |
| `MatchScorecardDetails` | `MatchScorecard`, `CricketPlayer`, `CricketTeam`, `TournamentMatch` | Multi-way JOIN aggregating runs, balls & wickets |
| `TeamMatchParticipation` | `TeamParticipation`, `CricketTeam`, `TournamentMatch` | Fixture participation lineups & match results |
| `MatchOfficialsDetails` | `MatchOfficials`, `TournamentMatch`, `CricketUmpire` | Accredited umpires & officiating experience |

