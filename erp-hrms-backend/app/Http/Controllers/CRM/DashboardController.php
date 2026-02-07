<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Services\CRM\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService)
    {
    }

    public function stats(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        return response()->json($this->dashboardService->getStats($orgId));
    }

    public function leadConversionFunnel(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        return response()->json($this->dashboardService->getLeadConversionFunnel($orgId));
    }

    public function opportunityPipeline(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        return response()->json($this->dashboardService->getOpportunityPipeline($orgId));
    }
}
