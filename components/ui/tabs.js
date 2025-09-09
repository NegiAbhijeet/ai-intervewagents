import React, { useState, createContext, useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";

// Context to manage active tab
const TabsContext = createContext({
  value: "",
  setValue: () => {},
});

export const Tabs = ({ defaultValue, children }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <View>{children}</View>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className }) => {
  return <View className={`flex-row bg-gray-200 rounded-lg p-1 my-2 ${className || ""}`}>{children}</View>;
};

export const TabsTrigger = ({ value, children, className, textClassName }) => {
  const { value: activeValue, setValue } = useContext(TabsContext);
  const isActive = value === activeValue;

  return (
    <TouchableOpacity
      className={`px-4 py-2 rounded-md mx-1 ${
        isActive ? "bg-white shadow" : "bg-transparent"
      } ${className || ""}`}
      onPress={() => setValue(value)}
    >
      <Text className={`font-medium text-sm ${isActive ? "text-gray-900" : "text-gray-500"} ${textClassName || ""}`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export const TabsContent = ({ value, children, className }) => {
  const { value: activeValue } = useContext(TabsContext);

  if (value !== activeValue) return null;

  return <View className={`mt-2 ${className || ""}`}>{children}</View>;
};
