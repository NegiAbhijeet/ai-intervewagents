import React, { useState, createContext, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// Create context to manage tab state
const TabsContext = createContext({
  value: '',
  setValue: () => {},
});

// Tabs wrapper to hold context and children
export const Tabs = ({ defaultValue, children }) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <View>{children}</View>
    </TabsContext.Provider>
  );
};

// Horizontal tab list (button container)
export const TabsList = ({ children }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical:8,
        marginVertical: 8,
      }}
    >
      {children}
    </View>
  );
};

// Single tab button
export const TabsTrigger = ({ value, children }) => {
  const { value: activeValue, setValue } = useContext(TabsContext);
  const isActive = value === activeValue;

  return (
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        marginHorizontal: 2, 
        backgroundColor: isActive ? '#FFFFFF' : 'transparent',
        elevation: isActive ? 2 : 0,
      }}
      onPress={() => setValue(value)}
    >
      <Text
        style={{
          fontWeight: '500',
          color: isActive ? '#111827' : '#6B7280',
          textAlign: 'center',
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

// Tab content, only rendered if active
export const TabsContent = ({ value, children }) => {
  const { value: activeValue } = useContext(TabsContext);
  if (value !== activeValue) return null;

  return <View style={{ marginTop: 12 }}>{children}</View>;
};
