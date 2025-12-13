<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarriageRecord extends Model
{
    use SoftDeletes;

    protected $fillable = [
        // Groom Information
        'groom_name',
        'groom_birthdate',
        'groom_birthplace',
        'groom_father_name',
        'groom_mother_name',
        'groom_address',
        'groom_religion',
        'groom_civil_status',
        
        // Bride Information
        'bride_name',
        'bride_birthdate',
        'bride_birthplace',
        'bride_father_name',
        'bride_mother_name',
        'bride_address',
        'bride_religion',
        'bride_civil_status',
        
        // Marriage Details
        'marriage_date',
        'marriage_time',
        'marriage_location',
        'priest_id',
        'schedule_id',
        
        // Sponsors/Witnesses
        'sponsors',
        'witness_1_name',
        'witness_2_name',
        
        // Documents
        'marriage_license_no',
        'marriage_license_date',
        'marriage_certificate_no',
        'certificate_issued_date',
        
        // Pre-marriage Requirements
        'baptismal_cert_submitted',
        'confirmation_cert_submitted',
        'cenomar_submitted',
        'pre_cana_completed',
        'pre_cana_completion_date',
        
        // Additional Information
        'notes',
        'status',
    ];

    protected $casts = [
        'groom_birthdate' => 'date',
        'bride_birthdate' => 'date',
        'marriage_date' => 'date',
        'marriage_license_date' => 'date',
        'certificate_issued_date' => 'date',
        'pre_cana_completion_date' => 'date',
        'sponsors' => 'array',
        'baptismal_cert_submitted' => 'boolean',
        'confirmation_cert_submitted' => 'boolean',
        'cenomar_submitted' => 'boolean',
        'pre_cana_completed' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the priest who officiated the marriage
     */
    public function priest(): BelongsTo
    {
        return $this->belongsTo(Priest::class);
    }

    /**
     * Get the schedule associated with this marriage
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }
}
