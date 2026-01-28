import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Timer = () => {
  const refValue = useRef(0)
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

  const hours = String(Math.floor(displaySeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((displaySeconds % 3600) / 60)).padStart(
    2,
    '0',
  );
  const seconds = String(displaySeconds % 60).padStart(2, '0');

  return (
    <Text style={styles.timerText}>
      {hours}:{minutes}:{seconds}
    </Text>
  );
};

const styles = StyleSheet.create({
  timerText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#000',
    fontWeight: 800
  },
});

export default Timer;
