import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './components/RootNavigator';
import { AppStateProvider } from './components/AppContext';
import './global.css';
import ContextGate from './libs/contextGate';
import Toast from 'react-native-toast-message';
import toastConfig from './libs/toastConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <AppStateProvider>
        <NavigationContainer>
          <ContextGate>
            <RootNavigator />
          </ContextGate>
        </NavigationContainer>
        <Toast topOffset={70} config={toastConfig} />
      </AppStateProvider>
    </SafeAreaView>
  );
}
