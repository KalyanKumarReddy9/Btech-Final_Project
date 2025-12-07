# 🗳️ Decentralized Voting System

A secure blockchain-based voting system with a modern web interface, built using Ethereum smart contracts and a FastAPI backend. This system ensures tamper-proof voting records, enabling users to cast their votes remotely while maintaining anonymity and preventing fraud.

---

## 🌟 Features

### Voter Features
- **Secure Wallet Authentication**: Connect using MetaMask wallet
- **One Vote Per Wallet**: Each Ethereum address can vote only once
- **Real-time Vote Counts**: View current vote counts for all candidates
- **Account Switching**: Automatically detects MetaMask account changes and updates voting eligibility
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **JWT Authentication**: Secure token-based authentication

### Admin Features
- **Candidate Management**: Add and manage candidates with party information
- **Voting Period Control**: Set voting start and end dates
- **Results Dashboard**: View voting results with winner announcement card
- **End Voting**: Manually end voting with beautiful success confirmation
- **Clear Data**: Reset candidates and votes for new elections
- **Admin Panel**: Intuitive UI to manage the entire voting process

---

## 🏗️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+ Modules)
- MetaMask Integration for wallet connectivity
- Modern UI with gradient animations
- Responsive card-based layout

### Backend
- **FastAPI** - High-performance Python web framework
- **MySQL** - Relational database for storing votes and candidates
- **JWT Authentication** - Secure token-based authorization
- **Python 3.8+** - Backend runtime environment

### Blockchain
- **Solidity 0.5.16** - Smart contract programming language
- **Truffle** - Ethereum development framework
- **Ganache** - Local blockchain for development and testing
- **Web3.js** - Ethereum JavaScript API integration

---

## 📋 Requirements

- **Node.js** (v14 or higher)
- **Metamask** Browser Extension
- **Python** 3.8+
- **FastAPI** and dependencies
- **MySQL Database** (port 3306)
- **Ganache** for local blockchain
- **Truffle** - Smart contract development framework

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/KalyanKumarReddy9/Btech-Final_Project.git
cd Btech-Final_Project
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Setup Blockchain with Ganache

#### Install Ganache CLI
```bash
npm install -g ganache
```

#### Start Ganache
```bash
ganache -p 7545
```

> **⚠️ Important**: Use `ganache -p 7545` (NOT `ganache cli -p 7545`)

#### Install Truffle
```bash
npm install -g truffle
```

#### Compile and Deploy Smart Contracts
```bash
truffle compile
truffle migrate
```

### 4. Setup MetaMask

1. Download [MetaMask](https://metamask.io/download/) browser extension
2. Create a new wallet or import existing one
3. Import accounts from Ganache using private keys
4. Add custom network to MetaMask:
   - **Network Name**: Localhost 7545
   - **RPC URL**: http://localhost:7545
   - **Chain ID**: 1337
   - **Currency Symbol**: ETH

### 5. Setup MySQL Database

#### Create Database
```sql
CREATE DATABASE voting_system;
USE voting_system;
```

#### Create Voters Table
```sql
CREATE TABLE voters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    voter_id VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);
```

#### Insert Sample Data
```sql
-- Admin account
INSERT INTO voters (voter_id, password, role) 
VALUES ('admin', 'admin123', 'admin');

-- Voter accounts
INSERT INTO voters (voter_id, password, role) 
VALUES ('voter1', 'pass123', 'voter');

INSERT INTO voters (voter_id, password, role) 
VALUES ('voter2', 'pass123', 'voter');

INSERT INTO voters (voter_id, password, role) 
VALUES ('voter3', 'pass123', 'voter');
```

### 6. Setup Backend (FastAPI)

#### Navigate to Backend Directory
```bash
cd Database_API
```

#### Install Python Dependencies
```bash
pip install fastapi uvicorn python-dotenv mysql-connector-python PyJWT
```

#### Create `.env` File
Create a `.env` file in `Database_API/` folder with the following content:

```env
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_DB=voting_system
SECRET_KEY=your-secret-key-change-this-in-production
```

---

## 🎮 Running the Application

### Step 1: Start Ganache
```bash
ganache -p 7545
```

### Step 2: Start Backend Server
Open a new terminal:
```bash
cd Database_API
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Step 3: Start Frontend Server
Open another terminal in project root:
```bash
npx http-server -p 8080
```

### Step 4: Access the Application

- **Home Page**: http://localhost:8080
- **Login Page**: http://localhost:8080/src/html/login.html
- **Voter Panel**: http://localhost:8080/src/html/index.html (after voter login)
- **Admin Panel**: http://localhost:8080/src/html/admin.html (after admin login)

---

## 📖 Usage Guide

### For Voters

#### 1. Login
- Navigate to login page: http://localhost:8080/src/html/login.html
- Enter voter credentials (e.g., `voter1` / `pass123`)
- Select **"Voter"** role from dropdown
- Click **Login** button

#### 2. Connect MetaMask Wallet
- Click **"Connect Wallet"** button
- Approve connection request in MetaMask popup
- Your wallet address will be displayed on screen

#### 3. View Candidates
Each candidate card shows:
- **Candidate Name**
- **Party Name**
- **Current Vote Count**

#### 4. Cast Your Vote
- Click on a candidate card to select
- Click **"Cast Vote"** button at the bottom
- Confirm the transaction in MetaMask
- Success message appears confirming your vote

#### 5. Switch Accounts (Optional)
- Switch to a different account in MetaMask
- System automatically detects the change
- New account can vote if it hasn't voted before
- "You have already voted" message appears for accounts that voted

### For Admins

#### 1. Login
- Use admin credentials: `admin` / `admin123`
- Select **"Admin"** role from dropdown
- Click **Login**

#### 2. Add Candidates
- Enter **Candidate Name** in first field
- Enter **Party Name** in second field
- Click **"Add Candidate"** button
- Confirmation alert appears

#### 3. Set Voting Period
- Select **Start Date** from calendar
- Select **End Date** from calendar
- Click **"Set Dates"** button
- Voting period is now active
- Only votes during this period will be accepted

#### 4. View Results
- Click **"Show Results"** button
- **Winner Announcement Card** displays:
  - 🏆 Trophy icon
  - Winner's name and party
  - Total votes received
  - If tie: "Multiple Winners!" message
- All candidates shown below sorted by vote count
- Winner highlighted with **gold border**
- Results scroll into view automatically

#### 5. End Voting
- Click **"End Voting"** button
- Confirm action in dialog box
- **Beautiful Success Card** appears with:
  - ✅ Green checkmark icon
  - **"Thank You!"** heading
  - **"The voting has been ended successfully"** message
  - **"Voting is now inactive"** subtext
  - **Close** button
- Card auto-closes after 5 seconds
- Voting immediately becomes inactive

#### 6. Clear All Data (Testing)
API endpoint to reset database:
```bash
curl -X POST http://127.0.0.1:8000/admin/clear-candidates \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## 🔐 Security Features

- ✅ **JWT Authentication**: Secure token-based auth with expiration
- ✅ **Wallet-based Voting**: Each Ethereum address can vote only once
- ✅ **Password Protection**: User credentials stored securely
- ✅ **SQL Injection Protection**: Parameterized queries
- ✅ **CORS Configuration**: Controlled cross-origin requests
- ✅ **Admin-only Routes**: Protected endpoints for admin operations
- ✅ **XSS Prevention**: HTML escaping for all user inputs
- ✅ **Role-based Access**: Admin and voter role separation
- ✅ **MetaMask Account Detection**: Automatic account change detection

---

## 📁 Project Structure

```
├── contracts/              # Solidity smart contracts
│   ├── Voting.sol         # Main voting contract with on-chain logic
│   └── Migrations.sol     # Truffle migrations contract
│
├── migrations/            # Truffle migration scripts
│   ├── 1_initial_migration.js
│   └── 2_deploy_contracts.js
│
├── build/                 # Compiled contract artifacts
│   └── contracts/
│       ├── Voting.json    # Compiled voting contract ABI
│       └── Migrations.json
│
├── Database_API/          # FastAPI backend server
│   ├── main.py           # API routes and business logic
│   └── .env              # Environment variables (create this!)
│
├── src/
│   ├── html/             # Frontend HTML pages
│   │   ├── login.html    # Login page for voters and admin
│   │   ├── index.html    # Voter voting interface
│   │   └── admin.html    # Admin management panel
│   │
│   ├── css/              # Stylesheets
│   │   ├── login.css     # Login page styles
│   │   ├── index.css     # Voter panel styles with card layout
│   │   └── admin.css     # Admin panel styles with animations
│   │
│   └── js/               # JavaScript modules
│       ├── wallet.js     # MetaMask integration and wallet functions
│       ├── admin.js      # Admin panel functionality
│       └── admin-init.js # Admin page initialization
│
├── truffle-config.js     # Truffle configuration
├── package.json          # Node.js dependencies
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

---

## 🛠️ API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Authenticate voter/admin and return JWT token |
| GET | `/public/candidates` | List all candidates (no auth required) |

### Voter Endpoints (Requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/candidates` | Get all candidates with vote counts |
| GET | `/dates` | Get voting start and end dates |
| POST | `/has-voted` | Check if wallet address has already voted |
| POST | `/vote` | Cast a vote for a candidate |

### Admin Endpoints (Requires Admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/add-candidate` | Add a new candidate |
| POST | `/set-dates` | Set voting period dates |
| POST | `/admin/clear-candidates` | Clear all candidates and votes |
| GET | `/voting-status` | Get current voting status (active/inactive) |


## 📝 Configuration Files

### `.env` File (Database_API/)

```env
# MySQL Database Configuration
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
MYSQL_DB=voting_system

# JWT Secret Key (Change this in production!)
SECRET_KEY=your-very-secure-secret-key-at-least-32-characters-long
```


## 🔄 How It Works

### Voting Flow

1. **Admin Setup**:
   - Admin adds candidates to database
   - Admin sets voting start and end dates
   - Dates stored both in database and blockchain

2. **Voter Authentication**:
   - Voter logs in with credentials
   - JWT token issued for API access
   - MetaMask wallet connected

3. **Vote Casting**:
   - System checks if wallet already voted
   - System verifies voting is active (date check)
   - Vote recorded with wallet address as voter ID
   - Vote count incremented in database
   - Transaction recorded on blockchain

4. **Results**:
   - Admin clicks "Show Results"
   - Database queried for all candidates
   - Sorted by vote count (highest first)
   - Winner displayed with special announcement
   - All results shown in cards

5. **End Voting**:
   - Admin clicks "End Voting"
   - End date set to yesterday
   - Voting becomes inactive immediately
   - Success card displayed

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch:
```bash
git checkout -b feature/AmazingFeature
```
3. Commit your changes:
```bash
git commit -m 'Add some AmazingFeature'
```
4. Push to branch:
```bash
git push origin feature/AmazingFeature
```
5. Open a Pull Request

### Coding Guidelines
- Follow existing code style
- Comment complex logic
- Test your changes thoroughly
- Update documentation as needed

---
## 👥 Authors


### Contributors
- Blockchain Development
- Backend API Development
- Frontend UI/UX Design
- Database Architecture
- Testing and Documentation

---

## 🙏 Acknowledgments

- **Truffle Suite** - For excellent blockchain development tools
- **FastAPI** - For the amazing Python web framework
- **MetaMask** - For seamless wallet integration
- **Ganache** - For local blockchain environment
- **Font Awesome** - For beautiful icons
- **MySQL** - For reliable database management
- **Ethereum Foundation** - For blockchain technology

---

## 📞 Support & Contact

### For Issues
- 🐛 Report bugs on [GitHub Issues](https://github.com/KalyanKumarReddy9/Btech-Final_Project/issues)
- 💬 Ask questions in [Discussions](https://github.com/KalyanKumarReddy9/Btech-Final_Project/discussions)

### Documentation
- 📚 Read this README carefully
- 🔍 Check existing issues before creating new ones
- 📝 Follow installation steps exactly

## 🎓 Learning Resources

### Blockchain
- [Ethereum Official Docs](https://ethereum.org/en/developers/docs/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Truffle Suite Docs](https://trufflesuite.com/docs/)

### Backend
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Python Official Tutorial](https://docs.python.org/3/tutorial/)

### Frontend
- [MetaMask Docs](https://docs.metamask.io/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Happy Voting! 🗳️✨**

---

*Made with ❤️ by Team KBN Hackathon*

*Last Updated: December 2025*
