# Notification System Implementation

## Overview
The system now has a comprehensive notification flow that connects users, church admins, and accountants.

## Notification Service
Located: `backend-record/app/Services/NotificationService.php`

### Methods:
- `notifyChurchAdmins()` - Send notification to all church admins
- `notifyAccountants()` - Send notification to all accountants
- `notifyUser()` - Send notification to a specific user
- `notifyUserAboutRequestStatus()` - Notify user when request status changes

## Notification Flow

### 1. Certificate Requests

#### When User Submits Certificate Request:
- ✅ **Church Admin** receives notification: "New Certificate Request"
- ✅ **Accountant** receives notification (if fee > 0): "Certificate Fee Payment Pending"

#### When Status Changes:
- ✅ **User** receives notification for: pending, processing, approved, rejected, completed

#### When Payment is Confirmed:
- ✅ **User** receives notification: "Payment Received"

#### When Certificate is Uploaded:
- ✅ **User** receives notification: "Certificate Ready"

---

### 2. Service Requests

#### When User Submits Service Request:
- ✅ **Church Admin** receives notification: "New Service Request"
- ✅ **Accountant** receives notification (if fee > 0): "Service Fee Payment Pending"

#### When Status Changes:
- ✅ **User** receives notification for: pending, processing, approved, rejected, completed

#### When Payment is Confirmed:
- ✅ **User** receives notification: "Payment Confirmed"

---

### 3. Correction Requests

#### When User Submits Correction Request:
- ✅ **Church Admin** receives notification: "New Correction Request"

#### When Status Changes:
- ✅ **User** receives notification for: pending, approved, rejected

---

## Updated Controllers

1. **CertificateRequestController.php**
   - Uses NotificationService for all notifications
   - Notifies church admins on new request
   - Notifies accountants when payment is involved
   - Notifies users on status changes

2. **ServiceRequestController.php**
   - Uses NotificationService for all notifications
   - Notifies church admins on new request
   - Notifies accountants when payment is involved
   - Notifies users on status changes and payment confirmation

3. **CorrectionRequestController.php**
   - Uses NotificationService for all notifications
   - Notifies church admins on new request
   - Notifies users on status changes

## Notification Types

- `certificate_request` - Certificate request related
- `service_request` - Service request related
- `correction_request` - Correction request related
- `payment_pending` - Payment is pending
- `payment_received` - Payment has been received
- `request_status` - Request status has changed
- `certificate_ready` - Certificate is ready for download

## Status Messages

### Request Statuses:
- **pending**: "Your request has been received and is pending review."
- **processing**: "Your request is now being processed."
- **approved**: "Your request has been approved."
- **completed**: "Your request has been completed."
- **rejected**: "Your request has been rejected."

## Frontend Integration

Notifications are displayed in:
- User Dashboard: Bell icon with unread count
- Church Admin Dashboard: Bell icon with unread count
- Accountant Dashboard: Bell icon with unread count

Real-time updates happen through:
- Auto-refresh every 30 seconds
- Manual refresh on user action
- Notification polling in dataSync.js

## Database

Table: `user_notifications`
Fields:
- `user_id` - Who receives the notification
- `type` - Type of notification
- `title` - Notification title
- `message` - Notification message
- `read` - Boolean if notification has been read
- `request_id` - Optional link to related request
- `created_at` / `updated_at` - Timestamps
