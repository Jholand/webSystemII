<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MarriageRecord;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class MarriageRecordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = MarriageRecord::with(['priest', 'schedule']);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('groom_name', 'like', "%{$search}%")
                  ->orWhere('bride_name', 'like', "%{$search}%");
            });
        }

        $records = $query->orderBy('marriage_date', 'desc')->get();

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
            'groom_name' => 'required|string|max:255',
            'groom_birthdate' => 'nullable|date',
            'groom_birthplace' => 'nullable|string|max:255',
            'groom_father_name' => 'nullable|string|max:255',
            'groom_mother_name' => 'nullable|string|max:255',
            'groom_address' => 'nullable|string|max:255',
            'groom_contact' => 'nullable|string|max:255',
            'bride_name' => 'required|string|max:255',
            'bride_birthdate' => 'nullable|date',
            'bride_birthplace' => 'nullable|string|max:255',
            'bride_father_name' => 'nullable|string|max:255',
            'bride_mother_name' => 'nullable|string|max:255',
            'bride_address' => 'nullable|string|max:255',
            'bride_contact' => 'nullable|string|max:255',
            'marriage_date' => 'required|date',
            'marriage_time' => 'required',
            'marriage_location' => 'required|string|max:255',
            'priest_id' => 'nullable|exists:priests,id',
            'witnesses' => 'nullable|string',
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
                'title' => $request->groom_name . ' & ' . $request->bride_name . ' - Wedding',
                'date' => $request->marriage_date,
                'time' => $request->marriage_time,
                'type' => 'Wedding',
                'location' => $request->marriage_location,
                'priest_id' => $request->priest_id,
                'status' => 'scheduled'
            ]);

            // Prepare marriage record data with defaults for optional fields
            $marriageData = [
                'groom_name' => $request->groom_name,
                'groom_birthdate' => $request->groom_birthdate ?? '2000-01-01',
                'groom_birthplace' => $request->groom_birthplace ?? 'N/A',
                'groom_father_name' => $request->groom_father_name ?? 'N/A',
                'groom_mother_name' => $request->groom_mother_name ?? 'N/A',
                'groom_address' => $request->groom_address ?? $request->groom_contact ?? 'N/A',
                'bride_name' => $request->bride_name,
                'bride_birthdate' => $request->bride_birthdate ?? '2000-01-01',
                'bride_birthplace' => $request->bride_birthplace ?? 'N/A',
                'bride_father_name' => $request->bride_father_name ?? 'N/A',
                'bride_mother_name' => $request->bride_mother_name ?? 'N/A',
                'bride_address' => $request->bride_address ?? $request->bride_contact ?? 'N/A',
                'marriage_date' => $request->marriage_date,
                'marriage_time' => $request->marriage_time,
                'marriage_location' => $request->marriage_location,
                'priest_id' => $request->priest_id ?? 1,
                'schedule_id' => $schedule->id,
                'marriage_certificate_no' => 'MC-' . date('Y') . '-' . str_pad(MarriageRecord::count() + 1, 4, '0', STR_PAD_LEFT),
                'certificate_issued_date' => now(),
                'status' => 'pending'
            ];

            // Add witnesses if provided
            if ($request->witnesses) {
                $marriageData['witness_1_name'] = $request->witnesses;
            }

            // Create the marriage record linked to the schedule
            $marriageRecord = MarriageRecord::create($marriageData);

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $marriageRecord->load(['priest', 'schedule']),
                'message' => 'Marriage record created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create marriage record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $record = MarriageRecord::with(['priest', 'schedule'])->findOrFail($id);
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
        $record = MarriageRecord::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'groom_name' => 'required|string|max:255',
            'bride_name' => 'required|string|max:255',
            'marriage_date' => 'required|date',
            'marriage_time' => 'required',
            'marriage_location' => 'required|string|max:255',
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
                    'title' => $request->groom_name . ' & ' . $request->bride_name . ' - Wedding',
                    'date' => $request->marriage_date,
                    'time' => $request->marriage_time,
                    'location' => $request->marriage_location,
                    'priest_id' => $request->priest_id,
                ]);
            }

            $record->update($request->all());

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $record->load(['priest', 'schedule']),
                'message' => 'Marriage record updated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update marriage record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $record = MarriageRecord::findOrFail($id);
        
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
                'message' => 'Marriage record deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete marriage record: ' . $e->getMessage()
            ], 500);
        }
    }
}
