// Massive Dictionary & Word Generation Engine
// Categorized by Beginner, Intermediate, Advanced, Expert
// Covers keyboard spread, tricky bigrams, tech terminology, and sentences.

export const WORD_COLLECTIONS = {
  beginner: [
    'cat', 'tree', 'magic', 'neon', 'fire', 'dark', 'void', 'code', 'cyber', 'star',
    'bolt', 'glow', 'run', 'fast', 'jump', 'cast', 'ring', 'mana', 'flux', 'blade',
    'aura', 'core', 'chip', 'grid', 'byte', 'spark', 'beam', 'data', 'rune', 'link',
    'wave', 'echo', 'node', 'dash', 'sync', 'hack', 'dust', 'iron', 'gate', 'lock',
    'mask', 'root', 'path', 'helm', 'wind', 'mist', 'orb', 'sign', 'claw', 'fang',
    'wing', 'tail', 'burn', 'acid', 'cold', 'heat', 'rift', 'soul', 'mind', 'veil',
    'apex', 'edge', 'flow', 'haze', 'lens', 'mark', 'mesh', 'neon', 'pack', 'pulse',
    'scan', 'slot', 'spun', 'tide', 'unit', 'volt', 'warp', 'wire', 'zone', 'zoom',
    'arch', 'beam', 'cite', 'dock', 'font', 'glow', 'halo', 'icon', 'jack', 'loop'
  ],

  intermediate: [
    'planet', 'battle', 'crystal', 'energy', 'shield', 'plasma', 'rocket', 'vector',
    'glitch', 'chrono', 'portal', 'matrix', 'knight', 'hunter', 'beacon', 'weapon',
    'shadow', 'strike', 'cyborg', 'circuit', 'stellar', 'galaxy', 'meteor', 'sorcery',
    'enchant', 'barrier', 'phantom', 'laser', 'cipher', 'hacker', 'protocol', 'terminal',
    'synthetic', 'android', 'quantum', 'spectral', 'dynamo', 'overload', 'disrupt', 'entropy',
    'gravity', 'neutron', 'vortex', 'holonet', 'firewall', 'subroutine', 'algorithm', 'teleport',
    'paralyze', 'catalyst', 'nanite', 'radiance', 'titanium', 'obsidian', 'astral', 'sentinel',
    'hyperion', 'valkyrie', 'firmware', 'infinite', 'frequency', 'pulsar', 'singularity', 'ionize',
    'subspace', 'cybernet', 'silicon', 'dimension', 'particle', 'magnetic', 'elemental', 'reactive',
    'cascade', 'feedback', 'junction', 'kinetics', 'manifest', 'mutation', 'navigate', 'optimize',
    'phantom', 'polarity', 'protocol', 'quantum', 'radiation', 'resonance', 'spectrum', 'velocity'
  ],

  advanced: [
    'technology', 'interstellar', 'technomancer', 'singularity', 'nanotechnology',
    'quantumburst', 'teleportation', 'superconductor', 'electromagnetic', 'gravitational',
    'cybernetic', 'overclocking', 'astrophysics', 'hyperspace', 'multiverse',
    'bioluminescence', 'metamorphosis', 'crystallization', 'decompilation', 'cryptography',
    'thermodynamics', 'photosynthesis', 'superposition', 'bioinformatics', 'neuroplasticity',
    'synchronization', 'hyperdimensional', 'electrochemical', 'semiconductor', 'reconfiguration',
    'transcendence', 'omnidirectional', 'photolithography', 'recalibration', 'countermeasure',
    'crystallography', 'telepathically', 'microprocessor', 'biomechanical', 'superluminal',
    'interconnection', 'parallelization', 'electrodynamics', 'perpendicular', 'hydrodynamic',
    'stratosphere', 'photosensitive', 'electromotive', 'macromolecule', 'biomolecular'
  ],

  expert: [
    'every keystroke is an ancient spell woven in starlight',
    'the digital mainframe whispers forgotten cybernetic incantations',
    'we channel plasma fire through the quantum singularity',
    'overclock your mind to shatter the incoming firewall',
    'precision and speed harmonize to awaken cosmic power',
    'the future belongs to those who master the rhythmic code',
    'arcane matrices align with cybernetic neural processors',
    'sublight thrusters propel our void ship beyond the event horizon',
    'dark matter resonates within the consecrated titanium circle',
    'synchronized keystrokes unleash overwhelming tachyon cascades',
    'only true keyboard sorcerers survive the neon singularity',
    'harness the infinite frequencies of the electromagnetic void',
    'decode the subterranean mainframe before the security lockdown',
    'channel pure starlight through crystallized plasma conduits',
    'unleash the quantum burst to vaporize rogue alien drones'
  ]
};

// Shuffled Non-repeating Word Generator
export class WordDeck {
  constructor(tier = 'beginner', adaptiveKeys = []) {
    this.tier = tier;
    this.adaptiveKeys = adaptiveKeys;
    this.deck = [];
    this.history = new Set();
    this.refill();
  }

  refill() {
    let source = [...(WORD_COLLECTIONS[this.tier] || WORD_COLLECTIONS.beginner)];

    // Adaptive boost: duplicate words containing difficult keys
    if (this.adaptiveKeys && this.adaptiveKeys.length > 0) {
      const targeted = source.filter(w => 
        this.adaptiveKeys.some(k => w.toLowerCase().includes(k.toLowerCase()))
      );
      if (targeted.length > 0) {
        source = [...source, ...targeted, ...targeted];
      }
    }

    // Fisher-Yates Shuffle
    for (let i = source.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [source[i], source[j]] = [source[j], source[i]];
    }

    // Filter out very recently used words to prevent immediate repeats
    this.deck = source.filter(w => !this.history.has(w));
    if (this.deck.length < 5) {
      this.history.clear();
      this.deck = source;
    }
  }

  nextWord() {
    if (this.deck.length === 0) {
      this.refill();
    }
    const word = this.deck.pop();
    this.history.add(word);
    if (this.history.size > 25) {
      const first = this.history.values().next().value;
      this.history.delete(first);
    }
    return word;
  }
}
