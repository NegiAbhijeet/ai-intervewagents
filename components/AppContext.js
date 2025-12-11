import { createContext, useState, useMemo } from 'react';

const AppStateContext = createContext();

const AppStateProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [isNotificationDraweron, setIsNotificationDrawerOn] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [unreadNotification, setUnreadNotification] = useState(0);
  const [fcmTokenUpdated, setFcmTokenUpdated] = useState(false);
  const [jobsFetched, setJobsFetched] = useState(false);
  const [firstInterviewObject, setFirstInterviewObject] = useState(null)
  const [leaderboardRank, setLeaderboardRank] = useState(1);
  const [myCandidate, setMyCandidate] = useState(null);
  const [langSelected, setLangSelected] = useState(true)
  const [language, setLanguage] = useState(null);
  const [showDailyStreak, setShowDailyStreak] = useState(false)
  // Determine if the user is on a free plan
  const isFreePlan = userProfile?.plan?.id === 1;

  // Total and used seconds
  const totalSeconds = isFreePlan
    ? userProfile?.plan?.free_seconds || 0
    : userProfile?.plan?.total_seconds || 0;

  const usedSeconds = isFreePlan
    ? userProfile?.free_seconds_used_today || 0
    : userProfile?.seconds_used || 0;

  // Round UP to the nearest minute
  const totalMinutes = Math.ceil(totalSeconds / 60);
  const usedMinutes = Math.ceil(usedSeconds / 60);

  const mainUsedSeconds = userProfile?.seconds_used || 0;

  const mainUsedMinutes = Math.ceil(mainUsedSeconds / 60);

  const [onboardingComplete, setOnboardingComplete] = useState(false);
  // Reset all app states to default when logging out
  const resetAppState = () => {
    setUserProfile(null);
    setFirebaseUser(null);
    setNotifications(null);
    setIsNotificationDrawerOn(false);
    setJobs([]);
    setUnreadNotification(0);
    setFcmTokenUpdated(false);
    setJobsFetched(false);
    setLeaderboardRank(1);
    setOnboardingComplete(false);
    setFirstInterviewObject(null)
    setMyCandidate(null)
    setLangSelected(true)
    // setLanguage(null)
  };

  const contextValue = useMemo(
    () => ({
      userProfile,
      setUserProfile,
      totalMinutes,
      usedMinutes,
      firebaseUser,
      setFirebaseUser,
      jobs,
      setJobs,
      isFreePlan,
      isNotificationDraweron,
      setIsNotificationDrawerOn,
      unreadNotification,
      setUnreadNotification,
      notifications,
      setNotifications,
      fcmTokenUpdated,
      setFcmTokenUpdated,
      jobsFetched,
      setJobsFetched,
      mainUsedMinutes,
      leaderboardRank,
      setLeaderboardRank,
      resetAppState,
      onboardingComplete,
      setOnboardingComplete,
      firstInterviewObject,
      setFirstInterviewObject,
      myCandidate,
      setMyCandidate,
      langSelected,
      setLangSelected,
      language,
      setLanguage,
      showDailyStreak,
      setShowDailyStreak
    }),
    [
      userProfile,
      totalMinutes,
      usedMinutes,
      firebaseUser,
      jobs,
      isFreePlan,
      isNotificationDraweron,
      unreadNotification,
      notifications,
      fcmTokenUpdated,
      jobsFetched,
      mainUsedMinutes,
      leaderboardRank,
      onboardingComplete,
      firstInterviewObject,
      myCandidate,
      langSelected,
      language,
      showDailyStreak
    ],
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export { AppStateContext, AppStateProvider };
