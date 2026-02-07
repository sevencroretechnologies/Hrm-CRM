<?php

use App\Modules\CRM\Controllers\AppointmentController;
use App\Modules\CRM\Controllers\CampaignController;
use App\Modules\CRM\Controllers\CrmContractController;
use App\Modules\CRM\Controllers\CrmNoteController;
use App\Modules\CRM\Controllers\CrmSettingController;
use App\Modules\CRM\Controllers\LeadController;
use App\Modules\CRM\Controllers\OpportunityController;
use App\Modules\CRM\Controllers\OpportunityItemController;
use App\Modules\CRM\Controllers\ProspectController;
use App\Modules\CRM\Controllers\SalesStageController;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', 'auth:sanctum'])->prefix('api/crm')->group(function () {

    Route::apiResource('leads', LeadController::class)
        ->parameters(['leads' => 'lead']);

    Route::apiResource('prospects', ProspectController::class)
        ->parameters(['prospects' => 'prospect']);
    Route::post('prospects/{prospect}/leads', [ProspectController::class, 'attachLead']);
    Route::delete('prospects/{prospect}/leads/{lead}', [ProspectController::class, 'detachLead']);

    Route::apiResource('opportunities', OpportunityController::class)
        ->parameters(['opportunities' => 'opportunity']);

    Route::get('opportunities/{opportunity}/items', [OpportunityItemController::class, 'index']);
    Route::post('opportunities/{opportunity}/items', [OpportunityItemController::class, 'store']);
    Route::put('opportunities/{opportunity}/items/{item}', [OpportunityItemController::class, 'update']);
    Route::delete('opportunities/{opportunity}/items/{item}', [OpportunityItemController::class, 'destroy']);

    Route::apiResource('sales-stages', SalesStageController::class)
        ->parameters(['sales-stages' => 'salesStage']);

    Route::apiResource('campaigns', CampaignController::class)
        ->parameters(['campaigns' => 'campaign']);

    Route::apiResource('appointments', AppointmentController::class)
        ->parameters(['appointments' => 'appointment']);

    Route::apiResource('notes', CrmNoteController::class)
        ->parameters(['notes' => 'crmNote']);

    Route::apiResource('contracts', CrmContractController::class)
        ->parameters(['contracts' => 'crmContract']);

    Route::get('settings', [CrmSettingController::class, 'index']);
    Route::get('settings/{key}', [CrmSettingController::class, 'show']);
    Route::post('settings', [CrmSettingController::class, 'upsert']);
    Route::delete('settings/{key}', [CrmSettingController::class, 'destroy']);
});
