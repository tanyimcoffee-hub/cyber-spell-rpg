// Game Data: Classes, Worlds, High-HP Balanced Monsters, Missions
export const CHARACTER_CLASSES = [
  {
    id: 'cyber-mage',
    name: 'Cyber Mage',
    nameTh: 'ไซเบอร์ เมจ',
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
    nameTh: 'วอยด์ ฮันเตอร์',
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
    nameTh: 'เทค ไนท์',
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
    nameTh: 'สตาร์ การ์เดียน',
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
    nameTh: 'ควอนตัม วิทช์',
    icon: '⚡',
    tagline: 'Tachyon Overclocker',
    desc: 'Bends space-time continuum. Accelerates attack speed and combo velocity.',
    passive: '+15% Damage multiplier scaling on 10+ combo',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
    primarySkill: 'Overclock Pulse',
    ultimateSkill: 'Quantum Lightning Storm'
  }
];

// Balanced High-HP Worlds with Distinct Monster Designs:
// Normal: 800 - 1,500 HP
// Elite: 2,500 - 4,500 HP
// Mini Boss: 6,000 - 9,500 HP
// Boss: 16,000+ HP
export const WORLDS = [
  {
    id: 'world-1',
    levelReq: 1,
    name: 'Neon Academy',
    nameTh: 'นีออน อคาเดมี',
    desc: 'High-tech training courtyard bathed in holographic neon lights.',
    bg: 'radial-gradient(ellipse at bottom, #100f2e 0%, #090B1A 100%)',
    difficulty: 'easy',
    wordTier: 'beginner',
    enemies: [
      { id: 'void-beast', name: 'Void Drone Beast', nameTh: 'อสูรโดรนวอยด์', hp: 1200, maxHp: 1200, attackPower: 8, speedSec: 7 },
      { id: 'mutant-spider', name: 'Mutant Cyber Spider', nameTh: 'แมงมุมไซเบอร์กลายพันธุ์', hp: 3200, maxHp: 3200, attackPower: 12, speedSec: 6.5, isElite: true },
      { id: 'crystal-golem', name: 'Holo Crystal Golem', nameTh: 'โกเลมคริสตัลโฮโล', hp: 6500, maxHp: 6500, attackPower: 15, speedSec: 6, isBoss: true }
    ]
  },
  {
    id: 'world-2',
    levelReq: 5,
    name: 'Crystal Forest',
    nameTh: 'ป่าคริสตัลโบราณ',
    desc: 'Bioluminescent alien woods with floating resonating mana crystals.',
    bg: 'radial-gradient(ellipse at bottom, #15103a 0%, #090B1A 100%)',
    difficulty: 'normal',
    wordTier: 'intermediate',
    enemies: [
      { id: 'mutant-spider', name: 'Prism Arachnid', nameTh: 'แมงมุมปริซึมแสง', hp: 1800, maxHp: 1800, attackPower: 12, speedSec: 6.5 },
      { id: 'shadow-reaper', name: 'Shadow Reaper', nameTh: 'ยมทูตเงาสังหาร', hp: 4500, maxHp: 4500, attackPower: 18, speedSec: 5.8, isElite: true },
      { id: 'crystal-golem', name: 'Emerald Archon Golem', nameTh: 'มหาโกเลมมรกต', hp: 9500, maxHp: 9500, attackPower: 22, speedSec: 5.2, isBoss: true }
    ]
  },
  {
    id: 'world-3',
    levelReq: 10,
    name: 'Cyber Dungeon',
    nameTh: 'คุกใต้ดินไซเบอร์',
    desc: 'Subterranean mainframe overrun by corrupted rogue algorithms.',
    bg: 'radial-gradient(ellipse at bottom, #1d0f3f 0%, #090B1A 100%)',
    difficulty: 'normal',
    wordTier: 'intermediate',
    enemies: [
      { id: 'void-beast', name: 'Malware Spore Beast', nameTh: 'อสูรสปอร์มัลแวร์', hp: 2500, maxHp: 2500, attackPower: 16, speedSec: 5.5 },
      { id: 'plasma-wraith', name: 'Plasma Wraith', nameTh: 'ภูตพลาสม่าคลั่ง', hp: 5500, maxHp: 5500, attackPower: 22, speedSec: 5.0, isElite: true },
      { id: 'abyss-dragon', name: 'Zero-Day Abyss Dragon', nameTh: 'มังกรห้วงลึกซีโร่เดย์', hp: 16500, maxHp: 16500, attackPower: 28, speedSec: 4.8, isBoss: true }
    ]
  },
  {
    id: 'world-4',
    levelReq: 20,
    name: 'Quantum City',
    nameTh: 'มหานครควอนตัม',
    desc: 'Metropolis pulsating with tachyon particle fountains and hover-skiffs.',
    bg: 'radial-gradient(ellipse at bottom, #23124d 0%, #090B1A 100%)',
    difficulty: 'hard',
    wordTier: 'advanced',
    enemies: [
      { id: 'shadow-reaper', name: 'Tachyon Reaper', nameTh: 'ผู้ล่าแทคยอนมิติ', hp: 3500, maxHp: 3500, attackPower: 20, speedSec: 5.0 },
      { id: 'plasma-wraith', name: 'Cybernetic Overlord', nameTh: 'ราชาไซเบอร์เนติกส์', hp: 7500, maxHp: 7500, attackPower: 26, speedSec: 4.5, isElite: true },
      { id: 'abyss-dragon', name: 'Nexus Void Dragon', nameTh: 'มังกรวอยด์แห่งเน็กซัส', hp: 22000, maxHp: 22000, attackPower: 32, speedSec: 4.2, isBoss: true }
    ]
  },
  {
    id: 'world-5',
    levelReq: 30,
    name: 'Void Station',
    nameTh: 'สถานีอวกาศแห่งความว่างเปล่า',
    desc: 'Derelict orbital fortress near an unstable event horizon.',
    bg: 'radial-gradient(ellipse at bottom, #260a48 0%, #090B1A 100%)',
    difficulty: 'hard',
    wordTier: 'expert',
    enemies: [
      { id: 'void-beast', name: 'Abyssal Colossus', nameTh: 'ยักษ์อสูรห้วงลึก', hp: 5000, maxHp: 5000, attackPower: 26, speedSec: 4.5 },
      { id: 'abyss-dragon', name: 'Event Horizon Dragon', nameTh: 'มังกรขอบฟ้าหลุมดำ', hp: 30000, maxHp: 30000, attackPower: 40, speedSec: 3.8, isBoss: true }
    ]
  },
  {
    id: 'world-6',
    levelReq: 50,
    name: 'The Singularity',
    nameTh: 'เดอะ ซิงกูลาริตี้ (จุดกำเนิดมิติ)',
    desc: 'The primordial core of cyber-arcana where space and digital code collapse.',
    bg: 'radial-gradient(ellipse at bottom, #2e0854 0%, #090B1A 100%)',
    difficulty: 'hard',
    wordTier: 'expert',
    enemies: [
      { id: 'abyss-dragon', name: 'Chronos Prime Titan', nameTh: 'จอมราชันกาลเวลา โครนอส ไพรม์', hp: 50000, maxHp: 50000, attackPower: 48, speedSec: 3.5, isBoss: true }
    ]
  }
];

export const INITIAL_DAILY_MISSIONS = [
  { id: 'm1', title: 'Power Surge', titleTh: 'คลื่นพลังงานสังหาร', desc: 'Type 250 words across all battles', descTh: 'พิมพ์ให้ครบ 250 คำในการต่อสู้ทั้งหมด', target: 250, current: 65, rewardXP: 300, completed: false },
  { id: 'm2', title: 'Hyper Focus', titleTh: 'สมาธิอันเฉียบคม', desc: 'Maintain 95% Accuracy in any battle', descTh: 'รักษาความแม่นยำ 95% ขึ้นไปในด่านใดก็ได้', target: 95, current: 0, rewardXP: 450, completed: false },
  { id: 'm3', title: 'Combo Master', titleTh: 'ปรมาจารย์คอมโบ', desc: 'Reach a 20x Combo streak in one fight', descTh: 'ทำคอมโบต่อเนื่อง 20 ครั้งขึ้นไปในการต่อสู้เดียว', target: 20, current: 12, rewardXP: 500, completed: false },
  { id: 'm4', title: 'Dungeon Conqueror', titleTh: 'ผู้พิชิตดันเจี้ยน', desc: 'Defeat 5 cyber enemies', descTh: 'กำจัดมอนสเตอร์ไซเบอร์ให้ครบ 5 ตัว', target: 5, current: 2, rewardXP: 350, completed: false }
];

export const INITIAL_LEADERBOARD = [
  { rank: 1, name: 'ChronosMaster', tag: '#0001', level: 48, wpm: 128, acc: 99.4, score: 28450, charClass: 'Quantum Witch' },
  { rank: 2, name: 'StarLight_99', tag: '#1234', level: 42, wpm: 115, acc: 98.6, score: 24900, charClass: 'Star Guardian' },
  { rank: 3, name: 'GlitchBreaker', tag: '#5566', level: 36, wpm: 108, acc: 97.8, score: 21300, charClass: 'Tech Knight' },
  { rank: 4, name: 'VoidWalker_K', tag: '#7788', level: 30, wpm: 99, acc: 96.5, score: 18750, charClass: 'Void Hunter' },
  { rank: 5, name: 'Aetheria', tag: '#9900', level: 28, wpm: 95, acc: 97.1, score: 16200, charClass: 'Cyber Mage' }
];
