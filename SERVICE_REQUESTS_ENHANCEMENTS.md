# SERVICE REQUESTS MODULE ENHANCEMENTS

## Summary
Enhanced the Service Requests module with certificate dropdown, simplified "My Requests" page, and integrated approval/payment workflows connecting church admin and accountant roles.

## Changes Made

### 1. Certificate Type Dropdown Enhancement
**File**: `frontend-react/src/pages/user/NewServiceRequest.jsx`

Added dropdown selects for specific field types instead of text inputs:
- **certificate_type**: Baptismal, Confirmation, Marriage, First Communion, Death, Church Membership
- **intention_type**: Thanksgiving, Petition, Soul of Deceased, Healing, Guidance, Birthday, Anniversary
- **blessing_type**: House, Vehicle, Business, Office, Other
- **venue_type**: Main Church, Chapel, Parish Hall, Meeting Room, Outdoor Garden

### 2. My Service Requests Page (New)
**File**: `frontend-react/src/pages/user/MyServiceRequests.jsx` (NEW)

Created clean, simplified requests history page with:
- Search functionality by service type or category
- Filter by status (pending, approved, processing, completed, rejected)
- Table view showing:
  - Request Date
  - Service Type
  - Category
  - Status badge
  - Payment status badge
  - Service fee
  - View action button
- View modal with complete request details including:
  - Request ID and submission date
  - Service details from JSON
  - Payment information
  - Preferred date
  - Admin notes
  - Assigned staff

**Route Added**: `/user/my-service-requests`

**Sidebar Updated**: Changed "My Requests" to "My Service Requests" linking to new page

### 3. Church Admin Service Requests Management (Updated)
**File**: `frontend-react/src/pages/churchadmin/ServiceRequests.jsx` (REPLACED)

Complete rewrite to work with new schema:
- Stats cards: Total Requests, Pending, Approved, Completed
- Filter by status and category
- Search functionality
- Table view with all requests showing:
  - Request ID
  - Service Type and Category
  - Requested by (user name)
  - Submission date
  - Status badge
  - Payment status and fee
  - Action buttons (View, Approve, Reject)
- Detailed view modal with:
  - Request details from JSON
  - Payment information
  - Staff assignment dropdown
  - Admin notes input
  - Approve/Reject actions with confirmation dialogs

**Workflow Features**:
- Approve requests with optional notes
- Reject requests with required reason
- Assign staff members to requests
- View all request details
- Filter by approval status

### 4. Accountant Service Payments Page (New)
**File**: `frontend-react/src/pages/accountant/ServicePayments.jsx` (NEW)

Created dedicated payment processing page for service requests:
- Stats cards: Total Payable, Unpaid, Paid, Total Amount
- Filter by payment status and category
- Search functionality
- Shows only requests that require payment
- Table view displaying:
  - Request ID
  - Service Type and Category
  - User name
  - Request date
  - Service fee amount
  - Payment status badge
  - Action buttons (View, Mark Paid)
- Payment details modal with:
  - Large service fee display
  - Request information
  - Service details
  - Admin notes
  - Payment actions (Mark as Paid, Waive Payment)

**Route Added**: `/accountant/service-payments`

**Sidebar Updated**: Added "Service Payments" link for accountant role

### 5. Backend Updates
**File**: `backend-record/app/Http/Controllers/ServiceRequestController.php`

Updated controller to work with new schema:
- Updated `index()` method:
  - Changed relationships from `processedBy` to `assignedStaff` and added `serviceRequestType`
  - Updated filters to use `category` and `payment_status` instead of old fields
  - Changed response to include `data` wrapper
  - Updated search to query service type name and JSON fields

- Updated `store()` method:
  - Changed validation to require `service_request_type_id`, `category`, `details_json`
  - Set default status to `pending` (lowercase)
  - Set payment_status based on service_fee
  - Updated notifications to use new service type relationship

- Updated `show()` method:
  - Changed relationships loaded
  - Added `data` wrapper to response

- Updated `update()` method:
  - Added validation for new fields: `assigned_staff_id`, `payment_status`
  - Updated status validation to include new states
  - Removed `processed_by` and `processed_at` logic
  - Simplified notification logic

- Updated `updatePaymentStatus()` method:
  - Changed from `is_paid` boolean to `payment_status` enum
  - Support for paid, unpaid, processing, waived statuses
  - Updated notification message

### 6. API Service Updates
**File**: `frontend-react/src/services/serviceRequestAPI.js`

Added new methods:
- `approve(id, notes)`: Approve request with optional notes
- `reject(id, reason)`: Reject request with required reason
- `assignStaff(id, staffId)`: Assign staff member to request

### 7. Routes Configuration
**File**: `frontend-react/src/App.jsx`

Added new routes:
- `/user/my-service-requests` → MyServiceRequests component
- `/accountant/service-payments` → ServicePayments component

Added import for:
- MyServiceRequests from './pages/user/MyServiceRequests'
- ServicePayments from './pages/accountant/ServicePayments'

### 8. Navigation Updates
**File**: `frontend-react/src/components/Sidebar.jsx`

Updated navigation menus:
- **User menu**: Changed "My Requests" to "My Service Requests" with new route
- **Accountant menu**: Added "Service Payments" link

## Database Schema Reference

### service_requests table
- `id`: Primary key
- `user_id`: Foreign key to users
- `service_request_type_id`: Foreign key to service_request_types
- `category`: Enum (sacrament, document, facility)
- `details_json`: JSON field with form data
- `preferred_date`: Date
- `service_fee`: Decimal
- `status`: Enum (pending, approved, rejected, processing, completed)
- `payment_status`: Enum (unpaid, paid, processing, waived)
- `admin_notes`: Text
- `assigned_staff_id`: Foreign key to users
- `donation_id`: Foreign key to donations
- `special_instructions`: Text
- `scheduled_date`: Date
- `scheduled_time`: Time
- `created_at`, `updated_at`

### service_request_types table
- `id`: Primary key
- `category`: String
- `type_code`: String (unique)
- `type_name`: String
- `description`: Text
- `required_fields`: JSON array
- `optional_fields`: JSON array
- `default_fee`: Decimal
- `requires_payment`: Boolean
- `requires_documents`: Boolean
- `requires_approval`: Boolean
- `is_active`: Boolean

## Workflow Integration

### User Flow
1. User creates service request via "New Service Request" page
2. Selects service type from categorized dropdown
3. Fills dynamic form with dropdowns for specific fields (certificate type, etc.)
4. Submits request → Status: pending, Payment: unpaid (if applicable)
5. Views all requests in "My Service Requests" page with status tracking
6. Receives notifications when status changes

### Church Admin Flow
1. Receives notification of new service request
2. Views request in "Service Requests Management" page
3. Reviews request details, service type, and user information
4. Can approve or reject with notes/reason
5. Can assign staff member to handle the request
6. Approval changes status to "approved"
7. User receives notification of approval

### Accountant Flow
1. Receives notification of new payable request
2. Views request in "Service Payments" page
3. Sees only requests that require payment
4. Reviews payment details and service fee
5. Can mark as paid when payment received
6. Can waive payment if authorized
7. User receives notification of payment confirmation

## Key Features Implemented

✅ Certificate type dropdown with predefined options
✅ Intention type dropdown for mass intentions
✅ Blessing type dropdown for house blessings
✅ Venue type dropdown for facility reservations
✅ Simplified "My Service Requests" page with table view
✅ Search and filter functionality on all pages
✅ Status badges (pending, approved, rejected, processing, completed)
✅ Payment status badges (unpaid, paid, processing, waived)
✅ Church admin approval workflow with notes
✅ Staff assignment system
✅ Accountant payment processing page
✅ Payment confirmation and waiving
✅ Real-time stats on admin and accountant dashboards
✅ Detailed view modals for all roles
✅ Notification system integration
✅ Responsive table designs

## Testing Checklist

### User Tests
- [ ] Create new service request with certificate dropdown
- [ ] View "My Service Requests" page
- [ ] Search and filter requests
- [ ] View request details modal
- [ ] Verify status badges display correctly

### Church Admin Tests
- [ ] View all pending requests
- [ ] Approve request with notes
- [ ] Reject request with reason
- [ ] Assign staff member
- [ ] Filter by status and category
- [ ] Search requests

### Accountant Tests
- [ ] View service payments page
- [ ] See only payable requests
- [ ] Mark payment as paid
- [ ] Waive payment
- [ ] View payment details
- [ ] Filter by payment status

### Integration Tests
- [ ] User creates request → Church admin sees it
- [ ] Church admin approves → User sees status change
- [ ] Payable request → Accountant sees in payment page
- [ ] Payment marked paid → User notified
- [ ] Notifications sent correctly at each stage

## API Endpoints Used

- `GET /api/service-requests` - List requests with filters
- `POST /api/service-requests` - Create new request
- `GET /api/service-requests/:id` - Get request details
- `PUT /api/service-requests/:id` - Update request (approve, reject, assign)
- `PUT /api/service-requests/:id/payment-status` - Update payment status
- `GET /api/service-request-types` - List available service types
- `GET /api/users?role=priest,church_admin` - Get staff for assignment

## Files Modified

1. `frontend-react/src/pages/user/NewServiceRequest.jsx` - Added dropdowns
2. `frontend-react/src/pages/user/MyServiceRequests.jsx` - NEW FILE
3. `frontend-react/src/pages/churchadmin/ServiceRequests.jsx` - REPLACED
4. `frontend-react/src/pages/churchadmin/ServiceRequests_OLD.jsx` - BACKUP
5. `frontend-react/src/pages/accountant/ServicePayments.jsx` - NEW FILE
6. `frontend-react/src/App.jsx` - Added routes and imports
7. `frontend-react/src/components/Sidebar.jsx` - Updated navigation
8. `frontend-react/src/services/serviceRequestAPI.js` - Added approve/reject/assign methods
9. `backend-record/app/Http/Controllers/ServiceRequestController.php` - Updated for new schema

## Next Steps (Optional Enhancements)

- [ ] Add email notifications for approvals/rejections
- [ ] Create receipt generation for paid requests
- [ ] Add payment proof upload functionality
- [ ] Implement scheduling calendar integration
- [ ] Add bulk approval/rejection for church admin
- [ ] Create detailed payment reports
- [ ] Add request cancellation feature for users
- [ ] Implement request editing (before approval)
- [ ] Add file attachment support for document requests
- [ ] Create automated payment reminders
