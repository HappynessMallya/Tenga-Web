export type ServiceType = {
  id: string;
  display_name: string;
  description?: string;
  processing_time_hours: number;
};

const MOCK_SERVICE_TYPES: ServiceType[] = [
  {
    id: 'wash_fold',
    display_name: 'Wash & Fold',
    description: 'Everyday laundry washed and neatly folded.',
    processing_time_hours: 24,
  },
  {
    id: 'dry_clean',
    display_name: 'Dry Cleaning',
    description: 'Delicate garments professionally cleaned.',
    processing_time_hours: 48,
  },
  {
    id: 'iron_only',
    display_name: 'Iron Only',
    description: 'Crisp ironing for already-washed clothes.',
    processing_time_hours: 12,
  },
];

class ServiceTypeService {
  async getServiceTypes(): Promise<ServiceType[]> {
    // Simulate async fetch while backend is not connected
    return Promise.resolve(MOCK_SERVICE_TYPES);
  }
}

export const serviceTypeService = new ServiceTypeService();
export default serviceTypeService;


