<?php

namespace App\Http\Controllers;

use App\Models\PaymentRecord;
use Illuminate\Http\Request;

class PaymentRecordController extends Controller
{
    public function index(Request $request)
    {
        $query = PaymentRecord::with('user');
        
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        if ($request->has('visible_to_user')) {
            $query->where('visible_to_user', $request->visible_to_user);
        }
        
        if ($request->has('payment_type')) {
            $query->where('payment_type', $request->payment_type);
        }
        
        $payments = $query->orderBy('payment_date', 'desc')->get();
        
        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'payment_type' => 'required|string',
            'service_name' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'reference_number' => 'nullable|string',
            'description' => 'nullable|string',
            'recorded_by' => 'required|string',
            'payment_date' => 'required|date',
            'visible_to_user' => 'boolean',
        ]);

        $payment = PaymentRecord::create($validated);
        
        return response()->json($payment, 201);
    }

    public function show($id)
    {
        $payment = PaymentRecord::with('user')->findOrFail($id);
        
        return response()->json($payment);
    }

    public function update(Request $request, $id)
    {
        $payment = PaymentRecord::findOrFail($id);
        
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'payment_type' => 'string',
            'service_name' => 'nullable|string',
            'amount' => 'numeric|min:0',
            'payment_method' => 'string',
            'reference_number' => 'nullable|string',
            'description' => 'nullable|string',
            'recorded_by' => 'string',
            'payment_date' => 'date',
            'visible_to_user' => 'boolean',
            'is_voided' => 'sometimes|boolean',
            'void_reason' => 'nullable|string',
            'voided_by' => 'nullable|string|max:255',
            'voided_at' => 'nullable|date',
        ]);

        $payment->update($validated);
        
        return response()->json($payment);
    }

    public function destroy($id)
    {
        $payment = PaymentRecord::findOrFail($id);
        $payment->delete();
        
        return response()->json(['message' => 'Payment record deleted successfully']);
    }

    public function getUserPayments($userId)
    {
        $payments = PaymentRecord::where('user_id', $userId)
            ->where('visible_to_user', true)
            ->orderBy('payment_date', 'desc')
            ->get();
        
        return response()->json($payments);
    }
}
