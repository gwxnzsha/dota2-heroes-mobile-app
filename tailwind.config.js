export default {
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A0D12',
          900: '#0D1117',
          850: '#11161D',
          800: '#161B22',
          750: '#1B212A',
          700: '#212832',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.12)',
        },
        accent: {
          DEFAULT: '#E05B36',
          soft: '#F08050',
          dim: 'rgba(224,91,54,0.14)',
        },
        attr: {
          strength: '#E05B4A',
          agility: '#63C271',
          intelligence: '#5AA8D6',
          universal: '#C08AD8',
        },
        muted: '#8B95A6',
        faint: '#5B6472',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        panel: '20px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
};
