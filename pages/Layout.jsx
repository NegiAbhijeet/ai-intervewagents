// components/Layout.jsx
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

const Layout = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 16,
  },
});

export default Layout;
