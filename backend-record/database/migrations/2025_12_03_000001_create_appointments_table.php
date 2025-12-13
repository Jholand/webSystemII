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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // Wedding, Baptism, Funeral, Mass Intention, Blessing, Other
            $table->string('client_name');
            $table->string('contact_number');
            $table->string('email')->nullable();
            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->enum('status', ['Pending', 'Confirmed', 'Completed', 'Cancelled'])->default('Pending');
            $table->decimal('event_fee', 10, 2);
            $table->text('notes')->nullable();
            $table->boolean('is_paid')->default(false);
            $table->foreignId('payment_id')->nullable()->constrained('donations')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('appointment_date');
            $table->index('status');
            $table->index('is_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
