<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    /**
     * Display a listing of appointments
     */
    public function index(Request $request)
    {
        $query = Appointment::query()->with('creator');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by payment status
        if ($request->has('is_paid')) {
            $query->where('is_paid', $request->is_paid === 'true');
        }

        // Search by client name or type
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('client_name', 'like', '%' . $request->search . '%')
                  ->orWhere('type', 'like', '%' . $request->search . '%');
            });
        }

        $appointments = $query->orderBy('appointment_date', 'desc')
                             ->orderBy('appointment_time', 'desc')
                             ->get();

        return response()->json($appointments);
    }

    /**
     * Store a newly created appointment
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string',
            'client_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'appointment_date' => 'required|date',
            'appointment_time' => 'required',
            'event_fee' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'status' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment = Appointment::create([
            'type' => $request->type,
            'client_name' => $request->client_name,
            'contact_number' => $request->contact_number,
            'email' => $request->email,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'event_fee' => $request->event_fee,
            'notes' => $request->notes,
            'status' => $request->status ?? 'Pending',
            'is_paid' => false,
            'created_by' => auth()->id()
        ]);

        return response()->json([
            'message' => 'Appointment created successfully',
            'appointment' => $appointment
        ], 201);
    }

    /**
     * Display the specified appointment
     */
    public function show($id)
    {
        $appointment = Appointment::with('creator', 'payment')->findOrFail($id);
        return response()->json($appointment);
    }

    /**
     * Update the specified appointment
     */
    public function update(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|string',
            'client_name' => 'sometimes|string|max:255',
            'contact_number' => 'sometimes|string|max:20',
            'email' => 'nullable|email|max:255',
            'appointment_date' => 'sometimes|date',
            'appointment_time' => 'sometimes',
            'event_fee' => 'sometimes|numeric|min:0',
            'notes' => 'nullable|string',
            'status' => 'sometimes|string',
            'is_paid' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment->update($request->all());

        return response()->json([
            'message' => 'Appointment updated successfully',
            'appointment' => $appointment
        ]);
    }

    /**
     * Remove the specified appointment
     */
    public function destroy($id)
    {
        $appointment = Appointment::findOrFail($id);
        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully'
        ]);
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, $id)
    {
        $appointment = Appointment::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'is_paid' => 'required|boolean',
            'payment_id' => 'nullable|exists:donations,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $appointment->update([
            'is_paid' => $request->is_paid,
            'payment_id' => $request->payment_id
        ]);

        return response()->json([
            'message' => 'Payment status updated successfully',
            'appointment' => $appointment
        ]);
    }
}
