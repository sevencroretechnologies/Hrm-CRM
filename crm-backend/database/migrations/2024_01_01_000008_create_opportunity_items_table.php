<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunity_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('opportunity_id')->constrained()->cascadeOnDelete();
            $table->string('item_code')->nullable();
            $table->string('item_name')->nullable();
            $table->string('uom')->nullable();
            $table->decimal('qty', 10, 2)->default(1);
            $table->string('brand')->nullable();
            $table->string('item_group')->nullable();
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->decimal('rate', 15, 2)->default(0);
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('base_rate', 15, 2)->default(0);
            $table->decimal('base_amount', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opportunity_items');
    }
};
