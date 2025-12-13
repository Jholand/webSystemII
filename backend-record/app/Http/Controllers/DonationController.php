<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DonationController extends Controller
{
    public function index(Request $request)
    {
        $query = Donation::query();
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('donation_date', [$request->start_date, $request->end_date]);
        }
        
        $donations = $query->orderBy('donation_date', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $donations
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'donor' => 'required|string|max:255',
            'donor_name' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'category' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'receipt_number' => 'nullable|string|max:255',
            'donation_date' => 'nullable|date',
            'date' => 'nullable|date',
            'purpose' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:pending,confirmed,cancelled',
            'created_by' => 'nullable|string|max:255',
            'recorded_by' => 'nullable|string|max:255',
        ]);
        
        // Map frontend fields to database fields
        $donationData = [
            'donor_name' => $validated['donor'] ?? $validated['donor_name'] ?? 'Anonymous',
            'contact_number' => $validated['contact_number'] ?? null,
            'email' => $validated['email'] ?? null,
            'category' => $validated['category'],
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'reference_number' => $validated['reference_number'] ?? null,
            'receipt_number' => $validated['receipt_number'] ?? 'DN-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
            'donation_date' => $validated['donation_date'] ?? $validated['date'] ?? now(),
            'purpose' => $validated['purpose'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'status' => $validated['status'] ?? 'confirmed',
            'created_by' => $validated['created_by'] ?? $validated['recorded_by'] ?? null,
        ];
        
        $donation = Donation::create($donationData);
        
        return response()->json([
            'success' => true,
            'message' => 'Donation recorded successfully',
            'data' => $donation
        ], 201);
    }

    public function show($id)
    {
        $donation = Donation::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $donation
        ]);
    }

    public function update(Request $request, $id)
    {
        $donation = Donation::findOrFail($id);
        
        $validated = $request->validate([
            'donor_name' => 'sometimes|required|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'category' => 'sometimes|required|string|max:255',
            'amount' => 'sometimes|required|numeric|min:0',
            'payment_method' => 'sometimes|required|string|max:255',
            'reference_number' => 'nullable|string|max:255',
            'donation_date' => 'sometimes|required|date',
            'purpose' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'sometimes|in:pending,confirmed,cancelled',
            'is_voided' => 'sometimes|boolean',
            'void_reason' => 'nullable|string',
            'voided_by' => 'nullable|string|max:255',
            'voided_at' => 'nullable|date',
        ]);
        
        $donation->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Donation updated successfully',
            'data' => $donation
        ]);
    }

    public function destroy($id)
    {
        $donation = Donation::findOrFail($id);
        $donation->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Donation deleted successfully'
        ]);
    }
}
