import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Timer = ({
  refValue,
  sessionDurationSeconds,
  terminateSession,
}) => {

  const [displaySeconds, setDisplaySeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplaySeconds(prev => {
        const next = prev + 1;
        refValue.current = next; // Update the parent's ref silently
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (displaySeconds > sessionDurationSeconds + 90) {
      terminateSession();
    }
  }, [displaySeconds]);

  const hours = String(Math.floor(displaySeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((displaySeconds % 3600) / 60)).padStart(
    2,
    '0',
  );
  const seconds = String(displaySeconds % 60).padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>
        {hours}:{minutes}:{seconds}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 25,
    left: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 1000,
  },
  timerText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'monospace',
  },
});

export default Timer;
