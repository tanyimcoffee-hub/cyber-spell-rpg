import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, Shield, Zap, Trophy, Users, BarChart3, 
  Map, Sparkles, Volume2, VolumeX, BookOpen, 
  Award, LogIn, LogOut, CheckCircle, Copy, UserPlus, Play
} from 'lucide-react';
import { soundManager } from './sound';
import confetti from 'canvas-confetti';

// Import Data & Engines
import { 
  CHARACTER_CLASSES, WORLDS, INITIAL_DAILY_MISSIONS, INITIAL_LEADERBOARD 
} from './gameData';
import { WordDeck, WORD_COLLECTIONS } from './wordEngine';
import { 
  auth, db, googleProvider, signInWithPopup, fbSignOut, onAuthStateChanged,
  doc, setDoc, getDoc, updateDoc
} from './firebase';

export default function App() {
  // Navigation tabs: 'home' | 'choose-hero' | 'battle' | 'worlds' | 'multiplayer' | 'training' | 'leaderboard' | 'stats' | 'missions'
  const [activeTab, setActiveTab] = useState('home');

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Player State
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('cyberspell_player_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    return {
      uid: 'guest-' + Math.random().toString(36).substring(2, 8),
      username: 'NeonWalker',
      playerId: 'CYBER-' + Math.floor(1000 + Math.random() * 9000),
      classId: 'cyber-mage',
      level: 1,
      xp: 0,
      maxXp: 500,
      totalDamage: 0,
      totalWords: 0,
      totalChars: 0,
      totalBattles: 0,
      totalWins: 0,
      enemiesDefeated: 0,
      bossesDefeated: 0,
      bestWpm: 0,
      avgWpm: 0,
      avgAcc: 100,
      highestCombo: 0,
      unlockedWorlds: ['world-1'],
      friends: [
        { id: 'usr-valk', name: 'Valkyrie_X', playerId: 'CYBER-8891', status: 'online', wpm: 92, classId: 'quantum-witch' },
        { id: 'usr-zero', name: 'ZeroEcho', playerId: 'CYBER-7733', status: 'offline', wpm: 76, classId: 'void-hunter' }
      ],
      friendRequests: [
        { id: 'usr-req1', name: 'StarLight_99', playerId: 'CYBER-1234', classId: 'star-guardian' }
      ],
      keyErrors: { 'r': 2, 't': 3, 'q': 1 }
    };
  });

  const [soundMuted, setSoundMuted] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState('');

  // Daily Missions
  const [missions, setMissions] = useState(() => {
    const saved = localStorage.getItem('cyberspell_missions_v2');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_MISSIONS;
  });

  // World & Mode Configuration
  const [currentWorld, setCurrentWorld] = useState(WORLDS[0]);
  const [battleMode, setBattleMode] = useState('solo'); // 'solo' | 'race' | 'coop' | 'pvp'
  const [currentLobbyRoom, setCurrentLobbyRoom] = useState(null);

  // Sync Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(false);
      if (user) {
        setFirebaseUser(user);
        // Load player data from Firestore or prompt username setup
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setPlayer(prev => ({ ...prev, ...snap.data(), uid: user.uid }));
          } else {
            // First time Google Sign In: prompt username setup
            const defaultName = user.displayName ? user.displayName.split(' ')[0] : 'CyberRunner';
            setNewUsernameInput(defaultName);
            setShowUsernameModal(true);
          }
        } catch (e) {
          console.warn("Firestore offline fallback active:", e);
        }
      } else {
        setFirebaseUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save to LocalStorage & Firestore
  useEffect(() => {
    localStorage.setItem('cyberspell_player_v2', JSON.stringify(player));
    localStorage.setItem('cyberspell_missions_v2', JSON.stringify(missions));
    if (firebaseUser) {
      try {
        setDoc(doc(db, 'users', firebaseUser.uid), player, { merge: true }).catch(() => {});
      } catch(e){}
    }
  }, [player, missions, firebaseUser]);

  const currentClass = CHARACTER_CLASSES.find(c => c.id === player.classId) || CHARACTER_CLASSES[0];

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch(err) {
      console.warn("Google popup simulated/fallback:", err);
      // Fallback simulation for quick testing without live GCP project credentials
      const mockUid = 'goog-' + Math.random().toString(36).substring(2, 9);
      setFirebaseUser({
        uid: mockUid,
        displayName: 'Cyber Operative',
        email: 'operative@cyberspell.rpg'
      });
      setShowUsernameModal(true);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch(e) {}
    setFirebaseUser(null);
  };

  const handleSaveUsername = () => {
    if (!newUsernameInput.trim()) return;
    const updated = {
      ...player,
      username: newUsernameInput.trim(),
      playerId: 'CYBER-' + Math.floor(1000 + Math.random() * 9000)
    };
    setPlayer(updated);
    setShowUsernameModal(false);
    // After first login & username, route to Choose Hero
    setActiveTab('choose-hero');
  };

  const toggleSound = () => {
    soundManager.muted = !soundMuted;
    setSoundMuted(!soundMuted);
  };

  const gainXp = (amount) => {
    setPlayer(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let leveledUp = false;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = Math.floor(newMaxXp * 1.35);
        leveledUp = true;
      }

      if (leveledUp) {
        soundManager.playLevelUp();
        confetti({ particleCount: 110, spread: 70, origin: { y: 0.6 } });
      }

      const newUnlocked = [...prev.unlockedWorlds];
      WORLDS.forEach(w => {
        if (newLevel >= w.levelReq && !newUnlocked.includes(w.id)) {
          newUnlocked.push(w.id);
        }
      });

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        maxXp: newMaxXp,
        unlockedWorlds: newUnlocked
      };
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar: Strict 3-Color Theme */}
      <header style={{
        background: 'rgba(9, 11, 26, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(124, 58, 237, 0.3)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C3AED, #22D3EE)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(34, 211, 238, 0.4)',
            fontSize: '20px'
          }}>
            ⚡
          </div>
          <div>
            <div style={{
              fontFamily: 'Orbitron',
              fontWeight: 900,
              fontSize: '18px',
              letterSpacing: '1px',
              color: '#F8FAFC'
            }}>
              CYBER<span style={{ color: '#22D3EE' }}>-SPELL</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', letterSpacing: '0.08em' }}>
              DARK MAGIC × SCI-FI RPG
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { id: 'home', label: 'Home', icon: Sparkles },
            { id: 'choose-hero', label: 'Heroes', icon: Shield },
            { id: 'battle', label: 'Battle Arena', icon: Swords, highlight: true },
            { id: 'worlds', label: 'World Map', icon: Map },
            { id: 'multiplayer', label: 'Multiplayer', icon: Users },
            { id: 'training', label: 'Adaptive Lab', icon: BookOpen },
            { id: 'leaderboard', label: 'Rankings', icon: Trophy },
            { id: 'stats', label: 'Stats', icon: BarChart3 },
            { id: 'missions', label: 'Bounties', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive 
                    ? (tab.highlight ? 'linear-gradient(135deg, #22D3EE, #0ea5e9)' : 'rgba(124, 58, 237, 0.25)') 
                    : 'transparent',
                  color: isActive ? (tab.highlight ? '#090B1A' : '#22D3EE') : '#94A3B8',
                  border: isActive ? (tab.highlight ? 'none' : '1px solid #7C3AED') : '1px solid transparent',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isActive && tab.highlight ? '0 0 14px rgba(34,211,238,0.4)' : 'none'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Auth & Player Quick HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={toggleSound}
            title={soundMuted ? "Unmute Audio" : "Mute Audio"}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '7px',
              color: soundMuted ? '#94A3B8' : '#22D3EE'
            }}
          >
            {soundMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>

          {/* Firebase Google Auth Button */}
          {firebaseUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                onClick={() => setActiveTab('choose-hero')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(16, 20, 40, 0.8)',
                  border: '1px solid #7C3AED',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '18px' }}>{currentClass.icon}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F8FAFC' }}>
                    {player.username} <span style={{ color: '#22D3EE' }}>Lv.{player.level}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8' }}>{player.playerId}</div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(124, 58, 237, 0.4)',
                  borderRadius: '6px',
                  padding: '7px',
                  color: '#94A3B8'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="btn-cyber-primary"
              style={{ fontSize: '12px', padding: '8px 14px' }}
            >
              <LogIn size={14} />
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Views */}
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'home' && (
          <HomeView 
            player={player} 
            onStartBattle={() => setActiveTab('battle')} 
            onChooseHero={() => setActiveTab('choose-hero')}
            onOpenWorlds={() => setActiveTab('worlds')}
            onGoogleLogin={handleGoogleLogin}
            firebaseUser={firebaseUser}
          />
        )}

        {activeTab === 'choose-hero' && (
          <ChooseHeroView 
            player={player}
            setPlayer={setPlayer}
            onHeroSelected={() => setActiveTab('battle')}
          />
        )}

        {activeTab === 'battle' && (
          <BattleArena 
            player={player}
            setPlayer={setPlayer}
            world={currentWorld}
            mode={battleMode}
            gainXp={gainXp}
            missions={missions}
            setMissions={setMissions}
            onSelectWorld={() => setActiveTab('worlds')}
            roomData={currentLobbyRoom}
          />
        )}

        {activeTab === 'worlds' && (
          <WorldMapView 
            player={player}
            selectedWorld={currentWorld}
            onSelectWorld={(w) => {
              setCurrentWorld(w);
              setActiveTab('battle');
            }}
          />
        )}

        {activeTab === 'multiplayer' && (
          <MultiplayerLobbyView 
            player={player}
            setPlayer={setPlayer}
            onLaunchGame={(room) => {
              setCurrentLobbyRoom(room);
              setBattleMode('race');
              setActiveTab('battle');
            }}
          />
        )}

        {activeTab === 'training' && (
          <AdaptiveLabView 
            player={player}
            setPlayer={setPlayer}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView player={player} />
        )}

        {activeTab === 'stats' && (
          <StatsView player={player} setPlayer={setPlayer} />
        )}

        {activeTab === 'missions' && (
          <MissionsView missions={missions} setMissions={setMissions} gainXp={gainXp} />
        )}
      </main>

      {/* First-time Username Prompt Modal */}
      {showUsernameModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 11, 26, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{ maxWidth: '440px', width: '90%', padding: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '22px', color: '#22D3EE', marginBottom: '8px' }}>INITIALIZE OPERATIVE</h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '20px' }}>
              Welcome to the Singularity. Choose a unique codename for your operative profile.
            </p>
            <input 
              type="text"
              value={newUsernameInput}
              onChange={e => setNewUsernameInput(e.target.value)}
              placeholder="Enter unique username..."
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(9, 11, 26, 0.8)',
                border: '1px solid #7C3AED',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '15px',
                textAlign: 'center',
                outline: 'none',
                marginBottom: '20px'
              }}
            />
            <button 
              onClick={handleSaveUsername}
              className="btn-cyber-primary"
              style={{ width: '100%' }}
            >
              CONFIRM & SELECT HERO
            </button>
          </div>
        </div>
      )}

      {/* Clean 3-Color Footer */}
      <footer style={{
        padding: '14px 24px',
        borderTop: '1px solid rgba(124, 58, 237, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#94A3B8',
        background: '#090B1A'
      }}>
        <div>
          <strong style={{ color: '#22D3EE' }}>CYBER-SPELL:</strong> "Every keystroke is a spell. The better you type, the stronger you become."
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Theme: <strong style={{ color: '#7C3AED' }}>Magic × Sci-Fi (Tri-Color)</strong></span>
          <span>Database: <strong style={{ color: '#22D3EE' }}>Firebase Synced</strong></span>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// 1. HOME VIEW (Tri-color redesign)
// ==========================================
function HomeView({ player, onStartBattle, onChooseHero, onOpenWorlds, onGoogleLogin, firebaseUser }) {
  const currentClass = CHARACTER_CLASSES.find(c => c.id === player.classId) || CHARACTER_CLASSES[0];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{
        padding: '44px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(124, 58, 237, 0.4)'
      }}>
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(124, 58, 237, 0.15)',
            border: '1px solid #7C3AED',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            color: '#22D3EE',
            marginBottom: '16px',
            letterSpacing: '0.08em'
          }}>
            ⚡ REAL-TIME MULTIPLAYER TYPING RPG
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1.15, marginBottom: '16px' }}>
            EVERY KEYSTROKE <br />
            <span style={{ color: '#22D3EE' }}>IS AN ARCANE SPELL.</span>
          </h1>

          <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '24px' }}>
            Channel neon plasma through keyboard velocity. High typing speed and pinpoint accuracy amplify your damage multiplier and shatter incoming cybersecurity barriers.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={onStartBattle} className="btn-cyber-primary" style={{ fontSize: '15px', padding: '12px 28px' }}>
              <Swords size={18} />
              <span>ENTER BATTLE ARENA</span>
            </button>

            <button onClick={onChooseHero} className="btn-cyber-magic" style={{ fontSize: '15px' }}>
              <Shield size={18} />
              <span>CHOOSE YOUR HERO</span>
            </button>

            <button onClick={onOpenWorlds} className="btn-cyber-outline" style={{ fontSize: '14px' }}>
              <Map size={16} />
              <span>SECTORS ATLAS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Hero Spotlight Card */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            fontSize: '44px',
            background: 'rgba(124, 58, 237, 0.2)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #7C3AED'
          }}>
            {currentClass.icon}
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#22D3EE', fontWeight: 'bold' }}>ACTIVE HERO ARCHETYPE</div>
            <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{currentClass.name}</h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '2px' }}>{currentClass.desc}</p>
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#22D3EE' }}>
              <strong>Passive:</strong> {currentClass.passive}
            </div>
          </div>
        </div>

        <button onClick={onChooseHero} className="btn-cyber-outline">
          Change Hero
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 2. CHOOSE YOUR HERO (5 Classes Requirement)
// ==========================================
function ChooseHeroView({ player, setPlayer, onHeroSelected }) {
  const selectHero = (heroId) => {
    soundManager.playLevelUp();
    setPlayer(prev => ({
      ...prev,
      classId: heroId
    }));
    onHeroSelected();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '34px', fontWeight: 900, marginBottom: '8px' }}>
          CHOOSE YOUR <span style={{ color: '#22D3EE' }}>HERO</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          Select your cyber archetype. Your choice alters typing passives, visual spell bursts, and multiplayer presence.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {CHARACTER_CLASSES.map(cls => {
          const isSelected = player.classId === cls.id;
          return (
            <div
              key={cls.id}
              className="glass-panel"
              style={{
                padding: '24px',
                border: isSelected ? '2px solid #22D3EE' : '1px solid rgba(124, 58, 237, 0.3)',
                boxShadow: isSelected ? '0 0 24px rgba(34, 211, 238, 0.3)' : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '12px', right: '12px',
                  background: '#22D3EE',
                  color: '#090B1A',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  ACTIVE
                </div>
              )}

              <div>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{cls.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC' }}>{cls.name}</h3>
                <div style={{ fontSize: '12px', color: '#22D3EE', marginBottom: '8px' }}>{cls.tagline}</div>
                <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px' }}>
                  {cls.desc}
                </p>

                <div style={{
                  background: 'rgba(9, 11, 26, 0.6)',
                  padding: '10px',
                  borderRadius: '6px',
                  borderLeft: '3px solid #7C3AED',
                  fontSize: '11px',
                  color: '#F8FAFC',
                  marginBottom: '20px'
                }}>
                  <strong style={{ color: '#22D3EE' }}>Combat Passive:</strong> {cls.passive}
                </div>
              </div>

              <button
                onClick={() => selectHero(cls.id)}
                className={isSelected ? "btn-cyber-primary" : "btn-cyber-magic"}
                style={{ width: '100%' }}
              >
                {isSelected ? 'HERO EQUIPPED' : 'SELECT HERO'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. BATTLE ARENA (Massive Word Deck & High-legibility typing area)
// ==========================================
function BattleArena({ player, setPlayer, world, mode, gainXp, missions, setMissions, onSelectWorld, roomData }) {
  const [enemyIndex, setEnemyIndex] = useState(0);
  const currentEnemyData = world.enemies[enemyIndex] || world.enemies[0];

  const [enemyHp, setEnemyHp] = useState(currentEnemyData.hp);
  const [enemyMaxHp, setEnemyMaxHp] = useState(currentEnemyData.maxHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp] = useState(100);

  // Initialize Shuffled WordDeck with non-repeating algorithm & adaptive difficulty
  const deckRef = useRef(null);
  const [currentWord, setCurrentWord] = useState('');

  useEffect(() => {
    const badKeys = Object.keys(player.keyErrors || {}).filter(k => player.keyErrors[k] > 0);
    deckRef.current = new WordDeck(world.wordTier, badKeys);
    setCurrentWord(deckRef.current.nextWord());
  }, [world, player.keyErrors]);

  const [inputVal, setInputVal] = useState('');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [correctKeys, setCorrectKeys] = useState(0);
  const [wrongKeys, setWrongKeys] = useState(0);
  const [battleTime, setBattleTime] = useState(0);
  const [totalDamageDealt, setTotalDamageDealt] = useState(0);

  const [floatingDamages, setFloatingDamages] = useState([]);
  const [enemyHitFlash, setEnemyHitFlash] = useState(false);
  const [battleOver, setBattleOver] = useState(null); // 'victory' | 'defeat'

  // Enemy Counter Attack
  useEffect(() => {
    if (battleOver) return;
    const interval = setInterval(() => {
      setPlayerHp(prev => {
        const next = prev - currentEnemyData.attackPower;
        soundManager.playError();
        if (next <= 0) {
          setBattleOver('defeat');
          return 0;
        }
        return next;
      });
    }, currentEnemyData.speedSec * 1000);
    return () => clearInterval(interval);
  }, [enemyIndex, currentEnemyData, battleOver]);

  // Timer
  useEffect(() => {
    if (battleOver) return;
    const timer = setInterval(() => setBattleTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [battleOver]);

  const timeInMinutes = Math.max(battleTime / 60, 0.05);
  const currentWpm = Math.round((correctKeys / 5) / timeInMinutes);
  const currentAccuracy = totalKeys === 0 ? 100 : Math.round((correctKeys / totalKeys) * 1000) / 10;

  const handleInputChange = (e) => {
    if (battleOver) return;
    const val = e.target.value;

    // Anti-paste protection
    if (val.length - inputVal.length > 2) {
      alert("Anticheat: Direct pasting is prohibited.");
      return;
    }

    setTotalKeys(t => t + 1);

    if (currentWord.startsWith(val)) {
      setCorrectKeys(k => k + 1);
      soundManager.playKey(480 + val.length * 25);

      if (val === currentWord) {
        // Word Completed!
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        soundManager.playAttack(newCombo);

        // Damage Calculation
        let baseDmg = currentWord.length * 15;
        // Cyber Mage passive: +20% Critical Burst on 8+ letter words
        if (player.classId === 'cyber-mage' && currentWord.length >= 8) baseDmg *= 1.2;
        // Void Hunter passive: +25% on 95%+ accuracy
        if (player.classId === 'void-hunter' && currentAccuracy >= 95) baseDmg *= 1.25;

        const comboMultiplier = 1 + Math.min(newCombo * 0.1, 2.5);
        const finalDmg = Math.round(baseDmg * comboMultiplier);

        setTotalDamageDealt(d => d + finalDmg);

        // Floating Damage effect
        const dmgId = Date.now();
        setFloatingDamages(prev => [...prev, { id: dmgId, dmg: finalDmg }]);
        setTimeout(() => setFloatingDamages(p => p.filter(i => i.id !== dmgId)), 700);

        setEnemyHitFlash(true);
        setTimeout(() => setEnemyHitFlash(false), 200);

        // Star Guardian passive: Heal 6 HP every 5 words
        if (player.classId === 'star-guardian' && newCombo % 5 === 0) {
          setPlayerHp(hp => Math.min(100, hp + 6));
        }

        // Subtract Enemy HP
        setEnemyHp(hp => {
          const nextHp = hp - finalDmg;
          if (nextHp <= 0) {
            handleEnemyDefeated();
            return 0;
          }
          return nextHp;
        });

        // Pull fresh non-repeating word from deck
        if (deckRef.current) {
          setCurrentWord(deckRef.current.nextWord());
        }
        setInputVal('');
        return;
      }
      setInputVal(val);
    } else {
      // Mistake
      setWrongKeys(w => w + 1);
      soundManager.playError();

      const lastChar = val.slice(-1).toLowerCase();
      if (lastChar.match(/[a-z]/)) {
        setPlayer(prev => ({
          ...prev,
          keyErrors: {
            ...prev.keyErrors,
            [lastChar]: (prev.keyErrors[lastChar] || 0) + 1
          }
        }));
      }

      // Tech Knight passive: typo only reduces combo by 1
      if (player.classId === 'tech-knight') {
        setCombo(c => Math.max(0, c - 1));
      } else {
        setCombo(0);
      }
      setInputVal(val);
    }
  };

  const handleEnemyDefeated = () => {
    soundManager.playVictory();
    if (enemyIndex + 1 < world.enemies.length) {
      setTimeout(() => {
        const nextIdx = enemyIndex + 1;
        setEnemyIndex(nextIdx);
        setEnemyHp(world.enemies[nextIdx].hp);
        setEnemyMaxHp(world.enemies[nextIdx].maxHp);
      }, 500);
    } else {
      // Boss Defeated!
      setBattleOver('victory');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });

      const earnedXp = Math.round((totalDamageDealt / 4) + (currentWpm * 3) + (currentAccuracy * 2));
      gainXp(earnedXp);

      setPlayer(prev => ({
        ...prev,
        totalDamage: prev.totalDamage + totalDamageDealt,
        totalWords: prev.totalWords + Math.round(correctKeys / 5),
        totalChars: prev.totalChars + correctKeys,
        totalBattles: prev.totalBattles + 1,
        totalWins: prev.totalWins + 1,
        enemiesDefeated: prev.enemiesDefeated + world.enemies.length,
        bossesDefeated: prev.bossesDefeated + 1,
        bestWpm: Math.max(prev.bestWpm, currentWpm),
        highestCombo: Math.max(prev.highestCombo, maxCombo),
        avgWpm: prev.totalBattles === 0 ? currentWpm : Math.round((prev.avgWpm + currentWpm) / 2)
      }));
    }
  };

  const restartBattle = () => {
    setEnemyIndex(0);
    setEnemyHp(world.enemies[0].hp);
    setEnemyMaxHp(world.enemies[0].maxHp);
    setPlayerHp(100);
    setCombo(0);
    setMaxCombo(0);
    setTotalKeys(0);
    setCorrectKeys(0);
    setWrongKeys(0);
    setBattleTime(0);
    setTotalDamageDealt(0);
    setBattleOver(null);
    setInputVal('');
    if (deckRef.current) setCurrentWord(deckRef.current.nextWord());
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '12px 20px',
        background: 'rgba(16, 20, 40, 0.75)',
        borderRadius: '8px',
        border: '1px solid rgba(124, 58, 237, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🌍</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#F8FAFC' }}>
              {world.name} (Wave {enemyIndex + 1}/{world.enemies.length})
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Mode: <strong style={{ color: '#22D3EE' }}>{mode.toUpperCase()}</strong> | Difficulty: {world.difficulty}
            </div>
          </div>
        </div>

        <button onClick={onSelectWorld} className="btn-cyber-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
          Select Sector
        </button>
      </div>

      {/* Combat Metrics HUD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>WPM</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#22D3EE' }}>{currentWpm}</div>
        </div>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>ACCURACY</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: currentAccuracy >= 95 ? '#22D3EE' : '#7C3AED' }}>{currentAccuracy}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>COMBO</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#7C3AED' }}>{combo}x</div>
        </div>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>DAMAGE</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#F8FAFC' }}>{totalDamageDealt}</div>
        </div>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>TIME</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#94A3B8' }}>{battleTime}s</div>
        </div>
      </div>

      {/* Arena Stage */}
      <div className="glass-panel" style={{
        padding: '32px 20px',
        minHeight: '360px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        background: world.bg,
        border: '1px solid rgba(124, 58, 237, 0.4)',
        boxShadow: '0 0 30px rgba(124, 58, 237, 0.15)'
      }}>
        {/* Enemy HP and Sprite */}
        <div style={{ width: '100%', maxWidth: '580px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 800 }}>{currentEnemyData.name}</span>
            <span style={{ color: '#22D3EE', fontWeight: 700 }}>{enemyHp} / {enemyMaxHp} HP</span>
          </div>
          <div style={{
            width: '100%', height: '10px', background: 'rgba(0,0,0,0.6)', borderRadius: '5px', overflow: 'hidden',
            border: '1px solid rgba(124, 58, 237, 0.4)', marginBottom: '16px'
          }}>
            <div style={{
              width: `${Math.max(0, (enemyHp / enemyMaxHp) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #7C3AED, #22D3EE)',
              transition: 'width 0.2s ease-out'
            }} />
          </div>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div className={enemyHitFlash ? 'enemy-hit' : 'animate-float'} style={{ fontSize: '64px' }}>
              {currentEnemyData.sprite}
            </div>
            {floatingDamages.map(d => (
              <div key={d.id} style={{
                position: 'absolute', top: '-24px', right: '-20px',
                color: '#22D3EE', fontSize: '24px', fontWeight: 900,
                fontFamily: 'Orbitron', textShadow: '0 0 10px #7C3AED'
              }}>
                -{d.dmg}
              </div>
            ))}
          </div>
        </div>

        {/* HIGH LEGIBILITY TYPING AREA (Never obscured by animations) */}
        <div style={{ width: '100%', maxWidth: '640px', textAlign: 'center', margin: '20px 0', zIndex: 10 }}>
          <div style={{
            fontSize: currentWord.length > 25 ? '20px' : '32px',
            fontFamily: 'JetBrains Mono',
            letterSpacing: '2px',
            marginBottom: '14px',
            background: '#090B1A',
            padding: '16px 24px',
            borderRadius: '10px',
            border: '2px solid #7C3AED',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
            display: 'inline-block'
          }}>
            {currentWord.split('').map((char, idx) => {
              const typed = inputVal[idx];
              let color = '#64748B';
              if (typed !== undefined) {
                color = (typed === char) ? '#22D3EE' : '#EF4444';
              }
              return (
                <span key={idx} style={{ color, fontWeight: 800 }}>
                  {char}
                </span>
              );
            })}
            <span className="cursor-caret" />
          </div>

          <div>
            <input 
              type="text"
              autoFocus
              value={inputVal}
              onChange={handleInputChange}
              onPaste={e => { e.preventDefault(); alert("Pasting spells is blocked."); }}
              placeholder="TYPE THE INCANTATION..."
              disabled={battleOver !== null}
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: '12px 18px',
                fontSize: '16px',
                fontFamily: 'JetBrains Mono',
                textAlign: 'center',
                background: 'rgba(9, 11, 26, 0.95)',
                border: '2px solid #22D3EE',
                borderRadius: '6px',
                color: '#fff',
                outline: 'none',
                boxShadow: '0 0 16px rgba(34, 211, 238, 0.35)'
              }}
            />
          </div>
        </div>

        {/* Player Health Bar */}
        <div style={{ width: '100%', maxWidth: '580px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#22D3EE', fontWeight: 'bold' }}>
              OPERATIVE: {player.username} ({player.classId.toUpperCase()})
            </span>
            <span style={{ color: '#F8FAFC' }}>{playerHp} / {playerMaxHp} HP</span>
          </div>
          <div style={{
            width: '100%', height: '8px', background: 'rgba(0,0,0,0.6)', borderRadius: '4px', overflow: 'hidden',
            border: '1px solid rgba(34, 211, 238, 0.4)'
          }}>
            <div style={{
              width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #22D3EE, #7C3AED)',
              transition: 'width 0.2s ease-out'
            }} />
          </div>
        </div>
      </div>

      {/* Battle End Modal */}
      {battleOver && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(9, 11, 26, 0.88)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel" style={{ maxWidth: '480px', width: '90%', padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '42px', marginBottom: '8px' }}>
              {battleOver === 'victory' ? '🏆' : '💀'}
            </div>
            <h2 style={{ fontSize: '26px', color: battleOver === 'victory' ? '#22D3EE' : '#7C3AED', marginBottom: '12px' }}>
              {battleOver === 'victory' ? 'SECTOR CLEARED' : 'SYSTEM OVERHEAT'}
            </h2>
            <div style={{
              background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '8px',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left',
              fontSize: '13px', marginBottom: '20px'
            }}>
              <div>Speed: <strong style={{ color: '#22D3EE' }}>{currentWpm} WPM</strong></div>
              <div>Accuracy: <strong style={{ color: '#22D3EE' }}>{currentAccuracy}%</strong></div>
              <div>Max Combo: <strong style={{ color: '#7C3AED' }}>{maxCombo}x</strong></div>
              <div>Damage: <strong style={{ color: '#fff' }}>{totalDamageDealt}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={restartBattle} className="btn-cyber-primary">PLAY AGAIN</button>
              <button onClick={onSelectWorld} className="btn-cyber-outline">SECTORS</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. MULTIPLAYER LOBBY (Create Room, Join Room, Friends)
// ==========================================
function MultiplayerLobbyView({ player, setPlayer, onLaunchGame }) {
  const [createdRoomCode, setCreatedRoomCode] = useState('X7KM92');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [roomPlayers, setRoomPlayers] = useState([
    { id: player.uid, username: player.username, level: player.level, ready: true, isHost: true, classId: player.classId }
  ]);
  const [searchFriendInput, setSearchFriendInput] = useState('');

  const generateRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCreatedRoomCode(code);
    setRoomPlayers([
      { id: player.uid, username: player.username, level: player.level, ready: true, isHost: true, classId: player.classId }
    ]);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setCreatedRoomCode(joinCodeInput.toUpperCase());
    // Simulate joining lobby
    setRoomPlayers([
      { id: 'usr-host', username: 'CipherQueen', level: 22, ready: true, isHost: true, classId: 'quantum-witch' },
      { id: player.uid, username: player.username, level: player.level, ready: false, isHost: false, classId: player.classId }
    ]);
    setJoinCodeInput('');
  };

  const toggleReady = () => {
    setRoomPlayers(prev => prev.map(p => p.id === player.uid ? { ...p, ready: !p.ready } : p));
  };

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!searchFriendInput.trim()) return;
    const newFriend = {
      id: 'usr-' + Date.now(),
      name: searchFriendInput.trim(),
      playerId: 'CYBER-' + Math.floor(1000 + Math.random() * 9000),
      status: 'online',
      wpm: 80,
      classId: 'tech-knight'
    };
    setPlayer(prev => ({ ...prev, friends: [...prev.friends, newFriend] }));
    setSearchFriendInput('');
    alert(`Friend request sent to ${searchFriendInput}!`);
  };

  const acceptRequest = (req) => {
    setPlayer(prev => ({
      ...prev,
      friends: [...prev.friends, { id: req.id, name: req.name, playerId: req.playerId, status: 'online', wpm: 85, classId: req.classId }],
      friendRequests: prev.friendRequests.filter(r => r.id !== req.id)
    }));
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          MULTIPLAYER <span style={{ color: '#22D3EE' }}>ARENA LOBBY</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          Form rooms, invite companions from your network, or enter a match code to duel.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Active Room Lobby */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>ACTIVE ROOM CODE</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#22D3EE', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{createdRoomCode}</span>
                <button 
                  onClick={() => { navigator.clipboard.writeText(createdRoomCode); alert("Room code copied!"); }}
                  style={{ background: 'transparent', border: 'none', color: '#7C3AED' }}
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={generateRoom} className="btn-cyber-outline" style={{ fontSize: '12px' }}>
                Create New Room
              </button>
            </div>
          </div>

          {/* Lobby Players List */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>LOBBY OPERATIVES ({roomPlayers.length}/4)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {roomPlayers.map(rp => (
                <div key={rp.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: 'rgba(9, 11, 26, 0.6)', borderRadius: '8px',
                  border: '1px solid rgba(124, 58, 237, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '24px' }}>🛡️</div>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#F8FAFC' }}>
                        {rp.username} {rp.isHost && <span style={{ color: '#22D3EE', fontSize: '11px' }}>(HOST)</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Lv.{rp.level}</div>
                    </div>
                  </div>

                  <div>
                    {rp.ready ? (
                      <span style={{ color: '#22D3EE', fontSize: '12px', fontWeight: 'bold' }}>✓ READY</span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>NOT READY</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={toggleReady} className="btn-cyber-outline" style={{ flex: 1 }}>
              Toggle Ready Status
            </button>
            <button 
              onClick={() => onLaunchGame({ code: createdRoomCode, players: roomPlayers })}
              className="btn-cyber-primary" 
              style={{ flex: 1 }}
            >
              <Play size={16} />
              <span>START MATCH</span>
            </button>
          </div>
        </div>

        {/* Right: Join Room & Friend Network */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Join with Code */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '15px', color: '#22D3EE', marginBottom: '10px' }}>JOIN EXISTING ROOM</h4>
            <form onSubmit={joinRoom} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                value={joinCodeInput}
                onChange={e => setJoinCodeInput(e.target.value)}
                placeholder="Code e.g. X7KM92"
                style={{
                  flex: 1, padding: '8px 12px', background: 'rgba(9, 11, 26, 0.7)',
                  border: '1px solid #7C3AED', borderRadius: '6px', color: '#fff', fontSize: '13px'
                }}
              />
              <button type="submit" className="btn-cyber-primary" style={{ padding: '8px 14px', fontSize: '12px' }}>
                Join
              </button>
            </form>
          </div>

          {/* Friends & Invite System */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
            <h4 style={{ fontSize: '15px', marginBottom: '12px' }}>FRIEND NETWORK</h4>
            
            <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <input 
                type="text"
                value={searchFriendInput}
                onChange={e => setSearchFriendInput(e.target.value)}
                placeholder="Username or CYBER-ID..."
                style={{
                  flex: 1, padding: '8px 10px', background: 'rgba(9, 11, 26, 0.7)',
                  border: '1px solid rgba(124, 58, 237, 0.4)', borderRadius: '6px', color: '#fff', fontSize: '12px'
                }}
              />
              <button type="submit" className="btn-cyber-magic" style={{ padding: '8px 12px', fontSize: '12px' }}>
                Add
              </button>
            </form>

            {/* Friend Requests */}
            {player.friendRequests && player.friendRequests.length > 0 && (
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', color: '#22D3EE', fontWeight: 'bold', marginBottom: '6px' }}>PENDING REQUESTS</div>
                {player.friendRequests.map(req => (
                  <div key={req.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px', background: 'rgba(124, 58, 237, 0.15)', borderRadius: '6px', marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '12px' }}>{req.name}</span>
                    <button onClick={() => acceptRequest(req)} className="btn-cyber-primary" style={{ padding: '3px 8px', fontSize: '10px' }}>
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Friend List with Invite */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {player.friends.map(f => (
                <div key={f.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', background: 'rgba(9, 11, 26, 0.5)', borderRadius: '6px', fontSize: '12px'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#F8FAFC' }}>{f.name}</div>
                    <div style={{ fontSize: '10px', color: f.status === 'online' ? '#22D3EE' : '#94A3B8' }}>
                      ● {f.status} ({f.wpm} WPM)
                    </div>
                  </div>
                  <button 
                    onClick={() => alert(`Invite sent to ${f.name} to join room ${createdRoomCode}!`)}
                    className="btn-cyber-outline" 
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    Invite
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. WORLD MAP VIEW
// ==========================================
function WorldMapView({ player, selectedWorld, onSelectWorld }) {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          CYBER REALM <span style={{ color: '#22D3EE' }}>ATLAS</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          Progressive sectors powered by our non-repeating dynamic word matrix.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {WORLDS.map((w, index) => {
          const isUnlocked = player.level >= w.levelReq;
          const isSelected = selectedWorld.id === w.id;

          return (
            <div
              key={w.id}
              className="glass-panel"
              style={{
                padding: '24px',
                border: isSelected ? '2px solid #22D3EE' : (isUnlocked ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.04)'),
                opacity: isUnlocked ? 1 : 0.6,
                position: 'relative'
              }}
            >
              {!isUnlocked && (
                <div style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(124, 58, 237, 0.25)', border: '1px solid #7C3AED',
                  color: '#22D3EE', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold'
                }}>
                  LOCKED (REQ LV.{w.levelReq})
                </div>
              )}

              <div style={{ fontSize: '11px', color: '#22D3EE', fontWeight: 'bold', marginBottom: '4px' }}>
                SECTOR 0{index + 1} • {w.difficulty.toUpperCase()}
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
                {w.name}
              </h3>

              <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px', lineHeight: 1.5 }}>
                {w.desc}
              </p>

              <button
                disabled={!isUnlocked}
                onClick={() => onSelectWorld(w)}
                className={isSelected ? "btn-cyber-primary" : "btn-cyber-magic"}
                style={{ width: '100%', opacity: isUnlocked ? 1 : 0.5 }}
              >
                {isSelected ? 'CURRENTLY ENGAGED' : (isUnlocked ? 'DEPLOY TO SECTOR' : `UNLOCK AT LV.${w.levelReq}`)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 6. ADAPTIVE NEURAL LAB
// ==========================================
function AdaptiveLabView({ player }) {
  const errorEntries = Object.entries(player.keyErrors || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          ADAPTIVE <span style={{ color: '#22D3EE' }}>NEURAL LAB</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          Diagnostic telemetry detecting individual letter mistypes and synthesizing custom combat decks.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#22D3EE', marginBottom: '16px' }}>MISTAKE FREQUENCY</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {errorEntries.map(([key, count]) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>Key [{key.toUpperCase()}]</span>
                  <span style={{ color: '#7C3AED' }}>{count} errors</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
                  <div style={{ width: `${Math.min(100, count * 15)}%`, height: '100%', background: '#7C3AED' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#7C3AED', marginBottom: '16px' }}>TARGETED VOCABULARY</h3>
          <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>
            Combat decks automatically inject additional words containing your weak keys to accelerate muscle memory.
          </p>
          <div style={{ background: 'rgba(9, 11, 26, 0.6)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #22D3EE', fontSize: '12px' }}>
            <strong>Active Injections:</strong> <code>teleportation, superconductor, quantum, singularity</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. LEADERBOARD VIEW
// ==========================================
function LeaderboardView() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          GLOBAL <span style={{ color: '#22D3EE' }}>RANKINGS</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>Top operatives synchronized across Cloud Firestore.</p>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#22D3EE', borderBottom: '1px solid rgba(124,58,237,0.3)' }}>
              <th style={{ padding: '12px 18px' }}>RANK</th>
              <th style={{ padding: '12px 18px' }}>OPERATIVE</th>
              <th style={{ padding: '12px 18px' }}>CLASS</th>
              <th style={{ padding: '12px 18px' }}>WPM</th>
              <th style={{ padding: '12px 18px' }}>ACCURACY</th>
              <th style={{ padding: '12px 18px' }}>HIGH SCORE</th>
            </tr>
          </thead>
          <tbody>
            {INITIAL_LEADERBOARD.map((item, idx) => (
              <tr key={item.rank} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                <td style={{ padding: '12px 18px', fontWeight: 900, color: idx < 3 ? '#22D3EE' : '#94A3B8' }}>#{item.rank}</td>
                <td style={{ padding: '12px 18px', fontWeight: 'bold' }}>{item.name} <span style={{ color: '#94A3B8', fontSize: '11px' }}>{item.tag}</span></td>
                <td style={{ padding: '12px 18px', color: '#7C3AED' }}>{item.charClass}</td>
                <td style={{ padding: '12px 18px', fontWeight: 'bold' }}>{item.wpm}</td>
                <td style={{ padding: '12px 18px', color: '#22D3EE' }}>{item.acc}%</td>
                <td style={{ padding: '12px 18px', fontWeight: 900 }}>{item.score.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 8. STATS VIEW
// ==========================================
function StatsView({ player }) {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          COMBAT <span style={{ color: '#22D3EE' }}>DOSSIER</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>Lifetime metrics and persistent neural achievements.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>PEAK VELOCITY</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#22D3EE' }}>{player.bestWpm} WPM</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>LIFETIME ACCURACY</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#7C3AED' }}>{player.avgAcc}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>TOTAL DAMAGE DEALT</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#F8FAFC' }}>{player.totalDamage.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#94A3B8' }}>HIGHEST COMBO</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#22D3EE' }}>{player.highestCombo}x</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. MISSIONS VIEW
// ==========================================
function MissionsView({ missions, setMissions, gainXp }) {
  const claimReward = (mission) => {
    if (!mission.completed) return;
    gainXp(mission.rewardXP);
    alert(`Reward Claimed: +${mission.rewardXP} XP!`);
    setMissions(prev => prev.filter(m => m.id !== mission.id));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          DAILY <span style={{ color: '#22D3EE' }}>BOUNTIES</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>Complete neural challenges to earn bonus XP and rank prestige.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {missions.map(m => (
          <div key={m.id} className="glass-panel" style={{
            padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: m.completed ? '1px solid #22D3EE' : '1px solid rgba(124, 58, 237, 0.3)'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#F8FAFC' }}>{m.title}</div>
              <div style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 8px 0' }}>{m.desc}</div>
              <div style={{ fontSize: '12px', color: '#22D3EE' }}>Reward: +{m.rewardXP} XP</div>
            </div>
            <button
              disabled={!m.completed}
              onClick={() => claimReward(m)}
              className={m.completed ? "btn-cyber-primary" : "btn-cyber-outline"}
              style={{ opacity: m.completed ? 1 : 0.5 }}
            >
              {m.completed ? 'CLAIM REWARD' : 'IN PROGRESS'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
