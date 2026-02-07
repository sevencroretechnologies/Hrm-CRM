<?php

namespace App\Modules\CRM;

use Illuminate\Support\Facades\Route;
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

        $this->registerRouteModelBindings();

        $this->loadRoutesFrom(__DIR__ . '/Routes/api.php');
    }

    protected function registerRouteModelBindings(): void
    {
        Route::model('crmContract', Models\CrmContract::class);
        Route::model('crmNote', Models\CrmNote::class);
        Route::model('salesStage', Models\SalesStage::class);
    }
}
