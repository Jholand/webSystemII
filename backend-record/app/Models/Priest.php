<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
