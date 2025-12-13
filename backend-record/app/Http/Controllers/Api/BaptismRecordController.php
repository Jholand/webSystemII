<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BaptismRecord;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BaptismRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = BaptismRecord::with(['priest', 'schedule']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('child_name', 'like', "%{$search}%")
                  ->orWhere('father_name', 'like', "%{$search}%")
                  ->orWhere('mother_name', 'like', "%{$search}%");
            });
        }

        $records = $query->orderBy('baptism_date', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'child_name' => 'required|string|max:255',
            'child_birthdate' => 'required|date',
            'child_birthplace' => 'nullable|string|max:255',
            'child_gender' => 'required|in:Male,Female,male,female',
            'father_name' => 'required|string|max:255',
            'mother_name' => 'required|string|max:255',
            'parents_address' => 'nullable|string|max:255',
            'baptism_date' => 'required|date',
            'baptism_time' => 'required',
            'baptism_location' => 'required|string|max:255',
            'priest_id' => 'nullable|exists:priests,id',
            'godfather_name' => 'nullable|string|max:255',
            'godmother_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create the schedule entry first
            $schedule = Schedule::create([
                'title' => $request->child_name . ' - Baptism',
                'date' => $request->baptism_date,
                'time' => $request->baptism_time,
                'type' => 'Baptism',
                'location' => $request->baptism_location,
                'priest_id' => $request->priest_id ?? 1,
                'status' => 'scheduled'
            ]);

            // Prepare baptism record data with defaults for optional fields
            $baptismData = [
                'child_name' => $request->child_name,
                'child_birthdate' => $request->child_birthdate,
                'child_birthplace' => $request->child_birthplace ?? 'N/A',
                'child_gender' => $request->child_gender,
                'father_name' => $request->father_name,
                'mother_name' => $request->mother_name,
                'parents_address' => $request->parents_address ?? 'N/A',
                'baptism_date' => $request->baptism_date,
                'baptism_time' => $request->baptism_time,
                'baptism_location' => $request->baptism_location,
                'priest_id' => $request->priest_id ?? 1,
                'godfather_name' => $request->godfather_name ?? 'N/A',
                'godmother_name' => $request->godmother_name ?? 'N/A',
                'schedule_id' => $schedule->id,
                'baptism_certificate_no' => 'BC-' . date('Y') . '-' . str_pad(BaptismRecord::count() + 1, 4, '0', STR_PAD_LEFT),
                'certificate_issued_date' => now(),
                'status' => 'pending'
            ];

            // Create the baptism record linked to the schedule
            $baptismRecord = BaptismRecord::create($baptismData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $baptismRecord->load(['priest', 'schedule']),
                'message' => 'Baptism record created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create baptism record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $record = BaptismRecord::with(['priest', 'schedule'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $record
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $record = BaptismRecord::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'child_name' => 'required|string|max:255',
            'baptism_date' => 'required|date',
            'baptism_time' => 'required',
            'baptism_location' => 'required|string|max:255',
            'priest_id' => 'required|exists:priests,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Update the associated schedule if it exists
            if ($record->schedule) {
                $record->schedule->update([
                    'title' => $request->child_name . ' - Baptism',
                    'date' => $request->baptism_date,
                    'time' => $request->baptism_time,
                    'location' => $request->baptism_location,
                    'priest_id' => $request->priest_id,
                ]);
            }

            $record->update($request->all());

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $record->load(['priest', 'schedule']),
                'message' => 'Baptism record updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update baptism record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $record = BaptismRecord::findOrFail($id);
        
        DB::beginTransaction();
        try {
            // Delete associated schedule if exists
            if ($record->schedule) {
                $record->schedule->delete();
            }
            
            $record->delete();
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Baptism record deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete baptism record: ' . $e->getMessage()
            ], 500);
        }
    }
}
