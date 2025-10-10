import { createContext, useState, useMemo } from 'react';

const AppStateContext = createContext();

const AppStateProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [isNotificationDraweron, setIsNotificationDrawerOn] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [unreadNotification, setUnreadNotification] = useState(0);
  // Determine if the user is on a free plan
  const isFreePlan = userProfile?.plan?.id === 1;

  // Total and used seconds
  const totalSeconds = isFreePlan
    ? userProfile?.plan?.free_seconds || 0
    : userProfile?.plan?.total_seconds || 0;
  const totalFreeSeconds = userProfile?.plan?.free_seconds_used_today || 0;

  const usedSeconds = userProfile?.seconds_used || 0;

  // Round UP to the nearest minute
  const totalMinutes = Math.ceil(totalSeconds / 60);
  const usedMinutes = Math.ceil(usedSeconds / 60);
  const usedFreeMinutes = Math.ceil(totalFreeSeconds / 60);

  // ✅ Memoize the cleaned context value
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
      usedFreeMinutes,
      isFreePlan,
      isNotificationDraweron,
      setIsNotificationDrawerOn,
      unreadNotification,
      setUnreadNotification,
      notifications,
      setNotifications,
    }),
    [
      userProfile,
      totalMinutes,
      usedMinutes,
      firebaseUser,
      jobs,
      usedFreeMinutes,
      isFreePlan,
      isNotificationDraweron,
      unreadNotification,
      notifications,
    ],
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export { AppStateContext, AppStateProvider };
