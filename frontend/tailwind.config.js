/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ethio: {
          primary:       '#01579B',   // dark blue — buttons, headings, active states
          'primary-dark':'#013d6e',
          'primary-light':'#29B6F6',
          navbar:        '#BAE6FD',   // Figma navbar light-blue background
          tint:          '#E3F2FD',   // very light blue tint
          accent:        '#29B6F6',   // mid blue accent
          'accent-light':'#54C5F8',
          'for-sale':    '#E07A3E',   // orange "For sale" label
          ink:           '#0D1B2A',
          body:          '#1a1a1a',
          muted:         '#546E7A',
          surface:       '#FFFFFF',
          'surface-2':   '#F5FAFF',
          border:        '#D6E8F7',
          'card-shadow': 'rgba(1,87,155,0.08)',
          verified:      '#F5A623',   // yellow verified badge
          live:          '#22C55E',   // green live badge
          draft:         '#94A3B8',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        ethio:   ['"Noto Sans Ethiopic"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:      '0 2px 12px rgba(1,87,155,0.08)',
        'card-lg': '0 8px 32px rgba(1,87,155,0.14)',
        soft:      '0 4px 20px -2px rgba(43,43,43,0.06)',
        'soft-lg': '0 20px 60px -10px rgba(43,43,43,0.12)',
        glow:      '0 0 40px rgba(1,87,155,0.15)',
        inner:     'inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        card: '12px',
        pill: '999px',
      },
    },
  },
  plugins: [],
}
