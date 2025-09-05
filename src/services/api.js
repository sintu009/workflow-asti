import axios from 'axios';
import { getAuthFromStorage } from '../utils/auth';

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
    } else {
      console.error('Network Error:', error);
    }
    return Promise.reject(error);
  }
);

export const api = {
  // ===== CONDITION APIs =====
  getAllConditions: async () => {
    try {
      const auth = getAuthFromStorage();
      
      if (!auth.accessToken) {
        console.error('Missing authentication data for conditions');
        return [];
      }

      const response = await apiClient.get(
        'http://10.10.10.27:8081/imprint/workflows/conditions',
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      
      console.log('Conditions API response:', response.data);
      return response.data.conditions || [];
    } catch (error) {
      console.error('Error fetching conditions:', error);
      return [];
    }
  },

  // ===== NODE DETAILS APIs =====
  getNodeDetails: async () => {
    try {
      const auth = getAuthFromStorage();
      
      if (!auth.accessToken) {
        console.error('Missing authentication data for node details');
        return { tasks: [], gateways: [], events: [] };
      }

      const response = await apiClient.get(
        'http://10.10.10.27:8081/imprint/workflows/nodes',
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      
      return {
        tasks: response.data.tasks || [],
        gateways: response.data.gateways || [],
        events: response.data.events || []
      };
    } catch (error) {
      console.error('Error fetching node details:', error);
      return { tasks: [], gateways: [], events: [] };
    }
  },

  // ===== WORKFLOW APIs =====
  getAllWorkflows: async () => {
    try {
      const auth = getAuthFromStorage();

      if (!auth.accessToken || !auth.companyId) {
        console.error('Missing authentication data for workflows');
        return [];
      }

      const response = await apiClient.get(
        `http://10.10.10.27:8081/imprint/workflows/getAllWorkflows?companyId=${auth.companyId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.accessToken}`
          },
        }
      );
      
      console.log('Workflows API response:', response.data);
      return response.data.workflowsList || [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  },

  getWorkflowJson: async (workflowId) => {
    try {
      const auth = getAuthFromStorage();
      
      if (!auth.accessToken || !workflowId) {
        console.error('Missing authentication data or workflow ID');
        return null;
      }

      const response = await apiClient.get(
        `http://10.10.10.27:8081/imprint/workflows/getWorkflowById/${workflowId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      
      console.log('Workflow JSON response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workflow JSON for ID ${workflowId}:`, error);
      return null;
    }
  },

  createWorkflow: async (workflowData) => {
    try {
      const auth = getAuthFromStorage();
      
      if (!auth.accessToken || !auth.companyId || !auth.userId) {
        throw new Error('Missing authentication data. Please login again.');
      }

      console.log('Creating workflow with data:', JSON.stringify(workflowData, null, 2));
      
      const response = await apiClient.post(
        `http://10.10.10.27:8081/imprint/workflows/createWorkflow?companyId=${auth.companyId}&userId=${auth.userId}`,
        workflowData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.accessToken}`,
          },
        }
      );
      
      console.log('Create workflow response:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Workflow created successfully!'
      };
    } catch (error) {
      console.error('Error creating workflow:', error);
      
      let errorMessage = 'Error creating workflow';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied. Check your permissions.';
        } else {
          errorMessage += `: ${error.response?.status} ${error.response?.statusText}`;
          if (error.response?.data) {
            const responseData = typeof error.response.data === 'string' 
              ? error.response.data 
              : JSON.stringify(error.response.data);
            errorMessage += ` - ${responseData}`;
          }
        }
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    }
  },

  updateWorkflow: async (workflowId, workflowData) => {
    try {
      const auth = getAuthFromStorage();
      
      if (!auth.accessToken || !auth.companyId || !auth.userId) {
        throw new Error('Missing authentication data. Please login again.');
      }

      const response = await apiClient.post(
        `http://10.10.10.27:8081/imprint/workflows/updateWorkflow/${workflowId}?companyId=${auth.companyId}&userId=${auth.userId}`,
        workflowData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.accessToken}`,
          },
        }
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Workflow updated successfully!'
      };
    } catch (error) {
      console.error('Error updating workflow:', error);
      
      let errorMessage = 'Error updating workflow';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied. Check your permissions.';
        } else {
          errorMessage += `: ${error.response?.status} ${error.response?.statusText}`;
          if (error.response?.data) {
            const responseData = typeof error.response.data === 'string' 
              ? error.response.data 
              : JSON.stringify(error.response.data);
            errorMessage += ` - ${responseData}`;
          }
        }
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    }
  },

  deleteWorkflow: async (workflowId) => {
    try {
      const auth = getAuthFromStorage();
      
      if (!auth.accessToken || !auth.companyId || !auth.userId) {
        throw new Error('Missing authentication data. Please login again.');
      }

      const response = await apiClient.delete(
        `http://10.10.10.27:8081/imprint/workflows/deleteWorkflow/${workflowId}?companyId=${auth.companyId}&userId=${auth.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
          },
        }
      );
      
      return {
        success: true,
        data: response.data,
        message: 'Workflow deleted successfully!'
      };
    } catch (error) {
      console.error('Error deleting workflow:', error);
      
      let errorMessage = 'Error deleting workflow';
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied. Check your permissions.';
        } else {
          errorMessage += `: ${error.response?.status} ${error.response?.statusText}`;
          if (error.response?.data) {
            const responseData = typeof error.response.data === 'string' 
              ? error.response.data 
              : JSON.stringify(error.response.data);
            errorMessage += ` - ${responseData}`;
          }
        }
      } else {
        errorMessage += `: ${error.message}`;
      }
      
      return {
        success: false,
        error: errorMessage,
        message: errorMessage
      };
    }
  },

  // ===== AUTHENTICATION APIs =====
  login: async (credentials) => {
    try {
      // Simulate API call - replace with actual authentication endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }

      // For demo purposes, accept any non-empty credentials
      // In a real app, you'd validate against your backend
      if (credentials.username && credentials.password) {
        return {
          success: true,
          data: {
            username: credentials.username,
            isAuthenticated: true,
            token: 'demo-token-' + Date.now()
          },
          message: 'Login successful!'
        };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Login failed. Please try again.'
      };
    }
  },

  logout: async () => {
    try {
      // Simulate API call for logout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        message: 'Logout successful!'
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message,
        message: 'Logout failed'
      };
    }
  },

  // ===== HEALTH CHECK =====
  healthCheck: async () => {
    try {
      const auth = getAuthFromStorage();
      
      if (!auth.accessToken) {
        throw new Error('No authentication token available');
      }

      const response = await apiClient.get(
        'http://10.10.10.27:8081/imprint/health',
        {
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
          },
        }
      );
      
      return {
        success: true,
        data: response.data,
        message: 'API is healthy'
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        error: error.message,
        message: 'API health check failed'
      };
    }
  }
};

export default api;