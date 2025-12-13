<?php

namespace App\Http\Controllers;

use App\Models\EventFeeCategory;
use Illuminate\Http\Request;

class EventFeeCategoryController extends Controller
{
    public function index()
    {
        $categories = EventFeeCategory::orderBy('name')->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'suggested_amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category = EventFeeCategory::create($validated);
        
        return response()->json($category, 201);
    }

    public function show($id)
    {
        $category = EventFeeCategory::findOrFail($id);
        return response()->json($category);
    }

    public function update(Request $request, $id)
    {
        $category = EventFeeCategory::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'suggested_amount' => 'numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);
        
        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = EventFeeCategory::findOrFail($id);
        $category->delete();
        
        return response()->json(['message' => 'Event fee category deleted successfully']);
    }
}
