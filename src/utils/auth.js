// Authentication utility functions
export const getAuthFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const authData = {
    accessToken: urlParams.get('access_token'),
    userId: urlParams.get('useId'), // Note: URL param is 'useId' but we store as 'userId'
    companyId: urlParams.get('companyId')
  };
  
  console.log('Extracted auth from URL:', authData);
  return authData;
};

export const saveAuthToStorage = (authData) => {
  console.log('Saving auth to storage:', authData);
  if (authData.accessToken) {
    localStorage.setItem('access_token', authData.accessToken);
  }
  if (authData.userId) {
    localStorage.setItem('user_id', authData.userId);
  }
  if (authData.companyId) {
    localStorage.setItem('company_id', authData.companyId);
  }
};

export const getAuthFromStorage = () => {
  const authData = {
    accessToken: localStorage.getItem('access_token'),
    userId: localStorage.getItem('user_id'),
    companyId: localStorage.getItem('company_id')
  };
  
  console.log('Retrieved auth from storage:', authData);
  return authData;
};

export const clearAuthFromStorage = () => {
  console.log('Clearing auth from storage');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('company_id');
};

export const isAuthenticated = () => {
  const auth = getAuthFromStorage();
  const isAuth = !!(auth.accessToken && auth.userId && auth.companyId);
  console.log('Is authenticated:', isAuth, auth);
  return isAuth;
};