<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequestAttachment extends Model
{
    protected $fillable = [
        'service_request_id',
        'file_name',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
        'document_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function serviceRequest(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class);
    }
}
