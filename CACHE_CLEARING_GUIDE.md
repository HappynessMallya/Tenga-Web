# Cache Clearing Guide

## Problem: Orders Being Canceled Immediately

If you're experiencing issues with orders being canceled immediately after creation, this is likely due to **old cached data** from before the UUID fix was implemented.

## Solutions

### Option 1: Use Dev Tools Button (Recommended)

1. Look for the **bug icon** button in the bottom-right corner of the home screen
2. Tap it to open the Dev Tools modal
3. Choose one of the following options:
   - **Show Order Info**: View current order ID and UUID
   - **Clear Order Cache**: Clears only order-related data
   - **Clear All Cache & Reload**: Clears everything and reloads the app

### Option 2: Browser Console Script

1. Press **F12** to open Developer Tools
2. Go to the **Console** tab
3. Copy and paste the contents of `CLEAR_CACHE_CONSOLE.js`
4. Press Enter
5. The page will reload automatically after 2 seconds

### Option 3: Manual Browser Cache Clear

#### Chrome/Edge
1. Press **F12** to open DevTools
2. Go to **Application** tab
3. Expand **Local Storage** in the left sidebar
4. Click on your domain (localhost:8081 or your app URL)
5. Right-click and select **Clear**
6. Do the same for **Session Storage**
7. Refresh the page (**Ctrl+R** or **F5**)

#### Firefox
1. Press **F12** to open DevTools
2. Go to **Storage** tab
3. Expand **Local Storage**
4. Right-click your domain and select **Delete All**
5. Do the same for **Session Storage**
6. Refresh the page

## Understanding the Issue

### Before the Fix
- Orders were created with only `orderId` (MongoDB ObjectID)
- Payment API requires `orderUuid` (UUID format)
- Missing UUID caused 404 errors in payment

### After the Fix
- Orders now store both `orderId` AND `orderUuid`
- Payment API correctly uses `orderUuid`
- Old cached orders don't have UUID → causes errors

### Why Clear Cache?
Old orders stored before the fix are missing the `orderUuid` field, causing:
- ❌ 404 errors: "Order not found"
- ❌ 400 errors: "Order is in CANCELED state"

Clearing cache removes these old orders and forces the app to create fresh ones with all required fields.

## Verifying the Fix

After clearing cache:

1. **Create a new order**:
   - Go to home
   - Click "Schedule a pickup"
   - Select garments
   - Set pickup time & location
   - Create the order

2. **Check Dev Tools**:
   - Open Dev Tools button
   - Click "Show Order Info"
   - Verify both Order ID and Order UUID are present

3. **Make payment**:
   - Enter your phone number
   - Click "Proceed to Payment"
   - USSD should be pushed to your phone

## Backend Investigation

If orders are still being canceled after clearing cache, the issue is likely on the backend:

### Possible Causes:
1. **Workflow timeout**: Orders may have a short timeout before auto-canceling
2. **Payment deadline**: Unpaid orders might get auto-canceled
3. **Business logic**: Check backend workflow rules

### To Investigate:
- Check backend logs when creating an order
- Look for auto-cancellation workflows
- Verify order status transitions
- Check if there's a payment deadline timer

## Code Changes Made

### 1. Added `orderUuid` to Order Store
```typescript
// app/store/orderStore.ts
export interface OrderData {
  // ... other fields
  orderId: string | null;
  orderUuid: string | null;  // ← NEW
}
```

### 2. Updated Order Creation
```typescript
// app/(customer)/order-summary.tsx
const orderId = orderResponse.order.id;
const orderUuid = orderResponse.order.uuid;  // ← NEW
setOrderId(orderId);
setOrderUuid(orderUuid);  // ← NEW
```

### 3. Fixed Payment API
```typescript
// app/(customer)/payment.tsx
// Before: `/payments/initiate/${orderId}`  ❌
// After:  `/payments/initiate/${orderUuid}`  ✅
```

## Need More Help?

If problems persist after:
1. ✅ Clearing cache
2. ✅ Creating fresh order
3. ✅ Verifying UUID is stored

Then investigate the backend for auto-cancellation logic.

