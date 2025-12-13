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
        Schema::table('service_requests', function (Blueprint $table) {
            // Add new fields
            $table->foreignId('service_request_type_id')->nullable()->after('id')->constrained()->onDelete('set null');
            $table->string('category')->nullable()->after('request_type'); // Sacrament & Schedule, Document, Facility & Event
            $table->json('details_json')->nullable()->after('details'); // Store dynamic fields as JSON
            $table->enum('payment_status', ['unpaid', 'paid', 'waived', 'partial'])->default('unpaid')->after('is_paid');
            $table->foreignId('assigned_staff_id')->nullable()->after('assigned_priest')->constrained('users')->onDelete('set null');
            
            // Update existing enum to include more statuses
            $table->enum('status', ['pending', 'approved', 'scheduled', 'in_progress', 'completed', 'cancelled', 'rejected'])->default('pending')->change();
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropForeign(['service_request_type_id']);
            $table->dropForeign(['assigned_staff_id']);
            $table->dropColumn(['service_request_type_id', 'category', 'details_json', 'payment_status', 'assigned_staff_id']);
        });
    }
};
