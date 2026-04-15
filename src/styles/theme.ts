export const theme = {
  colors: {
    /* brand */
    primary: '#1e3a5f',
    primaryHover: '#2c5282',

    /* header */
    headerBg: '#000000',
    headerText: '#ffffff',

    /* page / surface */
    pageBg: '#f0f2f5',
    cardBg: '#ffffff',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    /* text */
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',

    /* risk */
    risk: {
      high:   { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', dot: '#ef4444', label: '고위험' },
      medium: { bg: '#fffbeb', border: '#fde68a', text: '#b45309', dot: '#f59e0b', label: '중위험' },
      low:    { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', dot: '#22c55e', label: '저위험' },
    },

    /* job groups */
    soja:    { bg: '#dbeafe', text: '#1e40af' },
    process: { bg: '#fef3c7', text: '#b45309' },
    td:      { bg: '#dbeafe', text: '#1e40af' },
    funcProcess: { bg: '#fef3c7', text: '#b45309' },

    /* action pills */
    hire:  { bg: '#fef2f2', text: '#be123c', border: '#fecaca' },
    coach: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    keep:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },

    /* CL levels */
    cl5: { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
    cl4: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    cl3: { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  },

  spacing: {
    xs:  '4px',
    sm:  '8px',
    md:  '16px',
    lg:  '24px',
    xl:  '32px',
    xxl: '48px',
  },

  borderRadius: {
    xs:   '4px',
    sm:   '6px',
    md:   '8px',
    lg:   '12px',
    xl:   '16px',
    full: '9999px',
  },

  shadows: {
    card: '0 1px 3px rgba(15,23,42,0.06)',
    nav:  '0 1px 4px rgba(0,0,0,0.15)',
    md:   '0 4px 12px rgba(15,23,42,0.10)',
  },

  fontSize: {
    xs:  '10px',
    sm:  '11px',
    md:  '12px',
    base:'13px',
    lg:  '14px',
    xl:  '16px',
    xxl: '18px',
    h1:  '22px',
  },
} as const;

export type AppTheme = typeof theme;
