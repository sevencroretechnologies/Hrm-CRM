<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prospects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('company_name');
            $table->string('industry')->nullable();
            $table->string('market_segment')->nullable();
            $table->string('customer_group')->nullable();
            $table->string('territory')->nullable();
            $table->string('no_of_employees')->nullable();
            $table->decimal('annual_revenue', 15, 2)->default(0);
            $table->string('fax')->nullable();
            $table->string('website')->nullable();
            $table->foreignId('prospect_owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('company')->nullable();
            $table->timestamps();
            $table->unique(['org_id', 'company_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prospects');
    }
};
