import React, { useContext } from 'react';
import Layout from './Layout';
import ScheduleInterviewScreen from '../components/ScheduleInterviewScreen';
import { AppStateContext } from '../components/AppContext';
const Interview = ({ route }) => {
  const { userProfile } = useContext(AppStateContext);
  const { type } = route.params;
  console.log(type);
  return (
    <Layout>
      <ScheduleInterviewScreen userProfile={userProfile} type={type} />
    </Layout>
  );
};

export default Interview;
