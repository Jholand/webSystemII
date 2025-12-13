<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Certificate requests indexes
        $this->addIndexSafely('certificate_requests', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('certificate_type');
            $table->index('payment_status');
            $table->index('created_at');
            $table->index(['status', 'created_at'], 'cert_status_created_idx');
            $table->index(['user_id', 'status'], 'cert_user_status_idx');
        });

        // Service requests indexes
        $this->addIndexSafely('service_requests', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('request_type');
            $table->index('is_paid');
            $table->index('created_at');
            $table->index(['status', 'created_at'], 'service_status_created_idx');
            $table->index(['user_id', 'status'], 'service_user_status_idx');
        });

        // Correction requests indexes
        $this->addIndexSafely('correction_requests', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('status');
            $table->index('member_id');
            $table->index('submitted_at');
            $table->index(['status', 'submitted_at'], 'corr_status_submitted_idx');
        });

        // User notifications indexes
        $this->addIndexSafely('user_notifications', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('read');
            $table->index('type');
            $table->index('created_at');
            $table->index(['user_id', 'read'], 'notif_user_read_idx');
            $table->index(['user_id', 'created_at'], 'notif_user_created_idx');
        });

        // Schedules indexes
        $this->addIndexSafely('schedules', function (Blueprint $table) {
            $table->index('date');
            $table->index('type');
            $table->index('created_at');
            $table->index(['date', 'type'], 'schedule_date_type_idx');
        });

        // Donations indexes
        $this->addIndexSafely('donations', function (Blueprint $table) {
            $table->index('donation_date');
            $table->index('category');
            $table->index('created_by');
            $table->index('created_at');
            $table->index(['donation_date', 'category'], 'donation_date_category_idx');
        });

        // Payment records indexes
        $this->addIndexSafely('payment_records', function (Blueprint $table) {
            $table->index('user_id');
            $table->index('payment_date');
            $table->index('payment_type');
            $table->index('visible_to_user');
            $table->index('created_at');
            $table->index(['user_id', 'payment_date'], 'payment_user_date_idx');
        });

        // Appointments indexes
        $this->addIndexSafely('appointments', function (Blueprint $table) {
            $table->index('appointment_date');
            $table->index('type');
            $table->index('payment_status');
            $table->index('created_at');
            $table->index(['appointment_date', 'status'], 'appt_date_status_idx');
        });

        // Marriage records indexes
        $this->addIndexSafely('marriage_records', function (Blueprint $table) {
            $table->index('marriage_date');
            $table->index('created_at');
        });

        // Baptism records indexes
        $this->addIndexSafely('baptism_records', function (Blueprint $table) {
            $table->index('baptism_date');
            $table->index('created_at');
        });

        // Events indexes
        $this->addIndexSafely('events', function (Blueprint $table) {
            $table->index('event_date');
            $table->index('category');
            $table->index('status');
            $table->index('created_at');
            $table->index(['event_date', 'category'], 'event_date_category_idx');
        });

        // Documents indexes
        $this->addIndexSafely('documents', function (Blueprint $table) {
            $table->index('document_type');
            $table->index('category');
            $table->index('access_level');
            $table->index('uploaded_by');
            $table->index('document_date');
            $table->index('created_at');
        });
    }

    /**
     * Add indexes safely, catching duplicate index errors
     */
    private function addIndexSafely(string $tableName, callable $callback): void
    {
        try {
            Schema::table($tableName, $callback);
        } catch (\Exception $e) {
            // Silently ignore duplicate index errors
            if (!str_contains($e->getMessage(), 'Duplicate key name')) {
                throw $e;
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Indexes will be automatically dropped if tables are dropped
        // Or can be manually specified if needed
    }
};
