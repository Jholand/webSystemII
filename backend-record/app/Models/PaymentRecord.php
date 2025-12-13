<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payment_type',
        'service_name',
        'amount',
        'payment_method',
        'reference_number',
        'description',
        'recorded_by',
        'payment_date',
        'visible_to_user',
        'is_voided',
        'void_reason',
        'voided_by',
        'voided_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'visible_to_user' => 'boolean',
        'is_voided' => 'boolean',
        'voided_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
