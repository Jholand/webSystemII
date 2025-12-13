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
        Schema::create('service_request_types', function (Blueprint $table) {
            $table->id();
            $table->string('category'); // Sacrament & Schedule, Document, Facility & Event
            $table->string('type_code')->unique(); // baptism_scheduling, venue_reservation, etc.
            $table->string('type_name'); // Baptism Scheduling, Venue Reservation
            $table->text('description')->nullable();
            $table->string('icon')->nullable(); // Lucide icon name
            $table->json('required_fields')->nullable(); // JSON array of required field names
            $table->json('optional_fields')->nullable(); // JSON array of optional field names
            $table->decimal('default_fee', 10, 2)->default(0);
            $table->boolean('requires_payment')->default(false);
            $table->boolean('requires_documents')->default(false);
            $table->boolean('requires_approval')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_request_types');
    }
};
