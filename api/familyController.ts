import { handleApiError } from './utils';
import { Family, FamilyMember } from '@/types';
import { getAuthHeaders } from './authUtils';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export const familyController = {
  // Get family details
  getFamily: async (familyId: string) => {
    try {
      const response = await fetch(`${API_URL}/family/${familyId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
  async deleteFamily(familyData: { id: string | undefined }) {
    if (!familyData.id) {
      throw new Error('Family ID is required for deletion');
    }
    try {
      const response = await fetch(`${API_URL}/family/${familyData.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify(familyData),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Delete family error:', error);
      throw error;
    }
  },
  async verifyInvite(inviteToken: string) {
    try {
      const response = await fetch(`${API_URL}/family/verify/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inviteToken }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Verify invite token error:', error);
      throw error;
    }
  },
  async acceptInvite(inviteToken: string) {
    try {
      const response = await fetch(`${API_URL}/family/accept/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inviteToken }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Accept invite error:', error);
      throw error;
    }

  },
  async rejectInvite(inviteToken: string) {
    try {
      const response = await fetch(`${API_URL}/family/reject/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inviteToken }),
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.error('Accept invite error:', error);
      throw error;
    }


  }
};
