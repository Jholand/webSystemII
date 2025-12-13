<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CertificateRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'certificate_type',
        'purpose',
        'details',
        'supporting_documents',
        'certificate_fee',
        'payment_status',
        'payment_record_id',
        'paid_at',
        'status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'certificate_file',
        'downloaded',
        'downloaded_at',
        'admin_notes',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'downloaded_at' => 'datetime',
        'paid_at' => 'datetime',
        'downloaded' => 'boolean',
        'certificate_fee' => 'decimal:2',
        'supporting_documents' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function paymentRecord()
    {
        return $this->belongsTo(\App\Models\PaymentRecord::class, 'payment_record_id');
    }
}
