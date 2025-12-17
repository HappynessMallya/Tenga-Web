# System Architecture Document
## Tenga Laundry Customer Application

## Document Information

| Field | Value |
|-------|-------|
| **Document Title** | Tenga Laundry Customer Application - System Architecture |
| **Version** | 1.1.0 |
| **Date** | 2024 |
| **Author** | Tenga Laundry Development Team |
| **Status** | Active |

---

## 1. Introduction

### 1.1 Purpose
This document describes the high-level architecture of the Tenga Laundry Customer Application, including system structure, component interactions, technology stack, and architectural patterns.

### 1.2 Scope
This document covers:
- Overall system architecture
- Technology stack and frameworks
- Component architecture
- Data flow and state management
- Integration patterns
- Platform-specific considerations

### 1.3 Audience
- Software architects
- Developers (frontend, full-stack)
- DevOps engineers
- Technical leads
- Project managers

---

## 2. System Overview

### 2.1 Architecture Pattern
The application follows a **Component-Based Architecture** with:
- **Frontend Framework**: React Native (Expo) with TypeScript
- **State Management**: Zustand (global state) + React Query (server state)
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native) + StyleSheet
- **API Communication**: Axios with interceptors

### 2.2 Platform Support
- **iOS**: Native iOS app (iOS 13.0+)
- **Android**: Native Android app (Android 8.0+)
- **Web**: Progressive Web App (PWA) with responsive design

### 2.3 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Application                      │
│                  (iOS / Android / Web)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   UI Layer   │  │  State Layer  │  │ Service Layer│    │
│  │              │  │               │  │              │    │
│  │ - Components │  │ - Zustand     │  │ - API Calls  │    │
│  │ - Screens    │  │ - React Query │  │ - Business   │    │
│  │ - Navigation │  │ - Context     │  │   Logic      │    │
│  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘    │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                               │
│                    ┌───────▼────────┐                      │
│                    │  API Client    │                      │
│                    │  (Axios)       │                      │
│                    └───────┬────────┘                      │
└────────────────────────────┼──────────────────────────────┘
                             │
                             │ HTTPS/REST
                             │
┌────────────────────────────▼──────────────────────────────┐
│              Backend API Server                            │
│         (https://lk-7ly1.onrender.com/api)                │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Auth API    │  │  Order API   │  │ Payment API  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Vendor API   │  │ Location API │  │ Notify API   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└───────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

### 3.1 Core Framework
- **Expo SDK**: ~52.0.0
- **React Native**: 0.76.9
- **React**: 18.3.1
- **TypeScript**: ^5.1.3

### 3.2 State Management
- **Zustand**: ^5.0.8 (Global application state)
  - User authentication state
  - Order creation state
  - Order list state
  - Location state
  - Garment configuration state
- **React Query (TanStack Query)**: ^5.80.7 (Server state management)
  - API data caching
  - Automatic refetching
  - Optimistic updates
- **React Context**: Theme, Notifications, Auth providers

### 3.3 Navigation
- **Expo Router**: ~4.0.21
  - File-based routing
  - Deep linking support
  - Type-safe navigation

### 3.4 Styling
- **NativeWind**: ^4.2.1 (Tailwind CSS for React Native)
- **React Native StyleSheet**: Platform-specific styling
- **Expo Linear Gradient**: ~14.0.2

### 3.5 API Communication
- **Axios**: ^1.12.2
  - Request/response interceptors
  - Automatic token attachment
  - Error handling
  - CORS handling for web

### 3.6 Storage
- **Expo SecureStore**: ~14.0.1 (Native platforms - secure token storage)
- **AsyncStorage**: 1.23.1 (Web platform - token storage)

### 3.7 UI Components
- **React Native Components**: Core UI elements
- **Expo Vector Icons**: ~14.0.4
- **React Native Maps**: 1.18.0 (Location selection)
- **React Native Gesture Handler**: ~2.20.2
- **React Native Reanimated**: ~3.16.1

### 3.8 Utilities
- **Date-fns**: ^4.1.0 (Date manipulation)
- **Yup**: ^1.7.1 (Form validation)
- **Geokit**: ^1.1.0 (Geolocation utilities)

### 3.9 Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Jest**: Testing framework

---

## 4. Application Architecture

### 4.1 Directory Structure

```
app/
├── _layout.tsx                 # Root layout with providers
├── index.tsx                   # Entry point / routing logic
├── (auth)/                     # Authentication routes
│   ├── _layout.tsx
│   ├── welcome.tsx
│   ├── signin.tsx
│   └── signup.tsx
├── (customer)/                 # Customer routes
│   ├── _layout.tsx
│   ├── tabs/                   # Tab navigation
│   │   ├── home.tsx
│   │   ├── orders.tsx
│   │   ├── account.tsx
│   │   └── service-pricing.tsx
│   ├── service-type.tsx        # Service selection
│   ├── service-items.tsx       # Item selection
│   ├── time-location.tsx       # Schedule & location
│   ├── order-summary.tsx       # Order review
│   ├── payment.tsx             # Payment processing
│   ├── order-tracking.tsx      # Order tracking
│   └── notifications.tsx       # Notifications
├── api/
│   └── axiosInstance.ts        # Axios configuration
├── components/                  # Reusable UI components
│   ├── common/                 # Common components
│   ├── order/                  # Order-related components
│   ├── payment/                 # Payment components
│   └── notification/            # Notification components
├── config/                      # Configuration files
│   ├── environment.ts
│   └── notification.config.ts
├── constants/                   # App constants
│   ├── api.ts                   # API endpoints
│   ├── routes.ts                # Route definitions
│   └── validation.ts            # Validation rules
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useOrders.ts
│   ├── usePayment.ts
│   └── useLocation.ts
├── navigation/                  # Navigation configuration
│   ├── auth.ts
│   ├── customer.ts
│   └── types.ts
├── providers/                   # Context providers
│   ├── AuthProvider.tsx
│   ├── ThemeProvider.tsx
│   ├── NotificationProvider.tsx
│   └── QueryProvider.tsx
├── services/                    # Business logic & API calls
│   ├── authService.ts
│   ├── orderService.ts
│   ├── orderCreationService.ts
│   ├── paymentService.ts
│   └── vendorService.ts
├── store/                       # Zustand stores
│   ├── userStore.ts
│   ├── ordersStore.ts
│   ├── orderCreationStore.ts
│   └── locationStore.ts
├── types/                       # TypeScript type definitions
│   ├── auth.ts
│   ├── order.ts
│   ├── payment.ts
│   └── vendor.ts
└── utils/                       # Utility functions
    ├── storage.ts
    ├── validation.ts
    ├── format.ts
    └── error-handling.ts
```

### 4.2 Component Architecture

#### 4.2.1 Layer Structure

```
┌─────────────────────────────────────────┐
│         Presentation Layer               │
│  (Screens, Components, UI)               │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│  (Hooks, Services, State Management)    │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│  (API Client, Storage, Network)         │
└─────────────────────────────────────────┘
```

#### 4.2.2 Component Hierarchy

```
RootLayout
├── QueryProvider (React Query)
│   └── AuthProvider
│       └── GlobalErrorHandler
│           └── ThemeProvider
│               └── NotificationProvider
│                   └── SafeAreaProvider
│                       └── Stack Navigator
│                           ├── (auth) Routes
│                           └── (customer) Routes
│                               └── Tab Navigator
│                                   ├── Home Screen
│                                   ├── Orders Screen
│                                   └── Account Screen
```

### 4.3 State Management Architecture

#### 4.3.1 State Management Strategy

The application uses a **hybrid state management approach**:

1. **Zustand Stores** (Global Client State)
   - User authentication state
   - Order creation workflow state
   - Location preferences
   - UI preferences (theme, etc.)

2. **React Query** (Server State)
   - API data caching
   - Automatic background refetching
   - Optimistic updates
   - Request deduplication

3. **React Context** (Cross-cutting Concerns)
   - Theme configuration
   - Notification system
   - Auth context (simplified)

#### 4.3.2 State Flow Diagram

```
User Action
    │
    ▼
Component (UI)
    │
    ▼
Hook (useAuth, useOrders, etc.)
    │
    ├──► Zustand Store (Client State)
    │         │
    │         └──► Persist to Storage
    │
    └──► React Query (Server State)
              │
              └──► API Service
                        │
                        └──► Backend API
```

### 4.4 Data Flow Architecture

#### 4.4.1 Request Flow

```
1. User Interaction
   │
   ▼
2. Component Event Handler
   │
   ▼
3. Custom Hook (useOrders, useAuth, etc.)
   │
   ▼
4. Service Function (orderService.getOrders())
   │
   ▼
5. Axios Instance (with interceptors)
   │
   ├──► Request Interceptor
   │     - Attach JWT token
   │     - Add headers
   │
   ▼
6. Backend API
   │
   ▼
7. Response Interceptor
   │     - Handle errors
   │     - Refresh tokens
   │
   ▼
8. React Query Cache
   │
   ▼
9. Component Re-render
```

#### 4.4.2 Authentication Flow

```
1. User Login
   │
   ▼
2. authService.login()
   │
   ▼
3. API Call → Backend
   │
   ▼
4. Receive JWT Token
   │
   ▼
5. Store Token (SecureStore/AsyncStorage)
   │
   ▼
6. Update Zustand userStore
   │
   ▼
7. Axios Interceptor attaches token to future requests
```

### 4.5 API Integration Architecture

#### 4.5.1 API Client Configuration

- **Base URL**: Configurable via environment variables
- **Platform-specific handling**:
  - Web: Uses proxy server in development (CORS handling)
  - Native: Direct API calls
- **Interceptors**:
  - Request: Auto-attach JWT token
  - Response: Handle 401 errors, network errors

#### 4.5.2 API Service Pattern

Each domain has a dedicated service:
- `authService.ts` - Authentication endpoints
- `orderService.ts` - Order management endpoints
- `orderCreationService.ts` - Order creation workflow
- `paymentService.ts` - Payment processing
- `vendorService.ts` - Vendor information
- `locationService.ts` - Location services

---

## 5. Platform-Specific Architecture

### 5.1 iOS Architecture

- **Build System**: Expo EAS Build
- **Bundle Identifier**: `com.tengalaundry.app`
- **Minimum iOS Version**: 13.0
- **Storage**: SecureStore for sensitive data
- **Navigation**: Native stack navigation
- **Deep Linking**: Custom URL scheme `com.tengalaundry.app://`

### 5.2 Android Architecture

- **Build System**: Expo EAS Build
- **Package Name**: `com.tengalaundry.app`
- **Minimum SDK**: API Level 26 (Android 8.0)
- **Target SDK**: API Level 35
- **Storage**: SecureStore for sensitive data
- **Navigation**: Native stack navigation
- **Deep Linking**: Custom intent filters

### 5.3 Web Architecture

- **Build Tool**: Expo Web (Metro bundler)
- **Deployment**: Vercel/Netlify
- **Storage**: AsyncStorage (localStorage)
- **CORS Handling**: Proxy server in development
- **Responsive Design**: Tailwind CSS breakpoints
- **PWA Support**: Service workers, offline support

---

## 6. Integration Architecture

### 6.1 Backend API Integration

- **Protocol**: RESTful HTTP/HTTPS
- **Authentication**: JWT Bearer tokens
- **Data Format**: JSON
- **Error Handling**: Standardized error responses
- **Base URL**: `https://lk-7ly1.onrender.com/api`

### 6.2 Payment Gateway Integration

- **Provider**: Mobile Money (M-Pesa, Tigo Pesa, Airtel Money)
- **Integration**: Via backend API
- **Network Detection**: Automatic detection from phone number
- **Flow**: Frontend → Backend → Payment Gateway → Backend → Frontend

### 6.3 Notification Integration

- **Push Notifications**: Expo Push Notification service
- **In-App Notifications**: Real-time via backend WebSocket/polling
- **Notification Types**: Order updates, payment confirmations, vendor assignments

### 6.4 Location Services Integration

- **Provider**: Expo Location
- **Permissions**: Location access (when in use, always)
- **Features**: Current location, location search, address autocomplete

---

## 7. Security Architecture

### 7.1 Authentication Security

- **Token Storage**:
  - Native: SecureStore (encrypted, keychain/keystore)
  - Web: AsyncStorage (localStorage - encrypted in production)
- **Token Management**: Automatic token attachment via Axios interceptors
- **Token Expiration**: Automatic logout on 401 errors

### 7.2 Data Security

- **HTTPS**: All API communications over HTTPS
- **Sensitive Data**: Never stored in plain text
- **Input Validation**: Client-side validation with Yup
- **Error Handling**: No sensitive data in error messages

### 7.3 Platform Security

- **iOS**: Keychain for secure storage
- **Android**: Android Keystore for secure storage
- **Web**: HTTPS-only, secure cookies (if applicable)

---

## 8. Performance Architecture

### 8.1 Optimization Strategies

- **Code Splitting**: Route-based code splitting (Expo Router)
- **Image Optimization**: Lazy loading, optimized formats
- **State Management**: Efficient Zustand stores with selective updates
- **API Caching**: React Query automatic caching and deduplication
- **Bundle Size**: Tree shaking, dead code elimination

### 8.2 Caching Strategy

- **API Responses**: React Query cache (configurable TTL)
- **User Preferences**: Zustand persist middleware
- **Images**: Platform-native caching
- **Static Assets**: CDN caching (production)

---

## 9. Error Handling Architecture

### 9.1 Error Handling Layers

1. **Component Level**: Try-catch in event handlers
2. **Hook Level**: Error states in custom hooks
3. **Service Level**: API error handling
4. **Global Level**: ErrorBoundary, GlobalErrorHandler

### 9.2 Error Types

- **Network Errors**: Handled by Axios interceptors
- **API Errors**: Standardized error responses
- **Validation Errors**: Client-side validation feedback
- **Runtime Errors**: ErrorBoundary catch-all

---

## 10. Testing Architecture

### 10.1 Testing Strategy

- **Unit Tests**: Jest for utility functions, services
- **Component Tests**: React Native Testing Library
- **Integration Tests**: API integration tests
- **E2E Tests**: (Future) Detox or similar

### 10.2 Test Coverage

- Target: 70%+ code coverage
- Critical paths: Authentication, Order creation, Payment

---

## 11. Deployment Architecture

### 11.1 Build Process

- **Development**: Expo Go / Web dev server
- **Staging**: EAS Build (preview builds)
- **Production**: EAS Build (production builds)

### 11.2 Distribution

- **iOS**: App Store (via EAS Submit)
- **Android**: Google Play Store (via EAS Submit)
- **Web**: Vercel/Netlify deployment

### 11.3 Update Strategy

- **OTA Updates**: Expo Updates (for non-native changes)
- **Native Updates**: New app version required

---

## 12. Future Architecture Considerations

### 12.1 Scalability

- **Micro-frontends**: Potential for modular architecture
- **State Management**: Consider Redux for complex state
- **Caching**: Advanced caching strategies

### 12.2 Performance

- **Code Splitting**: Further optimization
- **Bundle Size**: Further reduction
- **Image Optimization**: Advanced image handling

### 12.3 Features

- **Offline Support**: Enhanced offline capabilities
- **Real-time**: WebSocket integration for real-time updates
- **Analytics**: User analytics integration

---

## 13. Diagrams

### 13.1 System Context Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Tenga Laundry Ecosystem                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Customer   │   │    Vendor    │   │   Delivery   │
│    App       │   │     App      │   │     App      │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
       └──────────────────┼───────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   Backend API    │
              │   (Supabase)     │
              └────────┬─────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Database   │ │   Storage    │ │   Payment    │
│  (PostgreSQL)│ │   (Supabase) │ │   Gateway    │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 13.2 Component Interaction Diagram

```
┌─────────────┐
│   Screen    │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐
│    Hook     │─────►│   Store     │
│ (useOrders) │      │ (Zustand)   │
└──────┬──────┘      └─────────────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐
│  Service    │─────►│ React Query │
│ (orderService)│    │   Cache     │
└──────┬──────┘      └─────────────┘
       │
       ▼
┌─────────────┐
│ Axios Client│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Backend API │
└─────────────┘
```

---

## 14. Glossary

- **Expo**: Framework and platform for React Native development
- **Zustand**: Lightweight state management library
- **React Query**: Server state management library
- **Expo Router**: File-based routing system for Expo
- **NativeWind**: Tailwind CSS for React Native
- **SecureStore**: Secure storage for sensitive data (native)
- **AsyncStorage**: Key-value storage (web/native)
- **JWT**: JSON Web Token for authentication
- **CORS**: Cross-Origin Resource Sharing
- **PWA**: Progressive Web App

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Architect | | | |
| Lead Developer | | | |
| Technical Lead | | | |

---

**Document End**

