<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunity_lost_reason_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opportunity_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('opportunity_lost_reason_id');
            $table->foreign('opportunity_lost_reason_id', 'olrd_lost_reason_id_fk')
                ->references('id')
                ->on('opportunity_lost_reasons')
                ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opportunity_lost_reason_details');
    }
};
