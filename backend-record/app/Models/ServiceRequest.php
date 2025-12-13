<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'service_request_type_id',
        'request_type',
        'category',
        'participant_name',
        'requestor_name',
        'contact_number',
        'email',
        'preferred_date',
        'preferred_time',
        'details',
        'details_json',
        'special_requirements',
        'assigned_priest',
        'assigned_staff_id',
        'status',
        'priority',
        'scheduled_date',
        'scheduled_time',
        'admin_notes',
        'processed_by',
        'processed_at',
        'service_fee',
        'is_paid',
        'payment_status',
        'payment_id',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'scheduled_date' => 'date',
        'preferred_time' => 'datetime:H:i',
        'scheduled_time' => 'datetime:H:i',
        'processed_at' => 'datetime',
        'service_fee' => 'decimal:2',
        'is_paid' => 'boolean',
        'details' => 'array',
        'details_json' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Donation::class, 'payment_id');
    }

    public function serviceRequestType(): BelongsTo
    {
        return $this->belongsTo(ServiceRequestType::class);
    }

    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ServiceRequestAttachment::class);
    }
}
