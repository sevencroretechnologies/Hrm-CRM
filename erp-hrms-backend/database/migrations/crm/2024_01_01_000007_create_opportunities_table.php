<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staff_members')->nullOnDelete();
            $table->string('opportunity_from')->default('Lead');
            $table->unsignedBigInteger('party_id');
            $table->string('customer_name')->nullable();
            $table->enum('status', ['Open', 'Quotation', 'Converted', 'Lost', 'Replied', 'Closed'])->default('Open');
            $table->string('opportunity_type')->nullable();
            $table->foreignId('opportunity_owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('sales_stage_id')->nullable()->constrained('sales_stages')->nullOnDelete();
            $table->date('expected_closing')->nullable();
            $table->decimal('probability', 5, 2)->default(100);
            $table->string('no_of_employees')->nullable();
            $table->decimal('annual_revenue', 15, 2)->default(0);
            $table->string('customer_group')->nullable();
            $table->string('industry')->nullable();
            $table->string('market_segment')->nullable();
            $table->string('website')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('territory')->nullable();
            $table->string('currency')->default('USD');
            $table->decimal('conversion_rate', 10, 4)->default(1.0);
            $table->decimal('opportunity_amount', 15, 2)->default(0);
            $table->decimal('base_opportunity_amount', 15, 2)->default(0);
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('company')->nullable();
            $table->date('transaction_date')->nullable();
            $table->string('language')->nullable();
            $table->string('title')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('job_title')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_mobile')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('phone')->nullable();
            $table->string('phone_ext')->nullable();
            $table->text('order_lost_reason')->nullable();
            $table->decimal('total', 15, 2)->default(0);
            $table->decimal('base_total', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
