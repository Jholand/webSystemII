<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Schedule::with('priest');

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by priest
        if ($request->has('priest_id')) {
            $query->where('priest_id', $request->priest_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $schedules = $query->orderBy('date', 'asc')
            ->orderBy('time', 'asc')
            ->paginate($request->get('per_page', 50));

        return response()->json($schedules);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'required',
            'end_time' => 'nullable',
            'type' => 'required|string',
            'location' => 'nullable|string|max:255',
            'priest_id' => 'nullable|exists:priests,id',
            'description' => 'nullable|string',
            'attendees' => 'nullable|integer',
            'status' => 'nullable|in:scheduled,completed,cancelled'
        ]);

        $schedule = Schedule::create($validated);
        $schedule->load('priest');

        return response()->json($schedule, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $schedule = Schedule::with('priest')->findOrFail($id);
        return response()->json($schedule);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $schedule = Schedule::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date',
            'time' => 'sometimes|required',
            'end_time' => 'nullable',
            'type' => 'sometimes|required|string',
            'location' => 'nullable|string|max:255',
            'priest_id' => 'nullable|exists:priests,id',
            'description' => 'nullable|string',
            'attendees' => 'nullable|integer',
            'status' => 'nullable|in:scheduled,completed,cancelled'
        ]);

        $schedule->update($validated);
        $schedule->load('priest');

        return response()->json($schedule);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();

        return response()->json(['message' => 'Schedule deleted successfully']);
    }
}
