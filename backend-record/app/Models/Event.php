<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'description', 'event_date', 'start_time', 'end_time',
        'location', 'category', 'max_participants', 'registered_count',
        'status', 'contact_person', 'contact_number', 'budget', 'notes', 'created_by',
    ];

    protected $casts = [
        'event_date' => 'date',
        'budget' => 'decimal:2',
    ];
}
