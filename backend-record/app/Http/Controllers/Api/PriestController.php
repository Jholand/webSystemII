<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Priest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PriestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Priest::query();

        // Optimize with ordering
        $priests = $query->orderBy('ordained_date', 'desc')
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $priests
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:priests,email',
            'phone' => 'required|string|max:20',
            'ordained_date' => 'required|date',
            'specialty' => 'nullable|string|max:255',
            'status' => 'nullable|in:active,inactive,Active,Inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        // Normalize status to lowercase for database
        if (isset($data['status'])) {
            $data['status'] = strtolower($data['status']);
        } else {
            $data['status'] = 'active';
        }

        $priest = Priest::create($data);

        return response()->json([
            'success' => true,
            'data' => $priest,
            'message' => 'Priest created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $priest = Priest::findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $priest
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $priest = Priest::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:priests,email,' . $id,
            'phone' => 'required|string|max:20',
            'ordained_date' => 'required|date',
            'specialty' => 'nullable|string|max:255',
            'status' => 'nullable|in:active,inactive,Active,Inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        // Normalize status to lowercase for database
        if (isset($data['status'])) {
            $data['status'] = strtolower($data['status']);
        }

        $priest->update($data);

        return response()->json([
            'success' => true,
            'data' => $priest,
            'message' => 'Priest updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $priest = Priest::findOrFail($id);
        $priest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Priest deleted successfully'
        ]);
    }
}
