<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Services\CRM\ProspectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProspectController extends Controller
{
    public function __construct(private ProspectService $prospectService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $prospects = $this->prospectService->list($orgId, $request->all());
        return response()->json($prospects);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'market_segment' => 'nullable|string|max:255',
            'customer_group' => 'nullable|string|max:255',
            'territory' => 'nullable|string|max:255',
            'no_of_employees' => 'nullable|string|max:50',
            'annual_revenue' => 'nullable|numeric|min:0',
            'fax' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'prospect_owner_id' => 'nullable|integer|exists:users,id',
            'company' => 'nullable|string|max:255',
        ]);

        $prospect = $this->prospectService->create($orgId, $validated);
        return response()->json($prospect, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $prospect = $this->prospectService->find($orgId, $id);
        return response()->json($prospect);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'market_segment' => 'nullable|string|max:255',
            'customer_group' => 'nullable|string|max:255',
            'territory' => 'nullable|string|max:255',
            'no_of_employees' => 'nullable|string|max:50',
            'annual_revenue' => 'nullable|numeric|min:0',
            'fax' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'prospect_owner_id' => 'nullable|integer|exists:users,id',
            'company' => 'nullable|string|max:255',
        ]);

        $prospect = $this->prospectService->update($orgId, $id, $validated);
        return response()->json($prospect);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $this->prospectService->delete($orgId, $id);
        return response()->json(null, 204);
    }
}
