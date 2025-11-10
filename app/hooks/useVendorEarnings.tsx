import { useState, useEffect } from 'react';
import { paymentService } from '../lib/services/domain/payment';
import { handleError } from '../utils/error-handling';

export const useVendorEarnings = (vendorId: string) => {
  const [earnings, setEarnings] = useState<{
    daily: number;
    weekly: number;
    monthly: number;
  }>({
    daily: 0,
    weekly: 0,
    monthly: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, [vendorId]);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const [daily, weekly, monthly] = await Promise.all([
        paymentService.getVendorEarnings(vendorId, 'day'),
        paymentService.getVendorEarnings(vendorId, 'week'),
        paymentService.getVendorEarnings(vendorId, 'month'),
      ]);

      setEarnings({
        daily: daily.total,
        weekly: weekly.total,
        monthly: monthly.total,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    earnings,
    loading,
    refresh: loadEarnings,
  };
};
