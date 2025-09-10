import React, { useContext } from 'react';
import Layout from './Layout';
import ScheduleInterviewScreen from '../components/ScheduleInterviewScreen';
import { AppStateContext } from '../components/AppContext';
const Interview = () => {
  const {userProfile}=useContext(AppStateContext)
  return (
    <Layout>
      <ScheduleInterviewScreen userProfile={userProfile} />
    </Layout>
  );
};

export default Interview;
