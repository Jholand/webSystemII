<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'description', 'document_type', 'category', 'file_name',
        'file_path', 'file_size', 'mime_type', 'document_date',
        'reference_number', 'access_level', 'status', 'download_count', 'uploaded_by',
    ];

    protected $casts = [
        'document_date' => 'date',
    ];
}
