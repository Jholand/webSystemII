<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('id');
            $table->string('participant_name')->nullable()->after('requestor_name');
            $table->decimal('service_fee', 10, 2)->default(0)->after('processed_at');
            $table->boolean('is_paid')->default(false)->after('service_fee');
            $table->unsignedBigInteger('payment_id')->nullable()->after('is_paid');
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('payment_id')->references('id')->on('donations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['payment_id']);
            $table->dropColumn(['user_id', 'participant_name', 'service_fee', 'is_paid', 'payment_id']);
        });
    }
};
