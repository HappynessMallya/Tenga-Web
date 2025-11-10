import { logger } from './logger';
import { Alert } from 'react-native';

export interface PaymentRecoveryResult {
  success: boolean;
  payment?: any;
  order?: any;
  error?: string;
  requiresManualIntervention?: boolean;
}

export async function recoverPaymentStatus(orderId: string): Promise<PaymentRecoveryResult> {
  logger.info('UI-only: recoverPaymentStatus called', { orderId });
  return { success: false, error: 'Payment recovery disabled in UI-only build' };
}

export async function createOrderForCompletedPayment(payment: any, orderData: any, paymentMethod: string): Promise<PaymentRecoveryResult> {
  logger.info('UI-only: createOrderForCompletedPayment called', { paymentMethod });
  return { success: false, error: 'Order creation disabled in UI-only build' };
}

export function showPaymentRecoveryAlert(result: PaymentRecoveryResult, onSuccess?: () => void) {
  Alert.alert(
    'Payment Recovery',
    result.error || 'Payment recovery is disabled in this UI-only build.',
    [
      {
        text: 'OK',
        style: 'default',
      },
    ]
  );
}
