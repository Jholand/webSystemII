<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceRequestType extends Model
{
    protected $fillable = [
        'category',
        'type_code',
        'type_name',
        'description',
        'icon',
        'required_fields',
        'optional_fields',
        'default_fee',
        'requires_payment',
        'requires_documents',
        'requires_approval',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'required_fields' => 'array',
        'optional_fields' => 'array',
        'default_fee' => 'decimal:2',
        'requires_payment' => 'boolean',
        'requires_documents' => 'boolean',
        'requires_approval' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }
}
