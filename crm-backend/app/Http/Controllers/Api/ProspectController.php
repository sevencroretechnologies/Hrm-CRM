<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProspectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProspectController extends Controller
{
    public function __construct(private ProspectService $prospectService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $prospects = $this->prospectService->list($request->all());
        return response()->json($prospects);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255|unique:prospects',
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

        $prospect = $this->prospectService->create($validated);
        return response()->json($prospect, 201);
    }

    public function show(int $id): JsonResponse
    {
        $prospect = $this->prospectService->find($id);
        return response()->json($prospect);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'nullable|string|max:255|unique:prospects,company_name,' . $id,
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

        $prospect = $this->prospectService->update($id, $validated);
        return response()->json($prospect);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->prospectService->delete($id);
        return response()->json(null, 204);
    }
}
