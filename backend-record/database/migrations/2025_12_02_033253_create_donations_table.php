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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->string('donor_name');
            $table->string('contact_number')->nullable();
            $table->string('email')->nullable();
            $table->string('category'); // Mass Offering, Building Fund, etc.
            $table->decimal('amount', 10, 2);
            $table->string('payment_method'); // Cash, Check, Online, etc.
            $table->string('reference_number')->nullable();
            $table->date('donation_date');
            $table->text('purpose')->nullable();
            $table->text('notes')->nullable();
            $table->string('receipt_number')->unique();
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('confirmed');
            $table->string('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
