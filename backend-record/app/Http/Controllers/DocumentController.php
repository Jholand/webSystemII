<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Document::query();
        
        // Filter by authenticated user
        $user = $request->user();
        if ($user) {
            // If user is not admin, only show their documents
            if ($user->role !== 'admin' && $user->role !== 'church_admin') {
                $query->where('uploaded_by', $user->id);
            }
        }
        
        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        // Filter by document type
        if ($request->has('document_type')) {
            $query->where('document_type', $request->document_type);
        }
        
        return response()->json(['data' => $query->latest()->get()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'document_type' => 'required|string',
            'category' => 'required|string',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'document_date' => 'nullable|date',
            'access_level' => 'required|in:public,private,restricted',
            'uploaded_by' => 'required|exists:users,id',
        ]);
        
        $file = $request->file('file');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('documents', $filename, 'public');
        
        $document = Document::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'document_type' => $validated['document_type'],
            'category' => $validated['category'],
            'file_name' => $filename,
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'document_date' => $validated['document_date'] ?? now(),
            'access_level' => $validated['access_level'],
            'status' => 'active',
            'uploaded_by' => $validated['uploaded_by'],
        ]);
        
        return response()->json($document, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $document = Document::findOrFail($id);
        return response()->json($document);
    }

    /**
     * Download the specified document.
     */
    public function download(string $id)
    {
        $document = Document::findOrFail($id);
        
        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found'], 404);
        }
        
        // Increment download count
        $document->increment('download_count');
        
        return response()->file($filePath, [
            'Content-Type' => $document->mime_type ?? 'application/octet-stream',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $document = Document::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|string',
            'access_level' => 'sometimes|in:public,private,restricted',
            'status' => 'sometimes|in:active,archived',
        ]);
        
        $document->update($validated);
        
        return response()->json($document);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $document = Document::findOrFail($id);
        
        // Delete file from storage
        if (Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }
        
        $document->delete();
        
        return response()->json(['message' => 'Document deleted successfully']);
    }
}
