<?php

namespace App\Http\Controllers;

use App\Models\CorrectionRequest;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class CorrectionRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = CorrectionRequest::query();
        
        // If user is not admin, only show their own requests
        if ($user && !in_array($user->role, ['admin', 'church_admin'])) {
            $query->where('user_id', $user->id);
        } elseif ($request->has('user_id')) {
            // Allow admin to filter by user_id
            $query->where('user_id', $request->user_id);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        return response()->json($query->orderBy('submitted_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'user_name' => 'required|string',
            'user_email' => 'required|email',
            'member_id' => 'required|string',
            'request' => 'required|string',
            'fields_to_edit' => 'nullable|array',
            'status' => 'string|in:pending,approved,rejected',
            'submitted_at' => 'required',
        ]);
        
        $validated['user_id'] = $user->id;

        $correctionRequest = CorrectionRequest::create($validated);
        
        // Notify church admin about new correction request
        NotificationService::notifyChurchAdmins(
            'correction_request',
            'New Correction Request',
            'A new correction request has been submitted by ' . $validated['user_name'] . ' for member ID: ' . $validated['member_id'],
            $correctionRequest->id
        );
        
        return response()->json($correctionRequest, 201);
    }

    public function show($id)
    {
        $correctionRequest = CorrectionRequest::findOrFail($id);
        return response()->json($correctionRequest);
    }

    public function update(Request $request, $id)
    {
        $correctionRequest = CorrectionRequest::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,approved,rejected',
            'completed' => 'sometimes|boolean',
            'reviewed_at' => 'sometimes',
            'reviewed_by' => 'sometimes|string',
            'completed_at' => 'sometimes',
        ]);

        $oldStatus = $correctionRequest->status;
        $correctionRequest->update($validated);
        
        // Notify user if status changed
        if (isset($validated['status']) && $validated['status'] !== $oldStatus) {
            NotificationService::notifyUserAboutRequestStatus(
                $correctionRequest->user_id,
                'correction',
                $correctionRequest->id,
                $validated['status']
            );
        }
        
        return response()->json($correctionRequest);
    }

    public function destroy($id)
    {
        $correctionRequest = CorrectionRequest::findOrFail($id);
        $correctionRequest->delete();
        
        return response()->json(null, 204);
    }
}
