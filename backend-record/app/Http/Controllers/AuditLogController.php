<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditLog::query();
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('related_user_id')) {
            $query->where('related_user_id', $request->related_user_id);
        }
        
        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string',
            'actor' => 'required|string',
            'actor_email' => 'nullable|email',
            'details' => 'required|string',
            'category' => 'required|string',
            'related_user_id' => 'nullable',
            'related_user_name' => 'nullable|string',
            'request_details' => 'nullable|string',
        ]);

        $auditLog = AuditLog::create($validated);
        
        return response()->json($auditLog, 201);
    }
}
