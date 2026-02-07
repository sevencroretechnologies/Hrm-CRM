<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staff_members')->nullOnDelete();
            $table->string('salutation')->nullable();
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('lead_name')->nullable();
            $table->string('job_title')->nullable();
            $table->string('gender')->nullable();
            $table->foreignId('lead_owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['Lead', 'Open', 'Replied', 'Opportunity', 'Quotation', 'Lost Quotation', 'Interested', 'Converted', 'Do Not Contact'])->default('Lead');
            $table->string('type')->nullable();
            $table->enum('request_type', ['Product Enquiry', 'Request for Information', 'Suggestions', 'Other'])->nullable();
            $table->string('email_id')->nullable();
            $table->string('website')->nullable();
            $table->string('mobile_no')->nullable();
            $table->string('whatsapp_no')->nullable();
            $table->string('phone')->nullable();
            $table->string('phone_ext')->nullable();
            $table->string('company_name')->nullable();
            $table->string('no_of_employees')->nullable();
            $table->decimal('annual_revenue', 15, 2)->default(0);
            $table->string('industry')->nullable();
            $table->string('market_segment')->nullable();
            $table->string('territory')->nullable();
            $table->string('fax')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->enum('qualification_status', ['Unqualified', 'In Process', 'Qualified'])->default('Unqualified');
            $table->foreignId('qualified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('qualified_on')->nullable();
            $table->string('company')->nullable();
            $table->string('language')->nullable();
            $table->string('image')->nullable();
            $table->string('title')->nullable();
            $table->boolean('disabled')->default(false);
            $table->boolean('unsubscribed')->default(false);
            $table->boolean('blog_subscriber')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
