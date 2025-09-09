import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Layout from './Layout';
import fetchWithAuth from '../libs/fetchWithAuth';
import { JAVA_API_URL } from '../components/config';
import { AppStateContext } from '../components/AppContext';

const reportData = [
  {
    id: 1,
    name: 'John Smith',
    role: 'Frontend Developer',
    date: 'Dec 15, 2023 - 2:30 PM',
    status: 'Completed',
    percentage: '85%',
    color: 'bg-green-100 text-green-700',
    pdfAvailable: true,
  },
  {
    id: 2,
    name: 'Anna Martinez',
    role: 'UX Designer',
    date: 'Dec 14, 2023 - 11:45 AM',
    status: 'Pending',
    percentage: '',
    color: 'bg-yellow-100 text-yellow-700',
    pdfAvailable: false,
  },
  {
    id: 3,
    name: 'Michael Johnson',
    role: 'Backend Developer',
    date: 'Dec 13, 2023 - 4:15 PM',
    status: 'Completed',
    percentage: '92%',
    color: 'bg-green-100 text-green-700',
    pdfAvailable: true,
  },
  {
    id: 4,
    name: 'Emily Wilson',
    role: 'Product Manager',
    date: 'Dec 12, 2023 - 9:20 AM',
    status: 'Incomplete',
    percentage: '',
    color: 'bg-red-100 text-red-700',
    pdfAvailable: false,
  },
  {
    id: 5,
    name: 'David Thompson',
    role: 'Data Scientist',
    date: 'Dec 11, 2023 - 3:45 PM',
    status: 'Completed',
    percentage: '78%',
    color: 'bg-green-100 text-green-700',
    pdfAvailable: true,
  },
];

const Reports = () => {
  const { userProfile } = useContext(AppStateContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${JAVA_API_URL}/api/meetings/uid/${userProfile.uid}`,
      );
      const data = await response.json();
      if (data?.data) {
        const finalMeetings = data.data.filter(
          item => item.status === 'Completed',
        );
        const sortedMeetings = finalMeetings.sort((a, b) => {
          const dateTimeA = new Date(`${a.interviewDate}T${a.interviewTime}`);
          const dateTimeB = new Date(`${b.interviewDate}T${b.interviewTime}`);
          return dateTimeB - dateTimeA;
        });
        setMeetings(sortedMeetings);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.uid) {
      fetchMeetings();
    }
  }, [userProfile]);
  return (
    <Layout>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold mb-1">Interview Reports</Text>
        <Text className="text-base text-gray-600 mb-4">
          You can view your reports here.
        </Text>
        {reportData.map(report => (
          <View
            key={report.id}
            className="bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200"
          >
            {/* Avatar and Info */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-300 justify-center items-center mr-3">
                  <Text className="text-white font-bold">
                    {report.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="font-semibold">{report.name}</Text>
                  <Text className="text-gray-500 text-sm">{report.role}</Text>
                </View>
              </View>
              {report.percentage ? (
                <View
                  className={`px-2 py-1 rounded-md ${report.color} text-xs`}
                >
                  <Text className="text-xs font-medium">
                    {report.percentage}
                  </Text>
                </View>
              ) : (
                <View className={`px-2 py-1 rounded-md ${report.color}`}>
                  <Text className="text-xs font-medium">{report.status}</Text>
                </View>
              )}
            </View>

            {/* Date */}
            <Text className="text-gray-400 text-xs mt-2">{report.date}</Text>

            {/* Action Buttons */}
            <View className="flex-row mt-3 gap-2">
              <TouchableOpacity
                className={`flex-1 px-4 py-2 rounded-md border ${
                  report.pdfAvailable
                    ? 'bg-green-500 border-green-500'
                    : 'bg-gray-200 border-gray-300'
                }`}
                disabled={!report.pdfAvailable}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    report.pdfAvailable ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  PDF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 px-4 py-2 rounded-md border border-blue-500">
                <Text className="text-center text-sm font-semibold text-blue-500">
                  Report
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </Layout>
  );
};

export default Reports;
