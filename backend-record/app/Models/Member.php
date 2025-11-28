<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'date_joined',
        'ministry',
        'status',
    ];

    protected $casts = [
        'date_joined' => 'date',
    ];
}
