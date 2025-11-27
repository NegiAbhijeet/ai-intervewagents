import React from 'react'
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native'
import RootNavigator from './components/RootNavigator'
import { AppStateProvider } from './components/AppContext'
import './global.css'
import ContextGate from './libs/contextGate'
import Toast from 'react-native-toast-message'
import toastConfig from './libs/toastConfig'
import * as Clarity from '@microsoft/react-native-clarity'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { View, Text, Modal, Pressable, StyleSheet, AppState } from 'react-native'
import { checkForUpdateInfo, startImmediateUpdate } from './libs/inAppUpdate'

export default function App() {
  const routeNameRef = React.useRef<any>()
  const navigationRef = useNavigationContainerRef()
  const appState = React.useRef(AppState.currentState)
  const [updateAvailable, setUpdateAvailable] = React.useState(false)
  const [checking, setChecking] = React.useState(false)
  const [startingUpdate, setStartingUpdate] = React.useState(false)

  async function runCheck() {
    try {
      setChecking(true)
      const info = await checkForUpdateInfo()
      if (info.shouldUpdate) {
        setUpdateAvailable(true)
      } else {
        setUpdateAvailable(false)
      }
    } catch (e) {
      console.warn('update check error', e)
    } finally {
      setChecking(false)
    }
  }

  React.useEffect(() => {
    runCheck()

    const sub = AppState.addEventListener('change', next => {
      if (
        appState.current.match(/inactive|background/) &&
        next === 'active'
      ) {
        runCheck()
      }
      appState.current = next
    })

    return () => sub.remove()
  }, [])

  async function handleUpdateNow() {
    try {
      setStartingUpdate(true)
      Toast.show({ type: 'info', text1: 'Starting update' })

      const res = await startImmediateUpdate()

      if (!res.started) {
        Toast.show({ type: 'error', text1: 'Could not start update' })
        setStartingUpdate(false)
        // keep the modal so user can try again or close
        return
      }

      // If start succeeded, Play UI will appear and handle blocking and restart.
      Toast.show({ type: 'success', text1: 'Update flow started' })
      // Do not programmatically close the modal here.
      // The app will be blocked by Play UI and then restarted when update installs.
    } catch (e) {
      console.warn('handleUpdateNow failed', e)
      Toast.show({ type: 'error', text1: 'Update failed' })
      setStartingUpdate(false)
    }
  }

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
            <ImmediateUpdateModal
              visible={updateAvailable}
              onClose={() => setUpdateAvailable(false)}
              onUpdateNow={handleUpdateNow}
              checking={checking}
              startingUpdate={startingUpdate}
            />
          </ContextGate>
        </NavigationContainer>

        <Toast topOffset={70} config={toastConfig} />
      </AppStateProvider>
    </GestureHandlerRootView>
  )
}

function ImmediateUpdateModal({
  visible,
  onClose,
  onUpdateNow,
  checking,
  startingUpdate,
}: {
  visible: boolean
  onClose: () => void
  onUpdateNow: () => void
  checking: boolean
  startingUpdate: boolean
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Update Required</Text>
          <Text style={styles.body}>
            A critical update is available. You must install it to continue using the app.
          </Text>

          <View style={styles.row}>
            {/* <Pressable style={styles.button} onPress={onClose} disabled={startingUpdate}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable> */}

            <Pressable
              style={[styles.button, styles.primary]}
              onPress={onUpdateNow}
              disabled={checking || startingUpdate}
            >
              <Text style={[styles.btnText, styles.primaryText]}>
                {startingUpdate ? 'Starting update...' : 'Update now'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  primary: {
    backgroundColor: '#0b63ff',
  },
  btnText: {
    fontSize: 14,
  },
  primaryText: {
    color: 'white',
    fontWeight: '600',
  },
})
