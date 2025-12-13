# Certificate Request Process Workflow
## Church Record Management System

---

## 📋 Process Overview

This document outlines the complete workflow for requesting, processing, and releasing church certificates in the Church Record Management System. The process ensures proper validation, payment tracking, and official documentation.

---

## 🔄 Workflow Steps

### **STEP 1: Certificate Request Submission**
**Actor:** User/Client (Parishioner)  
**Platform:** User Portal

#### Actions:
1. Log in to the Church Record Management System
2. Navigate to **"Service Requests"** or **"Request Certificate"** section
3. Fill out the certificate request form:
   - **Certificate Type:** Select from Baptism, Marriage, Confirmation, Death
   - **Purpose:** Specify reason (e.g., Employment, Travel, School Requirements)
   - **Personal Details:**
     - Full Name (as per church records)
     - Date of Birth
     - Date of Sacrament (if known)
     - Parent Names (for Baptism)
     - Spouse Name (for Marriage)
     - Contact Information (Email, Phone)
   - **Additional Information:** Special instructions or notes
4. Attach required supporting documents (if any):
   - Valid ID
   - Previous certificates
   - Authorization letter (if requesting on behalf of someone)
5. Submit the request

#### System Actions:
- Generate unique **Request ID**
- Send confirmation email/notification to user
- Create request entry with status: **"Pending Review"**
- Notify Church Admin of new request

---

### **STEP 2: Request Review & Validation**
**Actor:** Church Admin/Secretary  
**Platform:** Church Admin Dashboard

#### Actions:
1. Access **"Service Requests"** module in Church Admin dashboard
2. Review pending certificate requests
3. Verify request details:
   - Check completeness of information
   - Validate purpose and urgency
   - Review attached documents
4. Check client eligibility:
   - Confirm registered member (if required)
   - Verify identity matches church records
5. Update request status:
   - **Approve** → Proceed to Step 3
   - **Request More Info** → Return to user with specific requirements
   - **Reject** → Provide clear reason and close request

#### System Actions:
- Log all review activities in Audit Logs
- Send notification to user about request status
- If approved, trigger automatic record search

---

### **STEP 3: Automatic Record Verification**
**Actor:** System (Automated Process)  
**Platform:** Backend Database

#### System Process:
1. **Search Church Records Database:**
   - Query relevant table based on certificate type:
     - `baptism_records` for Baptism Certificates
     - `marriage_records` for Marriage Certificates
     - `birth_records` for Birth Certificates
     - `confirmation_records` for Confirmation Certificates
   
2. **Match Criteria:**
   - Full name (fuzzy matching for variations)
   - Date of sacrament
   - Parent/Spouse names (where applicable)
   - Church location

3. **Record Status Check:**
   - ✅ **Record Found:** Extract all relevant data
     - Store record ID with request
     - Status: **"Record Verified"**
     - Proceed to Step 4
   
   - ❌ **Record Not Found:** Flag for manual verification
     - Status: **"Manual Verification Required"**
     - Notify Church Admin to manually search archives
     - Church Admin can:
       - Manually link existing record
       - Create new record entry
       - Reject if record doesn't exist

#### Notification:
- Church Admin receives alert about verification result
- User receives status update

---

### **STEP 4: Payment Processing**
**Actor:** Accountant (or Church Admin based on workflow)  
**Platform:** Accountant Dashboard / Payment Module

#### Actions:
1. Access **"Appointments & Payments"** or **"Service Requests"** module
2. View pending requests requiring payment
3. Calculate certificate fee:
   - Base certificate fee (from Event Fee Categories)
   - Rush processing fee (if applicable)
   - Additional copies (if requested)
4. Generate **Payment Invoice** with:
   - Request ID
   - Client name
   - Certificate type
   - Amount due
   - Payment deadline
5. Record payment when received:
   - Payment method (Cash, Bank Transfer, GCash, etc.)
   - Payment date and time
   - Receipt number
   - Received by (staff name)
6. Update payment status in system:
   - Mark as **"Paid"**
   - Attach receipt/proof of payment

#### System Actions:
- Generate **Official Receipt** (OR)
- Send receipt copy to client via email
- Update request status to **"Payment Confirmed"**
- Trigger certificate generation notification to Church Admin
- Log transaction in payment records

---

### **STEP 5: Certificate Generation**
**Actor:** Church Admin/Secretary  
**Platform:** Church Admin Dashboard / Certificate Module

#### Actions:
1. Navigate to **"Service Requests"** with status **"Payment Confirmed"**
2. Select request to generate certificate
3. System loads appropriate certificate template:
   - Uses template uploaded by System Admin in Settings
   - Template format: DOCX, PDF, or HTML
4. **Auto-populate fields** with data:
   - From verified church record (Step 3)
   - From request form (Step 1)
   - System placeholders replaced:
     ```
     {{member_name}} → John Michael Santos
     {{date}} → December 6, 2025
     {{priest_name}} → Fr. Joseph Smith
     {{church_name}} → Our Lady of Peace Church
     {{parents}} → Juan Santos & Maria Santos
     {{sponsors}} → Pedro Reyes & Ana Cruz
     ```
5. **Preview generated certificate:**
   - Check all details for accuracy
   - Verify formatting and alignment
   - Make manual adjustments if needed
6. **Finalize certificate:**
   - Save as PDF
   - Assign certificate number (e.g., CERT-BAP-2025-001)
   - Store in document management system
7. Update request status to **"Certificate Generated"**

#### System Actions:
- Save certificate file with request ID
- Log generation details (who, when, certificate number)
- Notify relevant parties (Priest if signature required, Client)

---

### **STEP 6: Export & Print Certificate**
**Actor:** Church Admin/Secretary  
**Platform:** Certificate Preview Interface

#### Actions:
1. Open generated certificate from request details
2. **Export Options:**
   - **Print:** Direct print to office printer
     - Select printer and paper size (usually A4 or Letter)
     - Set orientation (Portrait/Landscape)
     - Print quality (Normal/High)
   - **Download PDF:** Save digital copy
     - High-resolution PDF file
     - Secured with watermark (optional)
     - File naming: `[CertType]-[Name]-[Date].pdf`
   - **Email:** Send directly to client
     - Attach PDF to email
     - Include instructions for collection

3. **Quality Check:**
   - Verify printed copy quality
   - Check if all details are clearly visible
   - Confirm no printing errors
4. Prepare physical certificate:
   - Use official church letterhead/paper
   - Add church seal/stamp
   - Place in protective folder

---

### **STEP 7: Official Priest Signature** *(If Required)*
**Actor:** Priest/Pastor  
**Platform:** Priest Dashboard or Physical Document

#### Certificate Types Requiring Signature:
- ✅ Baptism Certificate
- ✅ Marriage Certificate  
- ✅ Confirmation Certificate
- ✅ Death Certificate
- ❌ Certification Letter (Church Admin signature may suffice)

#### Process:
1. **Digital Signature (Recommended):**
   - Priest logs into system
   - Access **"Pending Signatures"** in Priest Dashboard
   - Review certificate details
   - Apply digital signature using system
   - System timestamps and records signature

2. **Manual Signature (Traditional):**
   - Church Admin brings printed certificates to Priest
   - Priest reviews and signs each certificate
   - Signs on designated signature line
   - Returns to Church Admin for processing

3. Update certificate status:
   - Mark as **"Signed"**
   - Record signature date and priest name
   - Move to **"Ready for Release"** status

#### System Actions:
- Log signature activity
- Notify Church Admin that certificate is ready for release
- Send notification to client for collection

---

### **STEP 8: Certificate Release**
**Actor:** Church Admin/Secretary  
**Platform:** Church Admin Dashboard / Reception Desk

#### Release Methods:

#### A. **Physical Collection (Walk-in)**
1. Client visits church office during business hours
2. Church Admin verifies identity:
   - Check valid ID
   - Match name with request details
   - Confirm Request ID or OR number
3. Client signs **Certificate Release Log:**
   - Date and time of release
   - Certificate type and number
   - Client signature
   - Staff who released
4. Hand over certificate in sealed envelope
5. Update system status to **"Released"**

#### B. **Digital Delivery (Email/Download)**
1. Send secured PDF via email:
   - Use registered email from request
   - Password-protected PDF (if sensitive)
   - Password sent via SMS
2. Or provide **Download Link:**
   - Temporary secure link (expires in 7 days)
   - Download tracked by system
   - One-time access code required
3. Client confirms receipt
4. Update system status to **"Released - Digital"**

#### C. **Mail Delivery (Courier)**
1. Package certificate securely
2. Send via registered mail/courier
3. Provide tracking number to client
4. System tracks delivery status
5. Upon delivery confirmation, mark as **"Released"**

#### Final System Actions:
- Record release date and time
- Log release method and recipient
- Close service request
- Archive all related documents
- Send **Thank You & Feedback** email to client
- Update statistics (certificates issued report)

---

## 📊 Status Tracking Summary

| Step | Status | Actor | Duration (Estimate) |
|------|--------|-------|---------------------|
| 1. Submission | Pending Review | User | 5-10 minutes |
| 2. Review | Under Review | Church Admin | 1-2 hours |
| 3. Verification | Record Verified / Not Found | System | Instant |
| 4. Payment | Awaiting Payment / Paid | Accountant | 1-3 days |
| 5. Generation | Certificate Generated | Church Admin | 15-30 minutes |
| 6. Export | Ready for Signature | Church Admin | 5-10 minutes |
| 7. Signature | Signed | Priest | 1-2 days |
| 8. Release | Released | Church Admin | Varies |

**Total Processing Time:** 3-7 business days (standard processing)  
**Rush Processing:** 1-2 business days (with additional fee)

---

## 🔔 Notification System

### User Notifications:
- ✉️ Request received confirmation
- ✉️ Request approved/rejected
- ✉️ Payment invoice sent
- ✉️ Payment confirmed
- ✉️ Certificate ready for collection
- ✉️ Certificate released

### Church Admin Notifications:
- 🔔 New certificate request
- 🔔 Payment received
- 🔔 Certificate awaiting generation
- 🔔 Certificate signed and ready

### Priest Notifications:
- 🔔 Certificates pending signature
- 🔔 Signature request reminder

### Accountant Notifications:
- 🔔 Payment received
- 🔔 Pending payment follow-up

---

## 📁 Document Management

### Files Stored in System:
1. **Request Form** (PDF snapshot)
2. **Supporting Documents** (Uploaded by client)
3. **Official Receipt** (Payment proof)
4. **Generated Certificate** (PDF with signature)
5. **Release Form** (Signed acknowledgment)

### Retention Period:
- **Active Requests:** Until completion + 30 days
- **Completed Requests:** Archived for 5 years
- **Certificates:** Permanent record in document management

---

## 🔐 Security & Access Control

### Access Levels:
- **User/Client:** Can only view/manage their own requests
- **Church Admin:** Full access to certificate workflow
- **Accountant:** Payment processing and receipt generation
- **Priest:** Certificate review and signature
- **System Admin:** Template management and system settings

### Audit Trail:
Every action is logged with:
- User who performed action
- Timestamp
- Action type
- Old and new values (for updates)
- IP address and device info

---

## 📈 Reports & Analytics

### Available Reports:
1. **Certificate Requests Summary**
   - Total requests by type and status
   - Processing time analysis
   - Approval/rejection rates

2. **Revenue Report**
   - Certificate fees collected
   - Payment methods breakdown
   - Outstanding payments

3. **Performance Metrics**
   - Average processing time per step
   - Pending requests aging
   - Staff productivity

4. **Sacrament Statistics**
   - Most requested certificate types
   - Seasonal trends
   - Historical data comparison

---

## ✅ Quality Assurance Checklist

Before releasing any certificate, verify:
- [ ] All personal details are accurate and match records
- [ ] Certificate number is assigned and unique
- [ ] Church seal/stamp is applied
- [ ] Priest signature is present (if required)
- [ ] Print quality is clear and professional
- [ ] No spelling or grammatical errors
- [ ] Correct certificate template used
- [ ] Payment is confirmed and recorded
- [ ] Release log is properly documented

---

## 🆘 Troubleshooting & FAQs

### Common Issues:

**Q: Record not found in system?**  
A: Church Admin can manually search archives or create new record entry if verified from physical records.

**Q: Payment not reflecting in system?**  
A: Contact Accountant to manually record payment with reference number.

**Q: Certificate template not loading?**  
A: System Admin needs to upload template in Settings > Certificates section.

**Q: Priest unavailable for signature?**  
A: Authorized priest or parish administrator can sign. Update priest assignment in system.

**Q: Client lost receipt number?**  
A: Search by name and date in service requests to locate transaction.

---

## 📞 Contact & Support

For technical issues or questions:
- **Church Admin Office:** admin@church.com
- **Accountant:** accountant@church.com  
- **System Support:** support@church.com
- **Office Hours:** Monday-Friday, 8:00 AM - 5:00 PM

---

**Document Version:** 1.0  
**Last Updated:** December 6, 2025  
**Prepared By:** Church Record Management System Team  

---

*This workflow ensures efficient, transparent, and secure processing of certificate requests while maintaining the highest standards of church record management.*
