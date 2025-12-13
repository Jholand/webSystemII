<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'type',
        'client_name',
        'contact_number',
        'email',
        'appointment_date',
        'appointment_time',
        'status',
        'event_fee',
        'notes',
        'is_paid',
        'payment_id',
        'created_by'
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
        'event_fee' => 'decimal:2',
        'is_paid' => 'boolean'
    ];

    /**
     * Get the payment associated with this appointment
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Donation::class, 'payment_id');
    }

    /**
     * Get the user who created this appointment
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
