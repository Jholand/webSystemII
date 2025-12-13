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
        Schema::create('baptism_records', function (Blueprint $table) {
            $table->id();
            
            // Child Information
            $table->string('child_name');
            $table->date('child_birthdate');
            $table->string('child_birthplace');
            $table->enum('child_gender', ['male', 'female']);
            $table->boolean('is_legitimate')->default(true);
            
            // Parents Information
            $table->string('father_name');
            $table->string('father_birthplace')->nullable();
            $table->string('father_religion')->default('Catholic');
            $table->string('mother_name');
            $table->string('mother_birthplace')->nullable();
            $table->string('mother_religion')->default('Catholic');
            $table->string('parents_address');
            $table->string('parents_contact')->nullable();
            
            // Baptism Details
            $table->date('baptism_date');
            $table->time('baptism_time');
            $table->string('baptism_location');
            $table->foreignId('priest_id')->constrained('priests')->cascadeOnDelete();
            $table->foreignId('schedule_id')->nullable()->constrained('schedules')->nullOnDelete();
            
            // Godparents/Sponsors
            $table->string('godfather_name');
            $table->string('godfather_address')->nullable();
            $table->string('godmother_name');
            $table->string('godmother_address')->nullable();
            $table->json('additional_sponsors')->nullable(); // For additional sponsors
            
            // Certificate Information
            $table->string('baptism_certificate_no')->unique();
            $table->date('certificate_issued_date');
            $table->string('birth_certificate_no')->nullable();
            
            // Pre-baptism Requirements
            $table->boolean('birth_cert_submitted')->default(false);
            $table->boolean('marriage_cert_submitted')->default(false);
            $table->boolean('baptism_seminar_completed')->default(false);
            $table->date('seminar_completion_date')->nullable();
            
            // Sacrament Records (for tracking other sacraments)
            $table->string('first_communion_date')->nullable();
            $table->string('confirmation_date')->nullable();
            
            // Additional Information
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'completed', 'cancelled'])->default('pending');
            
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('baptism_date');
            $table->index('priest_id');
            $table->index('schedule_id');
            $table->index('status');
            $table->index('child_name');
            $table->index(['father_name', 'mother_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('baptism_records');
    }
};
