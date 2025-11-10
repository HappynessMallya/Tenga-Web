type Period = 'day' | 'week' | 'month' | string;

class PaymentService {
  async getVendorEarnings(vendorId: string, period: Period): Promise<{ total: number }>{
    // UI-only stub: always return zero earnings
    return Promise.resolve({ total: 0 });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
