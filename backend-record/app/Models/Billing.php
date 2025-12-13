<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Billing extends Model
{
    protected $fillable = [
        'payment_type',
        'client_name',
        'amount',
        'amount_paid',
        'status',
        'payment_method',
        'event_date',
        'date_paid',
        'notes'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'event_date' => 'date',
        'date_paid' => 'date',
    ];
}
