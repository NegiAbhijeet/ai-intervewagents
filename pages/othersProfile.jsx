import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import CustomHeader from '../components/customHeader';
import Layout from './Layout';
import getLevelData from '../libs/getLevelData';
import { AppStateContext } from '../components/AppContext';
import { API_URL } from '../components/config';
import fetchWithAuth from '../libs/fetchWithAuth';
import Toast from 'react-native-toast-message';
import { RefreshControl } from 'react-native-gesture-handler';
import CertificateCarousel from '../components/CertificateCarousel';
function getInitials(name = '') {
  const words = name.trim().split(' ');
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
// get avatar, name, role, level, trophies, totalInterviews, bestScore, minutes
export default function OthersProfile({ route }) {
  const { language } = useContext(AppStateContext)
  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [connection, setConnection] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificatesList, setCertificatesList] = useState([])
  useEffect(() => {
    if (route?.params?.name) {
      setRouteData(route.params)
    }
  }, [route.params.name])
  async function fetchCertificates() {
    try {
      setCertificateLoading(true)
      const response = await fetchWithAuth(`${API_URL}/get-certificate/?uid=${routeData.myUid}&userId=${routeData.userUid}`);
      const result = await response.json();
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
  async function fetchConnectionDetails() {
    setConnectionLoading(true);
    try {
      const res = await fetchWithAuth(
        `${API_URL}/connection-details/?uid=${routeData.myUid}&profile_uid=${routeData.userUid}`,
        { method: 'GET' }
      );

      if (!res.ok) return;

      const data = await res.json();
      console.log('Connection details', data);
      setConnection(data);
    } catch (e) {
      console.log('Connection details error', e);
    } finally {
      setConnectionLoading(false);
    }
  }
  function fetchUserDetails() {
    fetchConnectionDetails();
    fetchCertificates();
  }
  useEffect(() => {
    if (!routeData?.myUid || !routeData?.userUid) return;

    fetchUserDetails()
  }, [routeData?.myUid, routeData?.userUid]);

  const LEVELS = useMemo(() => getLevelData(language) || {}, [language])
  const findLevel = (level) => {
    const x = LEVELS.find(
      (item) => String(item?.value) === String(level)
    )
    return x?.label || "Entry"
  }
  async function sendRequest() {
    try {
      if (!routeData?.myUid || !routeData?.userUid) {
        Toast.show({
          type: 'error',
          text1: 'Something went wrong',
          text2: 'Please try again later',
        });
        return;
      }
      setLoading(true);
      const body = {
        uid: routeData.myUid,
        receiver_id: routeData.userUid,
      };

      const response = await fetchWithAuth(
        `${API_URL}/connections/send/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorText = errorData?.error;
        throw new Error(errorText || 'Request failed');
      }

      setConnection((prev) => ({ ...prev, status: 'pending', option: 'request' }));
      Toast.show({
        type: 'success',
        text1: 'Request sent',
        text2: 'Connection request sent successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Unable to send request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }



  async function respondToRequest(status) {
    if (!routeData?.myUid || !connection?.request_id || !status) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong',
      })
      return
    }

    try {
      setLoading(true)

      await fetch(`${API_URL}/connections/respond/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: routeData?.myUid,
          request_id: connection?.request_id,
          status,
        }),
      })
      if (status === 'accepted') {
        setConnection((prev) => ({ ...prev, status: 'accepted' }));
      } else {
        setConnection(null);
      }
    } catch (error) {
      console.log('Request response failed', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Layout removePadding={true} >
        <CustomHeader title="Profile" />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40, }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={connectionLoading} onRefresh={fetchUserDetails} />
          }
        >
          <View style={{ paddingHorizontal: "7.5%" }}>
            <View
              style={{
                marginTop: 12,
                borderRadius: 24,
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              {/* Avatar */}
              <View style={{ position: 'relative', }}>
                <View style={{ position: 'relative', height: 140 }}>
                  <ImageBackground
                    source={require('../assets/images/Margin-1.png')}
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 56,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: "9999",
                      transform: [{ translateY: -25 }]
                    }}
                  >
                    {routeData?.avatar ? (
                      <Image
                        source={{ uri: routeData?.avatar }}
                        style={{ width: 100, height: 100, borderRadius: 52, zIndex: -1, marginTop: 4, marginRight: 4 }}
                      />
                    ) : (
                      <View className="rounded-full overflow-hidden bg-gray-300 items-center justify-center" style={{ width: 100, height: 100, zIndex: -1, marginTop: 4, marginRight: 4 }}>
                        <Text className="font-bold" style={{ fontSize: 28 }}>
                          {getInitials(routeData?.name)}
                        </Text>
                      </View>
                    )}
                  </ImageBackground>
                </View>

              </View>

              <Text
                style={{
                  marginTop: 12,
                  fontSize: 25,
                  fontWeight: '700',
                  color: 'rgba(60, 60, 60, 1)',
                }}
              >
                {routeData?.name}
              </Text>

              {/* Role */}
              <Text
                style={{
                  fontWeight: 400,
                  marginTop: 2,
                  fontSize: 16,
                  color: 'rgba(75, 85, 99, 1)',
                }}
              >
                {routeData?.role}
              </Text>

              {/* Badges */}
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    borderColor: "rgba(60, 60, 60, 1)",
                    borderWidth: 1,
                    borderRadius: 9999
                  }}
                >
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#92400E',
                    }}
                  >
                    {findLevel(routeData?.level)}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderColor: "rgba(60, 60, 60, 1)",
                    borderWidth: 1,
                    borderRadius: 9999
                  }}
                >
                  <Ionicons name="trophy" size={14} color="#6B7280" />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#374151',
                    }}
                  >
                    {routeData?.trophies} pts
                  </Text>
                </View>
              </View>

              {/* Add Friend */}
              {connection?.status === 'accepted' ? (
                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    backgroundColor: '#16A34A',
                    paddingHorizontal: 30,
                    paddingVertical: 12,
                    borderRadius: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    opacity: 0.8,
                  }}
                  disabled
                >
                  <Ionicons name="people" size={18} color="#fff" />
                  <Text
                    style={{
                      marginLeft: 8,
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    Friends
                  </Text>
                </TouchableOpacity>
              ) : connection?.status === 'pending' && connection?.option === 'respond' ? (
                <View style={{ flexDirection: 'row', marginTop: 20 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#000',
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 24,
                      marginRight: 10,
                    }}
                    onPress={() => respondToRequest('accepted')}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: 'red',
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 24,
                    }}
                    onPress={() => respondToRequest('declined')}
                  >
                    <Text style={{ color: 'white', fontWeight: '600' }}>Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : connection?.status === 'pending' && connection?.option === 'request' ? (
                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    backgroundColor: '#9CA3AF',
                    paddingHorizontal: 30,
                    paddingVertical: 12,
                    borderRadius: 24,
                  }}
                  disabled
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>
                    Pending
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    backgroundColor: loading ? 'rgba(0,0,0,0.8)' : '#000',
                    paddingHorizontal: 30,
                    paddingVertical: 12,
                    borderRadius: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  disabled={loading || connectionLoading}
                  onPress={sendRequest}
                >
                  <Ionicons name="person-add" size={18} color="#fff" />
                  <Text
                    style={{
                      marginLeft: 8,
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: 14,
                    }}
                  >
                    {
                      (connectionLoading || loading) ? <ActivityIndicator size="small" color="#000" /> : "Add Friend"
                    }
                  </Text>
                </TouchableOpacity>
              )}

            </View>

            {/* Stats */}
            <View
              style={{
                flexDirection: 'row',
                marginTop: 24,
                justifyContent: 'space-between',
                gap: 10
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: 16,
                  paddingVertical: 18,
                  paddingHorizontal: 10,
                  alignItems: 'center',
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 1)"
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#4F46E5"
                />
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 20,
                    fontWeight: '700',
                    color: '#111827',
                    textAlign: "center"
                  }}
                >
                  {routeData?.totalInterviews}
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280', textAlign: "center" }}>
                  Total Interviews Attempted
                </Text>
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: 16,
                  paddingVertical: 18,
                  alignItems: 'center',
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 1)"
                }}
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={22}
                  color="#0891B2"
                />
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 20,
                    fontWeight: '700',
                    color: '#111827',
                  }}
                >
                  {routeData?.bestScore}%
                </Text>
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  Best Score
                </Text>
                <Text style={{ fontSize: 11, color: '#F97316', marginTop: 2 }}>
                  {routeData?.streak} days streak
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 36, marginBottom: 24 }}>
              <Text style={{ width: "100%", fontSize: 18, fontWeight: 700, color: "rgba(60, 60, 60, 1)", textAlign: "center" }}>
                Top Certificates
              </Text>
            </View>
            {certificateLoading ? (
              <Text style={{ width: "100%", fontSize: 16, fontWeight: 600, marginBottom: 16, textAlign: "center" }}>Loading certificates...</Text>
            ) : certificatesList.length > 0 ? (
              <CertificateCarousel certificates={certificatesList.slice(0, 3)} LEVELS={LEVELS} showShareButton={false} />
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
        </ScrollView>
      </Layout>
    </>
  );
}
