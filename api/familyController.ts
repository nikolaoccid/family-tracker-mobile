import { handleApiError } from './utils';
import { useAuthStore } from '@/store/authStore';
import { Family, FamilyMember } from '@/types';

const API_URL = 'https://api.familytracker.example.com'; // Replace with your actual API URL

// Helper function to get headers with auth token
const getHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const familyController = {
  // Get family details
  getFamily: async (familyId: string) => {
    try {
      const response = await fetch(`${API_URL}/family/${familyId}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get family error:', error);
      throw error;
    }
  },
  
  // Create a new family
  createFamily: async (familyData: { name: string }) => {
    try {
      const response = await fetch(`${API_URL}/family`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(familyData),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create family error:', error);
      throw error;
    }
  },
  
  // Update family details
  updateFamily: async (familyId: string, familyData: Partial<Family>) => {
    try {
      const response = await fetch(`${API_URL}/family/${familyId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(familyData),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update family error:', error);
      throw error;
    }
  },
  
  // Add member to family
  addFamilyMember: async (familyId: string, email: string) => {
    try {
      const response = await fetch(`${API_URL}/family/${familyId}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Add family member error:', error);
      throw error;
    }
  },
  
  // Remove member from family
  removeFamilyMember: async (familyId: string, memberId: string) => {
    try {
      const response = await fetch(`${API_URL}/family/${familyId}/members/${memberId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Remove family member error:', error);
      throw error;
    }
  },
  
  // Update member role
  updateMemberRole: async (familyId: string, memberId: string, role: 'admin' | 'member') => {
    try {
      const response = await fetch(`${API_URL}/family/${familyId}/members/${memberId}/role`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update member role error:', error);
      throw error;
    }
  },
  
  // Toggle location sharing
  toggleLocationSharing: async (familyId: string, isSharing: boolean) => {
    try {
      const response = await fetch(`${API_URL}/family/${familyId}/location-sharing`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isSharing }),
      });
      
      if (!response.ok) {
        throw await handleApiError(response);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Toggle location sharing error:', error);
      throw error;
    }
  },
};