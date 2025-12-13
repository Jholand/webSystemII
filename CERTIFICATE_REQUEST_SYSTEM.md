# Certificate Request System Implementation

## Overview
A comprehensive certificate request and management system that allows users to request certificates, church admins to approve and upload certificates, and users to download them (one-time only).

## Database Schema

### Table: `certificate_requests`
- `id` - Primary key
- `user_id` - Foreign key to users table
- `certificate_type` - Enum: baptism, marriage, confirmation, death, birth
- `purpose` - String: Purpose of the certificate request
- `details` - Text: Additional details (optional)
- `status` - Enum: pending, processing, approved, rejected, completed
- `approved_by` - Foreign key to users table (church admin)
- `approved_at` - Timestamp
- `rejection_reason` - Text: Reason if rejected
- `certificate_file` - String: Path to uploaded PDF certificate
- `downloaded` - Boolean: Whether certificate has been downloaded
- `downloaded_at` - Timestamp: When certificate was downloaded
- `admin_notes` - Text: Internal notes for admins
- `timestamps` - created_at, updated_at
- `soft_deletes` - deleted_at

## Backend API Endpoints

### Certificate Request Management
- `GET /api/certificate-requests` - Get all certificate requests (admin view)
- `GET /api/certificate-requests/user/{userId}` - Get user's certificate requests
- `POST /api/certificate-requests` - Create new certificate request
- `GET /api/certificate-requests/{id}` - Get single certificate request details
- `PUT /api/certificate-requests/{id}/status` - Update request status (approve/reject)
- `POST /api/certificate-requests/{id}/upload` - Upload certificate PDF file
- `GET /api/certificate-requests/{id}/download` - Download certificate (one-time only)
- `GET /api/certificate-requests/{id}/view` - View certificate (admin, no restrictions)
- `DELETE /api/certificate-requests/{id}` - Delete certificate request

## Frontend Components

### User Interface
**File:** `frontend-react/src/pages/user/UserCertificateRequests.jsx`

Features:
- View all certificate requests with status
- Create new certificate request with:
  - Certificate type (dropdown)
  - Purpose (required)
  - Additional details (optional)
- Download completed certificates (one-time only)
- Visual status indicators (pending, processing, approved, completed, rejected)
- Shows rejection reason if rejected

### Church Admin Interface
**File:** `frontend-react/src/pages/churchadmin/ChurchAdminCertificates.jsx`

Features:
- View all certificate requests from all users
- Filter by status and certificate type
- Approve or reject pending requests
- Upload PDF certificates for approved requests
- View uploaded certificates
- Pagination support
- Shows requester information

## Workflow

### 1. User Submits Request
1. User navigates to `/user/certificates`
2. Clicks "New Request" button
3. Fills in certificate type, purpose, and optional details
4. Submits request
5. Request status: **PENDING**

### 2. Church Admin Reviews Request
1. Church admin sees request in `/church-admin/certificates`
2. Reviews requester information and purpose
3. Can either:
   - **Approve**: Changes status to APPROVED
   - **Reject**: Changes status to REJECTED (must provide reason)
4. User receives notification

### 3. Church Admin Uploads Certificate (If Approved)
1. For approved requests, admin clicks "Upload" button
2. Selects PDF certificate file (max 5MB)
3. Uploads certificate
4. Status automatically changes to **COMPLETED**
5. User receives notification that certificate is ready

### 4. User Downloads Certificate
1. User sees "Download" button for completed requests
2. Clicks download button
3. PDF downloads to their computer
4. System marks as downloaded (one-time only)
5. Button becomes disabled with "Downloaded" label
6. User cannot download again

## Notification System

The system automatically creates notifications for users when:
- Certificate request is **approved**
- Certificate request is **rejected**
- Certificate is **ready for download** (completed)

Notifications are stored in the `notifications` table with:
- `type: 'certificate_request'`
- `title: 'Certificate Request Update'`
- Custom message based on status

## Routes Added

### Frontend Routes (App.jsx)
- `/user/certificates` - User certificate requests page
- `/church-admin/certificates` - Admin certificate management page

### Sidebar Menu Items
- **User Menu**: "Certificate Requests" (Award icon)
- **Church Admin Menu**: "Certificate Requests" (Award icon)

## Security Features

1. **One-time Download**: Certificates can only be downloaded once by users
2. **File Validation**: Only PDF files allowed, max 5MB
3. **User Authorization**: Users can only see their own requests
4. **Admin Approval**: Certificates must be approved before upload
5. **Soft Deletes**: Deleted requests are archived, not permanently removed

## API Service

**File:** `frontend-react/src/services/certificateRequestAPI.js`

Provides functions for:
- `getAllCertificateRequests(filters)` - Admin view with filters
- `getUserCertificateRequests(userId)` - User's requests
- `createCertificateRequest(data)` - Submit new request
- `updateCertificateStatus(id, statusData)` - Approve/reject
- `uploadCertificateFile(id, file)` - Upload PDF
- `downloadCertificate(id)` - One-time download
- `viewCertificate(id)` - Admin preview (no restrictions)
- `getCertificateRequest(id)` - Get details
- `deleteCertificateRequest(id)` - Delete request

## Status Flow

```
PENDING (User submits)
   ↓
APPROVED (Admin approves) OR REJECTED (Admin rejects)
   ↓
COMPLETED (Admin uploads certificate PDF)
   ↓
DOWNLOADED (User downloads - one time only)
```

## File Storage

Certificates are stored in:
- **Backend Path**: `storage/app/public/certificates/`
- **Access**: Via Laravel's storage system
- **Format**: PDF only
- **Size Limit**: 5MB maximum

## Migration Command

```bash
php artisan migrate
```

This creates the `certificate_requests` table with all necessary fields.

## Testing the System

1. **As User**:
   - Login as user
   - Go to Certificate Requests in sidebar
   - Create a new request
   - Wait for admin approval

2. **As Church Admin**:
   - Login as church admin
   - Go to Certificate Requests in sidebar
   - See pending requests
   - Approve a request
   - Upload PDF certificate

3. **As User (Download)**:
   - Check notifications for "certificate ready" message
   - Go back to Certificate Requests
   - Click Download button
   - Verify PDF downloads
   - Verify button becomes disabled after download

## Future Enhancements

Possible improvements:
- Email notifications for status updates
- Certificate template generation (auto-generate instead of manual upload)
- Bulk certificate processing
- Certificate expiry dates
- Digital signatures
- Request history and audit trail
- Certificate verification system (QR codes)
