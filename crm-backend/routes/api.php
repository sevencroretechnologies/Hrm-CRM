<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CompetitorController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\CrmNoteController;
use App\Http\Controllers\Api\CrmSettingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\OpportunityController;
use App\Http\Controllers\Api\OpportunityLostReasonController;
use App\Http\Controllers\Api\ProspectController;
use App\Http\Controllers\Api\SalesStageController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('dashboard/lead-conversion-funnel', [DashboardController::class, 'leadConversionFunnel']);
    Route::get('dashboard/opportunity-pipeline', [DashboardController::class, 'opportunityPipeline']);

    Route::apiResource('leads', LeadController::class);
    Route::post('leads/{id}/convert-to-opportunity', [LeadController::class, 'convertToOpportunity']);
    Route::post('leads/{id}/add-to-prospect', [LeadController::class, 'addToProspect']);
    Route::post('leads/{id}/create-prospect', [LeadController::class, 'createProspect']);

    Route::apiResource('opportunities', OpportunityController::class);
    Route::post('opportunities/{id}/declare-lost', [OpportunityController::class, 'declareLost']);
    Route::post('opportunities/set-multiple-status', [OpportunityController::class, 'setMultipleStatus']);

    Route::apiResource('prospects', ProspectController::class);

    Route::apiResource('campaigns', CampaignController::class);
    Route::get('email-campaigns', [CampaignController::class, 'emailCampaigns']);
    Route::post('email-campaigns', [CampaignController::class, 'storeEmailCampaign']);
    Route::put('email-campaigns/{id}', [CampaignController::class, 'updateEmailCampaign']);
    Route::delete('email-campaigns/{id}', [CampaignController::class, 'destroyEmailCampaign']);

    Route::apiResource('contracts', ContractController::class);
    Route::post('contracts/{id}/sign', [ContractController::class, 'sign']);

    Route::apiResource('appointments', AppointmentController::class);

    Route::get('notes', [CrmNoteController::class, 'index']);
    Route::post('notes', [CrmNoteController::class, 'store']);
    Route::delete('notes/{id}', [CrmNoteController::class, 'destroy']);

    Route::apiResource('sales-stages', SalesStageController::class);
    Route::apiResource('lost-reasons', OpportunityLostReasonController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('competitors', CompetitorController::class)->only(['index', 'store', 'destroy']);

    Route::get('settings', [CrmSettingController::class, 'show']);
    Route::put('settings', [CrmSettingController::class, 'update']);
});
