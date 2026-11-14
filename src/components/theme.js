import { Platform } from 'react-native';

export const colors = {
  background: '#F4F7F4',
  surface: '#FFFFFF',
  ink: '#142F29',
  muted: '#465F55',
  forest: '#103D32',
  green: '#17634E',
  mint: '#DDF1E8',
  amber: '#FFD181',
  border: '#CCDCD3',
  danger: '#9B2924',
  dangerBackground: '#FBEDE8',
};

export const type = {
  display: {
    fontFamily: Platform.select({ ios: 'Avenir Next Condensed', android: 'sans-serif-condensed', web: '"Arial Narrow", "Roboto Condensed", system-ui, sans-serif' }),
    fontWeight: '800',
    letterSpacing: -0.65,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.25,
  },
};
