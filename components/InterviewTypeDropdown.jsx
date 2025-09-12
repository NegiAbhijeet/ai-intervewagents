// InterviewTypeDropdown.tsx
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export default function InterviewTypeDropdown({
  interviewType,
  setInterviewType,
  typeOptions,
}) {
  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      data={typeOptions}
      labelField="label"
      valueField="value"
      placeholder="Select Type"
      value={interviewType}
      onChange={item => setInterviewType(item.value)}
      maxHeight={200}
    />
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 56,
    borderColor: 'transparent',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    backgroundColor: '#ffffff',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#334155',
  },
});
