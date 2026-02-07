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
        Route::model('lead', Models\Lead::class);
        Route::model('prospect', Models\Prospect::class);
        Route::model('opportunity', Models\Opportunity::class);
        Route::model('item', Models\OpportunityItem::class);
        Route::model('sales_stage', Models\SalesStage::class);
        Route::model('campaign', Models\Campaign::class);
        Route::model('appointment', Models\Appointment::class);
        Route::model('note', Models\CrmNote::class);
        Route::model('crmContract', Models\CrmContract::class);
        Route::model('crmNote', Models\CrmNote::class);
    }
}
