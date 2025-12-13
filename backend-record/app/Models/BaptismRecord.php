<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BaptismRecord extends Model
{
    use SoftDeletes;

    protected $fillable = [
        // Child Information
        'child_name',
        'child_birthdate',
        'child_birthplace',
        'child_gender',
        'is_legitimate',
        
        // Parents Information
        'father_name',
        'father_birthplace',
        'father_religion',
        'mother_name',
        'mother_birthplace',
        'mother_religion',
        'parents_address',
        'parents_contact',
        
        // Baptism Details
        'baptism_date',
        'baptism_time',
        'baptism_location',
        'priest_id',
        'schedule_id',
        
        // Godparents/Sponsors
        'godfather_name',
        'godfather_address',
        'godmother_name',
        'godmother_address',
        'additional_sponsors',
        
        // Certificate Information
        'baptism_certificate_no',
        'certificate_issued_date',
        'birth_certificate_no',
        
        // Pre-baptism Requirements
        'birth_cert_submitted',
        'marriage_cert_submitted',
        'baptism_seminar_completed',
        'seminar_completion_date',
        
        // Sacrament Records
        'first_communion_date',
        'confirmation_date',
        
        // Additional Information
        'notes',
        'status',
    ];

    protected $casts = [
        'child_birthdate' => 'date',
        'baptism_date' => 'date',
        'certificate_issued_date' => 'date',
        'seminar_completion_date' => 'date',
        'additional_sponsors' => 'array',
        'is_legitimate' => 'boolean',
        'birth_cert_submitted' => 'boolean',
        'marriage_cert_submitted' => 'boolean',
        'baptism_seminar_completed' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the priest who performed the baptism
     */
    public function priest(): BelongsTo
    {
        return $this->belongsTo(Priest::class);
    }

    /**
     * Get the schedule associated with this baptism
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Get birth records linked to this baptism
     */
    public function birthRecords(): HasMany
    {
        return $this->hasMany(BirthRecord::class);
    }
}
