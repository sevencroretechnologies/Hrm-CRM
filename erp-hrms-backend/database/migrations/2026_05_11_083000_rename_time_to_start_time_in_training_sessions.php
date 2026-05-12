<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            // Rename 'time' to 'start_time'
            $table->renameColumn('time', 'start_time');

            // Add 'end_time' after 'start_time'
            $table->time('end_time')->nullable()->after('start_time');
        });
    }

    public function down(): void
    {
        Schema::table('training_sessions', function (Blueprint $table) {
            $table->dropColumn('end_time');
            $table->renameColumn('start_time', 'time');
        });
    }
};
