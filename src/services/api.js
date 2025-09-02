import axios from 'axios';
import { getAuthFromStorage } from '../utils/auth';

const BASE_URL = '/api';
const WORKFLOW_BASE_URL = '/workflow-api';

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
  getAllConditions: async (token) => {
    try {
      const auth = getAuthFromStorage();
      const response = await apiClient.get(
        'http://10.10.10.27:8081/imprint/workflows/conditions',
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      return response.data.conditions || [];
    } catch (error) {
      console.error('Error fetching conditions:', error);
      return [];
    }
  },

  // ===== NODE DETAILS APIs =====
  getNodeDetails: async (token) => {
    try {
      const auth = getAuthFromStorage();
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

      const response = await apiClient.get(
        `http://10.10.10.27:8081/imprint/workflows/getAllWorkflows?companyId=${auth.companyId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.accessToken}`
          },
        }
      );
       return response.data.workflowsList || [];
    } catch (error) {
      console.error('Error fetching workflows:', error);
      return [];
    }
  },

  getWorkflowJson: async (workflowId, token) => {
    try {
      const auth = getAuthFromStorage();
      const response = await apiClient.get(
        `http://10.10.10.27:8081/imprint/workflows/getWorkflowById/${workflowId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching workflow JSON for ID ${workflowId}:`, error);
      return null;
    }
  },

  createWorkflow: async (workflowData) => {
    try {
      const auth = getAuthFromStorage();
      console.log('Sending workflowData:', JSON.stringify(workflowData, null, 2));
      
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
      
      // Handle both JSON and text responses
      let result;
      const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      
      try {
        result = typeof response.data === 'object' ? response.data : JSON.parse(responseText);
        console.log('API response:', result);
      } catch (jsonErr) {
        console.log('Non-JSON API response:', responseText);
        result = { message: responseText };
      }
      
      return {
        success: true,
        data: result,
        message: 'Workflow created successfully!'
      };
    } catch (error) {
      console.error('Error creating workflow:', error);
      
      let errorMessage = 'Error creating workflow';
      if (axios.isAxiosError(error)) {
        errorMessage += `: ${error.response?.status} ${error.response?.statusText}`;
        if (error.response?.data) {
          errorMessage += ` - ${typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)}`;
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

  saveWorkflow: async (workflowData) => {
    try {
      const response = await apiClient.post(`${WORKFLOW_BASE_URL}/save`, workflowData);
      return {
        success: true,
        data: response.data,
        message: 'Workflow saved successfully!'
      };
    } catch (error) {
      console.error('Error saving workflow:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to save workflow'
      };
    }
  },

  updateWorkflow: async (workflowId, workflowData) => {
    try {
      const auth = getAuthFromStorage();
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
        errorMessage += `: ${error.response?.status} ${error.response?.statusText}`;
        if (error.response?.data) {
          errorMessage += ` - ${typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)}`;
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
        errorMessage += `: ${error.response?.status} ${error.response?.statusText}`;
        if (error.response?.data) {
          errorMessage += ` - ${typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data)}`;
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

  // ===== UTILITY APIs =====
  validateWorkflow: async (workflowData) => {
    try {
      const response = await apiClient.post(`${WORKFLOW_BASE_URL}/validate`, workflowData);
      return {
        success: true,
        data: response.data,
        message: 'Workflow validation completed'
      };
    } catch (error) {
      console.error('Error validating workflow:', error);
      return {
        success: false,
        error: error.message,
        message: 'Workflow validation failed'
      };
    }
  },

  exportWorkflow: async (workflowId, format = 'json') => {
    try {
      const response = await apiClient.get(`${WORKFLOW_BASE_URL}/export/${workflowId}?format=${format}`);
      return {
        success: true,
        data: response.data,
        message: 'Workflow exported successfully'
      };
    } catch (error) {
      console.error('Error exporting workflow:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to export workflow'
      };
    }
  },

  importWorkflow: async (workflowFile) => {
    try {
      const formData = new FormData();
      formData.append('workflow', workflowFile);
      
      const response = await apiClient.post(`${WORKFLOW_BASE_URL}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Workflow imported successfully'
      };
    } catch (error) {
      console.error('Error importing workflow:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to import workflow'
      };
    }
  },

  // ===== HEALTH CHECK =====
  healthCheck: async () => {
    try {
      const response = await apiClient.get(`${BASE_URL}/health`);
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