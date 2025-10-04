import React, { useContext, useEffect, useState } from 'react';
import Layout from './Layout';
import ScheduleInterviewScreen from '../components/ScheduleInterviewScreen';
import { AppStateContext } from '../components/AppContext';
import TopBar from '../components/TopBar';

const Interview = ({ route }) => {
  const { userProfile } = useContext(AppStateContext);
  const [type, setType] = useState(route.params?.type || 'Practice');
  const [position, setPosition] = useState(route.params?.position || '');
  const [isFromJob, setIsFromJob] = useState(false);
  useEffect(() => {
    if (route.params?.type) {
      setType(route.params.type);
    }
  }, [route.params?.type]);
  useEffect(() => {
    if (route.params?.position) {
      setPosition(route.params.position);
      setIsFromJob(true);
    }
  }, [route.params?.position]);

  return (
    <>
      <TopBar />
      <Layout>
        <ScheduleInterviewScreen
          userProfile={userProfile}
          type={type}
          routePosition={position}
          isFromJob={isFromJob}
        />
      </Layout>
    </>
  );
};

export default Interview;
