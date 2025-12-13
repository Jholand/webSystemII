<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('birthdate')->nullable()->after('phone');
            $table->enum('gender', ['Male', 'Female'])->nullable()->after('birthdate');
            $table->string('city')->nullable()->after('address');
            $table->string('province')->nullable()->after('city');
            $table->string('postal_code')->nullable()->after('province');
            $table->string('emergency_contact_name')->nullable()->after('postal_code');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            $table->string('emergency_contact_relation')->nullable()->after('emergency_contact_phone');
            $table->string('family_group')->nullable()->after('emergency_contact_relation');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'birthdate', 'gender', 'city', 'province', 'postal_code',
                'emergency_contact_name', 'emergency_contact_phone', 
                'emergency_contact_relation', 'family_group'
            ]);
        });
    }
};
