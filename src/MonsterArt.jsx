import React from 'react';

// Hand-crafted stylized vector silhouette illustrations for each unique monster
export function MonsterIllustration({ id, isBoss = false, isAttacking = false, isHit = false }) {
  const getMonsterSvg = () => {
    switch(id) {
      case 'void-beast':
        // Void Beast: Sharp predatory horned beast with dark matter tendrils
        return (
          <svg viewBox="0 0 160 160" width="140" height="140">
            <defs>
              <radialGradient id="vb-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.1" />
              </radialGradient>
            </defs>
            <circle cx="80" cy="80" r="60" fill="url(#vb-glow)" opacity="0.4" />
            {/* Horns */}
            <path d="M40 50 Q30 15 65 35 Q50 30 40 50 Z" fill="#7C3AED" />
            <path d="M120 50 Q130 15 95 35 Q110 30 120 50 Z" fill="#7C3AED" />
            {/* Body */}
            <polygon points="45,65 115,65 130,110 80,140 30,110" fill="#090B1A" stroke="#7C3AED" strokeWidth="3" />
            {/* Glowing Eyes */}
            <circle cx="65" cy="78" r="7" fill="#22D3EE" filter="drop-shadow(0 0 6px #22D3EE)" />
            <circle cx="95" cy="78" r="7" fill="#22D3EE" filter="drop-shadow(0 0 6px #22D3EE)" />
            {/* Jaws / Fangs */}
            <polygon points="70,105 80,120 90,105 85,100 75,100" fill="#22D3EE" />
          </svg>
        );

      case 'mutant-spider':
        // Mutant Spider: Multi-legged cyber arachnid with plasma sacs
        return (
          <svg viewBox="0 0 160 160" width="140" height="140">
            {/* Legs */}
            <path d="M70 80 Q30 50 15 95" stroke="#7C3AED" strokeWidth="4" fill="none" />
            <path d="M90 80 Q130 50 145 95" stroke="#7C3AED" strokeWidth="4" fill="none" />
            <path d="M70 90 Q20 85 10 125" stroke="#7C3AED" strokeWidth="4" fill="none" />
            <path d="M90 90 Q140 85 150 125" stroke="#7C3AED" strokeWidth="4" fill="none" />
            {/* Abdomen */}
            <ellipse cx="80" cy="110" rx="30" ry="24" fill="#090B1A" stroke="#22D3EE" strokeWidth="2.5" />
            <ellipse cx="80" cy="110" rx="14" ry="10" fill="#7C3AED" opacity="0.6" />
            {/* Head & 4 Eyes */}
            <circle cx="80" cy="70" r="18" fill="#101428" stroke="#7C3AED" strokeWidth="2" />
            <circle cx="74" cy="68" r="3.5" fill="#22D3EE" />
            <circle cx="86" cy="68" r="3.5" fill="#22D3EE" />
            <circle cx="78" cy="76" r="2.5" fill="#22D3EE" />
            <circle cx="82" cy="76" r="2.5" fill="#22D3EE" />
          </svg>
        );

      case 'crystal-golem':
        // Crystal Golem: Heavy monolithic geometric rock with resonating mana cores
        return (
          <svg viewBox="0 0 160 160" width="150" height="150">
            {/* Massive crystalline shoulders */}
            <polygon points="25,50 55,20 65,70 15,65" fill="#7C3AED" stroke="#22D3EE" strokeWidth="2" />
            <polygon points="135,50 105,20 95,70 145,65" fill="#7C3AED" stroke="#22D3EE" strokeWidth="2" />
            {/* Torso */}
            <polygon points="45,45 115,45 125,120 80,145 35,120" fill="#090B1A" stroke="#22D3EE" strokeWidth="3" />
            {/* Core Resonator */}
            <polygon points="80,65 95,85 80,105 65,85" fill="#22D3EE" filter="drop-shadow(0 0 8px #22D3EE)" />
            {/* Head Crest */}
            <polygon points="70,30 90,30 95,45 65,45" fill="#101428" stroke="#7C3AED" strokeWidth="2" />
          </svg>
        );

      case 'shadow-reaper':
        // Shadow Reaper: Floating shrouded scythe wraith
        return (
          <svg viewBox="0 0 160 160" width="145" height="145">
            {/* Scythe */}
            <path d="M120 20 Q150 40 135 70 Q145 35 120 20 Z" fill="#22D3EE" />
            <line x1="125" y1="25" x2="60" y2="140" stroke="#7C3AED" strokeWidth="3" />
            {/* Shroud */}
            <path d="M80 30 Q110 50 105 130 Q80 115 55 130 Q50 50 80 30 Z" fill="#090B1A" stroke="#7C3AED" strokeWidth="2.5" />
            {/* Face Void & Soul Eyes */}
            <ellipse cx="80" cy="55" rx="12" ry="15" fill="#000" />
            <circle cx="76" cy="54" r="3" fill="#22D3EE" filter="drop-shadow(0 0 5px #22D3EE)" />
            <circle cx="84" cy="54" r="3" fill="#22D3EE" filter="drop-shadow(0 0 5px #22D3EE)" />
          </svg>
        );

      case 'plasma-wraith':
        // Plasma Wraith: Serpentine electric spirit
        return (
          <svg viewBox="0 0 160 160" width="140" height="140">
            <path d="M80 25 Q115 50 85 85 Q55 120 95 145" stroke="#22D3EE" strokeWidth="6" fill="none" filter="drop-shadow(0 0 8px #22D3EE)" />
            <circle cx="80" cy="35" r="22" fill="#090B1A" stroke="#7C3AED" strokeWidth="3" />
            <polygon points="72,32 78,32 75,38" fill="#22D3EE" />
            <polygon points="82,32 88,32 85,38" fill="#22D3EE" />
          </svg>
        );

      case 'abyss-dragon':
      default:
        // Abyss Dragon / Boss: Massive horned draconian titan
        return (
          <svg viewBox="0 0 180 180" width="165" height="165">
            {/* Dragon Wings */}
            <path d="M80 80 Q10 20 5 80 Q40 85 80 85 Z" fill="#7C3AED" opacity="0.6" stroke="#22D3EE" strokeWidth="2" />
            <path d="M100 80 Q170 20 175 80 Q140 85 100 85 Z" fill="#7C3AED" opacity="0.6" stroke="#22D3EE" strokeWidth="2" />
            {/* Horns */}
            <path d="M65 40 Q40 5 75 25 Z" fill="#22D3EE" />
            <path d="M115 40 Q140 5 105 25 Z" fill="#22D3EE" />
            {/* Head & Jaws */}
            <polygon points="65,40 115,40 125,95 80,125 35,95" fill="#090B1A" stroke="#7C3AED" strokeWidth="3" />
            {/* Glowing Draconic Eyes */}
            <polygon points="58,58 72,58 65,66" fill="#22D3EE" filter="drop-shadow(0 0 6px #22D3EE)" />
            <polygon points="102,58 116,58 109,66" fill="#22D3EE" filter="drop-shadow(0 0 6px #22D3EE)" />
            {/* Breath Core */}
            <circle cx="90" cy="98" r="8" fill="#22D3EE" filter="drop-shadow(0 0 10px #22D3EE)" />
          </svg>
        );
    }
  };

  return (
    <div style={{
      transform: isHit ? 'scale(0.92) translate(2px, -3px)' : (isAttacking ? 'scale(1.1) translateY(4px)' : 'none'),
      filter: isHit ? 'brightness(1.8) drop-shadow(0 0 20px #22D3EE)' : (isAttacking ? 'drop-shadow(0 0 25px #7C3AED)' : 'none'),
      transition: 'all 0.15s ease-out',
      display: 'inline-block'
    }}>
      {getMonsterSvg()}
    </div>
  );
}
