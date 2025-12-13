<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Priest extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'ordained_date',
        'specialty',
        'status',
        'bio',
    ];

    protected $casts = [
        'ordained_date' => 'date',
    ];

    /**
     * Get schedules assigned to this priest
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Get marriage records officiated by this priest
     */
    public function marriageRecords(): HasMany
    {
        return $this->hasMany(MarriageRecord::class);
    }

    /**
     * Get baptism records performed by this priest
     */
    public function baptismRecords(): HasMany
    {
        return $this->hasMany(BaptismRecord::class);
    }
}
