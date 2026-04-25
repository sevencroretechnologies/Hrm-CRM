<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_bank_details', function (Blueprint $table) {
            $table->id();

            // Foreign Key — links to the customers table
            $table->foreignId('customer_id')
                  ->constrained('customers')
                  ->cascadeOnDelete();

            // Bank Details
            $table->string('bank_name');
            $table->string('account_no');
            $table->string('ifsc_code');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_bank_details');
    }
};
