// Game Data: Classes, Worlds, Enemies, Missions
export const CHARACTER_CLASSES = [
  {
    id: 'cyber-mage',
    name: 'Cyber Mage',
    icon: '🔮',
    tagline: 'Arcane Code Weaver',
    desc: 'Channels high-frequency neon glyphs. Devastating burst damage on long words.',
    passive: '+20% Critical Burst on 8+ letter words',
    avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Arcane Hex',
    ultimateSkill: 'Supernova Incantation'
  },
  {
    id: 'void-hunter',
    name: 'Void Hunter',
    icon: '🌌',
    tagline: 'Dimensional Assassin',
    desc: 'Manipulates dark matter and phase shifts. Rewarded heavily for precision.',
    passive: '+25% Damage when Accuracy is 95% or higher',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Rift Dagger',
    ultimateSkill: 'Singularity Vortex'
  },
  {
    id: 'tech-knight',
    name: 'Tech Knight',
    icon: '🛡️',
    tagline: 'Fortified Mainframe Guard',
    desc: 'Heavy cyber armor with plasma barrier. Immune to combo resets on typos.',
    passive: 'Typos only reduce combo by 1 instead of reset',
    avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Aegis Barrier',
    ultimateSkill: 'Solar Flare Cleave'
  },
  {
    id: 'star-guardian',
    name: 'Star Guardian',
    icon: '✨',
    tagline: 'Cosmic Healer & Protector',
    desc: 'Draws vitality from starlight. Steadily restores HP on typing streaks.',
    passive: 'Restores 6 HP every 5 words typed without mistakes',
    avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Starlight Blessing',
    ultimateSkill: 'Cosmic Genesis'
  },
  {
    id: 'quantum-witch',
    name: 'Quantum Witch',
    icon: '⚡',
    tagline: 'Tachyon Overclocker',
    desc: 'Bends space-time continuum. Accelerates attack speed and combo velocity.',
    passive: '+15% Damage multiplier scaling on 10+ combo',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Overclock Pulse',
    ultimateSkill: 'Quantum Lightning Storm'
  }
];

export const WORLDS = [
  {
    id: 'world-1',
    levelReq: 1,
    name: 'Neon Academy',
    desc: 'High-tech training courtyard bathed in holographic neon lights.',
    bg: 'radial-gradient(ellipse at bottom, #100f2e 0%, #090B1A 100%)',
    difficulty: 'Beginner',
    wordTier: 'beginner',
    enemies: [
      { name: 'Training Drone V1', hp: 140, maxHp: 140, attackPower: 8, sprite: '🤖', speedSec: 8 },
      { name: 'Glitch Scout', hp: 200, maxHp: 200, attackPower: 12, sprite: '👾', speedSec: 7 },
      { name: 'Holo-Gargoyle', hp: 320, maxHp: 320, attackPower: 15, sprite: '🗿', speedSec: 6.5, isBoss: true }
    ]
  },
  {
    id: 'world-2',
    levelReq: 5,
    name: 'Crystal Forest',
    desc: 'Bioluminescent alien woods with floating resonating mana crystals.',
    bg: 'radial-gradient(ellipse at bottom, #15103a 0%, #090B1A 100%)',
    difficulty: 'Intermediate',
    wordTier: 'intermediate',
    enemies: [
      { name: 'Prism Sprite', hp: 280, maxHp: 280, attackPower: 14, sprite: '💎', speedSec: 6.5 },
      { name: 'Crystal Stalker', hp: 380, maxHp: 380, attackPower: 18, sprite: '🐆', speedSec: 5.8 },
      { name: 'Emerald Archon', hp: 550, maxHp: 550, attackPower: 22, sprite: '🐉', speedSec: 5.2, isBoss: true }
    ]
  },
  {
    id: 'world-3',
    levelReq: 10,
    name: 'Cyber Dungeon',
    desc: 'Subterranean mainframe overrun by corrupted rogue algorithms.',
    bg: 'radial-gradient(ellipse at bottom, #1d0f3f 0%, #090B1A 100%)',
    difficulty: 'Advanced',
    wordTier: 'advanced',
    enemies: [
      { name: 'Malware Spore', hp: 420, maxHp: 420, attackPower: 20, sprite: '🦠', speedSec: 5.5 },
      { name: 'Firewall Sentinel', hp: 580, maxHp: 580, attackPower: 26, sprite: '🛡️', speedSec: 5.0 },
      { name: 'Zero-Day Leviathan', hp: 800, maxHp: 800, attackPower: 30, sprite: '🐙', speedSec: 4.5, isBoss: true }
    ]
  },
  {
    id: 'world-4',
    levelReq: 20,
    name: 'Quantum City',
    desc: 'Metropolis pulsating with tachyon particle fountains and hover-skiffs.',
    bg: 'radial-gradient(ellipse at bottom, #23124d 0%, #090B1A 100%)',
    difficulty: 'Expert',
    wordTier: 'advanced',
    enemies: [
      { name: 'Tachyon Enforcer', hp: 600, maxHp: 600, attackPower: 25, sprite: '🛸', speedSec: 4.8 },
      { name: 'Cybernetic Wyrm', hp: 750, maxHp: 750, attackPower: 32, sprite: '🐍', speedSec: 4.2 },
      { name: 'Nexus Overmind', hp: 1100, maxHp: 1100, attackPower: 38, sprite: '👁️', speedSec: 3.8, isBoss: true }
    ]
  },
  {
    id: 'world-5',
    levelReq: 30,
    name: 'Void Station',
    desc: 'Derelict orbital fortress near an unstable event horizon.',
    bg: 'radial-gradient(ellipse at bottom, #260a48 0%, #090B1A 100%)',
    difficulty: 'Master',
    wordTier: 'expert',
    enemies: [
      { name: 'Void Phantom', hp: 800, maxHp: 800, attackPower: 34, sprite: '👻', speedSec: 4.0 },
      { name: 'Eclipse Titan', hp: 1400, maxHp: 1400, attackPower: 45, sprite: '🪐', speedSec: 3.5, isBoss: true }
    ]
  },
  {
    id: 'world-6',
    levelReq: 50,
    name: 'The Singularity',
    desc: 'The primordial core of cyber-arcana where space and digital code collapse.',
    bg: 'radial-gradient(ellipse at bottom, #2e0854 0%, #090B1A 100%)',
    difficulty: 'Grandmaster',
    wordTier: 'expert',
    enemies: [
      { name: 'Chronos Prime', hp: 2000, maxHp: 2000, attackPower: 55, sprite: '⏳', speedSec: 3.2, isBoss: true }
    ]
  }
];

export const INITIAL_DAILY_MISSIONS = [
  { id: 'm1', title: 'Power Surge', desc: 'Type 250 words across all battles', target: 250, current: 65, rewardXP: 300, rewardTitle: 'Fast Finger', completed: false },
  { id: 'm2', title: 'Hyper Focus', desc: 'Maintain 95% Accuracy in any battle', target: 95, current: 0, rewardXP: 450, rewardTitle: 'Deadeye', completed: false },
  { id: 'm3', title: 'Combo Master', desc: 'Reach a 20x Combo streak in one fight', target: 20, current: 12, rewardXP: 500, rewardTitle: 'Rhythm Archon', completed: false },
  { id: 'm4', title: 'Dungeon Conqueror', desc: 'Defeat 5 cyber enemies', target: 5, current: 2, rewardXP: 350, rewardTitle: 'Glitch Slayer', completed: false }
];

export const INITIAL_LEADERBOARD = [
  { rank: 1, name: 'ChronosMaster', tag: '#0001', level: 48, wpm: 128, acc: 99.4, score: 28450, charClass: 'Quantum Witch' },
  { rank: 2, name: 'StarLight_99', tag: '#1234', level: 42, wpm: 115, acc: 98.6, score: 24900, charClass: 'Star Guardian' },
  { rank: 3, name: 'GlitchBreaker', tag: '#5566', level: 36, wpm: 108, acc: 97.8, score: 21300, charClass: 'Tech Knight' },
  { rank: 4, name: 'VoidWalker_K', tag: '#7788', level: 30, wpm: 99, acc: 96.5, score: 18750, charClass: 'Void Hunter' },
  { rank: 5, name: 'Aetheria', tag: '#9900', level: 28, wpm: 95, acc: 97.1, score: 16200, charClass: 'Cyber Mage' }
];
