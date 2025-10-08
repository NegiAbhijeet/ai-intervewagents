import { useContext, useState } from 'react';
import { Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { AppStateContext } from './AppContext';
import fetchWithAuth from '../libs/fetchWithAuth';
import { JAVA_API_URL, API_URL } from '../components/config';
import { SafeAreaView } from 'react-native-safe-area-context';

const GetStartedScreen = () => {
  const { userProfile, setUserProfile } = useContext(AppStateContext);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    try {
      setIsLoading(true);

      const res = await fetchWithAuth(
        `${API_URL}/profiles/${userProfile?.uid}/update-role/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'candidate' }),
        },
      );

      if (res.status === 200) {
        const body = {
          uid: userProfile.uid,
          firstName: userProfile?.first_name,
          lastName: userProfile?.last_name,
          email: userProfile?.email,
        };

        const candidateRes = await fetchWithAuth(
          `${JAVA_API_URL}/api/candidates/save`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          },
        );

        if (candidateRes.status === 200) {
          setUserProfile({ ...userProfile, role: 'candidate' });
        } else {
          console.error(
            'Failed to save candidate. Status:',
            candidateRes.status,
          );
        }
      }
    } catch (error) {
      console.error('Error during handleContinue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')} // Replace with your logo
        style={styles.logo}
        resizeMode="contain"
      />
<Text style={styles.logoTitle}>AI Interview Agents</Text>
      <Text style={styles.title}>Welcome to Our App</Text>
      <Text style={styles.subtitle}>
        Choose your role and let's get started!
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Please Wait...' : 'Get Started'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GetStartedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 180,
    height: 180,
    // marginBottom: 30,
  },
  logoTitle:{
    fontSize:20,
    color:"#5C6EF8",
marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5C6EF8',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
