import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './components/RootNavigator';
import { AppStateProvider } from './components/AppContext';
import "./global.css"
export default function App() {
  return (
    <AppStateProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AppStateProvider>
  );
}
