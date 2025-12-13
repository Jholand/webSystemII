<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $query = Message::with(['user', 'sender']);
        
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read);
        }
        
        $messages = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'sender_type' => 'required|in:user,secretary',
            'sender_id' => 'required',
            'message' => 'required|string',
            'attachments' => 'nullable|array',
        ]);

        $message = Message::create($validated);
        
        return response()->json($message, 201);
    }

    public function show($id)
    {
        $message = Message::with(['user', 'sender'])->findOrFail($id);
        
        return response()->json($message);
    }

    public function update(Request $request, $id)
    {
        $message = Message::findOrFail($id);
        
        $validated = $request->validate([
            'is_read' => 'boolean',
            'read_at' => 'nullable|date',
        ]);

        $message->update($validated);
        
        return response()->json($message);
    }

    public function markAsRead($id)
    {
        $message = Message::findOrFail($id);
        $message->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
        
        return response()->json($message);
    }

    public function markAllAsRead(Request $request)
    {
        $userId = $request->input('user_id');
        
        Message::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        
        return response()->json(['message' => 'All messages marked as read']);
    }

    public function destroy($id)
    {
        $message = Message::findOrFail($id);
        $message->delete();
        
        return response()->json(['message' => 'Message deleted successfully']);
    }
}
