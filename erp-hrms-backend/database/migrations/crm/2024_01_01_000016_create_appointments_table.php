<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staff_members')->nullOnDelete();
            $table->timestamp('scheduled_time');
            $table->enum('status', ['Open', 'Unverified', 'Closed'])->default('Open');
            $table->string('customer_name');
            $table->string('customer_phone_number')->nullable();
            $table->string('customer_skype')->nullable();
            $table->string('customer_email');
            $table->text('customer_details')->nullable();
            $table->string('appointment_with')->nullable();
            $table->string('party')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
