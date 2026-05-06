<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Nullify existing values
        DB::table('sales_tasks')->update([
            'sales_assign_id' => null
        ]);

        // Step 2: Get existing foreign keys from MySQL
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'sales_tasks'
            AND COLUMN_NAME = 'sales_assign_id'
            AND TABLE_SCHEMA = DATABASE()
        ");

        Schema::table('sales_tasks', function (Blueprint $table) use ($foreignKeys) {

            // Step 3: Drop FK only if it exists
            foreach ($foreignKeys as $fk) {
                $table->dropForeign($fk->CONSTRAINT_NAME);
            }

            // Step 4: Add new FK
            $table->foreign('sales_assign_id')
                ->references('id')
                ->on('staff_members')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        // Step 1: Get existing foreign keys again
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'sales_tasks'
            AND COLUMN_NAME = 'sales_assign_id'
            AND TABLE_SCHEMA = DATABASE()
        ");

        Schema::table('sales_tasks', function (Blueprint $table) use ($foreignKeys) {

            // Step 2: Drop FK safely
            foreach ($foreignKeys as $fk) {
                $table->dropForeign($fk->CONSTRAINT_NAME);
            }

            // Step 3: Restore old FK
            $table->foreign('sales_assign_id')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }
};