# Donation Access Control Implementation

## Overview
Implemented role-based access control (RBAC) for the donation management system. Only **Accountants** can now encode (add/edit/delete) donations, while other roles can only view summaries and reports.

## Changes Made

### 1. **AuthContext.jsx** - Permission System Update
- Added new donation-specific permissions:
  - `view_donations` - All roles except regular users
  - `view_donation_reports` - All roles except regular users
  - `encode_donations` - **Only Accountants**
  - `edit_donations` - **Only Accountants**
  - `delete_donations` - **Only Accountants**
  - `view_own_donations` - Regular users only

**Updated Permission Matrix:**
```javascript
admin:         view_donations, view_donation_reports (READ ONLY)
priest:        view_donations, view_donation_reports (READ ONLY)
church_admin:  view_donations, view_donation_reports (READ ONLY)
accountant:    ALL PERMISSIONS (view, edit, delete, encode)
user:          view_own_donations only
```

### 2. **DonationsCollections.jsx** (Admin Donations Page)
**Changes:**
- ✅ Added `useAuth` hook to get current user role
- ✅ Added `isAccountant` check throughout component
- ✅ Protected `handleAddDonation()` - shows error toast for non-accountants
- ✅ Protected `handleEditDonation()` - shows error toast for non-accountants
- ✅ Protected `handleDelete()` - shows error toast for non-accountants
- ✅ Conditionally renders "Add Donation" button (only for accountants)
- ✅ Updated action buttons in table:
  - **All users:** View and Print buttons
  - **Accountants only:** Edit and Delete buttons
- ✅ Added informational banner for non-accountants explaining access restrictions
- ✅ Updated page description based on user role

**UI Changes:**
- Non-accountants see: "View donation summaries and reports"
- Accountants see: "Manage donation entries and collection summaries"
- Blue info banner appears for non-accountants explaining they have read-only access

### 3. **DonationsLedger.jsx** (Accountant Donations Ledger)
**Changes:**
- ✅ Added `useAuth` hook to check user role
- ✅ Added `isAccountant` boolean flag
- ✅ Conditionally renders "Record New Donation" button (only for accountants)
- ✅ Added informational banner for non-accountants
- ✅ Updated page description based on user role
- ✅ Export and Print functions remain available to all roles

**UI Changes:**
- "Record New Donation" button only visible to accountants
- Non-accountants can still:
  - View all donation records
  - Filter and search donations
  - Print receipts
  - Export to CSV/PDF

### 4. **RecordDonation.jsx** (New Donation Entry Page)
**Changes:**
- ✅ Added `useAuth` hook and `useEffect` for route protection
- ✅ Implemented automatic redirect for non-accountants
- ✅ Shows error toast: "Only accountants can record donations"
- ✅ Redirects back to previous page if access denied

**Route Protection:**
```javascript
useEffect(() => {
  if (user?.role !== 'accountant') {
    showErrorToast('Access Denied', 'Only accountants can record donations');
    navigate(-1); // Go back to previous page
  }
}, [user, navigate]);
```

## User Experience by Role

### 👤 **Regular User**
- Can view only their own donations via `/user/donations`
- Can download their own receipts
- Cannot see other users' donations
- No access to encoding forms

### 👨‍💼 **Admin / Church Admin / Priest**
- Can view all donation summaries and reports
- Can see collection totals and statistics
- Can print receipts and export data
- **Cannot** add, edit, or delete donations
- See informational banner: "View-Only Access"
- Action buttons show: View, Print (no Edit/Delete)

### 💰 **Accountant**
- Full access to all donation features
- Can add new donations
- Can edit existing donations
- Can delete donations
- Can print receipts and export data
- No access restrictions or info banners
- Action buttons show: View, Print, Edit, Delete

## Error Messages

### Access Denied Messages:
1. **Add Donation:** "Only accountants can encode donations"
2. **Edit Donation:** "Only accountants can edit donations"
3. **Delete Donation:** "Only accountants can delete donations"
4. **Record Donation Page:** "Only accountants can record donations" (with auto-redirect)

## Security Features

### 🔒 Frontend Protection
- Button visibility based on role
- Function-level permission checks
- Error toasts for unauthorized attempts
- Automatic page redirects for protected routes
- Visual indicators (info banners) for read-only access

### 📋 Backend Requirements (Future)
To complete the implementation, the backend should:
1. Add role validation in donation API endpoints
2. Return 403 Forbidden for non-accountant encode/edit/delete attempts
3. Filter donations by user ID for regular users
4. Validate user role in middleware before processing donation mutations

## Testing Checklist

### ✅ As Accountant:
- [x] Can add new donations
- [x] Can edit existing donations
- [x] Can delete donations
- [x] Can view all donation records
- [x] Can print receipts
- [x] Can export data
- [x] See "Add Donation" button
- [x] See Edit and Delete buttons in table

### ✅ As Admin/Priest/Church Admin:
- [x] Can view donation summaries
- [x] Can view collection reports
- [x] Can print receipts
- [x] Can export data
- [x] **Cannot** add donations (button hidden)
- [x] **Cannot** edit donations (button hidden + error toast)
- [x] **Cannot** delete donations (button hidden + error toast)
- [x] See informational banner
- [x] See View and Print buttons only

### ✅ As Regular User:
- [x] Can view only own donations
- [x] Can download own receipts
- [x] Cannot access other users' donations
- [x] Cannot access encoding pages

## Files Modified

1. `frontend-react/src/contexts/AuthContext.jsx` - Updated permissions
2. `frontend-react/src/pages/admin/DonationsCollections.jsx` - Added RBAC
3. `frontend-react/src/pages/accountant/DonationsLedger.jsx` - Added RBAC
4. `frontend-react/src/pages/accountant/RecordDonation.jsx` - Added route protection

## Benefits

✅ **Security:** Only authorized users can modify financial records
✅ **Accountability:** Clear separation of who can encode donations
✅ **Transparency:** Other roles can still view and audit donations
✅ **User-Friendly:** Clear messaging about access restrictions
✅ **Flexible:** Easy to adjust permissions in AuthContext if needed

## Future Enhancements

1. Add backend API role validation
2. Add audit log for donation modifications
3. Add approval workflow for large donations
4. Add notification to accountant when non-accountant attempts to edit
5. Add dashboard widget showing recent donations (read-only for non-accountants)
