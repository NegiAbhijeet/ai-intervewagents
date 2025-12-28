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
import { useTranslation } from 'react-i18next';
import getLevelData from "../libs/getLevelData"
import CertificateCarousel from '../components/CertificateCarousel';
import EditProfileSkills from '../components/editProfileSkills';
import getIndustryData from '../libs/getIndustryData';
export default function ProfileScreen() {
  const {
    userProfile,
    totalMinutes,
    usedMinutes,
    firebaseUser,
    setUserProfile,
    resetAppState,
    setMyCandidate,
    language,
    myCandidate
  } = useContext(AppStateContext);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const activeUsedMinutes = usedMinutes;
  const expiryDate = userProfile?.plan_expiry
    ? new Date(userProfile.plan_expiry).toLocaleDateString('en-GB')
    : '';
  const [loading, setLoading] = useState(false);
  const [isEditProfile, setIsEditProfile] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editSkillVisible, seteditSkillVisible] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificatesList, setCertificatesList] = useState([])
  const closeModal = () => {
    seteditSkillVisible(false);
  };

  const [search, setSearch] = useState("");
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

  const industries = useMemo(() => getIndustryData(language) || {}, [language])
  const allSkills = useMemo(() => {
    try {
      if (!myCandidate?.position) return [];

      const skillsSet = new Set();

      Object.values(industries).forEach(industry => {
        Object.entries(industry).forEach(([role, skills]) => {
          if (role === myCandidate.position && Array.isArray(skills)) {
            skills.forEach(skill => skillsSet.add(skill));
          }
        });
      });

      return Array.from(skillsSet);
    } catch (error) {
      return [];
    }
  }, [industries, myCandidate?.position]);

  const fetchCandidates = async () => {
    try {
      const response = await fetchWithAuth(`${JAVA_API_URL}/api/candidates/uid/${userProfile.uid}`);
      const result = await response.json();

      if (Array.isArray(result?.data) && result.data.length > 0) {
        const candidate = result.data[0];
        console.log(candidate)
        setMyCandidate(candidate)
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
  async function fetchCertificates() {
    try {
      setCertificateLoading(true)
      const response = await fetchWithAuth(`${API_URL}/get-certificate/?uid=${userProfile.uid}&userId=${userProfile.uid}`);
      const result = await response.json();
      console.log(result, "===")
      if (Array.isArray(result?.certificates)) {
        console.log("Certificates fetched:", result.certificates);
        setCertificatesList(result?.certificates)
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    } finally {
      setCertificateLoading(false);
    }
  }

  const LEVELS = useMemo(() => getLevelData(language) || {}, [language])
  useEffect(() => {
    if (userProfile?.uid) {
      fetchCandidates();
      fetchCertificates();
    }
  }, [userProfile?.uid]);
  async function fetchDetails() {
    try {
      if (userProfile?.uid) {
        const profile = await fetchUserDetails(userProfile?.uid);
        setUserProfile(profile);
      }
    } catch (err) {
      console.log('Error fetching user details:', err);
    }
  }
  const onRefresh = () => {
    fetchDetails();
    fetchCandidates();
    fetchCertificates();
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
    const findLevel = LEVELS.find(
      (item) => String(item?.value) === String(profileData?.level)
    )
    const fialLevel = findLevel?.label || ""

    return [
      {
        key: 'role',
        label: t('profile.stats.role'),
        value: safe(profileData.role, 'N/A'),
      },
      {
        key: 'level',
        label: t('profile.stats.level'),
        value: safe(fialLevel, 'N/A'),
      },
      {
        key: 'time',
        label: t('profile.stats.totalTime'),
        value: `${safe(profileData.totalMinutes)} ${t('profile.stats.minutes')}`,
      },
      {
        key: 'rating',
        label: t('profile.stats.rating'),
        value: safe(profileData.score, 'N/A'),
      },
    ]
  }, [profileData])


  const handleDeleteAccount = async () => {
    Alert.alert(
      t('account.deleteConfirmTitle'),
      t('account.deleteConfirmMessage'),
      [
        { text: t('account.cancel'), style: 'cancel' },
        {
          text: t('account.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              const res = await fetchWithAuth(
                `${API_URL}/profile/${userProfile.uid}/delete/`,
                { method: 'DELETE' }
              )

              if (res.ok) {
                console.log('[Delete] Account deleted successfully')
                await logout()
              } else {
                throw new Error('Delete request failed')
              }
            } catch (err) {
              console.error('[Delete Error]', err)
              Alert.alert(t('account.errorTitle'), t('account.errorMessage'))
              setLoading(false)
            }
          },
        },
      ],
    )
  }

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
      <EditProfileSkills
        visible={editSkillVisible}
        onClose={closeModal}
        allSkills={allSkills}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        <View style={{ paddingTop: 60, backgroundColor: 'white' }}>
          <View style={{ backgroundColor: "rgba(239, 239, 239, 1)", gap: 24, paddingBottom: 40 }}>
            <BackgroundGradient2 />

            {/* Profile Card */}
            <View className="items-center px-[5%]" style={{ transform: "translateY(-48px)", width: "100%", marginHorizontal: "auto" }}>
              <View style={{ borderRadius: 999, borderColor: "rgba(239, 239, 239, 1)", borderWidth: 14, backgroundColor: "rgba(239, 239, 239, 1)" }}>
                <GradientBorderView
                  gradientProps={{
                    colors: ['rgba(93, 91, 239, 1)', 'rgba(140, 66, 236, 1)'],
                    start: { x: 0, y: 0 },
                    end: { x: 0, y: 1 },
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderRadius: 999,
                  }}
                >
                  {profileData?.avatar ? (
                    <Image
                      source={{ uri: profileData?.avatar }}
                      className="w-full h-full rounded-full"
                      style={{ width: 100, height: 100 }}
                    />
                  ) : (
                    <View className="items-center justify-center" style={{ width: 100, height: 100 }}>
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
                <View style={{ marginTop: 8, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14 }}>{t('profile.planExpiryPrefix')}</Text>
                    <Text style={{ color: 'red', marginLeft: 6 }}>{expiryDate}</Text>
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
                  {t('profile.editProfile')}
                </Text>
              </Pressable>

              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginTop: 22,
                width: '100%'
              }}>
                {stats.map((s) => (
                  <StatCard
                    key={s.key}
                    isRating={s.key === "rating"}
                    label={t(`profile.stats.${s.key}`, { defaultValue: s.label })}
                    value={s.value}
                  />
                ))}
              </View>


              <View style={{
                backgroundColor: "rgba(255, 255, 255, 0.25)", borderRadius: 14, marginBottom: 24, paddingBottom: 26, paddingHorizontal: 20,
                boxShadow: "0px 3.63px 14.5px 0px rgba(251, 207, 232, 0.2), 0px 7.25px 29px 0px rgba(147, 197, 253, 0.3)"
              }}>
                <View style={{ width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, }}>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: "rgba(60, 60, 60, 1)" }}>Top Skills</Text>
                  <Pressable onPress={() => seteditSkillVisible(true)}>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: "rgba(149, 29, 202, 1)" }}>
                      Edit
                    </Text>
                  </Pressable>

                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  {(myCandidate?.requiredSkills || []).map((tag, i) => (
                    <View
                      key={i}
                      style={{
                        borderRadius: 6,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'rgba(60, 60, 60, 1)',
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ width: "100%" }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 36, marginBottom: 24 }}>
                  <Text style={{ fontSize: 16, fontWeight: 600, color: "rgba(60, 60, 60, 1)", textAlign: "center" }}>
                    Top 3 Certificates
                  </Text>
                  <Pressable onPress={() => navigation.navigate("viewAllCertificates", { uid: userProfile?.uid, userId: userProfile?.uid })}><Text style={{ fontSize: 14, fontWeight: 600, color: "rgba(120, 20, 196, 1)" }}>View All</Text></Pressable>
                </View>

                {certificateLoading ? (
                  <Text style={{ width: "100%", fontSize: 16, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>Loading certificates...</Text>
                ) : certificatesList.length > 0 ? (
                  <CertificateCarousel certificates={certificatesList.slice(0, 3)} LEVELS={LEVELS} />
                ) : (
                  <View style={{ borderRadius: 10, justifyContent: "center", alignItems: "center", width: "90%", marginHorizontal: "auto", height: 200, backgroundColor: "rgba(217, 217, 217, 0.4)", borderWidth: 1, borderColor: "rgba(217, 217, 217, 1)" }}>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: "rgba(0, 0, 0, 0.5)" }}>No certificates issued.</Text>
                    <Pressable onPress={() => navigation.navigate('index', { startInterview: true })}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: 'rgba(121, 18, 195, 1)',
                          textDecorationLine: 'underline',
                          textDecorationColor: 'rgba(121, 18, 195, 1)',
                        }}
                      >
                        Start Interview
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>

              <View style={{ width: '100%', backgroundColor: "rgba(255, 255, 255, 0.4)", padding: 16, borderRadius: 18, marginTop: 24, gap: 12 }}>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '700' }}>{t('profile.subscription.title')}</Text>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>{t('profile.subscription.subtitle')}</Text>
                </View>

                <View style={{ backgroundColor: '#EEF2FF', borderRadius: 12, padding: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontWeight: '600', color: '#3730A3' }}>
                        {userProfile?.plan?.name || t('profile.subscription.freePlan')}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: '#E0E7FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                      <Text style={{ fontSize: 12, color: '#3730A3' }}>{t('profile.subscription.active')}</Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 8 }}>
                    <Text style={{ fontWeight: '700' }}>{activeUsedMinutes}</Text>
                    <Text> {t('profile.subscription.of')} </Text>
                    <Text style={{ fontWeight: '700' }}>{totalMinutes}</Text>
                    <Text> {t('profile.subscription.minutesUsed')}</Text>
                  </Text>

                  <View style={{ marginTop: 8, height: 8, width: '100%', borderRadius: 99, backgroundColor: '#EEF2FF', overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        backgroundColor: '#3730A3',
                        width: `${Math.max(5, (activeUsedMinutes / totalMinutes) * 100)}%`
                      }}
                    />
                  </View>

                  <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
                    {activeUsedMinutes > totalMinutes ? 0 : totalMinutes - activeUsedMinutes} {t('profile.subscription.minutesLeft')}
                  </Text>
                </View>

                {userProfile?.plan?.id == 1 ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('pricing')}
                    activeOpacity={0.8}
                    style={{ backgroundColor: '#2563EB', padding: 12, alignItems: 'center', borderRadius: 12 }}
                  >
                    <Text style={{ color: 'white', fontWeight: '700' }}>{t('profile.subscription.upgrade')}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ padding: 12, alignItems: 'center', borderRadius: 12, backgroundColor: '#E5E7EB', opacity: 0.8 }}>
                    <Text style={{ fontWeight: '700', color: '#6B7280' }}>{t('profile.subscription.proActive')}</Text>
                  </View>
                )}
              </View>

              {/* Links Section */}
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
                  {t('profile.legal.prefix')}
                  <Text style={{ color: '#2563EB' }} onPress={() => Linking.openURL(TERMS_OF_USE_URL)}> {t('profile.legal.terms')} </Text>
                  <Text> {t('profile.legal.and')} </Text>
                  <Text style={{ color: '#2563EB' }} onPress={() => Linking.openURL(PRIVACY_POILCY_URL)}> {t('profile.legal.privacy')} </Text>
                  .
                </Text>
              </View>

              {/* Danger Zone */}
              <View style={{ marginTop: 24, backgroundColor: "rgba(255, 255, 255, 0.4)", padding: 16, borderRadius: 18, width: "100%" }}>
                <Text style={{ fontSize: 18, fontWeight: '700' }}>{t('profile.danger.title')}</Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>{t('profile.danger.subtitle')}</Text>

                <TouchableOpacity
                  style={{ backgroundColor: 'black', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 12 }}
                  onPress={logout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '700' }}>{t('profile.danger.logout')}</Text>}
                </TouchableOpacity>

                <Text style={{ fontWeight: '600', marginBottom: 6 }}>{t('profile.danger.deleteTitle')}</Text>
                <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>{t('profile.danger.deleteDesc')}</Text>

                <TouchableOpacity
                  style={{ backgroundColor: '#DC2626', borderRadius: 12, padding: 12, alignItems: 'center' }}
                  onPress={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '700' }}>{t('profile.danger.deleteButton')}</Text>}
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
          uid={userProfile?.uid}
          canId={profileData?.canId}
          onSuccess={onRefresh}
          initialPosition={profileData?.role}
          initialIndustry={profileData?.industry}
          initialLevel={profileData?.level}
          language={language}
        />
      </ScrollView>
    </>
  );
}
