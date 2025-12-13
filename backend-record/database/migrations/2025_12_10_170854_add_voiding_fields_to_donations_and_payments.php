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
        // Add voiding fields to donations table
        Schema::table('donations', function (Blueprint $table) {
            if (!Schema::hasColumn('donations', 'is_voided')) {
                $table->boolean('is_voided')->default(false)->after('status');
            }
            if (!Schema::hasColumn('donations', 'void_reason')) {
                $table->text('void_reason')->nullable()->after('is_voided');
            }
            if (!Schema::hasColumn('donations', 'voided_by')) {
                $table->string('voided_by')->nullable()->after('void_reason');
            }
            if (!Schema::hasColumn('donations', 'voided_at')) {
                $table->timestamp('voided_at')->nullable()->after('voided_by');
            }
        });

        // Add voiding fields to payment_records table
        Schema::table('payment_records', function (Blueprint $table) {
            if (!Schema::hasColumn('payment_records', 'is_voided')) {
                $table->boolean('is_voided')->default(false)->after('visible_to_user');
            }
            if (!Schema::hasColumn('payment_records', 'void_reason')) {
                $table->text('void_reason')->nullable()->after('is_voided');
            }
            if (!Schema::hasColumn('payment_records', 'voided_by')) {
                $table->string('voided_by')->nullable()->after('void_reason');
            }
            if (!Schema::hasColumn('payment_records', 'voided_at')) {
                $table->timestamp('voided_at')->nullable()->after('voided_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donations', function (Blueprint $table) {
            $table->dropColumn(['is_voided', 'void_reason', 'voided_by', 'voided_at']);
        });

        Schema::table('payment_records', function (Blueprint $table) {
            $table->dropColumn(['is_voided', 'void_reason', 'voided_by', 'voided_at']);
        });
    }
};
