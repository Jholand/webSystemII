<?php

namespace App\Http\Controllers;

use App\Models\Billing;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $billings = Billing::orderBy('created_at', 'desc')->get();
        return response()->json($billings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'payment_type' => 'required|string',
            'client_name' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'amount_paid' => 'nullable|numeric|min:0',
            'status' => 'required|in:Pending,Paid',
            'payment_method' => 'nullable|string',
            'event_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        if ($validated['status'] === 'Paid' && !isset($validated['amount_paid'])) {
            $validated['amount_paid'] = $validated['amount'];
            $validated['date_paid'] = now()->toDateString();
        }

        $billing = Billing::create($validated);
        return response()->json($billing, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $billing = Billing::findOrFail($id);
        return response()->json($billing);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $billing = Billing::findOrFail($id);
        
        $validated = $request->validate([
            'payment_type' => 'sometimes|string',
            'client_name' => 'sometimes|string',
            'amount' => 'sometimes|numeric|min:0',
            'amount_paid' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:Pending,Paid',
            'payment_method' => 'nullable|string',
            'event_date' => 'sometimes|date',
            'notes' => 'nullable|string'
        ]);

        // If status changed to Paid, update date_paid and amount_paid
        if (isset($validated['status']) && $validated['status'] === 'Paid') {
            if (!$billing->date_paid) {
                $validated['date_paid'] = now()->toDateString();
            }
            if ($validated['amount_paid'] < $billing->amount) {
                $validated['amount_paid'] = $billing->amount;
            }
        }

        $billing->update($validated);
        return response()->json($billing);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $billing = Billing::findOrFail($id);
        $billing->delete();
        return response()->json(['message' => 'Billing deleted successfully']);
    }
}
