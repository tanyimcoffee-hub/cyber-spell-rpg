// Thai & English Word Dictionaries & Shuffled Deck Engine
export const THAI_WORDS = {
  beginner: [
    'ดาว', 'แสง', 'ดาบ', 'เวท', 'ไฟ', 'น้ำ', 'ลม', 'ดิน', 'ฟ้า', 'พลัง',
    'จิต', 'มนต์', 'ค่าย', 'ศร', 'เกราะ', 'เงา', 'กาย', 'มิติ', 'แก้ว', 'ศูนย์',
    'จักร', 'ยันต์', 'จิต', 'ตา', 'หิน', 'ทอง', 'เงิน', 'เหล็ก', 'พิษ', 'สาย',
    'วิญญาณ', 'ประตู', 'ขุม', 'คลัง', 'รหัส', 'ฐาน', 'กล่อง', 'เข็ม', 'แกน', 'วง'
  ],
  intermediate: [
    'เวทมนตร์', 'สายฟ้า', 'อัคคี', 'วารี', 'เกราะเหล็ก', 'ดาบแสง', 'คริสตัล', 'พลังงาน',
    'ป้อมปราการ', 'มิติลี้ลับ', 'วิญญาณแค้น', 'สัตว์ประหลาด', 'อสูรโบราณ', 'หุ่นยนต์',
    'กลไกไซเบอร์', 'วงจรไฟฟ้า', 'ดาวเคราะห์', 'ระบบสุริยะ', 'ความว่างเปล่า', 'ระเบิดพลาสม่า',
    'การโจมตี', 'การป้องกัน', 'การหลบหลีก', 'ความเร็วแสง', 'คลื่นความถี่', 'อนุภาคควอนตัม',
    'สนามแม่เหล็ก', 'ลำแสงเลเซอร์', 'รหัสพันธุกรรม', 'เครื่องจักรกล'
  ],
  advanced: [
    'จักรวาลคู่ขนาน', 'มิติแห่งความว่างเปล่า', 'มหาเวทโบราณกาล', 'อสูรสงครามอวกาศ',
    'เครื่องปฏิกรณ์พลังงานนิวเคลียร์', 'เทคโนโลยีชีวภาพขั้นสูง', 'การเหนี่ยวนำแม่เหล็กไฟฟ้า',
    'ทฤษฎีควอนตัมสัมพัทธภาพ', 'ระบบโครงข่ายประสาทเทียม', 'ซูเปอร์คอมพิวเตอร์ควอนตัม',
    'การสลายตัวของสสารมืด', 'รังสีคอสมิกพลังงานสูง', 'อนุภาคประจุลบความเร็วสูง'
  ],
  expert: [
    'พลังแห่งมนตราโบราณถูกปลุกขึ้นจากห้วงลึกแห่งอวกาศ',
    'จังหวะการพิมพ์ผสานเป็นหนึ่งเดียวกับคลื่นพลังงานเวท',
    'ปลดปล่อยพลังงานพลาสม่าเพื่อทำลายสนามพลังของศัตรู',
    'การเคลื่อนย้ายผ่านรูหนอนด้วยความเร็วเหนือแสง',
    'เมื่อรหัสลับแห่งจักรวาลถูกถอดออก พลังอันไร้ขีดจำกัดจึงตื่นขึ้น',
    'ประสานจิตเข้ากับแกนกลางเครื่องจักรกลสังหารแห่งอนาคต'
  ]
};

export const ENGLISH_WORDS = {
  beginner: [
    'claw', 'shadow', 'crystal', 'quantum', 'strike', 'blade', 'spark', 'flare',
    'pulse', 'cyber', 'void', 'nexus', 'flame', 'frost', 'abyss', 'venom',
    'laser', 'shield', 'armor', 'titan', 'beast', 'demon', 'golem', 'wraith',
    'drone', 'spark', 'bolt', 'phase', 'hyper', 'matrix', 'rune', 'force'
  ],
  intermediate: [
    'lightning', 'plasma', 'singularity', 'corrupted', 'overclock', 'dimension',
    'parasite', 'valkyrie', 'sentinel', 'overlord', 'supernova', 'radiation',
    'subroutine', 'algorithm', 'teleport', 'resonance', 'annihilate', 'cataclysm',
    'cybernetic', 'molecular', 'nanotech', 'frequency', 'gravitation', 'hyperdrive'
  ],
  advanced: [
    'electromagnetic', 'hyperdimensional', 'superconductor', 'bioluminescence',
    'decentralization', 'reconfiguration', 'photolithography', 'thermodynamic',
    'astrophysics', 'metamorphosis', 'crystallography', 'interconnection'
  ],
  expert: [
    'ancient guardian awakens beneath the crystal moon',
    'every keystroke channels arcane electricity through cyber conduits',
    'we tear open dimensional rifts to shatter rogue alien titans',
    'precision and velocity ignite supernova incinerations upon incoming demons'
  ]
};

// Shuffled Non-repeating Sequence Generator
export class SequenceDeck {
  constructor(langMode = 'en', tier = 'beginner') {
    this.langMode = langMode; // 'en' | 'th' | 'mix'
    this.tier = tier;
    this.history = new Set();
  }

  getWordPool() {
    let pool = [];
    if (this.langMode === 'en') {
      pool = [...(ENGLISH_WORDS[this.tier] || ENGLISH_WORDS.beginner)];
    } else if (this.langMode === 'th') {
      pool = [...(THAI_WORDS[this.tier] || THAI_WORDS.beginner)];
    } else {
      // Mixed Thai + English
      const en = ENGLISH_WORDS[this.tier] || ENGLISH_WORDS.beginner;
      const th = THAI_WORDS[this.tier] || THAI_WORDS.beginner;
      pool = [...en, ...th];
    }
    return pool;
  }

  // Generates a sequence of N words for typing combo
  generateSequence(difficulty = 'easy', isBoss = false) {
    let count = 4;
    if (isBoss) {
      count = difficulty === 'hard' ? 10 : (difficulty === 'normal' ? 8 : 6);
    } else {
      if (difficulty === 'easy') count = 4;
      else if (difficulty === 'normal') count = 6;
      else if (difficulty === 'hard') count = 8;
    }

    const pool = this.getWordPool();
    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    
    // Pick words avoiding immediate history
    const sequence = [];
    for (let w of shuffled) {
      if (!this.history.has(w)) {
        sequence.push(w);
        this.history.add(w);
      }
      if (sequence.length >= count) break;
    }

    // Refill if needed
    if (sequence.length < count) {
      this.history.clear();
      for (let w of shuffled) {
        if (!sequence.includes(w)) sequence.push(w);
        if (sequence.length >= count) break;
      }
    }

    if (this.history.size > 40) {
      this.history.clear();
    }

    return sequence;
  }
}
