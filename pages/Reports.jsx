import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import Layout from './Layout';

const Reports = () => {
  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text>Reports</Text>
      </ScrollView>
    </Layout>
  );
};

export default Reports;
