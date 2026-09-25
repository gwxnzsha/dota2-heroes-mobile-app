export const colors = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceElevated: '#1C232D',
  border: 'rgba(255,255,255,0.08)',
  textPrimary: '#F5F6F7',
  textSecondary: '#8B949E',
  textMuted: '#6E7681',
  accent: '#E2543B',
  accentMuted: 'rgba(226,84,59,0.16)',
  strength: '#F2545B',
  agility: '#37D67A',
  intelligence: '#4FA9E8',
  universal: '#C879E8',
};

export const attributeColor = (attribute: string) => {
  switch (attribute?.toLowerCase()) {
    case 'strength': return colors.strength;
    case 'agility': return colors.agility;
    case 'intelligence': return colors.intelligence;
    default: return colors.universal;
  }
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radii = { card: 18, chip: 999, sm: 10 };