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
        Schema::create('birth_records', function (Blueprint $table) {
            $table->id();
            
            // Child Information
            $table->string('child_name');
            $table->date('birth_date');
            $table->time('birth_time')->nullable();
            $table->string('birth_place');
            $table->enum('gender', ['male', 'female']);
            $table->decimal('birth_weight', 5, 2)->nullable(); // in kg
            $table->decimal('birth_height', 5, 2)->nullable(); // in cm
            
            // Parents Information
            $table->string('father_name');
            $table->string('father_citizenship')->nullable();
            $table->string('father_occupation')->nullable();
            $table->integer('father_age_at_birth')->nullable();
            $table->string('mother_maiden_name');
            $table->string('mother_citizenship')->nullable();
            $table->string('mother_occupation')->nullable();
            $table->integer('mother_age_at_birth')->nullable();
            $table->date('parents_marriage_date')->nullable();
            $table->string('parents_marriage_place')->nullable();
            
            // Address Information
            $table->string('residence_address');
            $table->string('residence_city');
            $table->string('residence_province');
            $table->string('residence_country')->default('Philippines');
            
            // Registration Information
            $table->string('birth_certificate_no')->unique();
            $table->date('registration_date');
            $table->string('registered_by')->nullable();
            $table->string('civil_registrar')->nullable();
            
            // Church Record Connection
            $table->foreignId('baptism_record_id')->nullable()->constrained('baptism_records')->nullOnDelete();
            $table->boolean('is_baptized')->default(false);
            $table->date('baptism_scheduled_date')->nullable();
            $table->foreignId('baptism_schedule_id')->nullable()->constrained('schedules')->nullOnDelete();
            
            // Document Status
            $table->boolean('psa_copy_issued')->default(false);
            $table->date('psa_copy_issue_date')->nullable();
            $table->integer('psa_copies_count')->default(0);
            
            // Additional Information
            $table->enum('birth_type', ['live', 'stillborn', 'multiple'])->default('live');
            $table->integer('birth_order')->nullable(); // For multiple births
            $table->text('medical_notes')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['registered', 'pending', 'amended', 'cancelled'])->default('registered');
            
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('birth_date');
            $table->index('baptism_record_id');
            $table->index('baptism_schedule_id');
            $table->index('status');
            $table->index('child_name');
            $table->index(['father_name', 'mother_maiden_name']);
            $table->index('registration_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('birth_records');
    }
};
