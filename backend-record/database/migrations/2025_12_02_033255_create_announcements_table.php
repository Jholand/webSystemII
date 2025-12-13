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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->string('category'); // General, Urgent, Event, etc.
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->date('publish_date');
            $table->date('expiry_date')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->string('target_audience')->nullable(); // All, Members, Staff, etc.
            $table->boolean('display_on_homepage')->default(false);
            $table->boolean('send_notification')->default(false);
            $table->string('attachment_path')->nullable();
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
        Schema::dropIfExists('announcements');
    }
};
