<?php

namespace App\Http\Controllers;

use App\Models\DonationCategory;
use Illuminate\Http\Request;

class DonationCategoryController extends Controller
{
    public function index()
    {
        $categories = DonationCategory::orderBy('name')->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category = DonationCategory::create($validated);
        
        return response()->json($category, 201);
    }

    public function show($id)
    {
        $category = DonationCategory::findOrFail($id);
        return response()->json($category);
    }

    public function update(Request $request, $id)
    {
        $category = DonationCategory::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);
        
        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = DonationCategory::findOrFail($id);
        $category->delete();
        
        return response()->json(['message' => 'Donation category deleted successfully']);
    }
}
