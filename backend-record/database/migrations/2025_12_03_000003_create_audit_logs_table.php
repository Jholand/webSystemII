<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action');
            $table->string('actor');
            $table->string('actor_email')->nullable();
            $table->text('details');
            $table->string('category');
            $table->unsignedBigInteger('related_user_id')->nullable();
            $table->string('related_user_name')->nullable();
            $table->text('request_details')->nullable();
            $table->timestamps();
            
            $table->index('related_user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
