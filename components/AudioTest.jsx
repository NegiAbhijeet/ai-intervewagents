import React from "react";
import { View, Button, TouchableOpacity, Text } from "react-native";
import useAudioPlayer from "../hooks/useAudioPlayer";

export default function TestScreen() {
  const { reset, testTone, stop } = useAudioPlayer();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop:20 }}>
      {/* <Button title="Init" onPress={reset} /> */}
      <TouchableOpacity onPress={testTone}><Text style={{backgroundColor:"red", padding:10, color:"white"}}>testTone</Text></TouchableOpacity>

      {/* <Button title="Stop" onPress={stop} /> */}
    </View>
  );
}
