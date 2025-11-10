import { router } from 'expo-router';
import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../providers/ThemeProvider';

// Components
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Header } from '../components/common/Header';

// ✅ Mocked data
const mockedCategorizedItems = [
  {
    category: { id: '1', display_name: 'Clothes' },
    items: [
      { id: 'shirt1', name: 'Shirt', price_tsh: 2000, icon_name: 'shirt' },
      { id: 'pant1', name: 'Pants', price_tsh: 2500, icon_name: 'pants' },
    ],
  },
  {
    category: { id: '2', display_name: 'Bedding' },
    items: [
      { id: 'blanket1', name: 'Blanket', price_tsh: 5000, icon_name: 'blanket' },
    ],
  },
];

export default function ServiceItemsScreen() {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [categorizedItems, setCategorizedItems] = useState<any[]>([]);

  // Simulate fetch delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setCategorizedItems(mockedCategorizedItems);
      setSelectedCategory(mockedCategorizedItems[0]?.category.id || '');
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Categories
  const categories = useMemo(() => {
    return categorizedItems.map((cat: any) => cat.category);
  }, [categorizedItems]);

  // Current items
  const currentItems = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categorizedItems.find(
      (cat: any) => cat.category.id === selectedCategory
    );
    return category?.items || [];
  }, [categorizedItems, selectedCategory]);

  const handleQuantityChange = useCallback((itemId: string, change: number) => {
    setSelectedItems((prev) => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);

      if (newQuantity === 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [itemId]: newQuantity };
    });
  }, []);

  const handleDone = useCallback(() => {
    const totalItems = Object.values(selectedItems).reduce(
      (sum, qty) => sum + qty,
      0
    );

    if (totalItems === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to continue.');
      return;
    }

    router.back();
  }, [selectedItems]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Order summary"
        rightComponent={
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category: any) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    selectedCategory === category.id ? colors.text : colors.card,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedCategory === category.id ? 'white' : colors.text,
                  },
                ]}
              >
                {category.display_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items */}
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        {currentItems.map((item: any) => {
          const quantity = selectedItems[item.id] || 0;

          return (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card }]}>
              <View style={styles.itemInfo}>
                <View style={styles.itemIcon}>
                  <Ionicons
                    name={getItemIcon(item.icon_name)}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                    {item.price_tsh.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleQuantityChange(item.id, -1)}
                  disabled={quantity === 0}
                >
                  <Ionicons name="remove" size={16} color="white" />
                </TouchableOpacity>

                <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>

                <TouchableOpacity
                  style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleQuantityChange(item.id, 1)}
                >
                  <Ionicons name="add" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Done Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: colors.primary }]}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Icon map
function getItemIcon(iconName: string): string {
  const iconMap: Record<string, string> = {
    shirt: 'shirt',
    pants: 'shirt-outline',
    blanket: 'bed',
  };
  return iconMap[iconName] || 'shirt';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeButton: { padding: 8 },
  tabContainer: { paddingHorizontal: 20, paddingVertical: 16 },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  tabText: { fontSize: 14, fontWeight: '600', fontFamily: 'Roboto-Medium' },
  itemsContainer: { flex: 1, paddingHorizontal: 20 },
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemDetails: { flex: 1 },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
    marginBottom: 4,
  },
  itemPrice: { fontSize: 14, fontFamily: 'Roboto-Regular' },
  quantitySelector: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  doneButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
});
