import { API_URL } from '../components/config';
import fetchWithAuth from './fetchWithAuth';

export default async function fetchUserDetails(uid) {
  try {
    console.log(`${API_URL}/profiles/${uid}/`)
    const profileUrl = `${API_URL}/profiles/${uid}/`;

    const response = await fetchWithAuth(profileUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const profileData = await response.json();
    return profileData;
  } catch (err) {
    console.error('Error fetching user details:', err);
    return null;
  }
}
