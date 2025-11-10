import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, StyleSheet } from 'react-native';
import { usePayment, PaymentState } from '../../hooks/usePayment';
import { CreatePaymentData } from '../../types/payment';
import { Button } from '../Button';
import { LoadingSpinner } from '../LoadingSpinner';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { recoverPaymentStatus, showPaymentRecoveryAlert } from '../../utils/payment-recovery';

interface PaymentProcessorProps {
  paymentData: CreatePaymentData;
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  children: (props: {
    startPayment: () => void;
    isProcessing: boolean;
    state: PaymentState;
  }) => React.ReactNode;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  paymentData,
  onSuccess,
  onError,
  onCancel,
  children,
}) => {
  const { state, result, progress, isProcessing, processPayment, reset } = usePayment();

  const [showModal, setShowModal] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Clean up technical error messages for user-friendly display
  const getCleanErrorMessage = (error: string | undefined): string => {
    if (!error) return 'Something went wrong with your payment.';

    // Handle database enum errors
    if (error.includes('invalid input value for enum payment_status')) {
      return 'Payment processing issue. Please try again or check your payment status.';
    }

    // Handle other technical errors
    if (error.includes('Failed to update payment status')) {
      return 'Payment verification issue. Please check your payment status.';
    }

    if (error.includes('insufficient funds')) {
      return 'Insufficient funds. Please check your mobile money balance and try again.';
    }

    if (error.includes('cancelled')) {
      return 'Payment was cancelled. Please try again.';
    }

    if (error.includes('expired') || error.includes('timeout')) {
      return 'Payment timed out. Please try again.';
    }

    // Return original error if it's already user-friendly
    if (error.length < 100 && !error.includes('Error:') && !error.includes('failed')) {
      return error;
    }

    // Default fallback for any other technical errors
    return 'Payment processing issue. Please try again or check your payment status.';
  };

  const handleStartPayment = async () => {
    try {
      setShowModal(true);
      const result = await processPayment(paymentData);

      if (result.success && result.payment) {
        onSuccess?.(result.payment);
      } else {
        onError?.(result.error || 'Payment failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError?.(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  const handleRetry = () => {
    reset();
    handleStartPayment();
  };

  const handleCancel = () => {
    Alert.alert('Cancel Payment', 'Are you sure you want to cancel this payment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          handleCloseModal();
          onCancel?.();
        },
      },
    ]);
  };

  const handleCheckPaymentStatus = async () => {
    if (!result?.orderId) {
      Alert.alert('Error', 'No payment reference found to check status.');
      return;
    }

    try {
      setIsCheckingStatus(true);

      const recoveryResult = await recoverPaymentStatus(result.orderId);

      if (recoveryResult.success && recoveryResult.payment?.status === 'completed') {
        // Payment was actually successful
        handleCloseModal(); // Close the failed payment modal

        if (recoveryResult.order) {
          onSuccess?.(recoveryResult.payment);
        } else {
          showPaymentRecoveryAlert(recoveryResult, () => onSuccess?.(recoveryResult.payment));
        }
      } else {
        showPaymentRecoveryAlert(recoveryResult);
      }
    } catch (error) {
      Alert.alert(
        'Check Failed',
        'Unable to verify payment status. Please try again or contact support.'
      );
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const renderModalContent = () => {
    switch (state) {
      case 'creating':
        return (
          <View style={styles.modalContent}>
            <LoadingSpinner size="large" />
            <Text style={styles.modalTitle}>Creating Payment</Text>
            <Text style={styles.modalMessage}>Setting up your payment request...</Text>
            {progress && (
              <Text style={styles.progressText}>
                Step {progress.current} of {progress.total}
              </Text>
            )}
          </View>
        );

      case 'push_sent':
        return (
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📱</Text>
            </View>
            <Text style={styles.modalTitle}>Check Your Phone</Text>
            <Text style={styles.modalMessage}>
              We've sent a push notification to your mobile wallet. Please check your phone and
              confirm the payment.
            </Text>
            <Text style={styles.hintText}>
              💡 Tip: Look for a notification from your mobile money app
            </Text>
            {progress && (
              <Text style={styles.progressText}>
                Step {progress.current} of {progress.total}
              </Text>
            )}
          </View>
        );

      case 'polling':
        return (
          <View style={styles.modalContent}>
            <LoadingSpinner size="large" />
            <Text style={styles.modalTitle}>Processing Payment</Text>
            <Text style={styles.modalMessage}>Waiting for payment confirmation...</Text>
            <Text style={styles.hintText}>⏳ This may take a few moments</Text>
            {progress && (
              <Text style={styles.progressText}>
                Step {progress.current} of {progress.total}
              </Text>
            )}
          </View>
        );

      case 'completed':
        return (
          <PaymentSuccessModal
            visible={true}
            amount={result?.payment?.amount || 0}
            orderId={result?.payment?.order_id || 'N/A'}
            onViewOrder={() => {
              // Handle view order
              handleCloseModal();
            }}
            onViewAllOrders={() => {
              // Handle view all orders
              handleCloseModal();
            }}
            onClose={handleCloseModal}
          />
        );

      case 'failed':
        return (
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>❌</Text>
            </View>
            <Text style={styles.modalTitle}>Payment Failed</Text>
            <Text style={styles.modalMessage}>
              {getCleanErrorMessage(result?.error) || 'Something went wrong with your payment.'}
            </Text>

            {/* Add helpful guidance for failed payments */}
            <View style={styles.troubleshootingContainer}>
              <Text style={styles.troubleshootingText}>• Check your mobile money balance</Text>
              <Text style={styles.troubleshootingText}>• Ensure you have sufficient funds</Text>
              <Text style={styles.troubleshootingText}>• Verify your phone number is correct</Text>
              <Text style={styles.troubleshootingText}>• Try again in a few moments</Text>
            </View>

            <View style={styles.buttonContainer}>
              <Button title="Try Again" onPress={handleRetry} style={styles.retryButton} />
              <Button
                title={isCheckingStatus ? 'Checking...' : 'Check Payment Status'}
                onPress={handleCheckPaymentStatus}
                variant="outline"
                style={styles.checkButton}
                disabled={isCheckingStatus}
              />
              <Button
                title="Cancel"
                onPress={handleCloseModal}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </View>
        );

      case 'cancelled':
        return (
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🚫</Text>
            </View>
            <Text style={styles.modalTitle}>Payment Cancelled</Text>
            <Text style={styles.modalMessage}>
              You cancelled the payment. No charges were made.
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Try Again" onPress={handleRetry} style={styles.retryButton} />
              <Button
                title="Close"
                onPress={handleCloseModal}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </View>
        );

      case 'expired':
        return (
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⏰</Text>
            </View>
            <Text style={styles.modalTitle}>Payment Expired</Text>
            <Text style={styles.modalMessage}>
              The payment request has expired. Please try again.
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Try Again" onPress={handleRetry} style={styles.retryButton} />
              <Button
                title="Close"
                onPress={handleCloseModal}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {children({
        startPayment: handleStartPayment,
        isProcessing,
        state,
      })}

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={isProcessing ? handleCancel : handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {renderModalContent()}

            {/* Cancel button for processing states */}
            {isProcessing && state !== 'completed' && state !== 'failed' && (
              <TouchableOpacity style={styles.cancelButtonOverlay} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
    alignItems: 'center',
    maxHeight: '80%',
  },
  modalContent: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
    color: '#666',
  },
  hintText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#888',
    fontStyle: 'italic',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  retryButton: {
    width: '100%',
    marginBottom: 8,
  },
  checkButton: {
    width: '100%',
    marginBottom: 8,
  },
  cancelButton: {
    width: '100%',
    marginBottom: 8,
  },
  cancelButtonOverlay: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  troubleshootingContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  troubleshootingText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
    lineHeight: 20,
  },
});
