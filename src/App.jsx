import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, Shield, Zap, Trophy, Users, BarChart3, 
  Map, Sparkles, Volume2, VolumeX, BookOpen, 
  Award, LogIn, LogOut, Copy, Play, Globe, Settings as SettingsIcon
} from 'lucide-react';
import { soundManager } from './sound';
import confetti from 'canvas-confetti';

// Import Data & Engines
import { 
  CHARACTER_CLASSES, WORLDS, INITIAL_DAILY_MISSIONS, INITIAL_LEADERBOARD 
} from './gameData';
import { SequenceDeck } from './wordEngine';
import { TRANSLATIONS } from './locales';
import { MonsterIllustration } from './MonsterArt';
import { 
  auth, db, googleProvider, signInWithPopup, fbSignOut, onAuthStateChanged,
  doc, setDoc, getDoc
} from './firebase';

export default function App() {
  // Navigation tabs: 'home' | 'choose-hero' | 'battle' | 'worlds' | 'multiplayer' | 'training' | 'leaderboard' | 'stats' | 'missions' | 'settings'
  const [activeTab, setActiveTab] = useState('home');

  // Language & Typing Mode Preferences (Saved to LocalStorage / Firebase)
  const [lang, setLang] = useState(() => localStorage.getItem('cyberspell_lang') || 'th');
  const [typingMode, setTypingMode] = useState(() => localStorage.getItem('cyberspell_typing_mode') || 'en'); // 'en' | 'th' | 'mix'

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Player State
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('cyberspell_player_v3');
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
    const saved = localStorage.getItem('cyberspell_missions_v3');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_MISSIONS;
  });

  // World & Mode Configuration
  const [currentWorld, setCurrentWorld] = useState(WORLDS[0]);
  const [battleMode, setBattleMode] = useState('solo');
  const [currentLobbyRoom, setCurrentLobbyRoom] = useState(null);

  // Sync Language & Mode Preferences
  useEffect(() => {
    localStorage.setItem('cyberspell_lang', lang);
    localStorage.setItem('cyberspell_typing_mode', typingMode);
  }, [lang, typingMode]);

  // Sync Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            setPlayer(prev => ({ ...prev, ...data, uid: user.uid }));
            if (data.preferredLang) setLang(data.preferredLang);
            if (data.preferredTypingMode) setTypingMode(data.preferredTypingMode);
          } else {
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
    localStorage.setItem('cyberspell_player_v3', JSON.stringify(player));
    localStorage.setItem('cyberspell_missions_v3', JSON.stringify(missions));
    if (firebaseUser) {
      try {
        setDoc(doc(db, 'users', firebaseUser.uid), {
          ...player,
          preferredLang: lang,
          preferredTypingMode: typingMode
        }, { merge: true }).catch(() => {});
      } catch(e){}
    }
  }, [player, missions, firebaseUser, lang, typingMode]);

  const currentClass = CHARACTER_CLASSES.find(c => c.id === player.classId) || CHARACTER_CLASSES[0];

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch(err) {
      console.warn("Google popup simulated/fallback:", err);
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
      {/* Top Navigation Bar: Strict 3-Color Theme (#090B1A, #7C3AED, #22D3EE) */}
      <header style={{
        background: 'rgba(9, 11, 26, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(124, 58, 237, 0.35)',
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
              {t.tagline}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'home', label: t.navHome, icon: Sparkles },
            { id: 'choose-hero', label: t.navHeroes, icon: Shield },
            { id: 'battle', label: `⚔️ ${t.navBattle}`, icon: Swords, highlight: true },
            { id: 'worlds', label: t.navWorlds, icon: Map },
            { id: 'multiplayer', label: t.navMultiplayer, icon: Users },
            { id: 'training', label: t.navTraining, icon: BookOpen },
            { id: 'leaderboard', label: t.navRankings, icon: Trophy },
            { id: 'stats', label: t.navStats, icon: BarChart3 },
            { id: 'missions', label: t.navBounties, icon: Award },
            { id: 'settings', label: t.navSettings, icon: SettingsIcon }
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
                    : (tab.highlight ? 'rgba(34, 211, 238, 0.15)' : 'transparent'),
                  color: isActive ? (tab.highlight ? '#090B1A' : '#22D3EE') : (tab.highlight ? '#22D3EE' : '#94A3B8'),
                  border: isActive ? (tab.highlight ? 'none' : '1px solid #7C3AED') : (tab.highlight ? '1px solid rgba(34, 211, 238, 0.4)' : '1px solid transparent'),
                  padding: '7px 11px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isActive || tab.highlight ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: isActive && tab.highlight ? '0 0 14px rgba(34,211,238,0.4)' : (tab.highlight ? '0 0 8px rgba(34, 211, 238, 0.2)' : 'none')
                }}
              >
                {!tab.label.includes('⚔️') && <Icon size={14} />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Language Toggle, Sound, and Auth HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Language Switcher Button */}
          <button
            onClick={() => setLang(l => l === 'th' ? 'en' : 'th')}
            title="Switch Language / เปลี่ยนภาษา"
            style={{
              background: 'rgba(124, 58, 237, 0.2)',
              border: '1px solid #7C3AED',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              color: '#22D3EE',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Globe size={14} />
            <strong>{lang === 'th' ? '🇹🇭 TH' : '🇬🇧 EN'}</strong>
          </button>

          <button 
            onClick={toggleSound}
            title={soundMuted ? "Unmute Audio" : "Mute Audio"}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '6px 8px',
              color: soundMuted ? '#94A3B8' : '#22D3EE'
            }}
          >
            {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Firebase Google Auth */}
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
                <span style={{ fontSize: '16px' }}>{currentClass.icon}</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#F8FAFC' }}>
                    {player.username} <span style={{ color: '#22D3EE' }}>Lv.{player.level}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                title={t.signOut}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(124, 58, 237, 0.4)',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  color: '#94A3B8'
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="btn-cyber-primary"
              style={{ fontSize: '12px', padding: '7px 12px' }}
            >
              <LogIn size={13} />
              <span>{t.signInGoogle}</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content View Switcher */}
      <main style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'home' && (
          <HomeView 
            t={t}
            lang={lang}
            player={player} 
            onStartBattle={() => setActiveTab('battle')} 
            onChooseHero={() => setActiveTab('choose-hero')}
            onOpenWorlds={() => setActiveTab('worlds')}
          />
        )}

        {activeTab === 'choose-hero' && (
          <ChooseHeroView 
            t={t}
            lang={lang}
            player={player}
            setPlayer={setPlayer}
            onHeroSelected={() => setActiveTab('battle')}
          />
        )}

        {activeTab === 'battle' && (
          <BattleArena 
            t={t}
            lang={lang}
            typingMode={typingMode}
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
            t={t}
            lang={lang}
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
            t={t}
            lang={lang}
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
            t={t}
            lang={lang}
            player={player}
            setPlayer={setPlayer}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView t={t} lang={lang} player={player} />
        )}

        {activeTab === 'stats' && (
          <StatsView t={t} lang={lang} player={player} setPlayer={setPlayer} />
        )}

        {activeTab === 'missions' && (
          <MissionsView t={t} lang={lang} missions={missions} setMissions={setMissions} gainXp={gainXp} />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            t={t}
            lang={lang}
            setLang={setLang}
            typingMode={typingMode}
            setTypingMode={setTypingMode}
          />
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

      {/* Strict 3-Color Footer */}
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
          <strong style={{ color: '#22D3EE' }}>CYBER-SPELL:</strong> "{t.everyKeystroke} {t.isArcaneSpell}"
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Lang: <strong style={{ color: '#22D3EE' }}>{lang.toUpperCase()}</strong></span>
          <span>Training: <strong style={{ color: '#7C3AED' }}>{typingMode.toUpperCase()}</strong></span>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// 1. HOME VIEW
// ==========================================
function HomeView({ t, lang, player, onStartBattle, onChooseHero, onOpenWorlds }) {
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
            {t.everyKeystroke} <br />
            <span style={{ color: '#22D3EE' }}>{t.isArcaneSpell}</span>
          </h1>

          <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '24px' }}>
            {t.heroSubtitle}
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={onStartBattle} className="btn-cyber-primary" style={{ fontSize: '15px', padding: '12px 28px' }}>
              <Swords size={18} />
              <span>{t.enterArena}</span>
            </button>

            <button onClick={onChooseHero} className="btn-cyber-magic" style={{ fontSize: '15px' }}>
              <Shield size={18} />
              <span>{t.chooseHero}</span>
            </button>

            <button onClick={onOpenWorlds} className="btn-cyber-outline" style={{ fontSize: '14px' }}>
              <Map size={16} />
              <span>{t.sectorsAtlas}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Hero Card */}
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
            <div style={{ fontSize: '12px', color: '#22D3EE', fontWeight: 'bold' }}>{t.activeHero}</div>
            <h3 style={{ fontSize: '24px', fontWeight: 800 }}>
              {lang === 'th' ? currentClass.nameTh : currentClass.name}
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '2px' }}>{currentClass.desc}</p>
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#22D3EE' }}>
              <strong>Passive:</strong> {currentClass.passive}
            </div>
          </div>
        </div>

        <button onClick={onChooseHero} className="btn-cyber-outline">
          {t.changeHero}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 2. CHOOSE YOUR HERO
// ==========================================
function ChooseHeroView({ t, lang, player, setPlayer, onHeroSelected }) {
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
          {lang === 'th' ? 'เลือกตัวละคร' : 'CHOOSE YOUR'} <span style={{ color: '#22D3EE' }}>{lang === 'th' ? 'ฮีโร่' : 'HERO'}</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          {lang === 'th' ? 'ฮีโร่แต่ละตัวมีพลังเวทมนตร์และคุณสมบัติการโจมตีแตกต่างกัน' : 'Select your cyber archetype. Your choice alters typing passives, visual spell bursts, and multiplayer presence.'}
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
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC' }}>
                  {lang === 'th' ? cls.nameTh : cls.name}
                </h3>
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
                {isSelected ? (lang === 'th' ? 'เลือกใช้อยู่' : 'HERO EQUIPPED') : (lang === 'th' ? 'เลือกตัวละครนี้' : 'SELECT HERO')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. BATTLE ARENA (Typing Sequences & Hand-crafted High-HP Monsters)
// ==========================================
function BattleArena({ t, lang, typingMode, player, setPlayer, world, mode, gainXp, missions, setMissions, onSelectWorld, roomData }) {
  const [enemyIndex, setEnemyIndex] = useState(0);
  const currentEnemyData = world.enemies[enemyIndex] || world.enemies[0];

  const [enemyHp, setEnemyHp] = useState(currentEnemyData.hp);
  const [enemyMaxHp, setEnemyMaxHp] = useState(currentEnemyData.maxHp);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp] = useState(100);

  // TYPING SEQUENCE ENGINE
  // Sequence deck generator
  const sequenceDeckRef = useRef(null);
  const [currentSequence, setCurrentSequence] = useState(() => {
    const deck = new SequenceDeck(typingMode, world.wordTier);
    return deck.generateSequence(world.difficulty, currentEnemyData.isBoss);
  });
  const [sequenceIndex, setSequenceIndex] = useState(0); // Which word in sequence is currently active
  const [sequenceAccumulatedDmg, setSequenceAccumulatedDmg] = useState(0);

  useEffect(() => {
    sequenceDeckRef.current = new SequenceDeck(typingMode, world.wordTier);
    const seq = sequenceDeckRef.current.generateSequence(world.difficulty, currentEnemyData.isBoss);
    setCurrentSequence(seq);
    setSequenceIndex(0);
    setSequenceAccumulatedDmg(0);
  }, [world, currentEnemyData, typingMode]);

  const activeTargetWord = currentSequence[sequenceIndex] || '';

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
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [battleOver, setBattleOver] = useState(null); // 'victory' | 'defeat'

  // Enemy Counter Attack
  useEffect(() => {
    if (battleOver) return;
    const interval = setInterval(() => {
      setEnemyAttacking(true);
      setTimeout(() => setEnemyAttacking(false), 400);

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

    if (activeTargetWord.startsWith(val)) {
      setCorrectKeys(k => k + 1);
      soundManager.playKey(460 + val.length * 20);

      if (val === activeTargetWord) {
        // Complete single word in sequence
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        // Accumulate damage for sequence
        let wordDmg = activeTargetWord.length * 40;
        if (player.classId === 'cyber-mage' && activeTargetWord.length >= 8) wordDmg *= 1.2;
        if (player.classId === 'void-hunter' && currentAccuracy >= 95) wordDmg *= 1.25;

        const nextAccum = sequenceAccumulatedDmg + wordDmg;
        setSequenceAccumulatedDmg(nextAccum);

        soundManager.playAttack(newCombo);

        // Star Guardian passive
        if (player.classId === 'star-guardian' && newCombo % 5 === 0) {
          setPlayerHp(hp => Math.min(100, hp + 6));
        }

        // Check if finished entire sequence!
        if (sequenceIndex + 1 >= currentSequence.length) {
          // RELEASE FULL SEQUENCE BURST ATTACK!
          soundManager.playComboBurst();
          const burstMultiplier = 1 + Math.min(newCombo * 0.12, 3.0);
          const finalBurstDmg = Math.round(nextAccum * burstMultiplier);

          setTotalDamageDealt(d => d + finalBurstDmg);

          // Visual damage popup
          const dmgId = Date.now();
          setFloatingDamages(prev => [...prev, { id: dmgId, dmg: finalBurstDmg, isBurst: true }]);
          setTimeout(() => setFloatingDamages(p => p.filter(i => i.id !== dmgId)), 800);

          setEnemyHitFlash(true);
          setTimeout(() => setEnemyHitFlash(false), 250);

          // Damage to monster
          setEnemyHp(hp => {
            const nextHp = hp - finalBurstDmg;
            if (nextHp <= 0) {
              handleEnemyDefeated();
              return 0;
            }
            return nextHp;
          });

          // Generate next fresh sequence
          if (sequenceDeckRef.current) {
            const nextSeq = sequenceDeckRef.current.generateSequence(world.difficulty, currentEnemyData.isBoss);
            setCurrentSequence(nextSeq);
            setSequenceIndex(0);
            setSequenceAccumulatedDmg(0);
          }
        } else {
          // Advance to next word in sequence
          setSequenceIndex(idx => idx + 1);
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
      if (lastChar.match(/[a-zก-๙]/)) {
        setPlayer(prev => ({
          ...prev,
          keyErrors: {
            ...prev.keyErrors,
            [lastChar]: (prev.keyErrors[lastChar] || 0) + 1
          }
        }));
      }

      // Tech Knight typo passive
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
      // World Clear!
      setBattleOver('victory');
      confetti({ particleCount: 130, spread: 80, origin: { y: 0.5 } });

      const earnedXp = Math.round((totalDamageDealt / 6) + (currentWpm * 4) + (currentAccuracy * 2));
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
    if (sequenceDeckRef.current) {
      const seq = sequenceDeckRef.current.generateSequence(world.difficulty, world.enemies[0].isBoss);
      setCurrentSequence(seq);
      setSequenceIndex(0);
      setSequenceAccumulatedDmg(0);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
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
              {lang === 'th' ? currentWorld.nameTh : currentWorld.name} (Wave {enemyIndex + 1}/{world.enemies.length})
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Mode: <strong style={{ color: '#22D3EE' }}>{typingMode.toUpperCase()}</strong> | Difficulty: {world.difficulty.toUpperCase()}
            </div>
          </div>
        </div>

        <button onClick={onSelectWorld} className="btn-cyber-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
          {t.selectSector}
        </button>
      </div>

      {/* Combat Metrics HUD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{t.speed}</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#22D3EE' }}>{currentWpm} WPM</div>
        </div>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{t.accuracy}</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: currentAccuracy >= 95 ? '#22D3EE' : '#7C3AED' }}>{currentAccuracy}%</div>
        </div>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{t.combo}</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#7C3AED' }}>{combo}x</div>
        </div>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{t.damage}</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#F8FAFC' }}>{totalDamageDealt}</div>
        </div>
        <div className="glass-panel" style={{ padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{t.time}</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#94A3B8' }}>{battleTime}s</div>
        </div>
      </div>

      {/* Arena Stage */}
      <div className="glass-panel" style={{
        padding: '32px 20px',
        minHeight: '380px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        background: world.bg,
        border: '1px solid rgba(124, 58, 237, 0.4)',
        boxShadow: '0 0 30px rgba(124, 58, 237, 0.15)'
      }}>
        {/* Monster HP and Hand-crafted Illustration */}
        <div style={{ width: '100%', maxWidth: '620px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ fontWeight: 800 }}>
              {currentEnemyData.isBoss && '👑 BOSS: '}
              {lang === 'th' ? currentEnemyData.nameTh : currentEnemyData.name}
            </span>
            <span style={{ color: '#22D3EE', fontWeight: 700 }}>
              {enemyHp.toLocaleString()} / {enemyMaxHp.toLocaleString()} HP
            </span>
          </div>

          <div style={{
            width: '100%', height: '12px', background: 'rgba(0,0,0,0.6)', borderRadius: '6px', overflow: 'hidden',
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
            <MonsterIllustration 
              id={currentEnemyData.id} 
              isBoss={currentEnemyData.isBoss}
              isAttacking={enemyAttacking}
              isHit={enemyHitFlash}
            />

            {floatingDamages.map(d => (
              <div key={d.id} style={{
                position: 'absolute', top: '-24px', right: '-24px',
                color: '#22D3EE', fontSize: d.isBurst ? '28px' : '22px', fontWeight: 900,
                fontFamily: 'Orbitron', textShadow: '0 0 12px #7C3AED'
              }}>
                -{d.dmg} {d.isBurst && 'BURST!'}
              </div>
            ))}
          </div>
        </div>

        {/* TYPING SEQUENCE BARS (Continuous Multi-Word Spell Progression) */}
        <div style={{ width: '100%', maxWidth: '780px', margin: '20px 0', zIndex: 10, textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px', letterSpacing: '0.05em' }}>
            {t.currentSpell} (Step {sequenceIndex + 1}/{currentSequence.length})
          </div>

          {/* Sequence Words Flow UI */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            {currentSequence.map((word, idx) => {
              const isDone = idx < sequenceIndex;
              const isCurrent = idx === sequenceIndex;

              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <div style={{
                    padding: isCurrent ? '8px 16px' : '6px 12px',
                    borderRadius: '6px',
                    background: isCurrent 
                      ? 'rgba(34, 211, 238, 0.2)' 
                      : (isDone ? 'rgba(124, 58, 237, 0.3)' : 'rgba(9, 11, 26, 0.6)'),
                    border: isCurrent 
                      ? '2px solid #22D3EE' 
                      : (isDone ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.1)'),
                    color: isCurrent ? '#22D3EE' : (isDone ? '#94A3B8' : '#64748B'),
                    fontWeight: isCurrent ? 800 : 500,
                    fontSize: isCurrent ? '16px' : '13px',
                    fontFamily: 'JetBrains Mono',
                    boxShadow: isCurrent ? '0 0 16px rgba(34, 211, 238, 0.4)' : 'none',
                    textDecoration: isDone ? 'line-through' : 'none'
                  }}>
                    {word}
                  </div>
                  {idx < currentSequence.length - 1 && (
                    <span style={{ color: '#7C3AED', fontSize: '14px' }}>→</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Word Letter-by-Letter Display */}
          <div style={{
            fontSize: activeTargetWord.length > 20 ? '24px' : '32px',
            fontFamily: 'JetBrains Mono',
            letterSpacing: '2px',
            marginBottom: '14px',
            background: '#090B1A',
            padding: '14px 24px',
            borderRadius: '10px',
            border: '2px solid #7C3AED',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
            display: 'inline-block'
          }}>
            {activeTargetWord.split('').map((char, idx) => {
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
              placeholder={t.typePrompt}
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
        <div style={{ width: '100%', maxWidth: '620px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#22D3EE', fontWeight: 'bold' }}>
              {player.username} ({player.classId.toUpperCase()})
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
              {battleOver === 'victory' ? t.missionComplete : t.systemOverheat}
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
              <button onClick={restartBattle} className="btn-cyber-primary">{t.playAgain}</button>
              <button onClick={onSelectWorld} className="btn-cyber-outline">{t.selectSector}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. WORLD MAP VIEW
// ==========================================
function WorldMapView({ t, lang, player, selectedWorld, onSelectWorld }) {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          CYBER REALM <span style={{ color: '#22D3EE' }}>ATLAS</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          {lang === 'th' ? 'สำรวจแต่ละด่านพร้อมเผชิญหน้ากับมอนสเตอร์ HP สูงและระบบคำแบบ Sequence' : 'Progressive sectors powered by our non-repeating dynamic word matrix.'}
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
                {lang === 'th' ? w.nameTh : w.name}
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
                {isSelected ? (lang === 'th' ? 'ด่านปัจจุบัน' : 'CURRENTLY ENGAGED') : (isUnlocked ? (lang === 'th' ? 'เริ่มต่อสู้ในด่านนี้' : 'DEPLOY TO SECTOR') : `UNLOCK AT LV.${w.levelReq}`)}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 5. MULTIPLAYER LOBBY VIEW
// ==========================================
function MultiplayerLobbyView({ t, lang, player, setPlayer, onLaunchGame }) {
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
    alert(lang === 'th' ? `ส่งคำขอเป็นเพื่อนไปยัง ${searchFriendInput} เรียบร้อยแล้ว!` : `Friend request sent to ${searchFriendInput}!`);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          MULTIPLAYER <span style={{ color: '#22D3EE' }}>LOBBY</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          {lang === 'th' ? 'สร้างห้องประลองหรือใส่รหัสห้องเพื่อพิมพ์ดวลแข่งกันแบบเรียลไทม์' : 'Form rooms, invite companions from your network, or enter a match code to duel.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Left: Active Room Lobby */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>{t.roomCode}</div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#22D3EE', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{createdRoomCode}</span>
                <button 
                  onClick={() => { navigator.clipboard.writeText(createdRoomCode); alert(lang === 'th' ? "คัดลอกรหัสห้องแล้ว!" : "Room code copied!"); }}
                  style={{ background: 'transparent', border: 'none', color: '#7C3AED' }}
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>

            <button onClick={generateRoom} className="btn-cyber-outline" style={{ fontSize: '12px' }}>
              {t.createRoom}
            </button>
          </div>

          {/* Lobby Players List */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '12px' }}>{t.lobbyPlayers} ({roomPlayers.length}/4)</h4>
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
                      <span style={{ color: '#22D3EE', fontSize: '12px', fontWeight: 'bold' }}>✓ {t.ready}</span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontSize: '12px' }}>{t.notReady}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={toggleReady} className="btn-cyber-outline" style={{ flex: 1 }}>
              Toggle Ready
            </button>
            <button 
              onClick={() => onLaunchGame({ code: createdRoomCode, players: roomPlayers })}
              className="btn-cyber-primary" 
              style={{ flex: 1 }}
            >
              <Play size={16} />
              <span>{t.startMatch}</span>
            </button>
          </div>
        </div>

        {/* Right: Join Room & Friend Network */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '15px', color: '#22D3EE', marginBottom: '10px' }}>{t.joinRoom}</h4>
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

          <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
            <h4 style={{ fontSize: '15px', marginBottom: '12px' }}>{t.friendNetwork}</h4>
            <form onSubmit={handleAddFriend} style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              <input 
                type="text"
                value={searchFriendInput}
                onChange={e => setSearchFriendInput(e.target.value)}
                placeholder="Username / ID..."
                style={{
                  flex: 1, padding: '8px 10px', background: 'rgba(9, 11, 26, 0.7)',
                  border: '1px solid rgba(124, 58, 237, 0.4)', borderRadius: '6px', color: '#fff', fontSize: '12px'
                }}
              />
              <button type="submit" className="btn-cyber-magic" style={{ padding: '8px 12px', fontSize: '12px' }}>
                {t.addFriend}
              </button>
            </form>

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
                    onClick={() => alert(`Invite sent to ${f.name}!`)}
                    className="btn-cyber-outline" 
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    {t.invite}
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
// 6. ADAPTIVE LAB
// ==========================================
function AdaptiveLabView({ t, lang, player }) {
  const errorEntries = Object.entries(player.keyErrors || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          ADAPTIVE <span style={{ color: '#22D3EE' }}>NEURAL LAB</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          {lang === 'th' ? 'ระบบตรวจจับปุ่มที่พิมพ์ผิดบ่อย และสร้างแบบฝึกหัดคำปรับแต่งเฉพาะบุคคล' : 'Diagnostic telemetry detecting individual letter mistypes and synthesizing custom combat decks.'}
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
            Combat sequences inject custom keywords to reinforce weak fingers.
          </p>
          <div style={{ background: 'rgba(9, 11, 26, 0.6)', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #22D3EE', fontSize: '12px' }}>
            <strong>Active Injections:</strong> <code>quantum, crystal, teleportation, singularity</code>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. LEADERBOARD VIEW
// ==========================================
function LeaderboardView({ t }) {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          {t.weeklyRankings}
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
function StatsView({ t, player }) {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          {t.lifetimeStats}
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
function MissionsView({ t, lang, missions, setMissions, gainXp }) {
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
          {t.dailyBounties}
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
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#F8FAFC' }}>
                {lang === 'th' ? m.titleTh : m.title}
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8', margin: '4px 0 8px 0' }}>
                {lang === 'th' ? m.descTh : m.desc}
              </div>
              <div style={{ fontSize: '12px', color: '#22D3EE' }}>Reward: +{m.rewardXP} XP</div>
            </div>
            <button
              disabled={!m.completed}
              onClick={() => claimReward(m)}
              className={m.completed ? "btn-cyber-primary" : "btn-cyber-outline"}
              style={{ opacity: m.completed ? 1 : 0.5 }}
            >
              {m.completed ? t.claimReward : t.inProgress}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 10. SETTINGS VIEW (Language & Typing Mode)
// ==========================================
function SettingsView({ t, lang, setLang, typingMode, setTypingMode }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px' }}>
          SYSTEM <span style={{ color: '#22D3EE' }}>SETTINGS</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>
          Configure user interface language and keyboard combat preferences.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Language Selection */}
        <div>
          <h3 style={{ fontSize: '16px', color: '#22D3EE', marginBottom: '12px' }}>
            {t.languageSetting}
          </h3>
          <div style={{ display: 'flex', gap: '14px' }}>
            <button
              onClick={() => setLang('th')}
              className={lang === 'th' ? "btn-cyber-primary" : "btn-cyber-outline"}
              style={{ flex: 1, padding: '14px', fontSize: '15px' }}
            >
              🇹🇭 ภาษาไทย (Thai)
            </button>
            <button
              onClick={() => setLang('en')}
              className={lang === 'en' ? "btn-cyber-primary" : "btn-cyber-outline"}
              style={{ flex: 1, padding: '14px', fontSize: '15px' }}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
