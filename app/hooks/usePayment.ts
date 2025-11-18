// @ts-nocheck
import { useState, useCallback } from 'react';
import { CreatePaymentData, Payment } from '../types/payment';
import { logger } from '../utils/logger';
import API from '../api/axiosInstance';
import { normalizeTanzaniaPhone } from '../utils/phoneUtils';

export type PaymentState =
  | 'idle'
  | 'creating'
  | 'push_sent'
  | 'polling'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface PaymentResult {
  success: boolean;
  payment?: Payment;
  error?: string;
  reference?: string;
  transactionId?: string;
  orderId?: string;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const usePayment = () => {
  const [state, setState] = useState<PaymentState>('idle');
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    message: string;
  } | null>(null);

  const processPayment = useCallback(async (data: CreatePaymentData): Promise<PaymentResult> => {
    try {
      // Use orderId from data if provided, otherwise generate one (for backward compatibility)
      const orderId = data.order_id || generateUUID();
      
      if (!orderId) {
        throw new Error('Order ID is required for payment');
      }

      // Normalize phone number to +255 format
      const normalizedPhone = data.phone ? normalizeTanzaniaPhone(data.phone) : null;
      
      if (!normalizedPhone) {
        throw new Error('Valid phone number is required for mobile money payment');
      }

      logger.info('Payment flow started', { orderId, amount: data.amount, phone: normalizedPhone });

      setState('creating');
      setProgress({ current: 1, total: 3, message: 'Creating payment request...' });

      // Call the payment API endpoint
      const response = await API.post(`/api/payments/initiate/${orderId}`, {
        phoneNumber: normalizedPhone,
      });

      logger.info('Payment initiated successfully', { orderId, response: response.data });

      setState('push_sent');
      setProgress({ current: 2, total: 3, message: 'Waiting for confirmation...' });

      // Poll for payment status (you may want to implement actual polling here)
      // For now, we'll simulate a delay
      await new Promise(r => setTimeout(r, 2000));

      setState('completed');
      setProgress({ current: 3, total: 3, message: 'Payment completed.' });

      const successResult: PaymentResult = {
        success: true,
        payment: {
          id: response.data.id || generateUUID(),
          order_id: orderId,
          amount: data.amount,
          payment_method: data.payment_method,
          status: 'completed',
          phone: normalizedPhone,
          transaction_id: response.data.transaction_id || generateUUID(),
          reference: orderId,
        } as any,
        reference: orderId,
        transactionId: response.data.transaction_id || orderId,
        orderId,
      };

      setResult(successResult);
      return successResult;
    } catch (error: any) {
      logger.error('Payment failed', { error: error.message, response: error.response?.data });
      setState('failed');
      setProgress(null);
      
      const errorMessage = error.response?.data?.message || error.message || 'Payment failed. Please try again.';
      const errorResult: PaymentResult = { success: false, error: errorMessage };
      setResult(errorResult);
      return errorResult;
    }
  }, []);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setProgress(null);
  }, []);

  const getStateMessage = useCallback(() => {
    switch (state) {
      case 'idle':
        return 'Ready to process payment';
      case 'creating':
        return 'Creating payment request...';
      case 'push_sent':
        return 'Waiting for payment confirmation...';
      case 'polling':
        return 'Waiting for payment confirmation...';
      case 'completed':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'cancelled':
        return 'Payment was cancelled. Please try again.';
      case 'expired':
        return 'Payment expired. Please try again.';
      default:
        return 'Processing payment...';
    }
  }, [state]);

  const isProcessing = state === 'creating' || state === 'push_sent' || state === 'polling';
  const isCompleted = state === 'completed';
  const isError = state === 'failed' || state === 'cancelled' || state === 'expired';

  return {
    state,
    result,
    progress,
    isProcessing,
    isCompleted,
    isError,
    processPayment,
    reset,
    getStateMessage,
  };
};
