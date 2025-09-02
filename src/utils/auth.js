// Authentication utility functions
export const getAuthFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    accessToken: urlParams.get('access_token'),
    userId: urlParams.get('useId'),
    companyId: urlParams.get('companyId')
  };
};

export const saveAuthToStorage = (authData) => {
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
  return {
    accessToken: localStorage.getItem('access_token'),
    userId: localStorage.getItem('user_id'),
    companyId: localStorage.getItem('company_id')
  };
};

export const clearAuthFromStorage = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('company_id');
};

export const isAuthenticated = () => {
  const auth = getAuthFromStorage();
  return !!(auth.accessToken && auth.userId && auth.companyId);
};