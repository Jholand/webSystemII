<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EventFeeCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'amount',
        'description',
        'active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'active' => 'boolean',
    ];

    protected $appends = ['suggested_amount', 'is_active'];

    // Accessor for API compatibility
    public function getSuggestedAmountAttribute()
    {
        return $this->amount;
    }

    // Mutator for API compatibility
    public function setSuggestedAmountAttribute($value)
    {
        $this->attributes['amount'] = $value;
    }

    // Accessor for API compatibility
    public function getIsActiveAttribute()
    {
        return $this->active;
    }

    // Mutator for API compatibility
    public function setIsActiveAttribute($value)
    {
        $this->attributes['active'] = $value;
    }
}
