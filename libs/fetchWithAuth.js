import { auth } from './firebase';

async function getAuthToken() {
  const user = auth()?.currentUser;
  if (user) {
    return { token: await user.getIdToken(), uid: user.uid };
  }
  return { token: null, uid: null };
}

async function fetchWithAuth(url, options = {}) {
  const { token, uid } = await getAuthToken();
  const method = options.method ? options.method.toUpperCase() : 'GET';

  let finalUrl = url;
  if (method === 'GET' && uid) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}uid=${uid}`;
  }

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchOptions = {
    ...options,
    method,
    headers,
  };

  return fetch(finalUrl, fetchOptions);
}

export default fetchWithAuth;
