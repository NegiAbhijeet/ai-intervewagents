import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  ImageBackground,
  Pressable,
} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AppStateContext } from '../components/AppContext';
import { auth } from '../libs/firebase';
import {
  API_URL,
  JAVA_API_URL,
  PRIVACY_POILCY_URL,
  TERMS_OF_USE_URL,
} from '../components/config';
import Layout from './Layout';
import fetchUserDetails from '../libs/fetchUser';
import { RefreshControl } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import fetchWithAuth from '../libs/fetchWithAuth';
import { GradientBorderView } from '@good-react-native/gradient-border';
import BackgroundGradient2 from '../components/backgroundGradient2';
import TopBar from '../components/TopBar';
import EditProfileModal from '../components/editProfile';
import { LEVELS } from '../libs/levels';
export default function ProfileScreen() {
  const {
    userProfile,
    totalMinutes,
    usedMinutes,
    firebaseUser,
    setUserProfile,
    resetAppState,
    setMyCandidate
  } = useContext(AppStateContext);
  const navigation = useNavigation();
  const activeUsedMinutes = usedMinutes;
  const expiryDate = userProfile?.plan_expiry
    ? new Date(userProfile.plan_expiry).toLocaleDateString('en-GB')
    : '';
  const [loading, setLoading] = useState(false);
  const [isEditProfile, setIsEditProfile] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [profileData, setProfileData] = useState({
    canId: "",
    avatar: userProfile?.avatar,
    name: "",
    email: firebaseUser?.email,
    totalMinutes: String(totalMinutes),
    score: userProfile?.rating,
    level: "",
    role: "",
    industry: ""
  });
  const fetchCandidates = async () => {
    try {
      const response = await fetchWithAuth(`${JAVA_API_URL}/api/candidates/uid/${userProfile.uid}`);
      const result = await response.json();

      if (Array.isArray(result?.data) && result.data.length > 0) {
        const candidate = result.data[0];
        console.log(candidate)
        setMyCandidate((prev) => ({ ...prev, firstName: candidate?.firstName }))
        setProfileData({
          avatar: userProfile?.avatar,
          name: `${candidate?.firstName} ${candidate?.lastName}`,
          email: firebaseUser?.email,
          totalMinutes: String(totalMinutes),
          score: userProfile?.rating,
          level: candidate?.experienceYears,
          role: candidate?.position,
          industry: candidate?.industry,
          canId: candidate?.canId
        })
      }
    } catch (error) {
      console.error("Failed to fetch candidate:", error);
    }
  };

  useEffect(() => {
    if (userProfile?.uid) {
      fetchCandidates();
    }
  }, [userProfile?.uid]);
  async function fetchDetails() {
    try {
      if (userProfile?.uid) {
        await fetchUserDetails(userProfile?.uid);
      }
    } catch (err) {
      console.log('Error fetching user details:', err);
    }

    if (profile) {
      setUserProfile(profile);
    } else {
      setUserProfile(null);
    }
  }
  const onRefresh = () => {
    fetchDetails();
    fetchCandidates()
  };
  const initials =
    firebaseUser?.displayName
      ?.split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || '';

  const logout = async () => {
    try {
      setIsLoggingOut(true);

      const currentUser = auth().currentUser;

      if (currentUser) {
        const isGoogleProvider = Array.isArray(currentUser.providerData) &&
          currentUser.providerData.some(p => p.providerId === 'google.com');

        if (isGoogleProvider) {
          // revoke and sign out from Google on device — safe to call even if it fails
          try {
            await GoogleSignin.revokeAccess();
          } catch (e) {
            console.warn('[Logout] revokeAccess failed:', e);
          }
          try {
            await GoogleSignin.signOut();
          } catch (e) {
            console.warn('[Logout] GoogleSignin.signOut failed:', e);
          }
        }
      }

      // sign out from Firebase (native)
      await auth().signOut();
      resetAppState();



      console.log('[Logout] User successfully logged out');
    } catch (err) {
      console.error('Error signing out:', err);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  }; const safe = (v, fallback = 'N/A') => {
    if (v === null || v === undefined || v === '') return fallback
    return v
  }
  const stats = useMemo(() => {
    const findLevel = LEVELS.find((item) => String(item?.value) === String(profileData?.level))
    const fialLevel = findLevel?.label || ""
    return [
      { key: 'role', label: 'Role', value: safe(profileData.role, 'N/A') },
      { key: 'level', label: 'Level', value: safe(fialLevel, 'N/A') },
      { key: 'time', label: 'Total Time', value: `${safe(profileData.totalMinutes)} Minutes` },
      { key: 'rating', label: 'Overall Rating', value: safe(profileData.score, 'N/A') },
    ]
  }, [profileData])

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to permanently delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const res = await fetchWithAuth(
                `${API_URL}/profile/${userProfile.uid}/delete/`,
                { method: 'DELETE' },
              );

              if (res.ok) {
                console.log('[Delete] Account deleted successfully');
                await logout();
              } else {
                throw new Error('Delete request failed');
              }
            } catch (err) {
              console.error('[Delete Error]', err);
              Alert.alert('Error', 'Failed to delete account.');
              setLoading(false);
            }
          },
        },
      ],
    );
  };
  const StatCard = ({ isRating = false, label, value, containerStyle }) => {
    const gradientProps = {
      colors: ['rgba(203,104,195,1)', 'rgba(140,66,236,1)'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 }
    }

    return (
      <GradientBorderView
        gradientProps={gradientProps}
        style={[
          {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderRadius: 14,
            width: '48%',
            height: 64,

            marginBottom: 16,
            alignItems: 'center',
            justifyContent: 'center'
          },
          containerStyle
        ]}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center', paddingHorizontal: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: 'rgba(60, 60, 60, 1)'
            }}
          >
            {label}
          </Text>
          <View className='flex-row items-center gap-2'>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: 'rgba(60, 60, 60, 1)',
                lineHeight: 20
              }}
              numberOfLines={1}
            >{value}
            </Text>
            {
              isRating && <Image source={require("../assets/images/star.png")} style={{ width: 12, height: 12 }} />
            }
          </View>
        </View>
      </GradientBorderView>
    )
  }

  return (
    <>
      <TopBar />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingTop: 60, backgroundColor: 'white' }}>
          <View className="gap-6 pb-10" style={{ backgroundColor: "rgba(239, 239, 239, 1)" }}>
            <BackgroundGradient2 />
            {/* Profile Card */}
            <View className="items-center" style={{ transform: "translateY(-48px)", width: "85%", marginHorizontal: "auto" }}>
              <View style={{ borderRadius: "100%", borderColor: "rgba(239, 239, 239, 1)", borderWidth: 14, backgroundColor: "rgba(239, 239, 239, 1)" }}>
                <GradientBorderView
                  gradientProps={{
                    colors: ['rgba(93, 91, 239, 1)', 'rgba(140, 66, 236, 1)'],
                    start: { x: 0, y: 0 },
                    end: { x: 0, y: 1 },
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderRadius: "100%",
                  }}
                >
                  {profileData?.avatar ? (
                    <Image
                      source={{ uri: profileData?.avatar }}
                      className="w-full h-full rounded-full"
                      style={{ width: 100, height: 100, }}
                    />
                  ) : (
                    <View className="items-center justify-center" style={{ width: 100, height: 100, }}>
                      <Text className="text-indigo-600 text-4xl font-bold">{initials}</Text>
                    </View>
                  )}
                </GradientBorderView>
              </View>

              <Text style={{ fontSize: 20, fontWeight: 700 }}>
                {profileData?.name}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: 500, color: "rgba(155, 169, 176, 1)" }}>
                {profileData?.email}
              </Text>
              {expiryDate && (
                <View className="text-center space-y-1 text-gray-600 mt-2">
                  <View className="text-sm font-medium flex-row items-center">
                    <Text className="text-black">Plan expiry: </Text>
                    <Text className="text-red-500">{expiryDate}</Text>
                  </View>
                </View>
              )}
              <Pressable onPress={() => setIsEditProfile(true)}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: 'rgba(143, 15, 200, 1)',
                    alignSelf: 'center',
                    marginTop: 8,
                    textDecorationLine: 'underline'
                  }}
                >
                  Edit Profile
                </Text>
              </Pressable>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginTop: 22,
                width: '100%'
              }}>
                {stats.map((s, i) => (
                  <StatCard
                    key={s.key}
                    isRating={s.key === "rating"}
                    label={s.label}
                    value={s.value}
                  />
                ))}
              </View>

              <View className=" w-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.4)", padding: 16, borderRadius: 18, marginTop: 24, gap: 12 }}>
                <View>
                  <Text className="text-lg font-bold">Subscription</Text>
                  <Text className="text-sm text-gray-500">
                    Your current plan and billing information.
                  </Text>
                </View>
                <View className="bg-indigo-50 rounded-lg p-4">
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="font-medium text-indigo-800">
                        {userProfile?.plan?.name || 'Free'} Plan
                      </Text>
                    </View>
                    <View className="bg-indigo-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-indigo-800">Active</Text>
                    </View>
                  </View>

                  <Text className="text-sm text-gray-600 mt-2">
                    <Text className="font-bold">{activeUsedMinutes}</Text>
                    <Text> of </Text>
                    <Text className="font-bold">{totalMinutes}</Text> minutes used
                  </Text>

                  <View className="mt-2 h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
                    <View
                      className="h-full bg-indigo-600"
                      style={{
                        width: `${Math.max(
                          5,
                          (activeUsedMinutes / totalMinutes) * 100,
                        )}%`,
                      }}
                    />
                  </View>

                  <Text className="text-xs text-gray-500 text-center mt-2">
                    {activeUsedMinutes > totalMinutes
                      ? 0
                      : totalMinutes - activeUsedMinutes}{' '}
                    minutes left
                  </Text>
                </View>
                {userProfile?.plan.id == 1 ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('pricing')}
                    activeOpacity={0.8}
                    className="bg-blue-500 p-3 items-center rounded-lg"
                  >
                    <Text className="text-white font-bold">Upgrade to Pro</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    className="p-3 items-center rounded-lg border"
                    style={{
                      backgroundColor: '#E5E7EB',
                      borderColor: '#D1D5DB',
                      opacity: 0.8,
                    }}
                  >
                    <Text className="font-bold" style={{ color: '#6B7280' }}>
                      Pro Plan Active
                    </Text>
                  </View>
                )}
              </View>

              {/* Links Section */}
              <View className="items-center mt-2">
                <Text className="text-sm text-gray-600">
                  By using this app, you agree to our
                  <Text
                    className="text-blue-600"
                    onPress={() => Linking.openURL(TERMS_OF_USE_URL)}
                  >
                    {' '}
                    Terms of Service{' '}
                  </Text>
                  <Text> and </Text>
                  <Text
                    className="text-blue-600"
                    onPress={() => Linking.openURL(PRIVACY_POILCY_URL)}
                  >
                    {' '}
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </View>

              {/* Danger Zone */}
              <View className="rounded-xl" style={{ backgroundColor: "rgba(255, 255, 255, 0.4)", padding: 16, borderRadius: 18, marginTop: 24 }}>
                <Text className="text-lg font-bold">Danger Zone</Text>
                <Text className="text-sm text-gray-500 mb-2">
                  Irreversible account actions.
                </Text>
                <TouchableOpacity
                  className="bg-black rounded-lg p-3 items-center mb-4"
                  onPress={logout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">Logout</Text>
                  )}
                </TouchableOpacity>
                <Text className="font-medium">Delete Account</Text>
                <Text className="text-sm text-gray-600 mb-2">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </Text>
                <TouchableOpacity
                  className="bg-red-600 rounded-lg p-3 items-center"
                  onPress={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold">Delete Account</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <EditProfileModal
          visible={isEditProfile}
          onClose={() => setIsEditProfile(false)}
          currentName={profileData?.name}
          avatarUrl={profileData?.avatar}
          initialEmail={profileData?.email}
          canId={profileData?.canId}
          onSuccess={fetchCandidates}
          initialPosition={profileData?.role}
          initialIndustry={profileData?.industry}
          initialLevel={profileData?.level}
        />
      </ScrollView>
    </>
  );
}
