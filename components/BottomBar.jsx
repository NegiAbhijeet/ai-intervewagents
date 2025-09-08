import React from "react";
import { View, Pressable, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather"; // You can change this if needed

const TABS = [
  {
    name: "index",
    label: "Home",
    icon: "home",
  },
  {
    name: "interview",
    label: "Interview",
    icon: "mic",
    isCenter: true,
  },
  {
    name: "reports",
    label: "Reports",
    icon: "file-text",
  },
];

const BottomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        paddingBottom: insets.bottom + 8,
        paddingTop: 8,
        height: Platform.OS === "ios" ? 80 : 70,
      }}
    >
      {TABS.map((tab, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: state.routes[index].key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        // Special center button (Interview)
        if (tab.isCenter) {
          return (
            <View
              key={tab.name}
              style={{
                width: 80,
                alignItems: "center",
                marginTop: -30,
              }}
            >
              <Pressable
                onPress={onPress}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  overflow: "hidden",
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                }}
              >
                <LinearGradient
                  colors={["skyblue", "#8B5CF6"]}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 32,
                  }}
                >
                  <Icon name={tab.icon} size={26} color="white" />
                </LinearGradient>
              </Pressable>
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: isFocused ? "#3B82F6" : "#9CA3AF",
                  fontWeight: isFocused ? "600" : "400",
                }}
              >
                {tab.label}
              </Text>
            </View>
          );
        }

        // Left and right tabs (Home, Reports)
        return (
          <Pressable
            key={tab.name}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              name={tab.icon}
              size={22}
              color={isFocused ? "#3B82F6" : "#9CA3AF"}
            />
            <Text
              style={{
                marginTop: 4,
                fontSize: 12,
                color: isFocused ? "#3B82F6" : "#9CA3AF",
                fontWeight: isFocused ? "600" : "400",
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default BottomTabBar;
