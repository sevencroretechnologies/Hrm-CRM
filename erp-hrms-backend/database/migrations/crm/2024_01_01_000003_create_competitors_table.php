<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competitors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('competitor_name');
            $table->string('website')->nullable();
            $table->timestamps();
            $table->unique(['org_id', 'competitor_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competitors');
    }
};
