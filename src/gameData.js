// Game Data: Classes, Worlds, Enemies, Word Database, Missions
export const CHARACTER_CLASSES = [
  {
    id: 'technomancer',
    name: 'Technomancer',
    icon: '⚡',
    color: '#00f3ff',
    desc: 'Wields high-voltage cyber arcana. Quick-burst magic and plasma overclocking.',
    passive: '+15% Damage on 10+ combo',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Overclock Pulse',
    ultimateSkill: 'Quantum Lightning Storm'
  },
  {
    id: 'cyber-knight',
    name: 'Cyber Knight',
    icon: '🛡️',
    color: '#ffaa00',
    desc: 'Heavy cyber armor with plasma energy blade. Steadfast typing defense.',
    passive: 'Errors do not completely reset combo, only -2',
    avatar: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Aegis Barrier',
    ultimateSkill: 'Solar Flare Cleave'
  },
  {
    id: 'void-hunter',
    name: 'Void Hunter',
    icon: '🌌',
    color: '#bd00ff',
    desc: 'Manipulates dark matter and dimensional rifts. Deadly critical strikes.',
    passive: '+20% Critical Damage on >95% accuracy',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Rift Dagger',
    ultimateSkill: 'Singularity Vortex'
  },
  {
    id: 'mage',
    name: 'Astral Mage',
    icon: '🔮',
    color: '#ff007b',
    desc: 'Channels pure neon aether circles. Massive area of effect bursts.',
    passive: 'Generates double ultimate charge during combo bursts',
    avatar: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Arcane Hex',
    ultimateSkill: 'Supernova Incantation'
  },
  {
    id: 'star-guardian',
    name: 'Star Guardian',
    icon: '✨',
    color: '#00ff66',
    desc: 'Cosmic protector healing HP on flawless typing streaks.',
    passive: 'Heal 5 HP every 5 words typed without mistakes',
    avatar: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Starlight Blessing',
    ultimateSkill: 'Cosmic Genesis'
  }
];

export const WORLDS = [
  {
    id: 'world-1',
    levelReq: 1,
    name: 'Neon Academy',
    desc: 'High-tech training courtyard bathed in holographic neon lights.',
    bg: 'radial-gradient(ellipse at bottom, #0d1b2a 0%, #050510 100%)',
    accent: '#00f3ff',
    enemies: [
      { name: 'Training Drone V1', hp: 140, maxHp: 140, attackPower: 8, sprite: '🤖', speedSec: 8 },
      { name: 'Glitch Scout', hp: 200, maxHp: 200, attackPower: 12, sprite: '👾', speedSec: 7 },
      { name: 'Holo-Gargoyle', hp: 320, maxHp: 320, attackPower: 15, sprite: '🗿', speedSec: 6.5, isBoss: true }
    ],
    difficulty: 'Beginner',
    wordTier: 'beginner'
  },
  {
    id: 'world-2',
    levelReq: 5,
    name: 'Crystal Forest',
    desc: 'Bioluminescent alien woods with floating resonating mana crystals.',
    bg: 'radial-gradient(ellipse at bottom, #112a20 0%, #05100a 100%)',
    accent: '#00ff88',
    enemies: [
      { name: 'Prism Sprite', hp: 280, maxHp: 280, attackPower: 14, sprite: '💎', speedSec: 6.5 },
      { name: 'Crystal Stalker', hp: 380, maxHp: 380, attackPower: 18, sprite: '🐆', speedSec: 5.8 },
      { name: 'Emerald Archon', hp: 550, maxHp: 550, attackPower: 22, sprite: '🐉', speedSec: 5.2, isBoss: true }
    ],
    difficulty: 'Intermediate',
    wordTier: 'intermediate'
  },
  {
    id: 'world-3',
    levelReq: 10,
    name: 'Cyber Dungeon',
    desc: 'Subterranean mainframe overrun by corrupted rogue algorithms.',
    bg: 'radial-gradient(ellipse at bottom, #2b0b1a 0%, #0d0408 100%)',
    accent: '#ff0055',
    enemies: [
      { name: 'Malware Spore', hp: 420, maxHp: 420, attackPower: 20, sprite: '🦠', speedSec: 5.5 },
      { name: 'Firewall Sentinel', hp: 580, maxHp: 580, attackPower: 26, sprite: '🛡️', speedSec: 5.0 },
      { name: 'Zero-Day Leviathan', hp: 800, maxHp: 800, attackPower: 30, sprite: '🐙', speedSec: 4.5, isBoss: true }
    ],
    difficulty: 'Advanced',
    wordTier: 'advanced'
  },
  {
    id: 'world-4',
    levelReq: 20,
    name: 'Quantum City',
    desc: 'Metropolis pulsating with tachyon particle fountains and hover-skiffs.',
    bg: 'radial-gradient(ellipse at bottom, #1c1033 0%, #07030d 100%)',
    accent: '#9d00ff',
    enemies: [
      { name: 'Tachyon Enforcer', hp: 600, maxHp: 600, attackPower: 25, sprite: '🛸', speedSec: 4.8 },
      { name: 'Cybernetic Wyrm', hp: 750, maxHp: 750, attackPower: 32, sprite: '🐍', speedSec: 4.2 },
      { name: 'Nexus Overmind', hp: 1100, maxHp: 1100, attackPower: 38, sprite: '👁️', speedSec: 3.8, isBoss: true }
    ],
    difficulty: 'Expert',
    wordTier: 'expert'
  },
  {
    id: 'world-5',
    levelReq: 30,
    name: 'Void Station',
    desc: 'Derelict orbital fortress near an unstable event horizon.',
    bg: 'radial-gradient(ellipse at bottom, #200030 0%, #020005 100%)',
    accent: '#d000ff',
    enemies: [
      { name: 'Void Phantom', hp: 800, maxHp: 800, attackPower: 34, sprite: '👻', speedSec: 4.0 },
      { name: 'Eclipse Titan', hp: 1400, maxHp: 1400, attackPower: 45, sprite: '🪐', speedSec: 3.5, isBoss: true }
    ],
    difficulty: 'Master',
    wordTier: 'sentences'
  },
  {
    id: 'world-6',
    levelReq: 50,
    name: 'The Singularity',
    desc: 'The primordial core of cyber-arcana where space and digital code collapse.',
    bg: 'radial-gradient(ellipse at bottom, #2b1d03 0%, #000000 100%)',
    accent: '#ffcc00',
    enemies: [
      { name: 'Chronos Prime', hp: 2000, maxHp: 2000, attackPower: 55, sprite: '⏳', speedSec: 3.2, isBoss: true }
    ],
    difficulty: 'Grandmaster',
    wordTier: 'sentences'
  }
];

export const WORD_COLLECTIONS = {
  beginner: [
    'cat', 'tree', 'magic', 'neon', 'fire', 'dark', 'void', 'code', 'cyber', 'star',
    'bolt', 'glow', 'run', 'fast', 'jump', 'cast', 'ring', 'mana', 'flux', 'blade',
    'aura', 'core', 'chip', 'grid', 'byte', 'spark', 'beam', 'data', 'rune', 'link'
  ],
  intermediate: [
    'planet', 'battle', 'crystal', 'energy', 'shield', 'plasma', 'rocket', 'vector',
    'glitch', 'chrono', 'portal', 'matrix', 'knight', 'hunter', 'beacon', 'weapon',
    'shadow', 'strike', 'cyborg', 'circuit', 'stellar', 'galaxy', 'meteor', 'sorcery',
    'enchant', 'barrier', 'phantom', 'laser', 'cipher', 'hacker'
  ],
  advanced: [
    'technology', 'interstellar', 'technomancer', 'singularity', 'nanotechnology',
    'quantumburst', 'teleportation', 'superconductor', 'electromagnetic', 'gravitational',
    'cybernetic', 'overclocking', 'astrophysics', 'hyperspace', 'multiverse',
    'bioluminescence', 'metamorphosis', 'crystallization', 'decompilation', 'cryptography'
  ],
  sentences: [
    'every keystroke is an ancient spell woven in starlight',
    'the digital mainframe whispers forgotten cybernetic incantations',
    'we channel plasma fire through the quantum singularity',
    'overclock your mind to shatter the incoming firewall',
    'precision and speed harmonize to awaken cosmic power',
    'the future belongs to those who master the rhythmic code'
  ]
};

export const INITIAL_DAILY_MISSIONS = [
  { id: 'm1', title: 'Power Surge', desc: 'Type 250 words across all battles', target: 250, current: 65, rewardXP: 300, rewardTitle: 'Fast Finger', completed: false },
  { id: 'm2', title: 'Hyper Focus', desc: 'Maintain 95% Accuracy in any battle', target: 95, current: 0, rewardXP: 450, rewardTitle: 'Deadeye', completed: false },
  { id: 'm3', title: 'Combo Master', desc: 'Reach a 20x Combo streak in one fight', target: 20, current: 12, rewardXP: 500, rewardTitle: 'Rhythm Archon', completed: false },
  { id: 'm4', title: 'Dungeon Conqueror', desc: 'Defeat 5 cyber enemies', target: 5, current: 2, rewardXP: 350, rewardTitle: 'Glitch Slayer', completed: false }
];

export const MOCK_FRIENDS = [
  { id: 'usr-002', name: 'Valkyrie_X', tag: '#8891', level: 24, class: 'Technomancer', status: 'online', wpm: 92, avatar: '⚡' },
  { id: 'usr-003', name: 'NeonSamurai', tag: '#4412', level: 19, class: 'Cyber Knight', status: 'in-battle', wpm: 84, avatar: '🛡️' },
  { id: 'usr-004', name: 'CosmicWitch', tag: '#1099', level: 31, class: 'Astral Mage', status: 'offline', wpm: 104, avatar: '🔮' },
  { id: 'usr-005', name: 'ZeroEcho', tag: '#7733', level: 14, class: 'Void Hunter', status: 'online', wpm: 76, avatar: '🌌' }
];

export const INITIAL_LEADERBOARD = [
  { rank: 1, name: 'ChronosMaster', tag: '#0001', level: 48, wpm: 128, acc: 99.4, score: 28450, class: 'Technomancer' },
  { rank: 2, name: 'StarLight_99', tag: '#1234', level: 42, wpm: 115, acc: 98.6, score: 24900, class: 'Star Guardian' },
  { rank: 3, name: 'GlitchBreaker', tag: '#5566', level: 36, wpm: 108, acc: 97.8, score: 21300, class: 'Cyber Knight' },
  { rank: 4, name: 'VoidWalker_K', tag: '#7788', level: 30, wpm: 99, acc: 96.5, score: 18750, class: 'Void Hunter' },
  { rank: 5, name: 'Aetheria', tag: '#9900', level: 28, wpm: 95, acc: 97.1, score: 16200, class: 'Astral Mage' }
];
