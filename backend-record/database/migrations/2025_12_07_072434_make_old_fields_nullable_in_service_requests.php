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
            $table->string('participant_name')->nullable()->change();
            $table->string('requestor_name')->nullable()->change();
            $table->string('contact_number')->nullable()->change();
            $table->string('email')->nullable()->change();
            $table->text('details')->nullable()->change();
            $table->text('special_requirements')->nullable()->change();
            $table->string('assigned_priest')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->string('participant_name')->nullable(false)->change();
            $table->string('requestor_name')->nullable(false)->change();
            $table->string('contact_number')->nullable(false)->change();
            $table->string('email')->nullable()->change(); // email was already nullable
            $table->text('details')->nullable()->change(); // details was already nullable
            $table->text('special_requirements')->nullable()->change();
            $table->string('assigned_priest')->nullable()->change();
        });
    }
};
