<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CompetitorController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\CrmNoteController;
use App\Http\Controllers\Api\CrmSettingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EnumController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\OpportunityController;
use App\Http\Controllers\Api\OpportunityLostReasonController;
use App\Http\Controllers\Api\ProspectController;
use App\Http\Controllers\Api\SalesStageController;
use App\Http\Controllers\Api\SourceController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\RequestTypeController;
use App\Http\Controllers\Api\IndustryTypeController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OpportunityStageController;
use App\Http\Controllers\Api\OpportunityTypeController;
use App\Http\Controllers\Api\TerritoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CustomerGroupController;
use App\Http\Controllers\Api\PaymentTermController;
use App\Http\Controllers\Api\PriceListController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SalesTaskController;
use App\Http\Controllers\Api\SalesTaskDetailController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskSourceController;
use App\Http\Controllers\Api\TaskTypeController;
use App\Http\Controllers\Api\ProductCategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OpportunityProductController;
use App\Http\Controllers\Api\Auth\AccessController;
use App\Http\Controllers\Api\Admin\UsersController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/sign-up', [AccessController::class, 'signUp']);
    Route::post('/sign-in', [AccessController::class, 'signIn']);
    Route::post('/forgot-password', [AccessController::class, 'forgotPassword']);
    Route::post('/reset-password', [AccessController::class, 'resetPassword']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Authentication
    // Route::prefix('auth')->group(function () {
    //     Route::post('/sign-out', [AccessController::class, 'signOut']);
    //     Route::get('/profile', [AccessController::class, 'profile']);
    // });
    // Users
    // Route::get('users', [UserController::class, 'index']);
    Route::get('users', [UsersController::class, 'index']);

    Route::get('dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('dashboard/lead-conversion-funnel', [DashboardController::class, 'leadConversionFunnel']);
    Route::get('dashboard/opportunity-pipeline', [DashboardController::class, 'opportunityPipeline']);

    Route::apiResource('leads', LeadController::class);
    Route::post('leads/{id}/convert-to-opportunity', [LeadController::class, 'convertToOpportunity']);
    Route::post('leads/{id}/add-to-prospect', [LeadController::class, 'addToProspect']);
    Route::post('leads/{id}/create-prospect', [LeadController::class, 'createProspect']);

    Route::apiResource('opportunities', OpportunityController::class);
    Route::post('opportunities/{id}/declare-lost', [OpportunityController::class, 'declareLost']);
    Route::get('opportunities/{id}/products', [OpportunityController::class, 'getProducts']);
    Route::post('opportunities/set-multiple-status', [OpportunityController::class, 'setMultipleStatus']);

    Route::apiResource('prospects', ProspectController::class);

    Route::apiResource('campaigns', CampaignController::class);
    Route::get('email-campaigns', [CampaignController::class, 'emailCampaigns']);
    Route::post('email-campaigns', [CampaignController::class, 'storeEmailCampaign']);
    Route::put('email-campaigns/{id}', [CampaignController::class, 'updateEmailCampaign']);
    Route::delete('email-campaigns/{id}', [CampaignController::class, 'destroyEmailCampaign']);

    Route::apiResource('sources', SourceController::class);

    Route::apiResource('contracts', ContractController::class);
    Route::post('contracts/{id}/sign', [ContractController::class, 'sign']);

    Route::apiResource('appointments', AppointmentController::class);

    Route::get('notes', [CrmNoteController::class, 'index']);
    Route::post('notes', [CrmNoteController::class, 'store']);
    Route::delete('notes/{id}', [CrmNoteController::class, 'destroy']);

    Route::apiResource('sales-stages', SalesStageController::class);
    Route::apiResource('statuses', StatusController::class);
    Route::apiResource('request-types', RequestTypeController::class);
    Route::apiResource('industry-types', IndustryTypeController::class);
    Route::apiResource('opportunity-stages', OpportunityStageController::class);
    Route::apiResource('opportunity-types', OpportunityTypeController::class);
    Route::apiResource('lost-reasons', OpportunityLostReasonController::class);
    Route::apiResource('competitors', CompetitorController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('territories', TerritoryController::class);
    Route::apiResource('contacts', ContactController::class);

    // Master Data
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('customer-groups', CustomerGroupController::class);
    // Route::apiResource('payment-terms', PaymentTermController::class);
    // Route::apiResource('price-lists', PriceListController::class);
    Route::apiResource('product-categories', ProductCategoryController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('opportunity-products', OpportunityProductController::class);
    Route::apiResource('sales-tasks', SalesTaskController::class);
    Route::apiResource('sales-task-details', SalesTaskDetailController::class);
    // Route::apiResource('tasks', TaskController::class);
    Route::apiResource('task-sources', TaskSourceController::class);
    Route::apiResource('task-types', TaskTypeController::class);

    // Enum routes
    Route::get('enums/qualification-statuses', [EnumController::class, 'qualificationStatuses']);
    Route::get('enums/genders', [EnumController::class, 'genders']);

    Route::get('settings', [CrmSettingController::class, 'show']);
    Route::put('settings', [CrmSettingController::class, 'update']);
});
