import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportsHome from '../Reports'; // Your existing reports page
import ReportDetail from '../ReportDetail'; // New detail screen

const Stack = createNativeStackNavigator();

const Reports = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="ReportsHome"
        component={ReportsHome}
        options={{ title: 'Reports' }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetail}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
};

export default Reports;
