<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    /**
     * Get the priest assigned to this schedule
     */
    public function priest(): BelongsTo
    {
        return $this->belongsTo(Priest::class);
    }

    /**
     * Get the marriage record associated with this schedule
     */
    public function marriageRecord(): HasOne
    {
        return $this->hasOne(MarriageRecord::class);
    }

    /**
     * Get the baptism record associated with this schedule
     */
    public function baptismRecord(): HasOne
    {
        return $this->hasOne(BaptismRecord::class);
    }

    /**
     * Get birth records that have this schedule as their baptism schedule
     */
    public function birthRecords(): HasMany
    {
        return $this->hasMany(BirthRecord::class, 'baptism_schedule_id');
    }

    /**
     * Check if this schedule is for a wedding
     */
    public function isWedding(): bool
    {
        return strtolower($this->type) === 'wedding' || strtolower($this->type) === 'marriage';
    }

    /**
     * Check if this schedule is for a baptism
     */
    public function isBaptism(): bool
    {
        return strtolower($this->type) === 'baptism';
    }
}
