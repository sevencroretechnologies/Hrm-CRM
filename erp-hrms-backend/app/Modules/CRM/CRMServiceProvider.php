<?php

namespace App\Modules\CRM;

use Illuminate\Support\ServiceProvider;

class CRMServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(database_path('migrations/crm'));

        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
    }
}
