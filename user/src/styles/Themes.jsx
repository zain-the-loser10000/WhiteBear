/**
 * @file Themes.jsx
 * @module styles/Themes
 * @description Centralized, production-grade theme definitions for the application.
 * Contains core colors, custom dashboard palettes, typography specs, and shadow elevations.
 */

export const theme = {
  colors: {
    // Core brand definitions
    primary: '#627a80',
    secondary: '#aabab0',
    tertiary: '#e8e8e8',
    success: '#35f338',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#f00221',
    white: '#ffffff',
    dark: '#000000',
    gray: '#dde0e5',
    border: '#E2E8F0',

    // Semantic application structural tones
    background: '#F8FAFA',
    textPrimary: '#0A1D2D',
    textMuted: '#a3a6a8',
    tabInactive: '#8E9A95',

    // Exact color metrics matching your core dashboard features
    dashboard: {
      goalsGradient: ['#5496FF', '#56C6E7'],
      goals: '#5496FF',
      todos: '#FFAF2A',
      habits: '#81b14e',
      journals: '#BA74D2',
      analytics: '#FA5E85',
      howItWorks: '#21B2DC',
      settings: '#5C74CE',
    },
  },

  typography: {
    // Custom font-family identities
    black: 'Nunito-Black',
    bold: 'Nunito-Bold',
    light: 'Nunito-Light',
    medium: 'Nunito-Medium',
    regular: 'Nunito-Regular',
    semiBold: 'Nunito-SemiBold',

    // Scaled baseline font sizes
    fontSize: {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 24,
      xxl: 32,
    },

    // Proportional text lines heights
    lineHeight: {
      xs: 20,
      sm: 22,
      md: 26,
      lg: 28,
      xl: 32,
      xxl: 40,
    },
  },

  // Abstract layout sizing engines
  spacing: factor => factor * 8,
  gap: factor => factor * 8,

  // Uniform layout perimeter smoothing rules
  borderRadius: {
    small: 6,
    medium: 8,
    large: 16,
    circle: 9999,
  },

  // Layered interface depth shadow systems
  elevation: {
    depth1: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    depth2: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 6,
    },
    depth3: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 12,
    },
  },
};
