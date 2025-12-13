<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BirthRecord extends Model
{
    use SoftDeletes;

    protected $fillable = [
        // Child Information
        'child_name',
        'birth_date',
        'birth_time',
        'birth_place',
        'gender',
        'birth_weight',
        'birth_height',
        
        // Parents Information
        'father_name',
        'father_citizenship',
        'father_occupation',
        'father_age_at_birth',
        'mother_maiden_name',
        'mother_citizenship',
        'mother_occupation',
        'mother_age_at_birth',
        'parents_marriage_date',
        'parents_marriage_place',
        
        // Address Information
        'residence_address',
        'residence_city',
        'residence_province',
        'residence_country',
        
        // Registration Information
        'birth_certificate_no',
        'registration_date',
        'registered_by',
        'civil_registrar',
        
        // Church Record Connection
        'baptism_record_id',
        'is_baptized',
        'baptism_scheduled_date',
        'baptism_schedule_id',
        
        // Document Status
        'psa_copy_issued',
        'psa_copy_issue_date',
        'psa_copies_count',
        
        // Additional Information
        'birth_type',
        'birth_order',
        'medical_notes',
        'notes',
        'status',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'parents_marriage_date' => 'date',
        'registration_date' => 'date',
        'baptism_scheduled_date' => 'date',
        'psa_copy_issue_date' => 'date',
        'birth_weight' => 'decimal:2',
        'birth_height' => 'decimal:2',
        'is_baptized' => 'boolean',
        'psa_copy_issued' => 'boolean',
        'psa_copies_count' => 'integer',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the baptism record associated with this birth
     */
    public function baptismRecord(): BelongsTo
    {
        return $this->belongsTo(BaptismRecord::class);
    }

    /**
     * Get the baptism schedule for this child
     */
    public function baptismSchedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class, 'baptism_schedule_id');
    }
}
