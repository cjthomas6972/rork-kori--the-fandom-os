const LUNAR_BLOSSOM = {
  inkBlack: '#07060B',
  inkDeep: '#0D0B14',
  inkElevated: '#13101C',
  inkCard: '#1A1625',
  
  moonGold: '#E8D5A3',
  moonGoldDim: '#C4B07A',
  moonGoldBright: '#F5E8C4',
  
  blossomPink: '#F2A0B5',
  blossomPinkSoft: '#E88BA3',
  blossomPinkBright: '#FFB6C8',
  
  emberRed: '#D64550',
  emberRedBright: '#FF5A67',
  emberRedGlow: '#FF3D4D',
  
  mistGray: '#6B6380',
  mistGrayLight: '#8A8299',
  mistGrayDark: '#4A4560',
  
  pearlWhite: '#F5F2F8',
  pearlSoft: '#E8E4EE',
  
  duskPurple: '#2A1F3D',
  duskPurpleDeep: '#1E1530',
  
  sakuraGlow: 'rgba(242, 160, 181, 0.15)',
  emberGlow: 'rgba(214, 69, 80, 0.2)',
  moonGlow: 'rgba(232, 213, 163, 0.12)',
  
  glass: 'rgba(26, 22, 37, 0.75)',
  glassLight: 'rgba(42, 31, 61, 0.6)',
  glassBorder: 'rgba(232, 213, 163, 0.15)',
  
  overlay: 'rgba(7, 6, 11, 0.9)',
};

const KORI_COLORS = {
  bg: {
    primary: LUNAR_BLOSSOM.inkBlack,
    secondary: LUNAR_BLOSSOM.inkDeep,
    elevated: LUNAR_BLOSSOM.inkElevated,
    card: LUNAR_BLOSSOM.inkCard,
  },
  text: {
    primary: LUNAR_BLOSSOM.pearlWhite,
    secondary: LUNAR_BLOSSOM.mistGrayLight,
    tertiary: LUNAR_BLOSSOM.mistGray,
    gold: LUNAR_BLOSSOM.moonGold,
  },
  accent: {
    primary: LUNAR_BLOSSOM.emberRed,
    secondary: LUNAR_BLOSSOM.blossomPink,
    gold: LUNAR_BLOSSOM.moonGold,
  },
  glow: {
    ember: LUNAR_BLOSSOM.emberGlow,
    sakura: LUNAR_BLOSSOM.sakuraGlow,
    moon: LUNAR_BLOSSOM.moonGlow,
  },
  glass: {
    bg: LUNAR_BLOSSOM.glass,
    light: LUNAR_BLOSSOM.glassLight,
    border: LUNAR_BLOSSOM.glassBorder,
  },
  border: {
    subtle: LUNAR_BLOSSOM.mistGrayDark,
    focus: LUNAR_BLOSSOM.emberRed,
    gold: LUNAR_BLOSSOM.moonGoldDim,
  },
  gradient: {
    moonrise: [LUNAR_BLOSSOM.inkBlack, LUNAR_BLOSSOM.duskPurpleDeep, LUNAR_BLOSSOM.duskPurple],
    ember: [LUNAR_BLOSSOM.emberRedBright, LUNAR_BLOSSOM.emberRed, 'transparent'],
    blossom: [LUNAR_BLOSSOM.blossomPinkBright, LUNAR_BLOSSOM.blossomPink, 'transparent'],
    gold: [LUNAR_BLOSSOM.moonGoldBright, LUNAR_BLOSSOM.moonGold, 'transparent'],
  },
  status: {
    success: '#4ADE80',
    warning: LUNAR_BLOSSOM.moonGold,
    error: LUNAR_BLOSSOM.emberRed,
  },
  neon: {
    cyan: LUNAR_BLOSSOM.moonGold,
    purple: LUNAR_BLOSSOM.blossomPink,
    pink: LUNAR_BLOSSOM.blossomPinkBright,
    green: '#4ADE80',
    blue: LUNAR_BLOSSOM.moonGoldDim,
    orange: LUNAR_BLOSSOM.emberRedBright,
  },
  overlay: LUNAR_BLOSSOM.overlay,
  lunar: LUNAR_BLOSSOM,
};

export default KORI_COLORS;
