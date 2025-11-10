export type ServiceItem = {
  id: string;
  service_type_id: string;
  name: string;
  price_tsh: number;
  category?: { name: string };
};

const MOCK_ITEMS: ServiceItem[] = [
  { id: 'item_shirt', service_type_id: 'wash_fold', name: 'Shirt', price_tsh: 1500, category: { name: 'tops' } },
  { id: 'item_trousers', service_type_id: 'wash_fold', name: 'Trousers', price_tsh: 2000, category: { name: 'bottoms' } },
  { id: 'item_dress', service_type_id: 'dry_clean', name: 'Dress', price_tsh: 4000, category: { name: 'dresses' } },
  { id: 'item_jacket', service_type_id: 'dry_clean', name: 'Jacket', price_tsh: 5000, category: { name: 'outerwear' } },
  { id: 'item_bedsheet', service_type_id: 'iron_only', name: 'Bedsheet', price_tsh: 1000, category: { name: 'bedding' } },
];

class ServiceItemService {
  async getAllItems(): Promise<ServiceItem[]> {
    return Promise.resolve(MOCK_ITEMS);
  }

  async getCategorizedItems(): Promise<Record<string, ServiceItem[]>> {
    const items = await this.getAllItems();
    return items.reduce<Record<string, ServiceItem[]>>((acc, item) => {
      const key = item.category?.name || 'other';
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }
}

export const serviceItemService = new ServiceItemService();
export default serviceItemService;


