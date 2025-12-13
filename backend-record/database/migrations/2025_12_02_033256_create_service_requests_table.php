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
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_type'); // Baptism, Wedding, Mass Intention, Counseling, etc.
            $table->string('requestor_name');
            $table->string('contact_number');
            $table->string('email')->nullable();
            $table->date('preferred_date')->nullable();
            $table->time('preferred_time')->nullable();
            $table->text('details');
            $table->text('special_requirements')->nullable();
            $table->string('assigned_priest')->nullable();
            $table->enum('status', ['pending', 'approved', 'scheduled', 'completed', 'cancelled'])->default('pending');
            $table->enum('priority', ['normal', 'urgent'])->default('normal');
            $table->date('scheduled_date')->nullable();
            $table->time('scheduled_time')->nullable();
            $table->text('admin_notes')->nullable();
            $table->string('processed_by')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
