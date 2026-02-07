<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('crm_leads')->nullOnDelete();
            $table->foreignId('prospect_id')->nullable()->constrained('crm_prospects')->nullOnDelete();
            $table->foreignId('sales_stage_id')->nullable()->constrained('crm_sales_stages')->nullOnDelete();
            $table->foreignId('campaign_id')->nullable()->constrained('crm_campaigns')->nullOnDelete();
            $table->string('name');
            $table->decimal('amount', 15, 2)->nullable();
            $table->date('expected_close_date')->nullable();
            $table->decimal('probability', 5, 2)->nullable();
            $table->string('status')->default('open');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_opportunities');
    }
};
