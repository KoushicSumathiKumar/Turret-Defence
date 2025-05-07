import { useState } from "react"
import { ClipboardCheck, Code, Cpu, FileCheck, Gamepad2, Layers, Music, TestTube2, Wrench } from "lucide-react"

export default function AboutPage({ returnToMenu }) {
  const [activeTab, setActiveTab] = useState("gameplay")

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #121212 0%, #1E1E1E 100%)",
        color: "white",
        fontFamily: "'Roboto', 'Segoe UI', sans-serif",
        padding: "20px",
        overflow: "auto",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "0.5rem",
            background: "linear-gradient(to bottom, #ff5555, #ff2222)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 20px rgba(255,85,85,0.4)",
            fontWeight: "900",
          }}
        >
          TURRET DEFENSE
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            opacity: 0.7,
          }}
        >
          Technical Documentation & Development Journey
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <TabButton
          icon={<Gamepad2 size={18} />}
          label="Gameplay"
          active={activeTab === "gameplay"}
          onClick={() => setActiveTab("gameplay")}
        />
        <TabButton
          icon={<Cpu size={18} />}
          label="Architecture"
          active={activeTab === "architecture"}
          onClick={() => setActiveTab("architecture")}
        />
        <TabButton
          icon={<Layers size={18} />}
          label="Technologies"
          active={activeTab === "technologies"}
          onClick={() => setActiveTab("technologies")}
        />
        <TabButton
          icon={<TestTube2 size={18} />}
          label="Testing"
          active={activeTab === "testing"}
          onClick={() => setActiveTab("testing")}
        />
        <TabButton
          icon={<Code size={18} />}
          label="Development"
          active={activeTab === "development"}
          onClick={() => setActiveTab("development")}
        />
        <TabButton
          icon={<Wrench size={18} />}
          label="3D Features"
          active={activeTab === "3dfeatures"}
          onClick={() => setActiveTab("3dfeatures")}
        />
        <TabButton
          icon={<ClipboardCheck size={18} />}
          label="Assessment"
          active={activeTab === "assessment"}
          onClick={() => setActiveTab("assessment")}
        />
        <TabButton
          icon={<FileCheck size={18} />}
          label="Originality"
          active={activeTab === "originality"}
          onClick={() => setActiveTab("originality")}
        />
        <TabButton
          icon={<Music size={18} />}
          label="Credits"
          active={activeTab === "credits"}
          onClick={() => setActiveTab("credits")}
        />
      </div>

      {/* Content Container */}
      <div
        style={{
          background: "rgba(20,20,20,0.6)",
          backdropFilter: "blur(10px)",
          padding: "2rem",
          borderRadius: "16px",
          flex: 1,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          overflowY: "auto",
          marginBottom: "2rem",
        }}
      >
        {activeTab === "gameplay" && <GameplayContent />}
        {activeTab === "architecture" && <ArchitectureContent />}
        {activeTab === "technologies" && <TechnologiesContent />}
        {activeTab === "testing" && <TestingContent />}
        {activeTab === "development" && <DevelopmentContent />}
        {activeTab === "3dfeatures" && <ThreeDFeaturesContent />}
        {activeTab === "assessment" && <AssessmentContent />}
        {activeTab === "originality" && <OriginalityContent />}
        {activeTab === "credits" && <CreditsContent />}
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={returnToMenu}
          style={{
            padding: "15px 30px",
            fontSize: "1.2rem",
            background: "linear-gradient(to bottom, #ff5555, #ff2222)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 15px rgba(255,85,85,0.3)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Return to Main Menu
        </button>
      </div>
    </div>
  )
}

// Tab Button Component
function TabButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        background: active ? "linear-gradient(to bottom, #ff5555, #ff2222)" : "rgba(255,255,255,0.1)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontWeight: active ? "bold" : "normal",
        boxShadow: active ? "0 4px 15px rgba(255,85,85,0.3)" : "none",
      }}
      onMouseOver={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.2)"
      }}
      onMouseOut={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.1)"
      }}
    >
      {icon}
      {label}
    </button>
  )
}

// Section Title Component
function SectionTitle({ children }) {
  return (
    <h2
      style={{
        color: "#ff5555",
        marginBottom: "1rem",
        fontSize: "1.8rem",
        borderBottom: "1px solid rgba(255,85,85,0.3)",
        paddingBottom: "0.5rem",
      }}
    >
      {children}
    </h2>
  )
}

// Subsection Title Component
function SubsectionTitle({ children }) {
  return (
    <h3
      style={{
        color: "#ff9999",
        marginTop: "1.5rem",
        marginBottom: "0.75rem",
        fontSize: "1.4rem",
      }}
    >
      {children}
    </h3>
  )
}

// Paragraph Component
function Paragraph({ children }) {
  return (
    <p
      style={{
        lineHeight: "1.6",
        marginBottom: "1rem",
        fontSize: "1.1rem",
        color: "#e0e0e0",
      }}
    >
      {children}
    </p>
  )
}

// Code Block Component
function CodeBlock({ children }) {
  return (
    <pre
      style={{
        background: "rgba(0,0,0,0.3)",
        padding: "1rem",
        borderRadius: "8px",
        overflowX: "auto",
        marginBottom: "1.5rem",
        fontFamily: "monospace",
        fontSize: "0.9rem",
        color: "#e0e0e0",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <code>{children}</code>
    </pre>
  )
}

// Feature List Component
function FeatureList({ items }) {
  return (
    <ul
      style={{
        marginBottom: "1.5rem",
        paddingLeft: "1.5rem",
      }}
    >
      {items.map((item, index) => (
        <li
          key={index}
          style={{
            marginBottom: "0.5rem",
            lineHeight: "1.5",
            fontSize: "1.1rem",
            color: "#e0e0e0",
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

// Info Box Component
function InfoBox({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(255,85,85,0.1)",
        border: "1px solid rgba(255,85,85,0.3)",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1.5rem",
      }}
    >
      <h4
        style={{
          color: "#ff5555",
          marginTop: 0,
          marginBottom: "0.5rem",
          fontSize: "1.2rem",
        }}
      >
        {title}
      </h4>
      <div style={{ color: "#e0e0e0", fontSize: "1rem", lineHeight: "1.5" }}>{children}</div>
    </div>
  )
}

// Table Component
function Table({ headers, rows }) {
  return (
    <div
      style={{
        overflowX: "auto",
        marginBottom: "1.5rem",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "1rem",
        }}
      >
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                style={{
                  textAlign: "left",
                  padding: "0.75rem",
                  background: "rgba(255,85,85,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: rowIndex % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.3)",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Gameplay Content
function GameplayContent() {
  return (
    <div>
      <SectionTitle>Game Overview</SectionTitle>
      <Paragraph>
        Turret Defense is a 3D tower defense game where players control a central turret to defend against waves of
        enemies approaching from all directions. Unlike traditional tower defense games where players place multiple
        towers, this game focuses on strategic positioning and timing with a single, upgradeable turret.
      </Paragraph>

      <SubsectionTitle>Core Gameplay</SubsectionTitle>
      <Paragraph>
        Players must survive increasingly difficult waves of enemies by rotating their turret and firing at approaching
        threats. The game features a day-night cycle that affects visibility with fog effects and creates a dynamic
        battlefield environment.
      </Paragraph>

      <FeatureList
        items={[
          "Select from four difficulty levels (Easy, Medium, Hard, Impossible) that affect enemy health and speed",
          "Rotate turret with A/D keys to target  Impossible) that affect enemy health and speed",
          "Rotate turret with A/D keys to target enemies approaching from all directions",
          "Fire with S key (hold for charging with Sniper turret, rapid fire with Machine Gun)",
          "Activate Super Charge ability with Q key when the meter is full",
          "Purchase upgrades between waves to improve your turret's capabilities",
          "Buy and use special items to gain tactical advantages during difficult waves",
          "Face powerful boss enemies every 5 waves with regenerative shields",
        ]}
      />

      <SubsectionTitle>Turret Types</SubsectionTitle>
      <Table
        headers={["Turret", "Strengths", "Weaknesses", "Special Ability"]}
        rows={[
          ["Standard", "Balanced damage and fire rate", "No special abilities", "None (good all-around performance)"],
          ["Sniper", "High damage, long range", "Slow reload time", "Charge shots for increased damage and velocity"],
          [
            "Machine Gun",
            "Rapid fire rate",
            "Lower damage per shot, overheats with continuous use",
            "Sustained fire until overheated",
          ],
        ]}
      />

      <SubsectionTitle>Progression System</SubsectionTitle>
      <Paragraph>
        As players defeat enemies, they earn coins that can be spent on permanent upgrades and consumable items. The
        upgrade system allows players to improve their turret's damage, reload speed, and bullet velocity, creating a
        sense of progression throughout the game.
      </Paragraph>

      <InfoBox title="Super Charge System">
        <p>
          The Super Charge meter fills as you defeat enemies. When full, activate it with the Q key to temporarily goes
          one level beyond all your turret's maximum stats, allowing for devastating damage output for a limited time.
        </p>
      </InfoBox>

      <SubsectionTitle>Enemy Types</SubsectionTitle>
      <FeatureList
        items={[
          "Normal Enemies: Basic units with standard health and speed",
          "Tank Enemies: Slower but more durable enemies that require more hits to defeat",
          "Boss Enemies: Appear every 5 waves with high health, regenerative shields, and special abilities",
        ]}
      />

      <SubsectionTitle>Special Items</SubsectionTitle>
      <Table
        headers={["Item", "Effect", "Best Used For"]}
        rows={[
          ["Absolute Zero", "Slows all enemies for 10 seconds", "When overwhelmed by multiple fast enemies"],
          [
            "Time Warp",
            "Resets all enemies to random positions in their spawn",
            "When enemies get too close to your turret",
          ],
          ["Shield", "Temporary invulnerability for 5 seconds", "Emergency protection when about to be overrun"],
          [
            "EMP Blast",
            "Temporarily stuns all enemies for 3 seconds",
            "Creating breathing room to focus on priority targets",
          ],
        ]}
      />

      <SubsectionTitle>Leaderboard System</SubsectionTitle>
      <Paragraph>
        Turret Defense features a global leaderboard system that tracks and displays the highest scores achieved by players. 
        This competitive element adds replay value and encourages players to improve their strategies to climb the rankings.
      </Paragraph>

      <FeatureList
        items={[
          "Global leaderboard tracking top scores across all players",
          "Player name submission after game over",
          "Sorting by score with timestamps for tiebreakers",
          "Persistent storage ensuring scores remain even after browser closure",
          "Real-time updates when new high scores are achieved"
        ]}
      />

      <InfoBox title="Leaderboard Strategy">
        <p>
          The leaderboard adds a competitive dimension to the game, encouraging players to experiment with different 
          turret types and upgrade paths to maximize their score. Players can compare strategies by seeing which 
          approaches achieve the highest scores on the global rankings.
        </p>
      </InfoBox>
    </div>
  )
}

// Architecture Content
function ArchitectureContent() {
  return (
    <div>
      <SectionTitle>Technical Architecture</SectionTitle>
      <Paragraph>
        Turret Defense is built using a component-based architecture with React and Three.js (via React Three Fiber).
        The game employs a central state management system using Zustand, with a clear separation between game logic,
        rendering, and UI components.
      </Paragraph>

      <SubsectionTitle>Core Architecture Components</SubsectionTitle>
      <FeatureList
        items={[
          "React for UI and component management",
          "Three.js and React Three Fiber for 3D rendering",
          "Zustand for global state management",
          "Custom game loop using useFrame from React Three Fiber",
          "Component-based design for modularity and reusability",
        ]}
      />

      <SubsectionTitle>State Management</SubsectionTitle>
      <Paragraph>
        The game uses Zustand for state management, providing a centralized store that handles game state, player
        progress, enemy tracking, and UI state. This approach allows for clean separation of concerns and makes it easy
        to track and debug state changes.
      </Paragraph>

      <CodeBlock>{`// Example of state management with Zustand
export const useGameStore = create((set, get) => ({
  // Game state
  wave: 1,
  gameOver: false,
  enemiesKilled: 0,
  enemiesRemaining: 5,
  
  // Methods to update state
  killEnemy: (enemyType) => {
    set((state) => ({
      enemiesKilled: state.enemiesKilled + 1,
      enemiesRemaining: Math.max(0, state.enemiesRemaining - 1),
      // Additional state updates...
    }))
  },
  
  // Other state and methods...
}))`}</CodeBlock>

      <SubsectionTitle>Component Hierarchy</SubsectionTitle>
      <Paragraph>
        The game follows a hierarchical component structure, with the main Game component orchestrating the 3D scene and
        game logic, while specialized components handle specific aspects like enemies, projectiles, and UI elements.
      </Paragraph>

      <InfoBox title="Component Structure">
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li>App (Router & Main Entry)</li>
          <li style={{ marginLeft: "1rem" }}>MainMenu</li>
          <li style={{ marginLeft: "1rem" }}>GameScreen</li>
          <li style={{ marginLeft: "2rem" }}>Game (3D Scene)</li>
          <li style={{ marginLeft: "3rem" }}>Turret</li>
          <li style={{ marginLeft: "3rem" }}>Enemy/Boss</li>
          <li style={{ marginLeft: "3rem" }}>Projectile</li>
          <li style={{ marginLeft: "3rem" }}>Ground</li>
          <li style={{ marginLeft: "3rem" }}>DayNightCycle</li>
          <li style={{ marginLeft: "2rem" }}>UI</li>
          <li style={{ marginLeft: "3rem" }}>UpgradeScreen</li>
          <li style={{ marginLeft: "3rem" }}>ShopScreen</li>
          <li style={{ marginLeft: "3rem" }}>ItemsBar</li>
          <li style={{ marginLeft: "1rem" }}>AboutPage</li>
          <li style={{ marginLeft: "1rem" }}>ModelViewerPage</li>
        </ul>
      </InfoBox>

      <SubsectionTitle>MVC Architecture</SubsectionTitle>
      <Paragraph>
        Turret Defense follows the Model-View-Controller (MVC) architectural pattern, which separates the application into three interconnected components to promote modularity and code organization.
      </Paragraph>

      <InfoBox title="MVC Implementation">
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li><strong>Model (Zustand Store):</strong> The game's data layer is implemented in <code>store.js</code> using Zustand. This contains all game state including player stats, enemy tracking, upgrade levels, and game progress.</li>
          <li><strong>View (React Components):</strong> UI components like <code>Game.jsx</code>, <code>UI.jsx</code>, <code>MainMenu.jsx</code>, and <code>UpgradeScreen.jsx</code> form the view layer, rendering the game state for the player.</li>
          <li><strong>Controller (Game Logic):</strong> Components like <code>Turret.jsx</code>, <code>Enemy.jsx</code>, and game logic within <code>Game.jsx</code> act as controllers, handling user input and updating the model.</li>
        </ul>
      </InfoBox>

      <Paragraph>
        This separation of concerns allows for easier maintenance, testing, and code reuse. When a player performs an action (controller), the game state updates (model), which then triggers UI updates (view).
      </Paragraph>

      <CodeBlock>{`// Example of MVC pattern in our codebase

      // Model (store.js)
      export const useGameStore = create((set) => ({
        // Game state
        score: 0,
        health: 100,
        
        // Actions that modify the model
        takeDamage: (amount) => set((state) => ({ 
          health: Math.max(0, state.health - amount) 
        })),
        
        addScore: (points) => set((state) => ({
          score: state.score + points
        })),
      }))

      // Controller (Game component)
      function Game() {
        // Game logic that handles user input and updates model
        const takeDamage = useGameStore((state) => state.takeDamage)
        const addScore = useGameStore((state) => state.addScore)
        
        const handleEnemyHit = () => {
          addScore(10) // Updates the model
        }
        
        // More game logic...
      }

      // View (UI component)
      function GameUI() {
        // Reads from model and renders UI
        const score = useGameStore((state) => state.score)
        const health = useGameStore((state) => state.health)
        
        return (
          <div>
            <div>Score: {score}</div>
            <div>Health: {health}</div>
          </div>
        )
      }`}</CodeBlock>

      <SubsectionTitle>Backend Architecture</SubsectionTitle>
      <Paragraph>
        Turret Defense implements a client-server architecture with a dedicated backend server handling the leaderboard system. 
        This separation allows for persistent data storage and global leaderboard functionality across multiple players.
      </Paragraph>

      <InfoBox title="Backend Implementation">
        <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
          <li><strong>Server:</strong> Express.js server (<code>server.js</code>) handling API requests for leaderboard operations</li>
          <li><strong>Database:</strong> SQLite database for persistent storage of player scores and names</li>
          <li><strong>API Endpoints:</strong> RESTful endpoints for retrieving leaderboard data and submitting new scores</li>
          <li><strong>Client Integration:</strong> Frontend communicates with the backend via fetch API calls</li>
        </ul>
      </InfoBox>

      <Paragraph>
        This backend architecture enables the game to maintain a persistent leaderboard that survives page refreshes and browser 
        sessions, creating a more engaging and competitive experience for players.
      </Paragraph>

      <SubsectionTitle>Game Loop</SubsectionTitle>
      <Paragraph>
        The game loop is implemented using React Three Fiber's useFrame hook, which runs on every animation frame. This
        loop handles enemy movement, collision detection, projectile physics, and other time-dependent game mechanics.
      </Paragraph>

      <SubsectionTitle>Physics and Collision Detection</SubsectionTitle>
      <Paragraph>
        The game implements a simplified physics system for projectile movement and custom collision detection between
        projectiles and enemies. This approach provides good performance while maintaining accurate gameplay mechanics.
      </Paragraph>

      <SubsectionTitle>Data Flow</SubsectionTitle>
      <Paragraph>
        Data flows primarily through the Zustand store, with components subscribing to relevant state slices. This
        unidirectional data flow makes the application more predictable and easier to debug. User inputs trigger state
        changes, which then propagate to the relevant components.
      </Paragraph>
    </div>
  )
}

// Technologies Content
function TechnologiesContent() {
  return (
    <div>
      <SectionTitle>Technologies & Libraries</SectionTitle>
      <Paragraph>
        Turret Defense leverages modern web technologies and libraries to create an immersive 3D gaming experience
        directly in the browser, without requiring any plugins or additional downloads.
      </Paragraph>

      <SubsectionTitle>Core Technologies</SubsectionTitle>
      <Table
        headers={["Technology", "Purpose"]}
        rows={[
          ["React", "UI component management and rendering"],
          ["Three.js", "3D rendering engine"],
          ["React Three Fiber", "React bindings for Three.js"],
          ["React Three Drei", "Useful helpers for React Three Fiber"],
          ["Zustand", "Lightweight state management"],
          ["React Router", "Navigation and routing"],
          ["Vitest", "Testing framework"],
          ["GSAP", "Animation library for advanced transitions"],
          ["Postprocessing", "Post-processing effects for Three.js"],
        ]}
      />

      <SubsectionTitle>3D Rendering</SubsectionTitle>
      <Paragraph>
        The game uses Three.js through React Three Fiber to render the 3D environment. This combination provides the
        power of Three.js with the component-based approach of React, making it easier to manage complex 3D scenes.
      </Paragraph>

      <FeatureList
        items={[
          "Custom GLSL shaders for special effects like holographic displays and shields",
          "Dynamic lighting system that changes with the day-night cycle",
          "Post-processing pipeline for bloom, chromatic aberration, and other visual effects",
          "Optimized rendering with frustum culling and level-of-detail techniques",
          "Custom materials for visual effects like glowing projectiles and enemy highlights",
          "Exploded view visualization for model inspection",
        ]}
      />

      <SubsectionTitle>Audio System</SubsectionTitle>
      <Paragraph>
        The game implements a custom audio system using the Web Audio API, with features like sound pooling, spatial
        audio, and dynamic volume adjustment based on game state.
      </Paragraph>

      <CodeBlock>{`// Sound utility example
const SoundEffects = {
  playButtonClick: () => playSound(sounds.buttonClick),
  playShooting: () => playSound(sounds.shooting),
  playSuperChargeActivate: () => playSound(sounds.superChargeActivate),
  // Other sound methods...
  
  // Method to unlock audio context on user interaction
  unlockAudio: unlockAudioContext,
}`}</CodeBlock>

      <SubsectionTitle>Performance Optimizations</SubsectionTitle>
      <Paragraph>
        Several performance optimizations have been implemented to ensure smooth gameplay even on lower-end devices:
      </Paragraph>

      <FeatureList
        items={[
          "Object pooling for frequently created/destroyed objects like projectiles",
          "Distance-based rendering for enemies (simplified models at a distance)",
          "Efficient collision detection using spatial partitioning",
          "Throttling of non-critical updates during intense gameplay moments",
          "Asynchronous loading of assets to prevent blocking the main thread",
        ]}
      />

      <SubsectionTitle>Responsive Design</SubsectionTitle>
      <Paragraph>
        The game UI is fully responsive, adapting to different screen sizes and orientations. This is achieved through:
      </Paragraph>

      <FeatureList
        items={[
          "Viewport-relative units (vh/vw) for consistent sizing across devices",
          "Flexible layouts that adapt to available screen space",
          "Touch controls that automatically activate on touch-enabled devices",
          "Dynamic adjustment of game parameters based on device capabilities",
        ]}
      />

      <InfoBox title="Browser Compatibility">
        <p>
          The game is optimized for modern browsers (Chrome, Firefox, Safari, Edge) and uses feature detection to
          provide fallbacks where necessary.
        </p>
      </InfoBox>
    </div>
  )
}

// Testing Content
function TestingContent() {
  return (
    <div>
      <SectionTitle>Testing Methodology & Results</SectionTitle>
      <Paragraph>
        Testing was a critical part of my development process for Turret Defense. I implemented multiple testing
        strategies to ensure game stability, performance, and a balanced gameplay experience.
      </Paragraph>

      <SubsectionTitle>Unit Testing</SubsectionTitle>
      <Paragraph>
        I used Vitest and React Testing Library to create unit tests for critical game components and logic. These tests
        verify that individual parts of the game function correctly in isolation.
      </Paragraph>

      <CodeBlock>{`// Example unit test for the killEnemy function from store.test.js
test('killEnemy should increment kills and decrement remaining enemies', () => {
  const { result } = renderHook(() => useGameStore())

  act(() => {
    result.current.killEnemy('normal')
  })

  expect(result.current.enemiesKilled).toBe(1)
  expect(result.current.enemiesRemaining).toBe(4)
})`}</CodeBlock>

      <SubsectionTitle>Component Testing</SubsectionTitle>
      <Paragraph>
        I created tests for key components to ensure they render correctly and respond appropriately to user
        interactions.
      </Paragraph>

      <FeatureList
        items={[
          "UI Component Tests: Verify that UI elements display correctly and respond to game state changes",
          "MainMenu Component Tests: Ensure difficulty selection and turret type selection work correctly",
          "Game Component Tests: Validate game initialization and state updates during gameplay",
          "Turret Component Tests: Confirm turret rendering and animation controls function properly",
        ]}
      />

      <InfoBox title="Testing Approach">
        <p>
          For components with complex Three.js dependencies, I implemented mock components to focus on testing the logic
          rather than the 3D rendering. This approach allowed me to achieve good test coverage without the complexity of
          testing WebGL directly.
        </p>
      </InfoBox>

      <SubsectionTitle>Store Testing</SubsectionTitle>
      <Paragraph>
        The Zustand store is the backbone of the game's state management, so I created thorough tests for its
        functionality:
      </Paragraph>

      <FeatureList
        items={[
          "Basic State Tests: Verify initial state values and reset functions",
          "Enemy Management Tests: Validate enemy tracking, killing, and removal",
          "Upgrade System Tests: Ensure upgrades apply correctly and respect maximum levels",
          "Shop Items Tests: Confirm item purchase, activation, and cooldown mechanics",
          "Super Charge Tests: Test activation conditions and effects on gameplay",
        ]}
      />

      <CodeBlock>{`// Example test for the upgrade system from store.test.js
test('purchaseUpgrade should deduct correct coins and increase upgrade level', () => {
  const { result } = renderHook(() => useGameStore())

  // Add coins first
  act(() => {
    result.current.addCoins(50)
  })

  // Purchase upgrade
  act(() => {
    const success = result.current.purchaseUpgrade('damage')
    expect(success).toBe(true)
  })

  // Verify upgrade level increased and coins deducted
  expect(result.current.upgrades.damage).toBe(1)
  expect(result.current.coins).toBe(40)
})`}</CodeBlock>

      <SubsectionTitle>Manual Testing</SubsectionTitle>
      <Paragraph>
        In addition to automated tests, I conducted extensive manual testing to ensure a smooth gameplay experience:
      </Paragraph>

      <FeatureList
        items={[
          "Gameplay Balance: Adjusted difficulty levels, enemy spawning, and upgrade costs based on extensive playtesting sessions",
          "Performance Testing: Identified and fixed performance bottlenecks during intense gameplay with many enemies and effects",
          "UI Accessibility: Refined HUD elements, button placement, and information displays based on player feedback for intuitive controls",
          "Visual Consistency: Ensured health bars, coin displays, and wave indicators maintained proper alignment and visibility during gameplay",
          "Cross-Browser Compatibility: Verified game functionality and appearance across Chrome, Firefox, Safari, and Edge browsers",
          "Cross-Platform Design: Adapted UI elements and controls for both desktop and mobile experiences with appropriate sizing",
          "Touch Interface Testing: Optimized button placement and interaction areas for comfortable gameplay on touchscreen devices",
          "UI Regression Testing: Verified existing interface elements remained functional after implementing new features like boss shields",
          "Edge Case Scenarios: Tested unusual gameplay situations like rapid wave transitions and extreme upgrade combinations",
        ]}
      />
    </div>
  )
}

// Development Content
function DevelopmentContent() {
  return (
    <div>
      <SectionTitle>Development Process</SectionTitle>
      <Paragraph>
        Turret Defense was developed using an iterative approach, with regular playtesting and feedback cycles informing
        each stage of development. This process allowed me to continuously refine the gameplay experience and technical
        implementation.
      </Paragraph>

      <SubsectionTitle>Development Methodology</SubsectionTitle>
      <Paragraph>
        I followed an Agile-inspired development process with short iterations. This allowed me to adapt quickly to
        playtest findings and technical challenges.
      </Paragraph>

      <FeatureList
        items={[
          "Weekly development sprints with clear goals and deliverables",
          "Regular playtesting sessions",
          "Continuous integration with automated testing",
          "Feature prioritization based on player impact and technical feasibility",
          "Regular code refactoring to maintain quality",
        ]}
      />

      <SubsectionTitle>Key Design Decisions</SubsectionTitle>
      <InfoBox title="Single Turret Focus">
        <p>
          Unlike traditional tower defense games with multiple towers, I chose to focus on a single, upgradeable turret.
          This decision was made to create a more action-oriented experience that highlights player skill and strategic
          decision-making over placement optimization.
        </p>
      </InfoBox>

      <InfoBox title="3D Implementation Using React Fiber">
        <p>
          I built the game in 3D using <code>@react-three/fiber</code>, which integrates Three.js into React. Compared
          to vanilla JavaScript, this approach offers a more declarative and modular structure, making it easier to
          manage complex scenes. It also enabled immersive visuals, a day-night cycle, and interactive 3D gameplay, all
          within the React ecosystem.
        </p>
      </InfoBox>

      <InfoBox title="Component-Based Architecture">
        <p>
          The decision to use a component-based architecture with React and Zustand provided excellent modularity and
          maintainability. This approach allowed me to work on different components independently and made it easier to
          test individual parts of the game in isolation.
        </p>
      </InfoBox>

      <SubsectionTitle>Asset</SubsectionTitle>
      <Paragraph>Game assets were created using a combination of tools and optimized for web delivery:</Paragraph>

      <FeatureList
        items={[
          "3D models created in Blender and exported as glTF for optimal loading performance",
          "Textures from the web were used and optimized with compression techniques",
          "Sound effects from the web were used and optimized for web playback",
          "UI elements designed in Figma and implemented with CSS/React",
        ]}
      />
    </div>
  )
}

// 3D Features Content
function ThreeDFeaturesContent() {
  return (
    <div>
      <SectionTitle>Advanced 3D Visualization Features</SectionTitle>
      <Paragraph>
        The Model Viewer component of Turret Defense showcases advanced 3D visualization techniques using Three.js and
        React Three Fiber. These features demonstrate sophisticated rendering capabilities and interactive 3D
        visualization techniques that improve the user experience and showcase technical proficiency in WebGL and shader
        programming.
      </Paragraph>

      <SubsectionTitle>Custom GLSL Shaders</SubsectionTitle>
      <Paragraph>
        The Model Viewer implements custom GLSL shaders that provide unique visual effects beyond standard materials.
        These shaders are written directly in GLSL and integrated with React Three Fiber using the shaderMaterial
        utility.
      </Paragraph>

      <InfoBox title="Hologram Shader">
        <p>The custom hologram shader creates a sci-fi inspired visualization with the following features:</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>Dynamic grid pattern overlay that responds to UV coordinates</li>
          <li>Pulsing rim light effect that highlights model edges</li>
          <li>Animated scan lines that move across the model surface</li>
          <li>Procedural noise for added visual complexity</li>
          <li>User-adjustable parameters for color, intensity, grid density, and animation speed</li>
        </ul>
      </InfoBox>

      <CodeBlock>{`// Fragment shader excerpt
uniform float time;
uniform vec3 color;
uniform float intensity;
uniform float gridSize;
uniform float pulseSpeed;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Create a pulsing rim light effect
  float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
  rim = pow(rim, 2.0) * sin(time * pulseSpeed) * 0.5 + 0.5;
  
  // Create a holographic grid pattern
  float gridX = step(0.98, fract(vUv.x * gridSize));
  float gridY = step(0.98, fract(vUv.y * gridSize));
  float grid = 0.15 * (gridX + gridY);
  
  // Add scan line effect
  float scanLine = 0.15 * step(0.98, fract(vPosition.y * 10.0 - time));
  
  // Combine effects
  vec3 baseColor = color * intensity;
  vec3 finalColor = mix(baseColor, vec3(1.0, 1.0, 1.0), grid + scanLine + rim);
  
  // Add transparency based on rim and grid
  float alpha = 0.7 + 0.3 * (rim + grid);
  
  gl_FragColor = vec4(finalColor, alpha);
}`}</CodeBlock>

      <SubsectionTitle>Post-Processing Effects</SubsectionTitle>
      <Paragraph>
        The Model Viewer implements a comprehensive post-processing pipeline using the @react-three/postprocessing
        library, which is built on top of the postprocessing.js library. This allows for sophisticated visual effects
        that are applied to the entire rendered scene.
      </Paragraph>

      <FeatureList
        items={[
          "Bloom effect with adjustable intensity for creating a glow around bright areas",
          "Chromatic aberration that simulates lens distortion by separating RGB channels",
          "Film grain noise overlay for added texture and atmosphere",
          "Vignette effect that darkens the edges of the viewport",
          "Interactive controls for adjusting all post-processing parameters in real-time",
        ]}
      />

      <SubsectionTitle>Exploded View Visualization</SubsectionTitle>
      <Paragraph>
        The Model Viewer features an interactive exploded view that separates the components of 3D models to reveal
        their internal structure. This technique is commonly used in technical illustrations and engineering
        visualizations.
      </Paragraph>

      <InfoBox title="Implementation Details">
        <p>The exploded view is implemented using the following techniques:</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>Traversal of the model's mesh hierarchy to identify individual components</li>
          <li>Storage of original positions and rotations for each component</li>
          <li>Calculation of displacement vectors from the model's center</li>
          <li>GSAP animation library for smooth transitions between normal and exploded states</li>
          <li>Elastic easing functions for natural-looking reassembly animations</li>
        </ul>
      </InfoBox>

      <SubsectionTitle>Advanced Lighting Techniques</SubsectionTitle>
      <Paragraph>
        The Model Viewer implements sophisticated lighting setups that improve the visual presentation of 3D models and
        demonstrate mastery of Three.js lighting capabilities.
      </Paragraph>

      <FeatureList
        items={[
          "Day/night mode toggle with appropriate lighting adjustments",
          "Dynamic spotlight arrays that create dramatic lighting effects",
          "Color-coded spotlights that highlight different aspects of the models",
          "Animated light intensities that create dynamic visual interest",
          "Rim lighting techniques that improve model silhouettes",
        ]}
      />

      <SubsectionTitle>Interactive Controls</SubsectionTitle>
      <Paragraph>
        The Model Viewer provides a comprehensive set of user controls that allow for real-time adjustment of
        visualization parameters, demonstrating the interactive capabilities of WebGL applications.
      </Paragraph>

      <Table
        headers={["Feature", "Controls", "Technical Implementation"]}
        rows={[
          [
            "Shader Parameters",
            "Color picker, intensity slider, grid size slider, pulse speed slider",
            "Real-time uniform updates to shader materials",
          ],
          [
            "Post-Processing",
            "Bloom intensity, chromatic aberration, noise, vignette sliders",
            "Effect composer parameter binding with React state",
          ],
          ["Explode View", "Toggle checkbox", "GSAP animations with directional vector calculations"],
          [
            "Lighting Modes",
            "Day/night toggle, spotlight intensity controls",
            "Dynamic light component generation and property updates",
          ],
          [
            "Model Selection",
            "Thumbnail gallery with preview renders",
            "Dynamic model loading with preloading optimization",
          ],
        ]}
      />

      <SubsectionTitle>Technical Achievements</SubsectionTitle>
      <Paragraph>
        The implementation of these advanced 3D features demonstrates several technical achievements:
      </Paragraph>

      <FeatureList
        items={[
          "Integration of low-level GLSL with high-level React components",
          "Efficient management of WebGL resources to prevent memory leaks",
          "Optimization of render performance while maintaining visual quality",
          "Creation of an intuitive UI for complex 3D visualization controls",
          "Implementation of advanced animation techniques for smooth transitions",
          "Development of custom shaders that create unique visual effects",
        ]}
      />
    </div>
  )
}

// Assessment Content
function AssessmentContent() {
  return (
    <div>
      <SectionTitle>Assessment Criteria</SectionTitle>
      <Paragraph>
        This section outlines the assessment criteria for the Turret Defense game and indicates which requirements have been met.
      </Paragraph>

      <Table
        headers={["Main criteria", "Criterion elements", "Status"]}
        rows={[
          // 3D Model
          [
            <div style={{ fontWeight: "bold" }}>3D Model – 20 marks</div>,
            "Geometry",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Lightning",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Cameras",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Textures",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          
          // Design
          [
            <div style={{ fontWeight: "bold" }}>Design – 15 marks</div>,
            "Usability",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Responsive",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Look and feel",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Accessibility",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          
          // Integration
          [
            <div style={{ fontWeight: "bold" }}>Integration – 10 marks</div>,
            "3D models",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Video",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Audio",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Images",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Text",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Animations",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          
          // Interaction
          [
            <div style={{ fontWeight: "bold" }}>Interaction – 10 marks</div>,
            "Manipulate 3D models",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "View 3D models",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Interactivities in all the other pages",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          
          // Implementation
          [
            <div style={{ fontWeight: "bold" }}>
              Implementation – 15 marks
              <div style={{ fontSize: "0.8rem", fontWeight: "normal", marginTop: "0.5rem" }}>
                The evidence in this criterion needs to be implemented in the about us page.
              </div>
            </div>,
            "Testing strategy",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Technology used",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Rationality of technology",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "Evidence of testing",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          
          // Deeper understanding
          [
            <div style={{ fontWeight: "bold" }}>Deeper understanding – 20 marks</div>,
            "1. Advanced 3D visualization techniques",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "2. Custom GLSL shaders implementation",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "3. Post-processing effects pipeline",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            "4. Advanced state management with Zustand & Complex game mechanics beyond basic tutorials",
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          
          // Implementation & publication
          [
            <div style={{ fontWeight: "bold" }}>Implementation & publication – 10 marks</div>,
            <div>
              About us <span style={{ fontWeight: "normal", fontSize: "0.9rem" }}>(5 marks).</span>
              <div style={{ fontSize: "0.8rem" }}>Listing all the required information.</div>
            </div>,
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
          [
            "",
            <div>
              Publishing <span style={{ fontWeight: "normal", fontSize: "0.9rem" }}>(5 marks).</span>
              <div style={{ fontSize: "0.8rem" }}>The application loads fine.</div>
            </div>,
            <span style={{ color: "#4caf50", fontWeight: "bold", textAlign: "center", display: "block" }}>✓</span>
          ],
        ]}
      />

      <InfoBox title="Assessment Summary">
        <p>
          The Turret Defense game meets almost all assessment criteria, with the only exception being video integration. 
          The game successfully implements advanced 3D visualization techniques, custom shaders, interactive model manipulation, 
          comprehensive testing, and proper documentation.
        </p>
      </InfoBox>
    </div>
  )
}
// Statement of Originality Content
function OriginalityContent() {
  return (
    <div>
      <SectionTitle>Statement of Originality</SectionTitle>
      <Paragraph>
        Turret Defense is an original game that I designed and developed as a Web 3D Applications coursework. The core
        gameplay mechanics, code implementation, and overall design are my original work. This statement clarifies the
        original aspects of the game and acknowledges inspirations and resources used.
      </Paragraph>

      <SubsectionTitle>Original Work</SubsectionTitle>
      <Paragraph>The following elements of Turret Defense are entirely my original creation:</Paragraph>

      <FeatureList
        items={[
          "Game concept and core mechanics of a single, upgradeable turret defense game",
          "All JavaScript/React code implementation including game logic, state management, and UI",
          "3D scene composition and camera setup",
          "Turret upgrade system and progression mechanics",
          "Enemy wave generation and difficulty scaling algorithms",
          "Boss mechanics including shield regeneration",
          "Special items system and implementation",
          "Day-night cycle implementation",
          "Custom GLSL shaders for holographic and special effects",
          "Advanced model visualization techniques including exploded view",
          "Post-processing effects pipeline for improved visuals",
        ]}
      />

      <SubsectionTitle>Development Process</SubsectionTitle>
      <Paragraph>
        I personally designed, coded, tested, and refined all aspects of the game. The development process involved:
      </Paragraph>

      <FeatureList
        items={[
          "Conceptualizing the game mechanics and player experience",
          "Implementing the 3D rendering using Three.js and React Three Fiber",
          "Creating the state management system with Zustand",
          "Designing and implementing the UI components",
          "Developing custom GLSL shaders for advanced visual effects",
          "Implementing post-processing effects for improved visuals",
          "Creating interactive model visualization techniques",
          "Balancing gameplay mechanics through iterative testing",
          "Optimizing performance",
          "Writing unit tests to ensure code reliability",
        ]}
      />

      <InfoBox title="Academic Integrity">
        <p>
          This project is submitted as part requirement for the degree of Computer Science at the University of Sussex. 
          It is the product of my own labour except where indicated in the text. This project represents my own work 
          and understanding of game development concepts, 3D rendering, and React application architecture. 
          While I have used third-party libraries and assets (as detailed in the Creditssection), the implementation and 
          integration of these resources are my original work.
        </p>
        <p><strong>Signed: Koushic Sumathi Kumar</strong></p>        
        <p><strong>Candidate Number: 262984</strong></p>
      </InfoBox>
    </div>
  )
}

// Credits & Attributions Content
function CreditsContent() {
  return (
    <div>
      <SectionTitle>Credits & Attributions</SectionTitle>
      <Paragraph>
        While the core game design and code implementation are my original work, Turret Defense uses various free
        resources and draws inspiration from existing works. This section acknowledges these resources and inspirations.
      </Paragraph>

      <SubsectionTitle>Audio Resources</SubsectionTitle>
      <Table
        headers={["Sound", "Source", "Notes"]}
        rows={[
          ["Boss Theme", "Adapted from free sound libraries", "Inspired by the Imperial March from Star Wars"],
          ["Shooting Effects", "freesound.org", "Modified for game use"],
          ["UI Sounds", "mixkit.co", "Button clicks and menu navigation"],
          ["Ambient Background", "uppbeat.io", "Modified for looping"],
          ["Enemy Defeat Sounds", "zapsplat.com", "Various explosion and defeat sounds"],
        ]}
      />

      <SubsectionTitle>Libraries & Frameworks</SubsectionTitle>
      <Table
        headers={["Library", "Usage"]}
        rows={[
          ["React", "UI framework"],
          ["Three.js", "3D rendering engine"],
          ["React Three Fiber", "React bindings for Three.js"],
          ["React Three Drei", "Helper components for React Three Fiber"],
          ["Zustand", "State management"],
          ["GSAP", "Animation library"],
          ["Postprocessing", "Post-processing effects"],
        ]}
      />

      <SubsectionTitle>Inspirations</SubsectionTitle>
      <Paragraph>
        Turret Defense draws inspiration from several sources while maintaining its original gameplay:
      </Paragraph>

      <InfoBox title="Star Wars Inspiration">
        <p>Several elements of the game are inspired by the Star Wars universe:</p>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
          <li>The boss theme music is reminiscent of the Imperial March</li>
          <li>The shield regeneration effect is inspired by shield technology seen in the films</li>
          <li>Some sound effects for weapons are inspired by Star Wars blaster sounds</li>
          <li>The green/red color scheme for enemies draws from the light/dark side visual language</li>
          <li>The holographic shader effect is inspired by hologram displays in the Star Wars universe</li>
        </ul>
        <p>
          These elements are used as inspiration only and have been significantly modified or reimagined for the game.
        </p>
      </InfoBox>

      <SubsectionTitle>Acknowledgments</SubsectionTitle>
      <Paragraph>
        I would like to express my gratitude to the creators and maintainers of the open-source libraries, free
        resources, and educational materials that made this project possible. The vibrant web development and game
        development communities have been invaluable sources of knowledge and inspiration.
      </Paragraph>
    </div>
  )
}
