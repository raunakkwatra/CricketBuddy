# 🏏 CricketBuddy — Tournament Management System

A full-stack, responsive Cricket Tournament Management System featuring complete CRUD functionality, Role-Based Access Control (Admin / Viewer), dark/light theme switching, and real-time tournament analytics.

---

## 🚀 Tech Stack

- **Frontend**: Vanilla JavaScript (SPA), HTML5, CSS3 with Custom CSS Variables (Light & Dark mode), Lucide Icons
- **Backend**: Node.js & Express REST API
- **Database**: MySQL 9.7 (Supports both `CricketTournamentDB` and `CRICKET` schemas)
- **Deployment**: Vercel (Serverless Functions + Static Hosting)

---

## 📁 Project Structure

```
├── api/
│   └── index.js            # Vercel Serverless Function entrypoint
├── public/
│   ├── index.html          # Main SPA interface
│   ├── style.css           # Master stylesheet (Dark/Light themes)
│   └── app.js              # Frontend logic (State, RBAC, CRUD modals)
├── CRICKETPROJECT.sql      # Database schema and seed data
├── db.js                   # MySQL connection pool (with SSL support)
├── server.js               # Express REST API routes
├── vercel.json             # Vercel deployment & routing config
├── .env.example            # Environment variables template
├── .gitignore              # Ignored files (secrets, node_modules)
└── package.json            # Project dependencies and scripts
```

---

## 💻 Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-github-repo-url>
   cd CRICKETTOURNAMENT
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
   mysql -u root -p < CRICKETPROJECT.sql
   ```

5. **Start the Server**:
   ```bash
   npm start
   ```
   Open **http://localhost:3000** in your browser.

---

## 🐙 Uploading to GitHub

1. **Initialize Git (if not already done)**:
   ```bash
   git init
   git branch -M main
   ```

2. **Stage and commit files**:
   ```bash
   git add .
   git commit -m "feat: complete CricketBuddy tournament management system"
   ```

3. **Link your GitHub repository**:
   Create a new empty repository on [GitHub](https://github.com/new), then run:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

---

## ☁️ Deploying on Vercel

> **Important Note on Database**:
> Vercel runs in the cloud and cannot connect to `localhost:3306` on your computer. To deploy to Vercel, your MySQL database must be hosted on a cloud provider.

### Step 1: Create a Free Cloud MySQL Database
You can use any free MySQL cloud provider:
- **[TiDB Cloud](https://tidbcloud.com/)** (Recommended, 100% free serverless MySQL)
- **[Aiven for MySQL](https://aiven.io/)** (Free tier available)
- **[Railway](https://railway.app/)** (Quick MySQL provisioning)

Once your cloud database is created, import the `CRICKETPROJECT.sql` schema into it and copy your connection credentials (Host, User, Password, Port, Database name).

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com/) and click **"Add New Project"**.
2. Select **"Import Git Repository"** and choose your GitHub repo.
3. In **Project Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
4. Expand **Environment Variables** and add:
   - `DB_HOST`: Your cloud database host (e.g., `gateway01.us-east-1.prod.aws.tidbcloud.com`)
   - `DB_PORT`: `4000` (for TiDB) or `3306`
   - `DB_USER`: Your cloud database username
   - `DB_PASSWORD`: Your cloud database password
   - `DB_NAME`: Your cloud database name
   - `DB_SSL`: `true`
5. Click **"Deploy"**.

Your CricketBuddy dashboard will be live on your custom `.vercel.app` URL!

---

## 🛡️ Role-Based Access Control (RBAC)

- **Admin**: Full access. Add, Edit, and Delete teams, players, stadiums, sponsors, matches, umpires, and scorecards.
- **Viewer**: Read-only access. Search, filter, inspect match statistics, and browse rosters. Action buttons are hidden or disabled.
