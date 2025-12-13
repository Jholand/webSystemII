<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('marriage_records', function (Blueprint $table) {
            $table->id();
            
            // Groom Information
            $table->string('groom_name');
            $table->date('groom_birthdate');
            $table->string('groom_birthplace');
            $table->string('groom_father_name');
            $table->string('groom_mother_name');
            $table->string('groom_address');
            $table->string('groom_religion')->default('Catholic');
            $table->enum('groom_civil_status', ['single', 'widowed', 'annulled'])->default('single');
            
            // Bride Information
            $table->string('bride_name');
            $table->date('bride_birthdate');
            $table->string('bride_birthplace');
            $table->string('bride_father_name');
            $table->string('bride_mother_name');
            $table->string('bride_address');
            $table->string('bride_religion')->default('Catholic');
            $table->enum('bride_civil_status', ['single', 'widowed', 'annulled'])->default('single');
            
            // Marriage Details
            $table->date('marriage_date');
            $table->time('marriage_time');
            $table->string('marriage_location');
            $table->foreignId('priest_id')->constrained('priests')->cascadeOnDelete();
            $table->foreignId('schedule_id')->nullable()->constrained('schedules')->nullOnDelete();
            
            // Sponsors/Witnesses
            $table->json('sponsors')->nullable(); // Array of sponsor names
            $table->string('witness_1_name')->nullable();
            $table->string('witness_2_name')->nullable();
            
            // Documents
            $table->string('marriage_license_no')->nullable();
            $table->date('marriage_license_date')->nullable();
            $table->string('marriage_certificate_no')->unique();
            $table->date('certificate_issued_date');
            
            // Pre-marriage Requirements
            $table->boolean('baptismal_cert_submitted')->default(false);
            $table->boolean('confirmation_cert_submitted')->default(false);
            $table->boolean('cenomar_submitted')->default(false);
            $table->boolean('pre_cana_completed')->default(false);
            $table->date('pre_cana_completion_date')->nullable();
            
            // Additional Information
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'completed', 'cancelled'])->default('pending');
            
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('marriage_date');
            $table->index('priest_id');
            $table->index('schedule_id');
            $table->index('status');
            $table->index(['groom_name', 'bride_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marriage_records');
    }
};
