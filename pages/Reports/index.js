import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportsHome from '../Reports'; // Your existing reports page
import ReportDetail from '../ReportDetail'; // New detail screen
import TopBar from '../../components/TopBar';

const Stack = createNativeStackNavigator();

const ReportsHomeWithTopBar = () => {
  return (
    <>
      <TopBar />
      <ReportsHome />
    </>
  );
};

const Reports = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="ReportsHome"
        component={ReportsHomeWithTopBar}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetail}
        options={{ title: 'Report Details' }}
      />
    </Stack.Navigator>
  );
};

export default Reports;
