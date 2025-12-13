<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Donation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'donor_name', 'contact_number', 'email', 'category', 'amount',
        'payment_method', 'reference_number', 'donation_date', 'purpose',
        'notes', 'receipt_number', 'status', 'created_by',
        'is_voided', 'void_reason', 'voided_by', 'voided_at',
    ];

    protected $casts = [
        'donation_date' => 'date',
        'amount' => 'decimal:2',
        'is_voided' => 'boolean',
        'voided_at' => 'datetime',
    ];
}
