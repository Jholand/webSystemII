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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('date');
            $table->time('time');
            $table->time('end_time')->nullable();
            $table->string('type'); // Mass, Wedding, Baptism, etc.
            $table->string('location')->nullable();
            $table->foreignId('priest_id')->nullable()->constrained('priests')->nullOnDelete();
            $table->text('description')->nullable();
            $table->integer('attendees')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'cancelled'])->default('scheduled');
            $table->timestamps();

            // Indexes for better performance
            $table->index('date');
            $table->index('type');
            $table->index('priest_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
