import React, { useContext, useEffect, useState } from 'react';
import Layout from './Layout';
import ScheduleInterviewScreen from '../components/ScheduleInterviewScreen';
import { AppStateContext } from '../components/AppContext';
import TopBar from '../components/TopBar';

const Interview = ({ route }) => {
  const { userProfile } = useContext(AppStateContext);
  const [type, setType] = useState(route.params?.type || 'Practice');
  const [position, setPosition] = useState(route.params?.position || '');
  const [routeSkills, setRouteSkills] = useState(route.params?.skills || []);
  const [isFromJob, setIsFromJob] = useState(false);
  useEffect(() => {
    if (route.params?.type) {
      setType(route.params.type);
    }
  }, [route.params?.type]);
  useEffect(() => {
    if (route.params?.position || route.params?.skills) {
      setPosition(route.params.position);
      setRouteSkills(route.params?.skills || []);
      setIsFromJob(true);
    }
  }, [route.params?.position, route.params?.skills]);

  return (
    <>
      <TopBar />
      <Layout>
        <ScheduleInterviewScreen
          userProfile={userProfile}
          type={type}
          routePosition={position}
          routeSkills={routeSkills}
        />
      </Layout>
    </>
  );
};

export default Interview;
