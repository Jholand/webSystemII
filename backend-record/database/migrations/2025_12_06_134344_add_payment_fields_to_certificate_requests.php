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
        Schema::table('certificate_requests', function (Blueprint $table) {
            $table->decimal('certificate_fee', 10, 2)->default(0.00)->after('details');
            $table->enum('payment_status', ['unpaid', 'paid', 'waived'])->default('unpaid')->after('certificate_fee');
            $table->foreignId('payment_record_id')->nullable()->constrained('payment_records')->onDelete('set null')->after('payment_status');
            $table->timestamp('paid_at')->nullable()->after('payment_record_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificate_requests', function (Blueprint $table) {
            $table->dropForeign(['payment_record_id']);
            $table->dropColumn(['certificate_fee', 'payment_status', 'payment_record_id', 'paid_at']);
        });
    }
};
