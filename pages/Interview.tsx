import React, { useContext, useEffect, useState } from 'react';
import Layout from './Layout';
import ScheduleInterviewScreen from '../components/ScheduleInterviewScreen';
import { AppStateContext } from '../components/AppContext';

const Interview = ({ route }) => {
  const { userProfile, language } = useContext(AppStateContext);
  const [type, setType] = useState(route.params?.type || 'Practice');
  const [position, setPosition] = useState(route.params?.position || '');
  const [routeSkills, setRouteSkills] = useState(route.params?.skills || []);
  useEffect(() => {
    if (route.params?.type) {
      setType(route.params.type);
    }
  }, [route.params?.type]);
  useEffect(() => {
    if (route.params?.position || route.params?.skills) {
      setPosition(route.params.position);
      setRouteSkills(route.params?.skills || []);
    }
  }, [route.params?.position, route.params?.skills]);

  return (
    <>
      <Layout>
        <ScheduleInterviewScreen
          userProfile={userProfile}
          type={type}
          routePosition={position}
          routeSkills={routeSkills}
          language={language}
        />
      </Layout>
    </>
  );
};

export default Interview;
