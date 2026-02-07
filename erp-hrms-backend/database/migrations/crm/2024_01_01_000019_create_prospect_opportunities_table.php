<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prospect_opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prospect_id')->constrained()->cascadeOnDelete();
            $table->foreignId('opportunity_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('stage')->nullable();
            $table->string('deal_owner')->nullable();
            $table->decimal('probability', 5, 2)->default(0);
            $table->date('expected_closing')->nullable();
            $table->string('currency')->default('USD');
            $table->string('contact_person')->nullable();
            $table->timestamps();
            $table->unique(['prospect_id', 'opportunity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prospect_opportunities');
    }
};
