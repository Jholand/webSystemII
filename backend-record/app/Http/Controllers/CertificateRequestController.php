<?php

namespace App\Http\Controllers;

use App\Models\CertificateRequest;
use App\Models\User;
use App\Models\Document;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CertificateRequestController extends Controller
{
    // Get all certificate requests (for admin/church admin)
    public function index(Request $request)
    {
        $user = $request->user();
        $query = CertificateRequest::with(['user', 'approver']);
        
        // If user is not admin, only show their own requests
        if ($user && !in_array($user->role, ['admin', 'church_admin'])) {
            $query->where('user_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('certificate_type')) {
            $query->where('certificate_type', $request->certificate_type);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json($requests);
    }

    // Get certificate requests for a specific user
    public function getUserRequests($userId)
    {
        $requests = CertificateRequest::where('user_id', $userId)
            ->with(['approver'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($requests);
    }

    // Create new certificate request
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'certificate_type' => 'required|in:baptism,marriage,confirmation,death',
            'purpose' => 'required|string|max:255',
            'details' => 'nullable|string',
            'certificate_fee' => 'nullable|numeric|min:0',
            'supporting_documents' => 'nullable|array',
            'supporting_documents.*' => 'file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        // Set user_id from authenticated user
        $validated['user_id'] = $user->id;
        
        // Set default fee if not provided (50 pesos for certificates)
        if (!isset($validated['certificate_fee'])) {
            $validated['certificate_fee'] = 50.00;
        }

        // Handle file uploads
        if ($request->hasFile('supporting_documents')) {
            $uploadedFiles = [];
            foreach ($request->file('supporting_documents') as $file) {
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('certificate_documents', $filename, 'public');
                $uploadedFiles[] = [
                    'original_name' => $file->getClientOriginalName(),
                    'filename' => $filename,
                    'path' => $path,
                    'size' => $file->getSize(),
                    'uploaded_at' => now()->toDateTimeString(),
                ];
                
                // Save to user's documents
                Document::create([
                    'title' => $file->getClientOriginalName(),
                    'description' => 'Certificate Request - ' . ucfirst($validated['certificate_type']),
                    'document_type' => 'Certificate Supporting Document',
                    'category' => 'Certificate Requests',
                    'file_name' => $filename,
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'document_date' => now(),
                    'access_level' => 'members',
                    'status' => 'active',
                    'uploaded_by' => $validated['user_id'],
                ]);
            }
            $validated['supporting_documents'] = $uploadedFiles;
        }

        $certificateRequest = CertificateRequest::create($validated);
        
        // Notify church admin about new certificate request
        NotificationService::notifyChurchAdmins(
            'certificate_request',
            'New Certificate Request',
            'A new ' . ucfirst($certificateRequest->certificate_type) . ' certificate request has been submitted by ' . $user->name,
            $certificateRequest->id
        );
        
        // Notify accountant if there's a fee
        if ($certificateRequest->certificate_fee > 0) {
            NotificationService::notifyAccountants(
                'payment_pending',
                'Certificate Fee Payment Pending',
                'Certificate fee of ₱' . number_format($certificateRequest->certificate_fee, 2) . ' is pending for ' . ucfirst($certificateRequest->certificate_type) . ' certificate from ' . $user->name,
                $certificateRequest->id
            );
        }

        return response()->json([
            'message' => 'Certificate request submitted successfully',
            'data' => $certificateRequest
        ], 201);
    }

    // Update certificate request status
    public function updateStatus(Request $request, $id)
    {
        \Log::info('Status update request', [
            'id' => $id,
            'data' => $request->all()
        ]);

        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,processing,approved,rejected,completed',
                'approved_by' => 'nullable|integer',
                'rejection_reason' => 'nullable|string',
                'admin_notes' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors()
            ]);
            throw $e;
        }

        $certificateRequest = CertificateRequest::findOrFail($id);

        if ($validated['status'] === 'approved') {
            $validated['approved_at'] = now();
        }

        $certificateRequest->update($validated);

        // Notify user about status change
        NotificationService::notifyUserAboutRequestStatus(
            $certificateRequest->user_id,
            'certificate',
            $certificateRequest->id,
            $validated['status']
        );

        return response()->json([
            'message' => 'Certificate request status updated successfully',
            'data' => $certificateRequest
        ]);
    }

    // Upload certificate file (for church admin)
    public function uploadCertificate(Request $request, $id)
    {
        $request->validate([
            'certificate_file' => 'required|file|mimes:pdf|max:5120', // 5MB max
        ]);

        $certificateRequest = CertificateRequest::findOrFail($id);

        // Delete old certificate if exists
        if ($certificateRequest->certificate_file) {
            Storage::disk('public')->delete($certificateRequest->certificate_file);
        }

        // Store new certificate
        $path = $request->file('certificate_file')->store('certificates', 'public');

        $certificateRequest->update([
            'certificate_file' => $path,
            'status' => 'completed',
        ]);

        // Notify user
        NotificationService::notifyUser(
            $certificateRequest->user_id,
            'certificate_ready',
            'Certificate Ready',
            'Your certificate is now available for download!',
            $certificateRequest->id
        );

        return response()->json([
            'message' => 'Certificate uploaded successfully',
            'data' => $certificateRequest
        ]);
    }

    // Download certificate (one-time download for user)
    public function downloadCertificate($id)
    {
        $certificateRequest = CertificateRequest::findOrFail($id);

        if (!$certificateRequest->certificate_file) {
            return response()->json(['message' => 'Certificate not available'], 404);
        }

        if ($certificateRequest->downloaded) {
            return response()->json([
                'message' => 'Certificate has already been downloaded',
                'downloaded_at' => $certificateRequest->downloaded_at
            ], 403);
        }

        // Mark as downloaded
        $certificateRequest->update([
            'downloaded' => true,
            'downloaded_at' => now(),
        ]);

        $filePath = storage_path('app/public/' . $certificateRequest->certificate_file);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'Certificate file not found'], 404);
        }

        return response()->download($filePath);
    }

    // View certificate without downloading (for admin)
    public function viewCertificate($id)
    {
        $certificateRequest = CertificateRequest::findOrFail($id);

        if (!$certificateRequest->certificate_file) {
            return response()->json(['message' => 'Certificate not available'], 404);
        }

        $filePath = storage_path('app/public/' . $certificateRequest->certificate_file);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'Certificate file not found'], 404);
        }

        return response()->file($filePath);
    }

    // Get single certificate request details
    public function show($id)
    {
        $certificateRequest = CertificateRequest::with(['user', 'approver'])->findOrFail($id);
        return response()->json($certificateRequest);
    }

    // Delete certificate request
    public function destroy($id)
    {
        $certificateRequest = CertificateRequest::findOrFail($id);
        
        // Delete certificate file if exists
        if ($certificateRequest->certificate_file) {
            Storage::disk('public')->delete($certificateRequest->certificate_file);
        }

        $certificateRequest->delete();

        return response()->json(['message' => 'Certificate request deleted successfully']);
    }

    // Record payment for certificate request
    public function recordPayment(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_record_id' => 'required|exists:payment_records,id',
        ]);

        $certificateRequest = CertificateRequest::findOrFail($id);

        $certificateRequest->update([
            'payment_status' => 'paid',
            'payment_record_id' => $validated['payment_record_id'],
            'paid_at' => now(),
        ]);

        // Notify user that payment is received
        NotificationService::notifyUser(
            $certificateRequest->user_id,
            'payment_received',
            'Payment Received',
            'Your payment for the certificate has been received.',
            $certificateRequest->id
        );

        return response()->json([
            'message' => 'Payment recorded successfully',
            'data' => $certificateRequest
        ]);
    }

    // Update payment status (for waiving fees)
    public function updatePaymentStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:unpaid,paid,waived',
            'admin_notes' => 'nullable|string',
        ]);

        $certificateRequest = CertificateRequest::findOrFail($id);
        
        $updateData = [
            'payment_status' => $validated['payment_status'],
        ];

        if (isset($validated['admin_notes'])) {
            $updateData['admin_notes'] = $validated['admin_notes'];
        }

        if ($validated['payment_status'] === 'waived') {
            $updateData['paid_at'] = now();
        }

        $certificateRequest->update($updateData);

        return response()->json([
            'message' => 'Payment status updated successfully',
            'data' => $certificateRequest
        ]);
    }



    // Download supporting document
    public function downloadDocument($id, $documentIndex)
    {
        $certificateRequest = CertificateRequest::findOrFail($id);
        
        if (!$certificateRequest->supporting_documents || !isset($certificateRequest->supporting_documents[$documentIndex])) {
            return response()->json(['message' => 'Document not found'], 404);
        }

        $document = $certificateRequest->supporting_documents[$documentIndex];
        $filePath = storage_path('app/public/' . $document['path']);

        if (!file_exists($filePath)) {
            return response()->json([
                'message' => 'File not found on server. This may be test data without actual files.',
                'file_info' => $document
            ], 404);
        }

        return response()->download($filePath, $document['original_name']);
    }
}
