<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('org_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('staff_members')->nullOnDelete();
            $table->enum('party_type', ['Customer', 'Supplier', 'Employee'])->default('Customer');
            $table->string('party_name');
            $table->foreignId('party_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['Unsigned', 'Active', 'Inactive', 'Cancelled'])->default('Unsigned');
            $table->enum('fulfilment_status', ['N/A', 'Unfulfilled', 'Partially Fulfilled', 'Fulfilled', 'Lapsed'])->default('N/A');
            $table->boolean('is_signed')->default(false);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('signee')->nullable();
            $table->timestamp('signed_on')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('contract_template')->nullable();
            $table->text('contract_terms');
            $table->boolean('requires_fulfilment')->default(false);
            $table->date('fulfilment_deadline')->nullable();
            $table->string('signee_company')->nullable();
            $table->string('signed_by_company')->nullable();
            $table->string('document_type')->nullable();
            $table->string('document_name')->nullable();
            $table->string('party_full_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
