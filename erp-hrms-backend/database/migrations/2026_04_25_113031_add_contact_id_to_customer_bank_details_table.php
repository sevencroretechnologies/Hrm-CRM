<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customer_bank_details', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_contact_id')->nullable()->after('customer_id');
            $table->foreign('customer_contact_id')->references('id')->on('customer_contacts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_bank_details', function (Blueprint $table) {
            $table->dropForeign(['customer_contact_id']);
            $table->dropColumn('customer_contact_id');
            // Revert customer_id to not null might fail if there are nulls, but we'll try
            // $table->unsignedBigInteger('customer_id')->nullable(false)->change();
        });
    }
};
