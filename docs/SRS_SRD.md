# Software Requirements Specification (SRS) / Software Requirements Document (SRD)

## Document Information

| Field | Value |
|-------|-------|
| **Document Title** | Tenga Laundry Customer Application - Software Requirements Specification |
| **Version** | 1.1.0 |
| **Date** | 2024 |
| **Author** | Tenga Laundry Development Team |
| **Status** | Active |

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for the Tenga Laundry Customer Application. The application enables customers to schedule laundry services, track orders, make payments, and manage their laundry needs through mobile (iOS, Android) and web platforms.

### 1.2 Scope
The Tenga Customer Application is a cross-platform application built with Expo/React Native that provides:
- User authentication and account management
- Service selection and order creation
- Real-time order tracking
- Payment processing
- Notification management
- Order history and management

**Out of Scope:**
- Vendor management interface
- Delivery driver interface
- Backend API implementation (handled separately)
- Payment gateway backend integration

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS**: Software Requirements Specification
- **SDD**: Software Design Document
- **API**: Application Programming Interface
- **JWT**: JSON Web Token
- **CORS**: Cross-Origin Resource Sharing
- **SDK**: Software Development Kit
- **UI/UX**: User Interface/User Experience

### 1.4 References
- Backend API Documentation (provided by backend team)
- Expo Documentation: https://docs.expo.dev
- React Native Documentation: https://reactnative.dev

### 1.5 Overview
This document is organized into sections covering:
- Overall description of the system
- Functional requirements
- Non-functional requirements
- Use cases and user stories
- System constraints

---

## 2. Overall Description

### 2.1 Product Perspective
The Tenga Customer Application is part of a larger laundry service ecosystem that includes:
- **Backend API**: RESTful API service handling business logic, data storage, and integrations
- **Vendor Application**: Separate application for laundry vendors
- **Delivery Application**: Separate application for delivery drivers
- **Payment Gateway**: Integration with mobile money providers (Vodacom M-Pesa, Tigo Pesa, Airtel Money, etc.)

### 2.2 Product Functions
The application provides the following main functions:

1. **User Authentication & Authorization**
   - User registration with email/password
   - User login
   - Session management
   - Secure token storage

2. **Service Selection & Order Creation**
   - Browse available laundry services (Wash & Fold, Dry Cleaning, Ironing)
   - Select service items and quantities
   - Schedule pickup and delivery times
   - Select pickup and delivery locations
   - Review order summary

3. **Order Management**
   - View order history
   - Track active orders in real-time
   - View order details
   - Cancel orders (when applicable)

4. **Payment Processing**
   - Automatic network detection (Vodacom, Tigo, Airtel, etc.)
   - Phone number validation and normalization
   - Payment initiation via mobile money
   - Payment status tracking

5. **Notifications**
   - Real-time push notifications
   - In-app notification center
   - Order status updates
   - Payment confirmations

6. **User Profile Management**
   - View and edit profile information
   - Manage saved addresses
   - View order history

### 2.3 User Classes and Characteristics

#### Primary Users: Customers
- **Age Range**: 18-65 years
- **Technical Proficiency**: Basic to intermediate smartphone users
- **Location**: Tanzania (primary market)
- **Language**: English, Swahili (future)
- **Device Types**: iOS, Android smartphones, Web browsers

#### User Characteristics:
- Busy professionals, students, and families
- Need convenient laundry services
- Comfortable with mobile money payments
- Expect real-time updates on service status

### 2.4 Operating Environment

#### Mobile Platforms:
- **iOS**: iOS 13.0 and above
- **Android**: Android 8.0 (API level 26) and above

#### Web Platform:
- Modern web browsers (Chrome, Safari, Firefox, Edge)
- Responsive design for desktop, tablet, and mobile web

#### Network Requirements:
- Internet connection (WiFi or mobile data)
- API endpoint accessible: `https://lk-7ly1.onrender.com/api`

### 2.5 Design and Implementation Constraints

#### Technical Constraints:
- Built with Expo SDK ~52.0.0
- React Native 0.76.9
- TypeScript for type safety
- Must support iOS, Android, and Web platforms
- API communication via RESTful services
- Authentication via JWT tokens

#### Business Constraints:
- Must integrate with existing backend API
- Payment integration with Tanzania mobile money networks
- Compliance with data privacy regulations
- Support for Tanzania market (phone number formats, currency)

#### Regulatory Constraints:
- Data protection and privacy compliance
- Secure handling of payment information
- User consent for location services

### 2.6 Assumptions and Dependencies

#### Assumptions:
- Backend API is available and stable
- Users have internet connectivity
- Users have mobile money accounts for payments
- Users grant location permissions when needed

#### Dependencies:
- Backend API service availability
- Expo services (updates, build services)
- Third-party services (payment gateways, push notifications)
- Device capabilities (GPS, camera for future features)

---

## 3. System Features

### 3.1 Feature 1: User Authentication

#### 3.1.1 Description
Users must authenticate to access the application. The system supports email/password registration and login.

#### 3.1.2 Functional Requirements

**FR-1.1: User Registration**
- The system SHALL allow users to register with email and password
- The system SHALL validate email format
- The system SHALL enforce password strength requirements
- The system SHALL store user credentials securely
- The system SHALL return appropriate error messages for invalid inputs

**FR-1.2: User Login**
- The system SHALL allow users to login with email and password
- The system SHALL validate credentials against backend API
- The system SHALL store authentication token securely (SecureStore on native, AsyncStorage on web)
- The system SHALL redirect authenticated users to home screen
- The system SHALL redirect unauthenticated users to welcome screen

**FR-1.3: Session Management**
- The system SHALL maintain user session using JWT tokens
- The system SHALL automatically attach token to API requests
- The system SHALL handle token expiration (401 errors)
- The system SHALL log out users when token is invalid
- The system SHALL persist session across app restarts

**FR-1.4: Logout**
- The system SHALL provide logout functionality
- The system SHALL clear stored tokens and user data
- The system SHALL redirect to welcome screen after logout

#### 3.1.3 Use Cases

**UC-1.1: Register New User**
- **Actor**: New Customer
- **Precondition**: User is on welcome screen
- **Main Flow**:
  1. User taps "Create Account"
  2. User enters email and password
  3. System validates inputs
  4. System sends registration request to backend
  5. System receives authentication token
  6. System stores token securely
  7. System navigates to home screen
- **Alternative Flow**: 
  - 3a. Invalid email format → Show error message
  - 4a. Email already exists → Show error message
- **Postcondition**: User is authenticated and on home screen

**UC-1.2: Login Existing User**
- **Actor**: Existing Customer
- **Precondition**: User is on welcome screen
- **Main Flow**:
  1. User taps "Login"
  2. User enters email and password
  3. System validates credentials
  4. System sends login request to backend
  5. System receives authentication token
  6. System stores token securely
  7. System navigates to home screen
- **Alternative Flow**:
  - 3a. Invalid credentials → Show error message
- **Postcondition**: User is authenticated and on home screen

---

### 3.2 Feature 2: Service Selection and Order Creation

#### 3.2.1 Description
Users can browse available laundry services, select items, schedule pickup/delivery, and create orders.

#### 3.2.2 Functional Requirements

**FR-2.1: Service Type Selection**
- The system SHALL display available service types (Wash & Fold, Dry Cleaning, Ironing)
- The system SHALL allow users to select one or more service types
- The system SHALL display service descriptions and pricing information

**FR-2.2: Service Items Selection**
- The system SHALL display items available for selected service types
- The system SHALL allow users to select items and specify quantities
- The system SHALL calculate item prices based on quantity
- The system SHALL display running total

**FR-2.3: Location Selection**
- The system SHALL allow users to select pickup location
- The system SHALL allow users to select delivery location
- The system SHALL support location search
- The system SHALL support current location detection (with permission)
- The system SHALL save frequently used addresses

**FR-2.4: Time Scheduling**
- The system SHALL allow users to select preferred pickup time
- The system SHALL allow users to select preferred delivery time
- The system SHALL validate that delivery time is after pickup time
- The system SHALL display available time slots

**FR-2.5: Order Summary**
- The system SHALL display complete order summary
- The system SHALL show selected services, items, quantities, and prices
- The system SHALL show pickup and delivery locations
- The system SHALL show scheduled times
- The system SHALL calculate and display subtotal, tax, and total
- The system SHALL allow users to edit order details before confirmation

**FR-2.6: Order Creation**
- The system SHALL create order via backend API
- The system SHALL validate all required fields
- The system SHALL handle order creation errors gracefully
- The system SHALL navigate to payment screen upon successful order creation

#### 3.2.3 Use Cases

**UC-2.1: Create New Order**
- **Actor**: Authenticated Customer
- **Precondition**: User is logged in and on home screen
- **Main Flow**:
  1. User taps "Schedule a pickup"
  2. User selects service type(s)
  3. User selects service items and quantities
  4. User selects pickup location
  5. User selects delivery location
  6. User selects pickup time
  7. User selects delivery time
  8. System displays order summary
  9. User reviews and confirms order
  10. System creates order via API
  11. System navigates to payment screen
- **Alternative Flow**:
  - 4a. User grants location permission → System uses current location
  - 10a. Order creation fails → Show error, allow retry
- **Postcondition**: Order is created and user is on payment screen

---

### 3.3 Feature 3: Order Tracking and Management

#### 3.3.1 Description
Users can view their order history, track active orders in real-time, and view detailed order information.

#### 3.3.2 Functional Requirements

**FR-3.1: Order List Display**
- The system SHALL display list of user's orders
- The system SHALL show order status, date, and total amount
- The system SHALL support pagination for large order lists
- The system SHALL allow filtering by order status
- The system SHALL support pull-to-refresh

**FR-3.2: Order Details**
- The system SHALL display complete order information
- The system SHALL show order items, quantities, and prices
- The system SHALL show pickup and delivery addresses
- The system SHALL show order timeline and status updates
- The system SHALL show assigned vendor information (when available)

**FR-3.3: Real-time Order Tracking**
- The system SHALL display current order status
- The system SHALL show order progress timeline
- The system SHALL update order status in real-time (via notifications/polling)
- The system SHALL show estimated delivery time

**FR-3.4: Order Cancellation**
- The system SHALL allow cancellation of orders in appropriate statuses
- The system SHALL confirm cancellation with user
- The system SHALL process cancellation via backend API
- The system SHALL update order status after cancellation

#### 3.3.3 Use Cases

**UC-3.1: View Order History**
- **Actor**: Authenticated Customer
- **Precondition**: User is logged in
- **Main Flow**:
  1. User navigates to Orders tab
  2. System fetches user's orders from API
  3. System displays list of orders
  4. User can scroll through orders
  5. User can pull to refresh
- **Postcondition**: User views their order history

**UC-3.2: Track Active Order**
- **Actor**: Authenticated Customer
- **Precondition**: User has an active order
- **Main Flow**:
  1. User views order on home screen or orders list
  2. User taps on order
  3. System displays order details
  4. System shows current status and timeline
  5. System updates status when notifications received
- **Postcondition**: User views real-time order status

---

### 3.4 Feature 4: Payment Processing

#### 3.4.1 Description
Users can make payments for orders using mobile money. The system automatically detects the mobile network provider.

#### 3.4.2 Functional Requirements

**FR-4.1: Network Detection**
- The system SHALL automatically detect mobile network from phone number
- The system SHALL support Vodacom, Tigo, Airtel, Halotel, TTCL, Smile networks
- The system SHALL display detected network to user
- The system SHALL validate phone number format

**FR-4.2: Phone Number Handling**
- The system SHALL accept multiple phone number formats (0755123456, +255755123456, 255755123456)
- The system SHALL normalize phone numbers to international format (+255...)
- The system SHALL validate phone number length and format
- The system SHALL provide real-time validation feedback

**FR-4.3: Payment Initiation**
- The system SHALL display order total amount
- The system SHALL allow user to enter phone number
- The system SHALL show payment confirmation modal
- The system SHALL initiate payment via backend API
- The system SHALL handle payment errors gracefully
- The system SHALL show payment success confirmation

**FR-4.4: Payment Status**
- The system SHALL track payment status
- The system SHALL update order status after successful payment
- The system SHALL handle payment failures

#### 3.4.3 Use Cases

**UC-4.1: Process Payment**
- **Actor**: Authenticated Customer
- **Precondition**: User has created an order and is on payment screen
- **Main Flow**:
  1. System displays order total
  2. User enters phone number
  3. System detects network provider
  4. System shows network badge
  5. User confirms payment
  6. System shows confirmation modal
  7. User confirms payment details
  8. System initiates payment via API
  9. System shows success message
  10. System navigates to order confirmation
- **Alternative Flow**:
  - 3a. Invalid phone number → Show error
  - 8a. Payment fails → Show error, allow retry
- **Postcondition**: Payment is processed and order is confirmed

---

### 3.5 Feature 5: Notifications

#### 3.5.1 Description
Users receive real-time notifications about order status updates, payment confirmations, and other important information.

#### 3.5.2 Functional Requirements

**FR-5.1: Notification Display**
- The system SHALL display in-app notifications
- The system SHALL show notification badge with unread count
- The system SHALL support push notifications (native platforms)
- The system SHALL mark notifications as read

**FR-5.2: Notification Types**
- The system SHALL support order status update notifications
- The system SHALL support payment confirmation notifications
- The system SHALL support vendor assignment notifications
- The system SHALL support pickup/delivery notifications

**FR-5.3: Notification Management**
- The system SHALL allow users to view notification history
- The system SHALL allow users to mark notifications as read
- The system SHALL allow users to mark all notifications as read

#### 3.5.3 Use Cases

**UC-5.1: Receive Order Update Notification**
- **Actor**: Authenticated Customer
- **Precondition**: User has an active order
- **Main Flow**:
  1. Order status changes on backend
  2. Backend sends notification
  3. System receives notification
  4. System displays notification badge
  5. User taps notification
  6. System navigates to order details
- **Postcondition**: User views updated order status

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

**NFR-1: Response Time**
- API requests SHALL complete within 15 seconds
- UI interactions SHALL respond within 100ms
- Order list loading SHALL complete within 3 seconds
- Image loading SHALL be optimized with lazy loading

**NFR-2: Throughput**
- System SHALL support at least 100 concurrent users
- System SHALL handle at least 10 orders per minute per user

**NFR-3: Resource Usage**
- Application size SHALL be optimized for mobile networks
- Memory usage SHALL be reasonable for target devices
- Battery usage SHALL be optimized

### 4.2 Security Requirements

**NFR-4: Authentication Security**
- Authentication tokens SHALL be stored securely (SecureStore on native, encrypted storage on web)
- Tokens SHALL expire and require refresh
- Passwords SHALL never be stored in plain text

**NFR-5: Data Security**
- API communications SHALL use HTTPS
- Sensitive data SHALL be encrypted in transit
- User data SHALL comply with privacy regulations

**NFR-6: Payment Security**
- Payment information SHALL be handled securely
- Payment API calls SHALL be authenticated
- Payment errors SHALL not expose sensitive information

### 4.3 Usability Requirements

**NFR-7: User Interface**
- Interface SHALL be intuitive and easy to navigate
- Interface SHALL follow platform design guidelines (iOS Human Interface Guidelines, Material Design)
- Interface SHALL support both light and dark themes
- Interface SHALL be responsive across different screen sizes

**NFR-8: Accessibility**
- Application SHALL support screen readers (future enhancement)
- Text SHALL be readable with appropriate contrast
- Interactive elements SHALL have adequate touch targets

**NFR-9: Localization**
- Application SHALL support English language
- Application SHALL be prepared for Swahili localization (future)

### 4.4 Reliability Requirements

**NFR-10: Availability**
- Application SHALL handle network failures gracefully
- Application SHALL provide offline indicators
- Application SHALL retry failed requests automatically when appropriate

**NFR-11: Error Handling**
- System SHALL display user-friendly error messages
- System SHALL log errors for debugging
- System SHALL not crash on unexpected errors

### 4.5 Maintainability Requirements

**NFR-12: Code Quality**
- Code SHALL follow TypeScript best practices
- Code SHALL be well-documented
- Code SHALL follow consistent coding standards

**NFR-13: Testing**
- Critical user flows SHALL have automated tests
- Code SHALL have unit test coverage (target: 70%+)

### 4.6 Portability Requirements

**NFR-14: Platform Support**
- Application SHALL work on iOS 13.0+
- Application SHALL work on Android 8.0+
- Application SHALL work on modern web browsers

---

## 5. System Constraints

### 5.1 Technical Constraints
- Must use Expo framework for cross-platform development
- Must integrate with existing backend API
- Must support JWT-based authentication
- Must work with limited network connectivity

### 5.2 Business Constraints
- Must support Tanzania mobile money networks
- Must comply with local regulations
- Must be cost-effective to maintain

### 5.3 Regulatory Constraints
- Must comply with data protection regulations
- Must obtain user consent for location services
- Must handle user data securely

---

## 6. Stakeholders

### 6.1 Primary Stakeholders
- **Customers**: End users of the application
- **Development Team**: Frontend developers, designers
- **Backend Team**: API developers (separate team)
- **Product Managers**: Product requirements and priorities

### 6.2 Secondary Stakeholders
- **Vendors**: Laundry service providers (use separate vendor app)
- **Delivery Drivers**: Delivery personnel (use separate delivery app)
- **Support Team**: Customer support staff
- **Management**: Business stakeholders

---

## 7. Use Case Diagrams

### 7.1 Main Use Cases

```
┌─────────────┐
│   Customer  │
└──────┬──────┘
       │
       ├─── Register Account
       ├─── Login
       ├─── Create Order
       ├─── Select Services
       ├─── Schedule Pickup/Delivery
       ├─── Make Payment
       ├─── Track Order
       ├─── View Order History
       ├─── View Notifications
       └─── Manage Profile
```

### 7.2 Order Creation Flow

```
Start → Select Service Type → Select Items → Select Locations 
→ Schedule Times → Review Summary → Create Order → Payment → Complete
```

---

## 8. Glossary

- **Order**: A customer's request for laundry services
- **Service Type**: Category of laundry service (Wash & Fold, Dry Cleaning, Ironing)
- **Service Item**: Specific item within a service type (e.g., Shirt, Pants)
- **Vendor**: Laundry service provider
- **Pickup**: Collection of laundry items from customer
- **Delivery**: Return of cleaned items to customer
- **Mobile Money**: Mobile payment system (M-Pesa, Tigo Pesa, Airtel Money)
- **JWT**: JSON Web Token for authentication

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | | | |
| Lead Developer | | | |
| QA Lead | | | |

---

**Document End**

