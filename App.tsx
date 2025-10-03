import React from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import RootNavigator from './components/RootNavigator';
import { AppStateProvider } from './components/AppContext';
import './global.css';
import ContextGate from './libs/contextGate';
import Toast from 'react-native-toast-message';
import toastConfig from './libs/toastConfig';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clarity from '@microsoft/react-native-clarity';

export default function App() {
  const routeNameRef = React.useRef();
  const navigationRef = useNavigationContainerRef();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <AppStateProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            routeNameRef.current = navigationRef.getCurrentRoute().name;
            const clarityConfig = {
              logLevel: Clarity.LogLevel.Verbose,
            };

            Clarity.initialize('<project-id>', clarityConfig);
            Clarity.setCurrentScreenName(routeNameRef.current);
          }}
        >
          <ContextGate>
            <RootNavigator />
          </ContextGate>
        </NavigationContainer>
        <Toast topOffset={70} config={toastConfig} />
      </AppStateProvider>
    </SafeAreaView>
  );
}
