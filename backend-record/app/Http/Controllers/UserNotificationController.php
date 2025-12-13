<?php

namespace App\Http\Controllers;

use App\Models\UserNotification;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = UserNotification::query();
        
        // If user is not admin, only show their notifications
        if ($user && !in_array($user->role, ['admin', 'church_admin'])) {
            $query->where('user_id', $user->id);
        } elseif ($request->has('user_id')) {
            // Allow admin to filter by user_id
            $query->where('user_id', $request->user_id);
        }
        
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required',
            'type' => 'required|string',
            'title' => 'required|string',
            'message' => 'required|string',
            'read' => 'boolean',
            'request_id' => 'nullable',
        ]);

        $notification = UserNotification::create($validated);
        
        return response()->json($notification, 201);
    }

    public function update(Request $request, $id)
    {
        $notification = UserNotification::findOrFail($id);
        
        $validated = $request->validate([
            'read' => 'sometimes|boolean',
        ]);

        $notification->update($validated);
        
        return response()->json($notification);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        UserNotification::where('user_id', $user->id)
            ->where('read', false)
            ->update(['read' => true]);
        
        return response()->json(['message' => 'All notifications marked as read']);
    }
}
