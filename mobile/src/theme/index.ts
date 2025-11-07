import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    secondary: '#FF5722',
    accent: '#FFC107',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FF9800',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    onSurface: '#000000',
    disabled: '#BDBDBD',
  },
  roundness: 8,
};

export default theme;
