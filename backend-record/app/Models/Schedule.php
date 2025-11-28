<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'title',
        'date',
        'time',
        'end_time',
        'type',
        'location',
        'priest_id',
        'description',
        'attendees',
        'status'
    ];

    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'attendees' => 'integer'
    ];

    public function priest()
    {
        return $this->belongsTo(Priest::class);
    }
}
