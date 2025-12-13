<?php

namespace App\Http\Controllers;

use App\Models\ServiceRequest;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = ServiceRequest::with(['user', 'serviceRequestType', 'assignedStaff']);
        
        // If user is not admin/staff, only show their own requests
        if ($user && !in_array($user->role, ['admin', 'church_admin', 'priest', 'accountant'])) {
            $query->where('user_id', $user->id);
        } elseif ($request->has('user_id')) {
            // Allow admin to filter by user_id
            $query->where('user_id', $request->user_id);
        }

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->whereHas('serviceRequestType', function($sq) use ($request) {
                    $sq->where('type_name', 'like', '%' . $request->search . '%');
                })
                ->orWhere('category', 'like', '%' . $request->search . '%')
                ->orWhereRaw("JSON_EXTRACT(details_json, '$.full_name') like ?", ['%' . $request->search . '%']);
            });
        }

        return response()->json([
            'data' => $query->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'service_request_type_id' => 'required|exists:service_request_types,id',
            'category' => 'required|string',
            'details_json' => 'required|array',
            'preferred_date' => 'nullable|date',
            'service_fee' => 'nullable|numeric',
            'special_instructions' => 'nullable|string',
        ]);

        $validated['user_id'] = $user->id;
        $validated['status'] = 'pending';
        $validated['payment_status'] = $validated['service_fee'] > 0 ? 'unpaid' : null;

        $serviceRequest = ServiceRequest::create($validated);
        
        $serviceType = $serviceRequest->serviceRequestType->type_name;
        
        // If there's a service fee, notify accountant first for payment processing
        if ($validated['service_fee'] > 0) {
            NotificationService::notifyAccountants(
                'payment_pending',
                'Payment Required - Service Request',
                'Payment of ₱' . number_format($validated['service_fee'], 2) . ' is required for ' . $serviceType . ' before approval',
                $serviceRequest->id
            );
        } else {
            // If no payment required, notify church admin directly
            NotificationService::notifyChurchAdmins(
                'service_request',
                'New Service Request',
                'A new ' . $serviceType . ' request has been submitted',
                $serviceRequest->id
            );
        }

        return response()->json([
            'data' => $serviceRequest->load(['user', 'serviceRequestType'])
        ], 201);
    }

    public function show($id)
    {
        $serviceRequest = ServiceRequest::with(['user', 'serviceRequestType', 'assignedStaff'])->findOrFail($id);
        return response()->json(['data' => $serviceRequest]);
    }

    public function update(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::with('user')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:pending,approved,rejected,processing,completed,scheduled,cancelled',
            'scheduled_date' => 'nullable|date',
            'scheduled_time' => 'nullable|string',
            'admin_notes' => 'nullable|string',
            'assigned_staff_id' => 'nullable|exists:users,id',
            'service_fee' => 'nullable|numeric',
            'payment_status' => 'nullable|in:unpaid,paid,processing,waived',
        ]);

        $oldStatus = $serviceRequest->status;
        
        $serviceRequest->update($validated);

        // Send notification to user if status changed
        if (isset($validated['status']) && $validated['status'] !== $oldStatus) {
            $newStatus = $validated['status'];
            
            // Only send notification if user_id exists
            if ($serviceRequest->user_id) {
                NotificationService::notifyUserAboutRequestStatus(
                    $serviceRequest->user_id,
                    'service',
                    $serviceRequest->id,
                    strtolower($newStatus)
                );
            }
        }

        return response()->json(['data' => $serviceRequest->load(['user', 'serviceRequestType', 'assignedStaff'])]);
    }

    public function destroy($id)
    {
        $serviceRequest = ServiceRequest::findOrFail($id);
        $serviceRequest->delete();

        return response()->json(['message' => 'Service request deleted successfully']);
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:unpaid,paid,processing,waived',
            'donation_id' => 'nullable|integer',
        ]);

        $serviceRequest = ServiceRequest::findOrFail($id);
        $serviceRequest->update($validated);
        
        $serviceType = $serviceRequest->serviceRequestType->type_name;
        
        // Notify user if payment is confirmed
        if ($validated['payment_status'] === 'paid' || $validated['payment_status'] === 'waived') {
            NotificationService::notifyUser(
                $serviceRequest->user_id,
                'payment_received',
                'Payment Confirmed',
                'Your payment for ' . $serviceType . ' has been confirmed.',
                $serviceRequest->id
            );
            
            // Notify church admin that payment is processed and ready for approval
            NotificationService::notifyChurchAdmins(
                'service_request',
                'Service Request Ready for Approval',
                'Payment for ' . $serviceType . ' has been processed. Request is ready for approval.',
                $serviceRequest->id
            );
        }

        return response()->json(['data' => $serviceRequest->load(['user', 'serviceRequestType', 'assignedStaff'])]);
    }
}
