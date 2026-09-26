import React, { useState, useEffect } from 'react';
import { 
  Swords, Shield, Zap, Flame, Trophy, Users, BarChart3, 
  Map, Sparkles, Volume2, VolumeX, UserCheck, BookOpen, 
  Settings as SettingsIcon, LogOut, CheckCircle, Award
} from 'lucide-react';
import { soundManager } from './sound';
import confetti from 'canvas-confetti';

// Import Data
import { 
  CHARACTER_CLASSES, WORLDS, WORD_COLLECTIONS, 
  INITIAL_DAILY_MISSIONS, MOCK_FRIENDS, INITIAL_LEADERBOARD 
} from './gameData';

export default function App() {
  // Navigation tabs: 'home' | 'battle' | 'worlds' | 'multiplayer' | 'training' | 'leaderboard' | 'stats' | 'friends' | 'missions'
  const [activeTab, setActiveTab] = useState('home');

  // Player State
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('cyberspell_player');
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    return {
      username: 'NeonWalker',
      playerId: 'CYBER-9082',
      classId: 'technomancer',
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
      cosmetics: ['Default Hologram'],
      currentTitle: 'Apprentice Hacker',
      unlockedWorlds: ['world-1'],
      // Adaptive Training: record error keys counts
      keyErrors: { 'r': 2, 't': 3, 'q': 1 }
    };
  });

  const [soundMuted, setSoundMuted] = useState(false);

  // Sync player to local storage
  useEffect(() => {
    localStorage.setItem('cyberspell_player', JSON.stringify(player));
  }, [player]);

  const currentClass = CHARACTER_CLASSES.find(c => c.id === player.classId) || CHARACTER_CLASSES[0];

  // Battle Configuration & State
  const [currentWorld, setCurrentWorld] = useState(WORLDS[0]);
  const [battleMode, setBattleMode] = useState('solo'); // 'solo' | 'coop' | 'race' | 'pvp'
  const [multiplayerRoom, setMultiplayerRoom] = useState(null);

  // Mission State
  const [missions, setMissions] = useState(() => {
    const saved = localStorage.getItem('cyberspell_missions');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_MISSIONS;
  });

  const toggleSound = () => {
    soundManager.muted = !soundMuted;
    setSoundMuted(!soundMuted);
  };

  // Add XP and level up check
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
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      // Check unlocking new worlds
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
      {/* Top Cyber Navigation Bar */}
      <header style={{
        background: 'rgba(10, 14, 28, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 243, 255, 0.25)',
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
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00f3ff, #bd00ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0, 243, 255, 0.5)',
            fontSize: '22px'
          }}>
            ⚡
          </div>
          <div>
            <div style={{
              fontFamily: 'Orbitron',
              fontWeight: 900,
              fontSize: '19px',
              letterSpacing: '1px',
              background: 'linear-gradient(90deg, #00f3ff, #ff007b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 20px rgba(0, 243, 255, 0.4)'
            }}>
              CYBER-SPELL
            </div>
            <div style={{ fontSize: '11px', color: '#8391b5', letterSpacing: '0.1em' }}>
              DARK MAGIC × SCI-FI RPG
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { id: 'home', label: 'Home', icon: Sparkles },
            { id: 'battle', label: 'Battle', icon: Swords, highlight: true },
            { id: 'worlds', label: 'World Map', icon: Map },
            { id: 'multiplayer', label: 'Multiplayer', icon: Users },
            { id: 'training', label: 'Adaptive Lab', icon: BookOpen },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'stats', label: 'Stats & Log', icon: BarChart3 },
            { id: 'missions', label: 'Missions', icon: Award }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive 
                    ? (tab.highlight ? 'linear-gradient(135deg, #00f3ff, #0088ff)' : 'rgba(0, 243, 255, 0.15)') 
                    : 'transparent',
                  color: isActive ? (tab.highlight ? '#000' : '#00f3ff') : '#a0aec0',
                  border: isActive ? (tab.highlight ? 'none' : '1px solid #00f3ff') : '1px solid transparent',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isActive && tab.highlight ? '0 0 15px rgba(0,243,255,0.4)' : 'none'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Player Profile Quick Info & Sound Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={toggleSound}
            title={soundMuted ? "Unmute Audio" : "Mute Audio"}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '8px',
              color: soundMuted ? '#ff4466' : '#00f3ff'
            }}
          >
            {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Player Mini Badge */}
          <div 
            onClick={() => setActiveTab('stats')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(14, 20, 38, 0.8)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: `linear-gradient(135deg, ${currentClass.color}, #000)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              {currentClass.icon}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', display: 'flex', gap: '6px' }}>
                <span>{player.username}</span>
                <span style={{ color: '#00f3ff' }}>Lv.{player.level}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* XP Bar */}
                <div style={{
                  width: '70px',
                  height: '5px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, (player.xp / player.maxXp) * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #00f3ff, #bd00ff)'
                  }} />
                </div>
                <span style={{ fontSize: '10px', color: '#8391b5' }}>
                  {player.xp}/{player.maxXp} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main View Router */}
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'home' && (
          <HomeView 
            player={player} 
            setPlayer={setPlayer} 
            onStartBattle={() => setActiveTab('battle')} 
            onOpenWorlds={() => setActiveTab('worlds')} 
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
          <MultiplayerView 
            player={player}
            onJoinBattle={(mode) => {
              setBattleMode(mode);
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

      {/* Cyber Footer */}
      <footer style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#657493',
        background: 'rgba(5, 7, 15, 0.95)'
      }}>
        <div>
          <strong style={{ color: '#00f3ff' }}>CYBER-SPELL:</strong> "Every keystroke is a spell. The better you type, the stronger you become."
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Multiplayer Sync: <strong style={{ color: '#00ff88' }}>CONNECTED</strong></span>
          <span>Adaptive Neural Engine: <strong style={{ color: '#00f3ff' }}>ACTIVE</strong></span>
          <span>Version: 2.4.0 (Quantum Edition)</span>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// 1. HOME VIEW (Overview, Class Pick, Lore)
// ==========================================
function HomeView({ player, setPlayer, onStartBattle, onOpenWorlds }) {
  const currentClass = CHARACTER_CLASSES.find(c => c.id === player.classId) || CHARACTER_CLASSES[0];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Hero Banner */}
      <div className="glass-panel" style={{
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '32px',
        border: '1px solid rgba(0, 243, 255, 0.4)',
        boxShadow: '0 0 30px rgba(0, 243, 255, 0.15)'
      }}>
        {/* Neon Ambient Background */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(189, 0, 255, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '700px', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 243, 255, 0.1)',
            border: '1px solid #00f3ff',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#00f3ff',
            marginBottom: '16px',
            letterSpacing: '0.1em'
          }}>
            ⚡ REAL-TIME TYPING RPG ARENA
          </div>

          <h1 style={{
            fontSize: '46px',
            lineHeight: 1.15,
            fontWeight: 900,
            marginBottom: '16px',
            letterSpacing: '1px'
          }}>
            EVERY KEYSTROKE <br />
            <span style={{
              background: 'linear-gradient(90deg, #00f3ff 0%, #bd00ff 50%, #ff007b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              IS A LETHAL SPELL.
            </span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#9db0d4',
            lineHeight: 1.6,
            marginBottom: '28px',
            maxWidth: '620px'
          }}>
            Step into the neon-drenched cyber abyss. Channel raw plasma, elemental sigils, and quantum energy through rhythm and keyboard velocity. The faster and more accurately you type, the higher your combo damage.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={onStartBattle}
              className="btn-cyber-primary"
              style={{ fontSize: '16px', padding: '14px 32px' }}
            >
              <Swords size={20} />
              <span>ENTER BATTLE ARENA</span>
            </button>

            <button 
              onClick={onOpenWorlds}
              className="btn-cyber-outline"
              style={{ fontSize: '15px' }}
            >
              <Map size={18} />
              <span>EXPLORE WORLD MAP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Class Selector Grid */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>CHOOSE YOUR CYBER CLASS</h2>
            <p style={{ color: '#8391b5', fontSize: '14px' }}>Select an archetype to alter your combat passives and visual magic animations.</p>
          </div>
          <div style={{ fontSize: '13px', color: '#00f3ff' }}>
            Active: <strong>{currentClass.name}</strong>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {CHARACTER_CLASSES.map(cls => {
            const isSelected = player.classId === cls.id;
            return (
              <div
                key={cls.id}
                onClick={() => setPlayer(p => ({ ...p, classId: cls.id }))}
                className="glass-panel"
                style={{
                  padding: '20px',
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${cls.color}` : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isSelected ? `0 0 20px ${cls.color}44` : 'none',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: cls.color,
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    SELECTED
                  </div>
                )}
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>{cls.icon}</div>
                <h3 style={{ fontSize: '18px', color: cls.color, marginBottom: '6px' }}>{cls.name}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '12px', minHeight: '36px' }}>
                  {cls.desc}
                </p>
                <div style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${cls.color}`,
                  fontSize: '11px',
                  color: '#cbd5e1'
                }}>
                  <strong style={{ color: cls.color }}>Passive: </strong>{cls.passive}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Highlights Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ color: '#00f3ff', marginBottom: '8px' }}><Flame size={28} /></div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Rhythmic Combo Combats</h3>
          <p style={{ fontSize: '13px', color: '#8391b5', lineHeight: 1.6 }}>
            Type without lifting to hit Enter. Each letter triggers elemental particles. Complete words to release burst attacks and stack multipliers up to 30x.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ color: '#bd00ff', marginBottom: '8px' }}><Zap size={28} /></div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Adaptive Neural Training</h3>
          <p style={{ fontSize: '13px', color: '#8391b5', lineHeight: 1.6 }}>
            The AI records your frequently mistyped bigrams (e.g. TH, ER, QU) and dynamically injects specialized counter-words to drill your muscle memory.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ color: '#00ff88', marginBottom: '8px' }}><Users size={28} /></div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Real-time Multiplayer</h3>
          <p style={{ fontSize: '13px', color: '#8391b5', lineHeight: 1.6 }}>
            Compete in 1v1 PvP Magic Duels, Co-Op Boss Raids, or high-speed typing races with live synchronized progress bars and global rank trackers.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. BATTLE ARENA (Active Gameplay & Combat)
// ==========================================
function BattleArena({ player, setPlayer, world, mode, gainXp, missions, setMissions, onSelectWorld }) {
  // Battle state
  const [enemyIndex, setEnemyIndex] = useState(0);
  const currentEnemyData = world.enemies[enemyIndex] || world.enemies[0];
  
  const [enemyHp, setEnemyHp] = useState(currentEnemyData.hp);
  const [enemyMaxHp, setEnemyMaxHp] = useState(currentEnemyData.maxHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp] = useState(100);

  // Word pool generation according to world tier + adaptive mistakes
  const getWordPool = () => {
    let pool = [...(WORD_COLLECTIONS[world.wordTier] || WORD_COLLECTIONS.beginner)];
    // Adaptive: if player has errors in 't', 'r', prioritize words containing them
    const badKeys = Object.keys(player.keyErrors || {}).filter(k => player.keyErrors[k] > 0);
    if (badKeys.length > 0) {
      const extraAdaptive = pool.filter(w => badKeys.some(k => w.toLowerCase().includes(k)));
      if (extraAdaptive.length > 0) {
        pool = [...pool, ...extraAdaptive, ...extraAdaptive];
      }
    }
    return pool;
  };

  const [currentWord, setCurrentWord] = useState(() => {
    const pool = WORD_COLLECTIONS[world.wordTier] || WORD_COLLECTIONS.beginner;
    return pool[Math.floor(Math.random() * pool.length)];
  });

  const [inputVal, setInputVal] = useState('');
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalKeys, setTotalKeys] = useState(0);
  const [correctKeys, setCorrectKeys] = useState(0);
  const [wrongKeys, setWrongKeys] = useState(0);
  const [battleTime, setBattleTime] = useState(0);
  const [totalDamageDealt, setTotalDamageDealt] = useState(0);

  // Visual attack effects
  const [floatingDamages, setFloatingDamages] = useState([]);
  const [enemyHitFlash, setEnemyHitFlash] = useState(false);
  const [magicCirclePulse, setMagicCirclePulse] = useState(false);
  const [battleOver, setBattleOver] = useState(null); // 'victory' | 'defeat'

  // Enemy auto-attack timer
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

  // Battle duration timer
  useEffect(() => {
    if (battleOver) return;
    const timer = setInterval(() => {
      setBattleTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [battleOver]);

  // Real-time calculation of WPM and Accuracy
  const timeInMinutes = Math.max(battleTime / 60, 0.05);
  const wordsCalculated = correctKeys / 5;
  const currentWpm = Math.round(wordsCalculated / timeInMinutes);
  const currentAccuracy = totalKeys === 0 ? 100 : Math.round((correctKeys / totalKeys) * 1000) / 10;

  // Handle typing input
  const handleInputChange = (e) => {
    if (battleOver) return;
    const val = e.target.value;

    // Check anti-paste / sudden large jump
    if (val.length - inputVal.length > 2) {
      alert("Anticheat: Direct pasting is prohibited in combat.");
      return;
    }

    setTotalKeys(t => t + 1);

    // Character match check
    const isPrefixCorrect = currentWord.startsWith(val);

    if (isPrefixCorrect) {
      // Correct keystroke!
      setCorrectKeys(k => k + 1);
      soundManager.playKey(440 + val.length * 30);

      // Check if word completed
      if (val === currentWord) {
        // Complete word spell cast!
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        soundManager.playAttack(newCombo);

        // Calculate damage = base * speed factor * accuracy factor * combo multiplier
        const baseDmg = currentWord.length * 15;
        const comboMult = 1 + Math.min(newCombo * 0.1, 3.0);
        const accMult = currentAccuracy >= 95 ? 1.3 : (currentAccuracy >= 85 ? 1.0 : 0.7);
        const finalDmg = Math.round(baseDmg * comboMult * accMult);

        setTotalDamageDealt(d => d + finalDmg);

        // Visual damage popup
        const dmgId = Date.now();
        setFloatingDamages(prev => [...prev, { id: dmgId, dmg: finalDmg, isCrit: newCombo >= 10 }]);
        setTimeout(() => {
          setFloatingDamages(prev => prev.filter(item => item.id !== dmgId));
        }, 800);

        // Flash enemy
        setEnemyHitFlash(true);
        setTimeout(() => setEnemyHitFlash(false), 200);

        // Special combo burst sound
        if (newCombo % 5 === 0) {
          soundManager.playComboBurst();
          setMagicCirclePulse(true);
          setTimeout(() => setMagicCirclePulse(false), 600);
        }

        // Star Guardian passive: Heal 5 HP every 5 words
        if (player.classId === 'star-guardian' && newCombo % 5 === 0) {
          setPlayerHp(hp => Math.min(100, hp + 6));
        }

        // Deal damage to enemy
        setEnemyHp(hp => {
          const nextHp = hp - finalDmg;
          if (nextHp <= 0) {
            // Enemy Defeated!
            handleEnemyDefeated();
            return 0;
          }
          return nextHp;
        });

        // Pick next word
        const pool = getWordPool();
        const nextW = pool[Math.floor(Math.random() * pool.length)];
        setCurrentWord(nextW);
        setInputVal('');
        return;
      }

      setInputVal(val);
    } else {
      // Wrong keystroke!
      setWrongKeys(w => w + 1);
      soundManager.playError();

      // Record mistake for adaptive learning
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

      // Cyber Knight passive: only lose 2 combo instead of full reset
      if (player.classId === 'cyber-knight') {
        setCombo(c => Math.max(0, c - 2));
      } else {
        setCombo(0);
      }

      // Shake animation effect
      setInputVal(val);
    }
  };

  const handleEnemyDefeated = () => {
    soundManager.playVictory();

    // Check if more enemies in this world
    if (enemyIndex + 1 < world.enemies.length) {
      setTimeout(() => {
        const nextIdx = enemyIndex + 1;
        setEnemyIndex(nextIdx);
        setEnemyHp(world.enemies[nextIdx].hp);
        setEnemyMaxHp(world.enemies[nextIdx].maxHp);
      }, 500);
    } else {
      // World Boss Defeated! Victory!
      setBattleOver('victory');
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });

      // Calculate XP
      const earnedXp = Math.round(
        (totalDamageDealt / 4) + (currentWpm * 3) + (currentAccuracy * 2) + (maxCombo * 10)
      );

      gainXp(earnedXp);

      // Update Player overall stats
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

      // Update Daily Missions
      setMissions(prevMissions => prevMissions.map(m => {
        if (m.id === 'm1') {
          const next = m.current + Math.round(correctKeys / 5);
          return { ...m, current: next, completed: next >= m.target };
        }
        if (m.id === 'm2' && currentAccuracy >= 95) {
          return { ...m, current: currentAccuracy, completed: true };
        }
        if (m.id === 'm3' && maxCombo >= 20) {
          return { ...m, current: Math.max(m.current, maxCombo), completed: true };
        }
        if (m.id === 'm4') {
          const next = m.current + world.enemies.length;
          return { ...m, current: next, completed: next >= m.target };
        }
        return m;
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
    const pool = WORD_COLLECTIONS[world.wordTier] || WORD_COLLECTIONS.beginner;
    setCurrentWord(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', position: 'relative' }}>
      {/* World & Mode Banner Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '12px 20px',
        background: 'rgba(13, 19, 38, 0.7)',
        borderRadius: '10px',
        border: `1px solid ${world.accent}44`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🌍</span>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: world.accent }}>
              {world.name} (Sector {enemyIndex + 1}/{world.enemies.length})
            </div>
            <div style={{ fontSize: '11px', color: '#8391b5' }}>
              Mode: <strong style={{ color: '#00f3ff' }}>{mode.toUpperCase()}</strong> | Tier: {world.difficulty}
            </div>
          </div>
        </div>

        <button 
          onClick={onSelectWorld}
          className="btn-cyber-outline" 
          style={{ padding: '6px 14px', fontSize: '12px' }}
        >
          Change Sector
        </button>
      </div>

      {/* Real-time Combat Statistics HUD */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8391b5' }}>SPEED</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#00f3ff' }}>
            {currentWpm} <span style={{ fontSize: '12px' }}>WPM</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8391b5' }}>ACCURACY</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: currentAccuracy >= 95 ? '#00ff88' : '#ffaa00' }}>
            {currentAccuracy}%
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8391b5' }}>COMBO STREAK</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#ff007b' }}>
            {combo}x
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8391b5' }}>TOTAL DAMAGE</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#bd00ff' }}>
            {totalDamageDealt}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8391b5' }}>TIME</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#f0f4ff' }}>
            {Math.floor(battleTime / 60)}:{(battleTime % 60).toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Central Battle Arena Visual Stage */}
      <div className="glass-panel" style={{
        padding: '36px 24px',
        position: 'relative',
        background: world.bg,
        border: `1px solid ${world.accent}66`,
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: `0 0 40px ${world.accent}22`,
        overflow: 'hidden'
      }}>
        {/* Magic Circle Background Animation */}
        <div 
          className="animate-magic-circle"
          style={{
            position: 'absolute',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            border: `2px dashed ${magicCirclePulse ? '#ff007b' : world.accent}44`,
            boxShadow: `0 0 30px ${world.accent}22`,
            pointerEvents: 'none',
            top: 'calc(50% - 225px)'
          }}
        />

        {/* Top: Enemy Showcase & Health Bar */}
        <div style={{ width: '100%', maxWidth: '600px', textAlign: 'center', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '18px', color: currentEnemyData.isBoss ? '#ff007b' : '#fff' }}>
              {currentEnemyData.isBoss && '👑 BOSS: '} {currentEnemyData.name}
            </span>
            <span style={{ fontSize: '13px', color: '#ff3366', fontWeight: 700 }}>
              {enemyHp} / {enemyMaxHp} HP
            </span>
          </div>

          {/* Enemy HP Progress Bar */}
          <div style={{
            width: '100%',
            height: '14px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '7px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 51, 102, 0.4)',
            marginBottom: '20px'
          }}>
            <div style={{
              width: `${Math.max(0, (enemyHp / enemyMaxHp) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff0055, #ffaa00)',
              transition: 'width 0.2s ease-out'
            }} />
          </div>

          {/* Enemy Sprite & Floating Damage Numbers */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div 
              className={enemyHitFlash ? 'enemy-hit' : 'animate-float'}
              style={{
                fontSize: currentEnemyData.isBoss ? '80px' : '64px',
                filter: `drop-shadow(0 0 20px ${world.accent})`
              }}
            >
              {currentEnemyData.sprite}
            </div>

            {/* Floating Damage Text */}
            {floatingDamages.map(item => (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-20px',
                  color: item.isCrit ? '#ff0055' : '#00f3ff',
                  fontSize: item.isCrit ? '28px' : '22px',
                  fontWeight: 900,
                  fontFamily: 'Orbitron',
                  textShadow: '0 0 10px #000, 0 0 20px currentColor',
                  animation: 'float-slow 0.8s ease-out',
                  pointerEvents: 'none'
                }}
              >
                -{item.dmg} {item.isCrit && 'CRIT!'}
              </div>
            ))}
          </div>
        </div>

        {/* Middle: THE CORE TYPING SPELL TARGET */}
        <div style={{
          width: '100%',
          maxWidth: '680px',
          textAlign: 'center',
          margin: '28px 0',
          zIndex: 3
        }}>
          {/* Target Word Display with Letter-by-Letter Highlights */}
          <div style={{
            fontSize: currentWord.length > 20 ? '24px' : '36px',
            fontFamily: 'JetBrains Mono',
            letterSpacing: '2px',
            marginBottom: '16px',
            background: 'rgba(5, 10, 25, 0.85)',
            padding: '16px 28px',
            borderRadius: '12px',
            border: '2px solid rgba(0, 243, 255, 0.4)',
            boxShadow: '0 0 25px rgba(0, 243, 255, 0.2)',
            display: 'inline-block'
          }}>
            {currentWord.split('').map((char, index) => {
              const typedChar = inputVal[index];
              let color = '#556688';
              let textShadow = 'none';

              if (typedChar !== undefined) {
                if (typedChar === char) {
                  color = '#00f3ff';
                  textShadow = '0 0 12px #00f3ff';
                } else {
                  color = '#ff0055';
                  textShadow = '0 0 12px #ff0055';
                }
              }

              return (
                <span 
                  key={index} 
                  style={{ 
                    color, 
                    textShadow,
                    fontWeight: 800,
                    textDecoration: (typedChar !== undefined && typedChar !== char) ? 'underline' : 'none'
                  }}
                >
                  {char}
                </span>
              );
            })}
            <span className="cursor-caret" />
          </div>

          {/* Typing Input Box (Auto Focused) */}
          <div>
            <input
              type="text"
              autoFocus
              value={inputVal}
              onChange={handleInputChange}
              onPaste={(e) => { e.preventDefault(); alert("Spell paste forbidden!"); }}
              placeholder="TYPE THE SPELL TO INCINERATE FOES..."
              disabled={battleOver !== null}
              style={{
                width: '100%',
                maxWidth: '520px',
                padding: '14px 20px',
                fontSize: '18px',
                fontFamily: 'JetBrains Mono',
                textAlign: 'center',
                background: 'rgba(10, 16, 35, 0.9)',
                border: '2px solid #00f3ff',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
                boxShadow: '0 0 20px rgba(0, 243, 255, 0.4)'
              }}
            />
          </div>
        </div>

        {/* Bottom: Player Health Bar & Class Archetype Status */}
        <div style={{ width: '100%', maxWidth: '600px', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#00f3ff' }}>
              PLAYER: {player.username} ({player.classId.toUpperCase()})
            </span>
            <span style={{ fontSize: '13px', color: playerHp < 30 ? '#ff3366' : '#00ff88', fontWeight: 700 }}>
              {playerHp} / {playerMaxHp} HP
            </span>
          </div>

          <div style={{
            width: '100%',
            height: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '5px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 255, 136, 0.4)'
          }}>
            <div style={{
              width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00ff88, #00f3ff)',
              transition: 'width 0.2s ease-out'
            }} />
          </div>
        </div>
      </div>

      {/* Battle End Modal (Victory or Defeat) */}
      {battleOver && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 8, 20, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '90%',
            padding: '36px',
            textAlign: 'center',
            border: battleOver === 'victory' ? '2px solid #00ff88' : '2px solid #ff0055',
            boxShadow: battleOver === 'victory' ? '0 0 40px rgba(0,255,136,0.3)' : '0 0 40px rgba(255,0,85,0.3)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {battleOver === 'victory' ? '🏆' : '💀'}
            </div>

            <h2 style={{
              fontSize: '32px',
              fontWeight: 900,
              color: battleOver === 'victory' ? '#00ff88' : '#ff0055',
              marginBottom: '12px'
            }}>
              {battleOver === 'victory' ? 'MISSION COMPLETE' : 'SYSTEM OVERHEAT'}
            </h2>

            <p style={{ color: '#8391b5', fontSize: '14px', marginBottom: '24px' }}>
              {battleOver === 'victory' 
                ? 'All cyber abominations in this sector have been neutralized.' 
                : 'Your defenses were breached. Refine your typing pace and strike again.'}
            </p>

            {/* Performance Metrics Table */}
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '8px',
              padding: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              textAlign: 'left',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              <div>WPM: <strong style={{ color: '#00f3ff' }}>{currentWpm}</strong></div>
              <div>Accuracy: <strong style={{ color: '#00ff88' }}>{currentAccuracy}%</strong></div>
              <div>Max Combo: <strong style={{ color: '#ff007b' }}>{maxCombo}x</strong></div>
              <div>Mistakes: <strong style={{ color: '#ff3366' }}>{wrongKeys}</strong></div>
              <div>Damage Dealt: <strong style={{ color: '#bd00ff' }}>{totalDamageDealt}</strong></div>
              <div>Time: <strong style={{ color: '#fff' }}>{battleTime}s</strong></div>
            </div>

            {/* Adaptive Recommendation */}
            <div style={{
              background: 'rgba(0, 243, 255, 0.08)',
              border: '1px solid #00f3ff',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#d0f0ff',
              marginBottom: '24px'
            }}>
              💡 <strong>Adaptive Diagnostic:</strong> Practice rhythm on words containing <code>TR, QU, CK</code> to push past {currentWpm + 15} WPM!
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={restartBattle} className="btn-cyber-primary">
                PLAY AGAIN
              </button>
              <button onClick={onSelectWorld} className="btn-cyber-outline">
                WORLD MAP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. WORLD MAP VIEW
// ==========================================
function WorldMapView({ player, selectedWorld, onSelectWorld }) {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>CYBER REALM ATLAS</h1>
        <p style={{ color: '#8391b5', fontSize: '14px' }}>
          Navigate through progressive difficulty sectors. Higher tiers unleash complex tech terminology and rapid boss mechanics.
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
                border: isSelected ? `2px solid ${w.accent}` : (isUnlocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.04)'),
                opacity: isUnlocked ? 1 : 0.6,
                position: 'relative',
                overflow: 'hidden',
                background: w.bg
              }}
            >
              {!isUnlocked && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255,0,85,0.2)',
                  border: '1px solid #ff0055',
                  color: '#ff0055',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  LOCKED (REQ LV.{w.levelReq})
                </div>
              )}

              <div style={{ fontSize: '12px', color: w.accent, fontWeight: 'bold', marginBottom: '6px' }}>
                SECTOR 0{index + 1} • {w.difficulty.toUpperCase()}
              </div>

              <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>
                {w.name}
              </h3>

              <p style={{ fontSize: '13px', color: '#9bb0cf', marginBottom: '16px', lineHeight: 1.5 }}>
                {w.desc}
              </p>

              <div style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '12px'
              }}>
                <div style={{ color: '#cbd5e1', marginBottom: '4px' }}>
                  <strong>Enemies:</strong> {w.enemies.map(e => e.name).join(' → ')}
                </div>
                <div style={{ color: '#8391b5' }}>
                  <strong>Word Tier:</strong> {w.wordTier}
                </div>
              </div>

              <button
                disabled={!isUnlocked}
                onClick={() => onSelectWorld(w)}
                className={isSelected ? "btn-cyber-magic" : "btn-cyber-primary"}
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
// 4. MULTIPLAYER REAL-TIME VIEW
// ==========================================
function MultiplayerView({ player, onJoinBattle }) {
  const [activeSubTab, setActiveSubTab] = useState('race'); // 'race' | 'coop' | 'pvp'
  const [friendsList, setFriendsList] = useState(MOCK_FRIENDS);
  const [newFriendId, setNewFriendId] = useState('');
  const [roomCode, setRoomCode] = useState('CYBER-ROOM-409');

  // Simulated live racers for the Race Mode preview
  const [racers, setRacers] = useState([
    { name: player.username, progress: 45, wpm: 84, isYou: true },
    { name: 'Valkyrie_X', progress: 68, wpm: 92, isYou: false },
    { name: 'ZeroEcho', progress: 32, wpm: 66, isYou: false }
  ]);

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!newFriendId) return;
    setFriendsList(prev => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        name: newFriendId,
        tag: `#${Math.floor(1000 + Math.random() * 9000)}`,
        level: 1,
        class: 'Technomancer',
        status: 'online',
        wpm: 70,
        avatar: '⚡'
      }
    ]);
    setNewFriendId('');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>REAL-TIME MULTIPLAYER</h1>
        <p style={{ color: '#8391b5', fontSize: '14px' }}>
          Engage with hackers worldwide. Team up in co-op boss raids, race across identical texts, or engage in 1v1 magic duels.
        </p>
      </div>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {[
          { id: 'race', label: 'Typing Race (Speed Run)', desc: 'Live progress bars against 3 competitors' },
          { id: 'coop', label: 'Co-Op Boss Raid', desc: 'Pool typing DPS to take down massive Raid Bosses' },
          { id: 'pvp', label: '1v1 Magic Duel', desc: 'Spell combos directly damage opponent shields' }
        ].map(m => (
          <div
            key={m.id}
            onClick={() => setActiveSubTab(m.id)}
            className="glass-panel"
            style={{
              flex: 1,
              padding: '16px',
              cursor: 'pointer',
              border: activeSubTab === m.id ? '2px solid #00f3ff' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: activeSubTab === m.id ? '0 0 15px rgba(0,243,255,0.3)' : 'none'
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '16px', color: activeSubTab === m.id ? '#00f3ff' : '#fff' }}>
              {m.label}
            </div>
            <div style={{ fontSize: '12px', color: '#8391b5', marginTop: '4px' }}>
              {m.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Mode Detail Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Mode Arena */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          {activeSubTab === 'race' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', color: '#00f3ff' }}>RACE ARENA: LIVE TRACK</h3>
                <span style={{ fontSize: '12px', color: '#00ff88' }}>● 3 PLAYERS CONNECTED</span>
              </div>

              {/* Progress bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                {racers.map(racer => (
                  <div key={racer.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', color: racer.isYou ? '#00f3ff' : '#fff' }}>
                        {racer.name} {racer.isYou && '(YOU)'}
                      </span>
                      <span style={{ color: '#ffaa00' }}>{racer.wpm} WPM • {racer.progress}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '14px',
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '7px',
                      overflow: 'hidden',
                      border: racer.isYou ? '1px solid #00f3ff' : '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{
                        width: `${racer.progress}%`,
                        height: '100%',
                        background: racer.isYou 
                          ? 'linear-gradient(90deg, #00f3ff, #bd00ff)' 
                          : 'linear-gradient(90deg, #ffaa00, #ff0055)'
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onJoinBattle('race')}
                className="btn-cyber-primary"
                style={{ width: '100%' }}
              >
                START LIVE RACE BATTLE
              </button>
            </div>
          )}

          {activeSubTab === 'coop' && (
            <div>
              <h3 style={{ fontSize: '20px', color: '#00ff88', marginBottom: '12px' }}>CO-OP MAIN RAID</h3>
              <p style={{ color: '#9bb0cf', fontSize: '13px', marginBottom: '20px' }}>
                Join forces with your guild members to eliminate the high-HP Raid Boss before the corruption timer expires.
              </p>
              <div style={{
                padding: '20px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🪐</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#ff007b' }}>RAID BOSS: CHRONOS OVERLORD</div>
                <div style={{ fontSize: '13px', color: '#ff3366', marginTop: '4px' }}>HP: 25,000 / 25,000</div>
              </div>
              <button 
                onClick={() => onJoinBattle('coop')}
                className="btn-cyber-magic"
                style={{ width: '100%' }}
              >
                JOIN CO-OP RAID
              </button>
            </div>
          )}

          {activeSubTab === 'pvp' && (
            <div>
              <h3 style={{ fontSize: '20px', color: '#ff007b', marginBottom: '12px' }}>1V1 SPELL DUEL</h3>
              <p style={{ color: '#9bb0cf', fontSize: '13px', marginBottom: '20px' }}>
                Direct keyboard duel. Every accurate word launches a magical missile into your opponent's cyber shield.
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '24px',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px' }}>⚡</div>
                  <div style={{ fontWeight: 'bold' }}>{player.username}</div>
                  <div style={{ fontSize: '12px', color: '#00f3ff' }}>Lv.{player.level}</div>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#ff0055' }}>VS</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px' }}>🛡️</div>
                  <div style={{ fontWeight: 'bold' }}>NeonSamurai</div>
                  <div style={{ fontSize: '12px', color: '#ffaa00' }}>Lv.19</div>
                </div>
              </div>
              <button 
                onClick={() => onJoinBattle('pvp')}
                className="btn-cyber-primary"
                style={{ width: '100%' }}
              >
                SEARCH PVP MATCH
              </button>
            </div>
          )}
        </div>

        {/* Right: Friends & Private Room Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Private Room Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '16px', color: '#00f3ff', marginBottom: '8px' }}>PRIVATE ROOM</h4>
            <div style={{ fontSize: '12px', color: '#8391b5', marginBottom: '12px' }}>
              Room Code: <code style={{ color: '#fff' }}>{roomCode}</code>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="Enter Room Code..."
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '6px 10px',
                  fontSize: '12px'
                }}
              />
              <button className="btn-cyber-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                Join
              </button>
            </div>
          </div>

          {/* Friends List */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '16px' }}>FRIENDS LIST</h4>
              <span style={{ fontSize: '12px', color: '#8391b5' }}>{friendsList.length} Friends</span>
            </div>

            <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
              <input
                type="text"
                value={newFriendId}
                onChange={e => setNewFriendId(e.target.value)}
                placeholder="Add Username / ID..."
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '6px 10px',
                  fontSize: '12px'
                }}
              />
              <button type="submit" className="btn-cyber-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                Add
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {friendsList.map(f => (
                <div key={f.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{f.avatar}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#fff' }}>{f.name} <span style={{ color: '#8391b5', fontSize: '10px' }}>{f.tag}</span></div>
                      <div style={{ fontSize: '10px', color: '#00f3ff' }}>Lv.{f.level} • {f.wpm} WPM</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: f.status === 'online' ? '#00ff88' : (f.status === 'in-battle' ? '#ffaa00' : '#666')
                  }}>
                    ● {f.status}
                  </span>
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
// 5. ADAPTIVE TRAINING LAB (Neuro Drill)
// ==========================================
function AdaptiveLabView({ player, setPlayer }) {
  const errorEntries = Object.entries(player.keyErrors || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>ADAPTIVE NEURAL LAB</h1>
        <p style={{ color: '#8391b5', fontSize: '14px' }}>
          Real-time telemetry analysis of your keystroke accuracy. The engine identifies weak finger transitions and synthesizes drill matrices.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Keystroke Weakness Diagnostic */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#ff007b', marginBottom: '16px' }}>MISTAKE FREQUENCY BY KEY</h3>
          {errorEntries.length === 0 ? (
            <p style={{ color: '#8391b5', fontSize: '13px' }}>No recorded typing errors yet. Flawless execution!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {errorEntries.map(([key, count]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold', color: '#00f3ff' }}>
                      Key [{key.toUpperCase()}]
                    </span>
                    <span style={{ color: '#ff3366' }}>{count} mistakes</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{
                      width: `${Math.min(100, count * 15)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #ffaa00, #ff0055)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Targeted Drills */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', color: '#00f3ff', marginBottom: '16px' }}>SYNTHESIZED DRILL SETS</h3>
          <p style={{ fontSize: '12px', color: '#8391b5', marginBottom: '16px' }}>
            Curated words to condition muscle memory for tricky English bigrams:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #00f3ff' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>Transition: [T] ↔ [R]</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#8391b5', marginTop: '4px' }}>
                Words: <code>teleportation, interstellar, matrix, crystal</code>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #bd00ff' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>Transition: [Q] ↔ [U]</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#8391b5', marginTop: '4px' }}>
                Words: <code>quantum, quick, vanquish, quest</code>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #00ff88' }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>Transition: [C] ↔ [K]</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#8391b5', marginTop: '4px' }}>
                Words: <code>overclock, knight, lock, hack</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. LEADERBOARD VIEW
// ==========================================
function LeaderboardView({ player }) {
  const [filter, setFilter] = useState('global'); // 'global' | 'friends' | 'today'

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>CYBER RANKINGS</h1>
          <p style={{ color: '#8391b5', fontSize: '14px' }}>Top operatives across the Quantum Singularity.</p>
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['global', 'friends', 'today'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#00f3ff' : 'rgba(255,255,255,0.06)',
                color: filter === f ? '#000' : '#cbd5e1',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', borderBottom: '1px solid rgba(0,243,255,0.3)' }}>
              <th style={{ padding: '14px 20px' }}>RANK</th>
              <th style={{ padding: '14px 20px' }}>OPERATIVE</th>
              <th style={{ padding: '14px 20px' }}>CLASS</th>
              <th style={{ padding: '14px 20px' }}>WPM</th>
              <th style={{ padding: '14px 20px' }}>ACCURACY</th>
              <th style={{ padding: '14px 20px' }}>HIGH SCORE</th>
            </tr>
          </thead>
          <tbody>
            {INITIAL_LEADERBOARD.map((item, idx) => (
              <tr 
                key={item.rank}
                style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: idx % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'transparent'
                }}
              >
                <td style={{ padding: '14px 20px', fontWeight: 900, color: idx < 3 ? '#ffaa00' : '#8391b5' }}>
                  #{item.rank}
                </td>
                <td style={{ padding: '14px 20px', fontWeight: 'bold' }}>
                  {item.name} <span style={{ color: '#8391b5', fontSize: '11px' }}>{item.tag}</span>
                </td>
                <td style={{ padding: '14px 20px', color: '#00f3ff' }}>{item.class}</td>
                <td style={{ padding: '14px 20px', fontWeight: 'bold' }}>{item.wpm}</td>
                <td style={{ padding: '14px 20px', color: '#00ff88' }}>{item.acc}%</td>
                <td style={{ padding: '14px 20px', fontWeight: 900, color: '#bd00ff' }}>
                  {item.score.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 7. STATS & PROGRESSION LOG
// ==========================================
function StatsView({ player, setPlayer }) {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>COMBAT DOSSIER</h1>
        <p style={{ color: '#8391b5', fontSize: '14px' }}>Detailed lifetime metrics and character specialization data.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#8391b5' }}>HIGHEST SPEED</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#00f3ff' }}>{player.bestWpm} WPM</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#8391b5' }}>AVG ACCURACY</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#00ff88' }}>{player.avgAcc}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#8391b5' }}>TOTAL DAMAGE DEALT</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#bd00ff' }}>{player.totalDamage.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#8391b5' }}>HIGHEST COMBO</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#ff007b' }}>{player.highestCombo}x</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>CHARACTER EDIT</h3>
        <div style={{ display: 'flex', gap: '16px', maxWidth: '400px' }}>
          <input 
            type="text" 
            value={player.username}
            onChange={(e) => setPlayer(p => ({ ...p, username: e.target.value }))}
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #00f3ff',
              borderRadius: '6px',
              padding: '10px 14px',
              color: '#fff',
              fontSize: '14px'
            }}
          />
          <button className="btn-cyber-primary" onClick={() => alert("Profile updated!")}>
            Save Name
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. MISSIONS & DAILY REWARDS
// ==========================================
function MissionsView({ missions, setMissions, gainXp }) {
  const claimReward = (mission) => {
    if (!mission.completed) return;
    gainXp(mission.rewardXP);
    alert(`Reward Claimed: +${mission.rewardXP} XP and Title: "${mission.rewardTitle}"!`);
    setMissions(prev => prev.filter(m => m.id !== mission.id));
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>DAILY BOUNTIES</h1>
        <p style={{ color: '#8391b5', fontSize: '14px' }}>Complete neural typing challenges to earn bonus XP and exclusive titles.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {missions.map(m => (
          <div 
            key={m.id}
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: m.completed ? '1px solid #00ff88' : '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{m.title}</span>
                {m.completed && <span style={{ color: '#00ff88', fontSize: '12px' }}>✓ READY TO CLAIM</span>}
              </div>
              <div style={{ fontSize: '13px', color: '#8391b5', margin: '4px 0 10px 0' }}>{m.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                <span style={{ color: '#00f3ff' }}>Progress: {m.current} / {m.target}</span>
                <span style={{ color: '#bd00ff' }}>Reward: +{m.rewardXP} XP ({m.rewardTitle})</span>
              </div>
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
