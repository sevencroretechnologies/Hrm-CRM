<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crm_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('campaign_naming_by')->default('Campaign Name');
            $table->boolean('allow_lead_duplication_based_on_emails')->default(false);
            $table->boolean('auto_creation_of_contact')->default(true);
            $table->integer('close_opportunity_after_days')->default(15);
            $table->integer('default_valid_till')->nullable();
            $table->boolean('carry_forward_communication_and_comments')->default(false);
            $table->timestamps();
            $table->unique('org_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crm_settings');
    }
};
