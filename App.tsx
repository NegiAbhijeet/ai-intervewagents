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
import * as Clarity from '@microsoft/react-native-clarity';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const routeNameRef = React.useRef();
  const navigationRef = useNavigationContainerRef();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStateProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            routeNameRef.current = navigationRef.getCurrentRoute()?.name;
            const clarityConfig = { logLevel: Clarity.LogLevel.Verbose };
            Clarity.initialize('tlsi9652zl', clarityConfig);
            Clarity.setCurrentScreenName(routeNameRef.current);
          }}
        >
          <ContextGate>
            <RootNavigator />
          </ContextGate>
        </NavigationContainer>

        <Toast topOffset={70} config={toastConfig} />
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}
