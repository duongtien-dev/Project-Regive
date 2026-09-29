import { apiClient } from './apiClient';
import { ApiResponse, VolunteerRegistration } from '@/types';

export type RegisterVolunteerPayload = {
  campaignId: string;
  skills?: string;
  availabilityNote?: string;
};

export const volunteerService = {
  async register(payload: RegisterVolunteerPayload): Promise<VolunteerRegistration> {
    const res = await apiClient.post<ApiResponse<{ registration: VolunteerRegistration }>>(
      '/volunteers/register',
      payload
    );
    return res.data.data.registration;
  },

  async getMyRegistrations(): Promise<VolunteerRegistration[]> {
    const res = await apiClient.get<ApiResponse<{ registrations: VolunteerRegistration[] }>>(
      '/volunteers/me'
    );
    return res.data.data.registrations;
  },
};
