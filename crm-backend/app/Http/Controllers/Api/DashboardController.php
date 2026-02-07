<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService)
    {
    }

    public function stats(): JsonResponse
    {
        return response()->json($this->dashboardService->getStats());
    }

    public function leadConversionFunnel(): JsonResponse
    {
        return response()->json($this->dashboardService->getLeadConversionFunnel());
    }

    public function opportunityPipeline(): JsonResponse
    {
        return response()->json($this->dashboardService->getOpportunityPipeline());
    }
}
