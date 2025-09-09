import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './components/RootNavigator';
import { AppStateProvider } from './components/AppContext';
import './global.css';
import ContextGate from './libs/contextGate';
export default function App() {
  return (
    <AppStateProvider>
      <NavigationContainer>
        <ContextGate>
          <RootNavigator />
        </ContextGate>
      </NavigationContainer>
    </AppStateProvider>
  );
}
