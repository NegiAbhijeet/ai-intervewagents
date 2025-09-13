import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Timer = ({
  elapsedSeconds,
  setElapsedSeconds,
  sessionDurationSeconds,
  terminateSession,
}) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        const next = prev + 1;
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [elapsedSeconds]);

  useEffect(() => {
    if (elapsedSeconds > sessionDurationSeconds + 90) {
      terminateSession(); // Trigger session termination
      if (intervalRef.current) clearInterval(intervalRef.current); // Stop timer
    }
  }, [elapsedSeconds, sessionDurationSeconds, terminateSession]);

  const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(
    2,
    '0',
  );
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');

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
    top: 10,
    left: 10,
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
