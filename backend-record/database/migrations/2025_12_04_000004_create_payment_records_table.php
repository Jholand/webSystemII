<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('payment_type'); // 'sacrament_fee', 'donation', 'event_fee'
            $table->string('service_name')->nullable(); // baptism, wedding, etc.
            $table->decimal('amount', 10, 2);
            $table->string('payment_method'); // 'cash', 'gcash', 'bank_transfer'
            $table->string('reference_number')->nullable();
            $table->text('description')->nullable();
            $table->string('recorded_by'); // accountant/secretary name
            $table->timestamp('payment_date');
            $table->boolean('visible_to_user')->default(true); // walk-in payments visible to user
            $table->timestamps();
            
            $table->index(['user_id', 'visible_to_user']);
            $table->index('payment_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_records');
    }
};
