// @ts-nocheck
import { useState, useCallback } from 'react';
import { CreatePaymentData, Payment } from '../types/payment';
import { logger } from '../utils/logger';

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
      const orderId = generateUUID();
      logger.info('UI-only payment flow started', { orderId, amount: data.amount });

      setState('creating');
      setProgress({ current: 1, total: 3, message: 'Creating payment request...' });
      await new Promise(r => setTimeout(r, 500));

      setState('push_sent');
      setProgress({ current: 2, total: 3, message: 'Waiting for confirmation...' });
      await new Promise(r => setTimeout(r, 800));

      setState('completed');
      setProgress({ current: 3, total: 3, message: 'Payment completed (simulated).' });

      const successResult: PaymentResult = {
        success: true,
        payment: {
          id: generateUUID(),
          order_id: orderId,
          amount: data.amount,
          payment_method: data.payment_method,
          status: 'completed',
          phone: data.phone,
          transaction_id: generateUUID(),
          reference: orderId,
        } as any,
        reference: orderId,
        transactionId: orderId,
        orderId,
      };

      setResult(successResult);
      return successResult;
    } catch (error) {
      setState('failed');
      setProgress(null);
      const errorResult: PaymentResult = { success: false, error: 'Payment failed (UI-only).' };
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
