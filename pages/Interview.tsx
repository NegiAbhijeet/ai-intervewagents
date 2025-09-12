import React, { useContext, useEffect, useState } from 'react';
import Layout from './Layout';
import ScheduleInterviewScreen from '../components/ScheduleInterviewScreen';
import { AppStateContext } from '../components/AppContext';
import TopBar from '../components/TopBar';

const Interview = ({ route }) => {
  const { userProfile } = useContext(AppStateContext);
  const [type, setType] = useState(route.params?.type || 'Practice');

  useEffect(() => {
    if (route.params?.type) {
      setType(route.params.type);
    }
  }, [route.params?.type]);

  return (
    <>
      <TopBar />
      <Layout>
        <ScheduleInterviewScreen userProfile={userProfile} type={type} />
      </Layout>
    </>
  );
};

export default Interview;
