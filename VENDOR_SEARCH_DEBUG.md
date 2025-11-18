# Vendor Search Debugging Guide

## How the Vendor Search Works

When you click "Create Order & Pay", the app performs the following steps:

1. **Validates order data** (items, date, location)
2. **Checks for nearby vendors** within 10km radius
3. **Creates the order** (only if vendors are found)
4. **Shows success modal** and navigates to payment

## The Vendor Search API Call

**Endpoint:** `GET /offices/search/nearest`
**Full URL:** `https://lk-7ly1.onrender.com/api/offices/search/nearest`
**Parameters:**
- `latitude`: Customer's latitude (e.g., -6.6836254)
- `longitude`: Customer's longitude (e.g., 39.2239659)
- `radius`: Search radius in meters (default: 10000 = 10km)

**Example Request:**
```
GET https://lk-7ly1.onrender.com/api/offices/search/nearest?latitude=-6.6836254&longitude=39.2239659&radius=10000
```

## What Logs to Check

Open your browser console (F12) and look for these logs when you click the button:

### 1. **Button Click - Initial Validation**
```
🔍 Starting vendor check process...
🔍 Checking for nearby vendors...
📍 Location coordinates: { latitude: -6.6836254, longitude: 39.2239659, type: 'number', isNumber: true }
```

### 2. **Vendor Search Start**
```
⏱️ Starting vendor search with 15-second timeout...
🔍 VendorService: Searching for nearby offices { latitude: -6.6836254, longitude: 39.2239659, radius: 10000 }
🔗 VendorService: Making GET request to: /offices/search/nearest with params: {...}
🔗 VendorService: Axios baseURL: https://lk-7ly1.onrender.com/api
🔗 VendorService: Full URL will be: https://lk-7ly1.onrender.com/api/offices/search/nearest
```

### 3. **Successful Response**
```
✅ VendorService: Request completed in 1234ms
✅ VendorService: Nearby offices found: { count: 2, offices: [...] }
✅ Found 2 nearby vendor(s): [...]
🎯 Proceeding to order creation...
```

### 4. **Error Scenarios**

#### A. Network Error
```
❌ VendorService: Failed to search nearby offices: Error: Network Error
❌ Error type: Error
❌ Error message: Network request failed
```

#### B. Timeout Error
```
⏰ Vendor search timeout reached!
❌ Vendor search failed: Error: Vendor search timed out after 15 seconds
```

#### C. No Vendors Found
```
⚠️ No vendors found in the area
[Alert shown: "No Nearby Vendors"]
```

## Common Issues & Solutions

### Issue 1: Button Just Loads Forever
**Symptoms:** Button shows "Creating Order..." but never finishes or shows alert

**Possible Causes:**
1. **Timeout not working** - The 15-second timeout should trigger
2. **API server is down** - Check if `https://lk-7ly1.onrender.com/api` is accessible
3. **CORS error on web** - Check browser console for CORS errors

**Solutions:**
- Check browser console for error logs
- Test the API directly in browser: `https://lk-7ly1.onrender.com/api/offices/search/nearest?latitude=-6.6836254&longitude=39.2239659&radius=10000`
- Verify your internet connection

### Issue 2: No Alert Shows Up
**Symptoms:** Button finishes loading but no alert appears

**Possible Causes:**
1. **Vendor service returns empty array** - Silent failure
2. **Alert is blocked** - Browser might block alerts
3. **React Native Alert not working** - Platform-specific issue

**Solutions:**
- Check console for the log: `⚠️ No vendors found in the area`
- Check if you see: `✅ Found 0 nearby vendor(s)`
- Look for any errors in the catch block

### Issue 3: CORS Error on Web
**Symptoms:** Console shows CORS policy error

**Error Message:**
```
Access to XMLHttpRequest at 'https://lk-7ly1.onrender.com/api/offices/search/nearest' 
from origin 'http://localhost:8081' has been blocked by CORS policy
```

**Solutions:**
1. **Use the proxy server (Development):**
   ```bash
   npm run web:proxy
   ```
   Then in another terminal:
   ```bash
   npm run web
   ```

2. **Or run both together:**
   ```bash
   npm run web:dev
   ```

3. **Backend needs to allow your domain:**
   - The API server must include CORS headers
   - Contact backend team to add your domain to allowed origins

### Issue 4: Invalid Coordinates
**Symptoms:** Alert says "Invalid Location"

**Solutions:**
- Go back and click "Get My Location" again
- Make sure location permissions are granted
- Check if location service is working on your device

## Testing the API Directly

You can test the vendor search API directly in your browser:

1. Open a new browser tab
2. Paste this URL:
   ```
   https://lk-7ly1.onrender.com/api/offices/search/nearest?latitude=-6.6836254&longitude=39.2239659&radius=10000
   ```
3. You should see a JSON response with offices

**Expected Response:**
```json
{
  "offices": [
    {
      "id": "...",
      "name": "...",
      "distance": 1234,
      "address": {...}
    }
  ],
  "searchParams": {
    "latitude": -6.6836254,
    "longitude": 39.2239659,
    "radius": 10000
  }
}
```

## Debugging Steps

1. **Open browser console** (F12 → Console tab)
2. **Click "Create Order & Pay"**
3. **Watch for logs** starting with 🔍, 🔗, ✅, or ❌
4. **Copy all error logs** if any appear
5. **Check the Network tab** to see the actual HTTP request
6. **Look for:**
   - Request URL
   - Request Status (200, 404, 500, etc.)
   - Response body
   - Any error messages

## Quick Checklist

- [ ] Browser console is open
- [ ] Location has valid coordinates
- [ ] Internet connection is working
- [ ] API server is accessible: https://lk-7ly1.onrender.com/api
- [ ] No CORS errors in console
- [ ] Vendor search logs appear in console
- [ ] 15-second timeout triggers if server is slow

## Expected Flow Timeline

```
0s    → Button clicked
0s    → Validation checks pass
0s    → Vendor search starts
0-15s → API call to server
0-15s → Response received OR timeout
0-15s → Alert shown OR order creation starts
```

If it takes longer than 15 seconds without showing an alert, something is wrong with the timeout mechanism.

