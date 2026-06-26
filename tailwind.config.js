/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      sm:  '640px',
      md:  '768px',
      nav: '900px',
      lg:  '1024px',
      xl:  '1200px',
    },
    extend: {
      // ─── shadcn CSS-variable colors ────────────────────────
      colors: {
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        // ─── Celebre brand tokens (static) ───────────────────
        surface: '#fffefe',
        ink:     '#42445d',
        rose:    '#c88bbe',
        lilac:   '#b0aeff',

        // ─── Auth / Dashboard tokens (--ca-*) ────────────────
        slate: {
          950: '#0F172A',
          900: '#1E293B',
          800: '#334155',
          500: '#64748B',
          400: '#94A3B8',
          200: '#E2E8F0',
          100: '#EEF2F7',
          50:  '#F8FAFC',
        },
      },

      // ─── Border radius ────────────────────────────────────
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        cb:  '14px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },

      // ─── Shadows ──────────────────────────────────────────
      boxShadow: {
        cb:       '0 8px 32px rgba(66, 68, 93, 0.08)',
        'ca-xs':  '0 1px 2px rgba(15, 23, 42, 0.04)',
        'ca-sm':  '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.04)',
        'ca-md':  '0 2px 4px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)',
        'ca-lg':  '0 4px 8px rgba(15, 23, 42, 0.05), 0 24px 56px rgba(15, 23, 42, 0.12)',
        'ca-violet': '0 8px 24px rgba(99, 102, 241, 0.28), 0 2px 4px rgba(99, 102, 241, 0.18)',
      },

      // ─── Max widths ───────────────────────────────────────
      maxWidth: {
        page: '1120px',
      },

      // ─── Gradients ────────────────────────────────────────
      backgroundImage: {
        'cl-grad':       'linear-gradient(135deg, #9e68ba 0%, #c88bbe 52%, #b0aeff 100%)',
        'cl-grad-soft':  'linear-gradient(160deg, #fffefe 0%, #f3f0ff 48%, #f9f0f6 100%)',
        'ca-grad':       'linear-gradient(135deg, #6366F1 0%, #8B5CF6 60%, #A855F7 100%)',
        'ca-grad-soft':  'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 60%, #FAF5FF 100%)',
      },

      // ─── Font families ────────────────────────────────────
      fontFamily: {
        display: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        serif:   ['Instrument Serif', 'Georgia', 'serif'],
      },

      // ─── Animations ───────────────────────────────────────
      keyframes: {
        'home-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'home-orb-pulse': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(0.9)' },
          '50%':      { opacity: '1',    transform: 'scale(1.1)' },
        },
        'home-orb-pulse-core': {
          '0%, 100%': { opacity: '0.5',  transform: 'translate(-50%, -50%) scale(0.88)' },
          '50%':      { opacity: '0.95', transform: 'translate(-50%, -50%) scale(1.14)' },
        },
        'home-center-float': {
          '0%, 100%': { transform: 'translate(-50%, -50%) translateY(0)' },
          '50%':      { transform: 'translate(-50%, -50%) translateY(-10px)' },
        },
      },
      animation: {
        'home-float':           'home-float 6s ease-in-out infinite',
        'home-orb-pulse':       'home-orb-pulse 4.5s ease-in-out infinite',
        'home-orb-pulse-core':  'home-orb-pulse-core 4.5s ease-in-out infinite',
        'home-center-float':    'home-center-float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
