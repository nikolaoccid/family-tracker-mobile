import {getAuthHeaders} from "@/api/authUtils";
import {handleApiError} from "@/api/utils";

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export const chatController = {
  getToken: async () => {
    try {
      const response = await fetch(`${API_URL}/chat/token`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      console.log('Get token response:', response);

      if (!response.ok) {
        throw await handleApiError(response);
      }

      return await response.json();
    } catch (error) {
      console.warn('Get alerts error:', error);
      throw error;
    }
  }
}
