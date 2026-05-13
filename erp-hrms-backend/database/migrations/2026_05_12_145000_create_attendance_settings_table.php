<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendance_settings', function (Blueprint $table) {
            $table->id();

            $table->string('default_clock_in_time')->default('09:00 AM');
            $table->string('default_clock_out_time')->default('06:00 PM');
            $table->integer('grace_minutes')->default(0);

            $table->unsignedBigInteger('org_id')->nullable();
            $table->unsignedBigInteger('company_id')->nullable();

            $table->softDeletes();
            $table->timestamps();

            $table->foreign('org_id')->references('id')->on('organizations')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_settings');
    }
};
