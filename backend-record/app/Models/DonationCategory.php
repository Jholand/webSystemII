<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonationCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected $appends = ['is_active'];

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
