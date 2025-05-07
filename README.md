# Turret Defense

A 3D tower defense game where you control a central turret to defend against waves of enemies approaching from all directions. Unlike traditional tower defense games, this game focuses on strategic positioning and timing with a single, upgradeable turret.

## Features

- **Three Turret Types:** Choose between Standard, Sniper, and Machine Gun turrets, each with unique abilities
- **Upgrade System:** Improve your turret's damage, reload speed, and bullet velocity
- **Special Items:** Purchase and use tactical items like absolute zero, shields, time warps, and EMP blasts
- **Boss Battles:** Face powerful boss enemies every 5 waves with regenerative shields
- **Day-Night Cycle:** Dynamic lighting changes as you progress through waves
- **Super Charge:** Build up and activate a powerful temporary boost
- **Leaderboard:** Compare your performance with other players

## Prerequisites

Before you begin, you'll need to install:

- Node.js (which includes npm)

## Installation & Setup

### Step 1: Install Node.js and npm

#### Windows:
1. Download the Node.js installer from [nodejs.org](https://nodejs.org/) (LTS version recommended)
2. Run the installer and follow the installation wizard
3. Verify installation by opening Command Prompt and typing:
```
node --version
npm --version
```

#### macOS:
1. Download the Node.js installer from [nodejs.org](https://nodejs.org/) (LTS version recommended)
2. Run the installer and follow the installation wizard

OR use Homebrew:
```
brew install node
```

Verify installation:
```
node --version
npm --version
```

#### Linux:
Using your distribution's package manager:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Fedora
sudo dnf install nodejs npm
```

Verify installation:
```
node --version
npm --version
```

### Step 2: Unzip the Project

1. Extract it to your preferred location
2. Open a terminal/command prompt and navigate to the extracted folder

### Step 3: Install Dependencies and Start the Game

#### Frontend Setup:
```bash
# Navigate to the frontend directory
cd turret-defense

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

The game should now be running at http://localhost:5173 (or another port if 5173 is in use).

#### Backend Setup (for Leaderboard):
Open a new terminal window and run:

```bash
# Navigate to the backend directory
cd turret-defense-backend

# Install backend dependencies
npm install

# Start the backend server
node server.js
```

The backend server should now be running at http://localhost:3000.


#### Running Tests:
Open a new terminal window and run:

```bash
# Navigate to the frontend directory
cd turret-defense

# Runs the tests
npm run test
```

## How to Play

### Controls:
- **A/D:** Rotate turret left/right
- **S:** Fire (hold for charging with Sniper turret or rapid fire with Machine Gun)
- **Q:** Activate Super Charge when meter is full
- **1-4:** Use special items

### Gameplay Tips:
- Upgrade your turret between waves to increase your chances of survival
- Save coins for special items that can help in difficult situations
- The Super Charge ability can be a lifesaver during boss waves
- Different turret types are better suited for different play styles:
  - **Standard:** Balanced performance
  - **Sniper:** High damage but slow reload
  - **Machine Gun:** Rapid fire but lower damage and can overheat

## Troubleshooting

### Common Issues:

#### "npm command not found"
- Make sure Node.js is properly installed
- Try restarting your terminal/command prompt

#### "Cannot connect to backend/leaderboard"
- Ensure the backend server is running
- Check if port 3000 is available or change the port in server.js

#### Audio Not Working
- Click anywhere on the game screen to enable audio (browsers require user interaction)
- Check if your system volume is on and not muted

## Development

### Project Structure:
- **src/** - Main source code
  - **components/** - React components for game elements
  - **store.js** - Zustand state management
  - **utils/** - Utility functions
- **public/** - Static assets (models, sounds)
- **turret-defense-backend/** - Backend server for leaderboard

### Technologies Used:
- React
- Three.js (via React Three Fiber)
- Zustand for state management
- Express.js for backend
- SQLite for leaderboard database

## Acknowledgments

- 3D models and sound effects from various free resources