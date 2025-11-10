// @ts-nocheck
import { useState } from 'react';
import { OrderStatus } from '../types/order';

export const useOrderStatus = (orderId: string) => {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async (_status: OrderStatus) => {
    setUpdating(true);
    await new Promise(r => setTimeout(r, 200));
    setUpdating(false);
    return { id: orderId, status: _status } as any;
  };

  return {
    updating,
    updateStatus,
  };
};
