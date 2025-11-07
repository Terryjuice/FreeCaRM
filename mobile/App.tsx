import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { InspectionProvider } from './src/context/InspectionContext';
import AppNavigator from './src/navigation/AppNavigator';
import theme from './src/theme';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <InspectionProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </InspectionProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
