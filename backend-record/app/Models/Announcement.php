<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Announcement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'content', 'category', 'priority', 'publish_date',
        'expiry_date', 'status', 'target_audience', 'display_on_homepage',
        'send_notification', 'attachment_path', 'created_by',
    ];

    protected $casts = [
        'publish_date' => 'date',
        'expiry_date' => 'date',
        'display_on_homepage' => 'boolean',
        'send_notification' => 'boolean',
    ];
}
