<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'action',
        'actor',
        'actor_email',
        'details',
        'category',
        'related_user_id',
        'related_user_name',
        'request_details',
    ];
}
