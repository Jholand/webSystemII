<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BirthRecord;
use Illuminate\Http\Request;

class BirthRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = BirthRecord::query();

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('child_name', 'like', "%{$search}%")
                  ->orWhere('father_name', 'like', "%{$search}%")
                  ->orWhere('mother_maiden_name', 'like', "%{$search}%")
                  ->orWhere('birth_certificate_no', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('birth_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('birth_date', '<=', $request->to_date);
        }

        $birthRecords = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json($birthRecords);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'child_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'birth_time' => 'nullable|date_format:H:i:s',
            'birth_place' => 'required|string|max:255',
            'gender' => 'required|in:male,female',
            'birth_weight' => 'nullable|numeric',
            'birth_height' => 'nullable|numeric',
            'father_name' => 'required|string|max:255',
            'father_citizenship' => 'nullable|string|max:100',
            'father_occupation' => 'nullable|string|max:100',
            'father_age_at_birth' => 'nullable|integer',
            'mother_maiden_name' => 'required|string|max:255',
            'mother_citizenship' => 'nullable|string|max:100',
            'mother_occupation' => 'nullable|string|max:100',
            'mother_age_at_birth' => 'nullable|integer',
            'parents_marriage_date' => 'nullable|date',
            'parents_marriage_place' => 'nullable|string|max:255',
            'residence_address' => 'required|string',
            'residence_city' => 'required|string|max:100',
            'residence_province' => 'required|string|max:100',
            'residence_country' => 'nullable|string|max:100',
            'birth_certificate_no' => 'required|string|unique:birth_records,birth_certificate_no',
            'registration_date' => 'required|date',
            'registered_by' => 'nullable|string|max:255',
            'civil_registrar' => 'nullable|string|max:255',
            'is_baptized' => 'nullable|boolean',
            'baptism_scheduled_date' => 'nullable|date',
            'psa_copy_issued' => 'nullable|boolean',
            'psa_copy_issue_date' => 'nullable|date',
            'psa_copies_count' => 'nullable|integer',
            'birth_type' => 'nullable|in:live,stillborn,multiple',
            'birth_order' => 'nullable|integer',
            'medical_notes' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:registered,pending,amended,cancelled',
        ]);

        $birthRecord = BirthRecord::create($validated);
        
        return response()->json($birthRecord, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $birthRecord = BirthRecord::findOrFail($id);
        return response()->json($birthRecord);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $birthRecord = BirthRecord::findOrFail($id);

        $validated = $request->validate([
            'child_name' => 'sometimes|required|string|max:255',
            'birth_date' => 'sometimes|required|date',
            'gender' => 'sometimes|required|in:male,female',
            'status' => 'nullable|in:registered,pending,amended,cancelled',
        ]);

        $birthRecord->update($validated);
        
        return response()->json($birthRecord);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $birthRecord = BirthRecord::findOrFail($id);
        $birthRecord->delete();
        
        return response()->json(['message' => 'Birth record deleted successfully']);
    }
}
