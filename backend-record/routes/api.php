<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\PriestController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\MarriageRecordController;
use App\Http\Controllers\Api\BaptismRecordController;
use App\Http\Controllers\Api\BirthRecordController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ServiceRequestController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CorrectionRequestController;
use App\Http\Controllers\UserNotificationController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PaymentRecordController;
use App\Http\Controllers\DonationCategoryController;
use App\Http\Controllers\EventFeeCategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CertificateRequestController;
use App\Http\Controllers\ServiceRequestTypeController;

// Authentication routes (public)
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Public read-only routes (no authentication required)
Route::get('schedules', [ScheduleController::class, 'index']);
Route::get('schedules/{id}', [ScheduleController::class, 'show']);
Route::get('events', [EventController::class, 'index']);
Route::get('events/{id}', [EventController::class, 'show']);
Route::get('announcements', [AnnouncementController::class, 'index']);
Route::get('announcements/{id}', [AnnouncementController::class, 'show']);
Route::get('service-request-types', [ServiceRequestTypeController::class, 'index']);
Route::get('service-request-types/{id}', [ServiceRequestTypeController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth profile routes
    Route::get('profile', [AuthController::class, 'profile']);
    Route::put('profile', [AuthController::class, 'updateProfile']);
    Route::post('logout', [AuthController::class, 'logout']);
    
    // Member routes
    Route::apiResource('members', MemberController::class);
    Route::post('members/{id}/toggle-status', [MemberController::class, 'toggleStatus']);
    
    // Priest routes
    Route::apiResource('priests', PriestController::class);
    
    // Schedule routes (write operations only - read is public)
    Route::post('schedules', [ScheduleController::class, 'store']);
    Route::put('schedules/{id}', [ScheduleController::class, 'update']);
    Route::delete('schedules/{id}', [ScheduleController::class, 'destroy']);
    
    // Marriage Record routes
    Route::apiResource('marriage-records', MarriageRecordController::class);
    
    // Baptism Record routes
    Route::apiResource('baptism-records', BaptismRecordController::class);
    
    // Birth Record routes
    Route::apiResource('birth-records', BirthRecordController::class);
    
    // Billing routes
    Route::apiResource('billings', BillingController::class);
    
    // Donation routes
    Route::apiResource('donations', DonationController::class);
    
    // Event routes (write operations only - read is public)
    Route::post('events', [EventController::class, 'store']);
    Route::put('events/{id}', [EventController::class, 'update']);
    Route::delete('events/{id}', [EventController::class, 'destroy']);
    
    // Announcement routes (write operations only - read is public)
    Route::post('announcements', [AnnouncementController::class, 'store']);
    Route::put('announcements/{id}', [AnnouncementController::class, 'update']);
    Route::delete('announcements/{id}', [AnnouncementController::class, 'destroy']);
    
    // Document routes
    Route::apiResource('documents', DocumentController::class);
    Route::get('documents/{id}/download', [DocumentController::class, 'download']);
    
    // Service Request routes
    Route::apiResource('service-requests', ServiceRequestController::class);
    Route::put('service-requests/{id}/payment-status', [ServiceRequestController::class, 'updatePaymentStatus']);
    
    // Appointment routes
    Route::apiResource('appointments', AppointmentController::class);
    Route::put('appointments/{id}/payment-status', [AppointmentController::class, 'updatePaymentStatus']);
    
    // Correction Request routes
    Route::apiResource('correction-requests', CorrectionRequestController::class);
    
    // User Notification routes
    Route::apiResource('user-notifications', UserNotificationController::class)->only(['index', 'store', 'update']);
    Route::post('user-notifications/mark-all-read', [UserNotificationController::class, 'markAllAsRead']);
    
    // Audit Log routes
    Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'store']);
    
    // Message routes
    Route::apiResource('messages', MessageController::class);
    Route::post('messages/{id}/mark-read', [MessageController::class, 'markAsRead']);
    Route::post('messages/mark-all-read', [MessageController::class, 'markAllAsRead']);
    
    // Payment Record routes
    Route::apiResource('payment-records', PaymentRecordController::class);
    Route::get('payment-records/user/{userId}', [PaymentRecordController::class, 'getUserPayments']);
    
    // Donation Category routes
    Route::apiResource('donation-categories', DonationCategoryController::class);
    
    // Event Fee Category routes
    Route::apiResource('event-fee-categories', EventFeeCategoryController::class);
    
    // User Management routes
    Route::apiResource('users', UserController::class);
    Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword']);
    Route::post('users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    
    // Certificate Request routes
    Route::apiResource('certificate-requests', CertificateRequestController::class);
    Route::get('certificate-requests/user/{userId}', [CertificateRequestController::class, 'getUserRequests']);
    Route::put('certificate-requests/{id}/status', [CertificateRequestController::class, 'updateStatus']);
    Route::post('certificate-requests/{id}/upload', [CertificateRequestController::class, 'uploadCertificate']);
    Route::get('certificate-requests/{id}/download', [CertificateRequestController::class, 'downloadCertificate']);
    Route::get('certificate-requests/{id}/view', [CertificateRequestController::class, 'viewCertificate']);
    Route::post('certificate-requests/{id}/payment', [CertificateRequestController::class, 'recordPayment']);
    Route::put('certificate-requests/{id}/payment-status', [CertificateRequestController::class, 'updatePaymentStatus']);
    Route::get('certificate-requests/{id}/document/{documentIndex}', [CertificateRequestController::class, 'downloadDocument']);
});
