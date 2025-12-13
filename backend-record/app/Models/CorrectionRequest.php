<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorrectionRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'member_id',
        'request',
        'fields_to_edit',
        'status',
        'completed',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'completed_at',
    ];

    protected $casts = [
        'fields_to_edit' => 'array',
        'completed' => 'boolean',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
