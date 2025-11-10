import { NotificationSound } from '../types/notification';

export const NOTIFICATION_SOUNDS: NotificationSound[] = [
  {
    id: 'default',
    name: 'Default',
    file: 'default.mp3',
  },
  {
    id: 'urgent',
    name: 'Urgent',
    file: 'urgent.mp3',
  },
  {
    id: 'success',
    name: 'Success',
    file: 'success.mp3',
  },
];

export const VIBRATION_PATTERNS: Record<string, number[]> = {
  default: [0, 250, 250, 250],
  urgent: [0, 500, 200, 500],
  success: [0, 100, 100, 100],
};
