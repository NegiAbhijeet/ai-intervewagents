import { createContext, useState, useMemo } from 'react';

const AppStateContext = createContext();

const AppStateProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);

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

  // ✅ Memoize the cleaned context value
  const contextValue = useMemo(
    () => ({
      userProfile,
      setUserProfile,
      totalMinutes,
      usedMinutes,
      totalSeconds,
      usedSeconds,
    }),
    [userProfile, totalMinutes, usedMinutes, totalSeconds, usedSeconds],
  );

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

export { AppStateContext, AppStateProvider };
