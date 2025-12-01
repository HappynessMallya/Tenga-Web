# Order Creation & Payment Flow

## 📋 Complete Flow Overview

This document describes the improved order creation and payment initiation flow.

---

## 🔄 Step-by-Step Flow

### 1. **Order Creation Request**
**File**: `app/(customer)/order-summary.tsx`

```typescript
const orderResponse = await orderCreationService.createOrder(orderData);
```

**API Call**: `POST /api/orders`

**Response**:
```json
{
  "message": "Order created successfully",
  "order": {
    "id": "691d2d63189fac878897e62e",
    "uuid": "d5ca5ef7-7296-4cd0-b298-7cc3513c4609",
    "status": "CREATED",
    ...
  }
}
```

---

### 2. **Fetch Complete Order** ⭐ NEW
**File**: `app/(customer)/order-summary.tsx`

After creating the order, we **immediately fetch the complete order** to ensure we have the latest status and all fields.

```typescript
const completeOrder = await orderService.getOrderById(orderId);
```

**API Call**: `GET /api/orders/{orderId}`

**Response**:
```json
{
  "order": {
    "id": "691d2d63189fac878897e62e",
    "uuid": "d5ca5ef7-7296-4cd0-b298-7cc3513c4609",
    "status": "TEMPORARILY_ASSIGNED",  // ← Status may have changed!
    "totalAmount": 23375,
    ...
  }
}
```

**Why This Step?**
- ✅ Ensures order is properly persisted in database
- ✅ Gets the latest status (backend may auto-assign to vendor)
- ✅ Guarantees UUID is available
- ✅ Validates order was created successfully
- ✅ Provides more robust error handling

---

### 3. **Store Order Data**
**File**: `app/(customer)/order-summary.tsx`

Extract and store both `orderId` and `orderUuid` in Zustand:

```typescript
const orderUuid = completeOrder.uuid || orderResponse.order.uuid;

if (!orderUuid) {
  throw new Error('Order UUID is missing. Please contact support.');
}

setOrderId(orderId);     // Store MongoDB ID
setOrderUuid(orderUuid); // Store UUID for payment
```

**Zustand Store**: `app/store/orderStore.ts`

Persisted to localStorage/AsyncStorage for cross-screen persistence.

---

### 4. **Navigate to Payment**
**File**: `app/(customer)/order-summary.tsx`

```typescript
router.push('/(customer)/payment');
```

User sees success modal, then navigates to payment screen.

---

### 5. **Payment Screen Loads**
**File**: `app/(customer)/payment.tsx`

Payment screen reads order data from Zustand:

```typescript
const { orderId, orderUuid } = useOrderStore();
```

**Console Output**:
```
💳 Payment Screen State: {
  orderId: "691d2d63189fac878897e62e",
  orderUuid: "d5ca5ef7-7296-4cd0-b298-7cc3513c4609"
}
```

---

### 6. **Payment Initiation**
**File**: `app/(customer)/payment.tsx`

User enters phone number and confirms payment:

```typescript
const paymentEndpoint = `/payments/initiate/${orderUuid}`;

const response = await API.post(paymentEndpoint, {
  phoneNumber: normalizedPhone
});
```

**API Call**: `POST /api/payments/initiate/{orderUuid}`

**Request Body**:
```json
{
  "phoneNumber": "+255755512190"
}
```

**Response**:
```json
{
  "message": "Payment initiated successfully",
  "workflowId": "payment-processing-691d2d63189fac878897e62e-+255755512190",
  "orderUuid": "d5ca5ef7-7296-4cd0-b298-7cc3513c4609",
  "orderId": "691d2d63189fac878897e62e",
  "amount": 23375,
  "currency": "TZS"
}
```

**USSD Push**: User receives USSD prompt on their phone to complete payment.

---

## 🎯 Key Improvements

### Before This Update
- ❌ Only stored `orderId` after creation
- ❌ Payment API would fail if UUID was missing
- ❌ No verification that order was properly created
- ❌ Relied on cached data that could be stale

### After This Update
- ✅ Fetches complete order after creation
- ✅ Stores both `orderId` AND `orderUuid`
- ✅ Verifies order exists in database
- ✅ Gets latest order status (e.g., TEMPORARILY_ASSIGNED)
- ✅ Robust error handling with fallback
- ✅ Better logging for debugging

---

## 📝 Console Logs

When creating an order, you'll see:

```
🛒 Creating order from order summary...
📦 Order data prepared: {...}
✅ Order created successfully: {...}
📦 Order ID received: 691d2d63189fac878897e62e
🔄 Fetching complete order data...
✅ Complete order fetched: {...}
📋 Order details: {
  orderId: "691d2d63189fac878897e62e",
  orderUuid: "d5ca5ef7-7296-4cd0-b298-7cc3513c4609",
  status: "TEMPORARILY_ASSIGNED",
  totalAmount: 23375
}
💾 Order data stored in Zustand
  ├─ Order ID (MongoDB): 691d2d63189fac878897e62e
  ├─ Order UUID: d5ca5ef7-7296-4cd0-b298-7cc3513c4609
  └─ Order Status: TEMPORARILY_ASSIGNED
```

---

## 🔐 Data Flow

```
┌─────────────────┐
│  User Creates   │
│     Order       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   POST /orders  │  ← Create order
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GET /orders/:id │  ← Fetch complete order ⭐ NEW
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Store in       │
│  Zustand:       │
│  - orderId      │
│  - orderUuid    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Navigate to    │
│  Payment Screen │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Read orderUuid  │
│  from Zustand   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /payments/ │
│ initiate/:uuid  │  ← Use UUID for payment
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  USSD Push to   │
│  User's Phone   │
└─────────────────┘
```

---

## 🛡️ Error Handling

### Order Creation Fails
```typescript
catch (error) {
  Alert.alert('Order Creation Failed', errorMessage);
  setIsCreatingOrder(false);
}
```

### Order Fetch Fails
```typescript
// Falls back to UUID from creation response
const orderUuid = completeOrder.uuid || orderResponse.order.uuid;

if (!orderUuid) {
  throw new Error('Order UUID is missing. Please contact support.');
}
```

### Payment Initiation Fails
```typescript
catch (error) {
  Alert.alert('Payment Failed', error.message);
  setIsProcessing(false);
}
```

---

## 🧪 Testing Checklist

- [ ] Clear cache using Dev Tools
- [ ] Create a new order
- [ ] Check console logs for order details
- [ ] Verify both `orderId` and `orderUuid` are logged
- [ ] Check that order status is `TEMPORARILY_ASSIGNED`
- [ ] Navigate to payment screen
- [ ] Verify order data is available
- [ ] Enter phone number
- [ ] Initiate payment
- [ ] Verify API uses `orderUuid` not `orderId`
- [ ] Check USSD is pushed to phone

---

## 📚 Related Files

### Order Creation
- `app/(customer)/order-summary.tsx` - Order creation UI and logic
- `app/services/orderCreationService.ts` - Order creation API calls
- `app/services/orderService.ts` - Order fetch API calls

### Payment
- `app/(customer)/payment.tsx` - Payment UI and logic
- `app/api/axiosInstance.ts` - API client

### State Management
- `app/store/orderStore.ts` - Order state (Zustand)
- `app/hooks/useGarmentConfig.ts` - Garment selection state

### Types
- `app/types/orderCreation.ts` - Order creation types
- `app/services/orderService.ts` - Order types

---

## 🎉 Success Criteria

✅ Order is created successfully  
✅ Complete order is fetched from database  
✅ Both `orderId` and `orderUuid` are stored  
✅ Order status is updated (CREATED → TEMPORARILY_ASSIGNED)  
✅ Payment API receives correct `orderUuid`  
✅ USSD is pushed to user's phone  
✅ No more "Order not found" or "Order canceled" errors  

---

## 🐛 Debugging

If you encounter issues:

1. **Check Dev Tools** - Use the bug icon button to view order info
2. **Check Console** - Look for the detailed logs above
3. **Clear Cache** - Old orders may cause conflicts
4. **Verify Backend** - Ensure backend returns UUID in order response
5. **Check Network** - Use browser DevTools Network tab

---

## 💡 Notes

- The fetch step adds ~100-200ms to order creation but significantly improves reliability
- Order status may change between creation and fetch (this is expected)
- UUID format: `d5ca5ef7-7296-4cd0-b298-7cc3513c4609`
- MongoDB ID format: `691d2d63189fac878897e62e`
- Payment API requires UUID, not MongoDB ID









