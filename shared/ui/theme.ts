/** Design tokens: the only file allowed to contain raw colors (enforced by __tests__/theme-guard.test.ts). */
export const Colors = {
  primary: '#4A80F0',
  secondary: '#F0C14A',
  success: '#4AD991',
  danger: '#F25757',
  warning: '#F2994A',
  info: '#56CCF2',
  white: '#FFFFFF',
  black: '#000000',
  light: {
    background: '#FFFFFF',
    card: '#F9FAFC',
    text: '#1A1A2E',
    subtext: '#6E7191',
    border: '#E4E9F2',
    icon: '#A0A3BD',
  },
  dark: {
    background: '#1A1A2E',
    card: '#262A43',
    text: '#FFFFFF',
    subtext: '#A0A3BD',
    border: '#3F4366',
    icon: '#6E7191',
  },
  mapBackground: '#E8EEF4',
  link: '#2e78b7',
  chatMuted: '#555',
  errorTint: '#ffcccc',
  errorStrong: '#990000',
  notificationLight: '#FF231F7C',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radii = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
export const fontSizes = { caption: 12, small: 14, body: 16, title: 24, headline: 28 } as const;
export const breakpoints = { compact: 360, regular: 768 } as const;
