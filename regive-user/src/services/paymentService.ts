import { apiClient } from './apiClient';
import { ApiResponse, Payment, PaymentPurpose } from '@/types';

export type CreatePaymentPayload = {
  purpose: PaymentPurpose;
  orderId?: string;
  donationId?: string;
};

export type ConfirmSandboxPaymentPayload = {
  paymentId: string;
  sandboxToken: string;
};

export const paymentService = {
  async create(payload: CreatePaymentPayload): Promise<Payment> {
    const res = await apiClient.post<ApiResponse<{ payment: Payment }>>('/payments', payload);
    return res.data.data.payment;
  },

  async confirmSandbox(payload: ConfirmSandboxPaymentPayload): Promise<Payment> {
    const res = await apiClient.post<ApiResponse<{ payment: Payment }>>(
      '/payments/sandbox/confirm',
      payload
    );
    return res.data.data.payment;
  },

  async getMyPayments(): Promise<Payment[]> {
    const res = await apiClient.get<ApiResponse<{ payments: Payment[] }>>('/payments/me');
    return res.data.data.payments;
  },

  async getById(id: string): Promise<Payment> {
    const res = await apiClient.get<ApiResponse<{ payment: Payment }>>(`/payments/${id}`);
    return res.data.data.payment;
  },
};
