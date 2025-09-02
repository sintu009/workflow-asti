// Authentication utility functions
export const getAuthFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const authData = {
    accessToken: urlParams.get('access_token'),
    useId: urlParams.get('useId'),
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
  if (authData.useId) {
    localStorage.setItem('use_id', authData.useId);
  }
  if (authData.companyId) {
    localStorage.setItem('company_id', authData.companyId);
  }
};

export const getAuthFromStorage = () => {
  const authData = {
    accessToken: localStorage.getItem('access_token'),
    useId: localStorage.getItem('use_id'),
    companyId: localStorage.getItem('company_id')
  };
  
  console.log('Retrieved auth from storage:', authData);
  return authData;
};

export const clearAuthFromStorage = () => {
  console.log('Clearing auth from storage');
  localStorage.removeItem('access_token');
  localStorage.removeItem('use_id');
  localStorage.removeItem('company_id');
};

export const isAuthenticated = () => {
  const auth = getAuthFromStorage();
  const isAuth = !!(auth.accessToken && auth.useId && auth.companyId);
  console.log('Is authenticated:', isAuth, auth);
  return isAuth;
};