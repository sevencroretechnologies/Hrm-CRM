<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Services\CRM\OpportunityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpportunityController extends Controller
{
    public function __construct(private OpportunityService $opportunityService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $opportunities = $this->opportunityService->list($orgId, $request->all());
        return response()->json($opportunities);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'opportunity_from' => 'required|string|in:Lead,Prospect,Customer',
            'party_id' => 'required|integer',
            'customer_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:Open,Quotation,Converted,Lost,Replied,Closed',
            'opportunity_type' => 'nullable|string|max:255',
            'opportunity_owner_id' => 'nullable|integer|exists:users,id',
            'staff_id' => 'nullable|integer|exists:staff_members,id',
            'sales_stage_id' => 'nullable|integer|exists:sales_stages,id',
            'expected_closing' => 'nullable|date',
            'probability' => 'nullable|numeric|min:0|max:100',
            'opportunity_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'conversion_rate' => 'nullable|numeric|min:0',
            'company' => 'nullable|string|max:255',
            'transaction_date' => 'nullable|date',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_mobile' => 'nullable|string|max:50',
            'territory' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'market_segment' => 'nullable|string|max:255',
            'website' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'items' => 'nullable|array',
            'items.*.item_code' => 'nullable|string|max:255',
            'items.*.item_name' => 'nullable|string|max:255',
            'items.*.qty' => 'nullable|numeric|min:0',
            'items.*.rate' => 'nullable|numeric|min:0',
            'items.*.uom' => 'nullable|string|max:50',
        ]);

        $validated['opportunity_owner_id'] = $validated['opportunity_owner_id'] ?? $request->user()->id;

        $opportunity = $this->opportunityService->create($orgId, $validated);
        return response()->json($opportunity, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $opportunity = $this->opportunityService->find($orgId, $id);
        return response()->json($opportunity);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'opportunity_from' => 'nullable|string|in:Lead,Prospect,Customer',
            'party_id' => 'nullable|integer',
            'customer_name' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:Open,Quotation,Converted,Lost,Replied,Closed',
            'opportunity_type' => 'nullable|string|max:255',
            'opportunity_owner_id' => 'nullable|integer|exists:users,id',
            'staff_id' => 'nullable|integer|exists:staff_members,id',
            'sales_stage_id' => 'nullable|integer|exists:sales_stages,id',
            'expected_closing' => 'nullable|date',
            'probability' => 'nullable|numeric|min:0|max:100',
            'opportunity_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'conversion_rate' => 'nullable|numeric|min:0',
            'company' => 'nullable|string|max:255',
            'transaction_date' => 'nullable|date',
            'contact_person' => 'nullable|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_mobile' => 'nullable|string|max:50',
            'territory' => 'nullable|string|max:255',
            'items' => 'nullable|array',
            'items.*.item_code' => 'nullable|string|max:255',
            'items.*.item_name' => 'nullable|string|max:255',
            'items.*.qty' => 'nullable|numeric|min:0',
            'items.*.rate' => 'nullable|numeric|min:0',
            'items.*.uom' => 'nullable|string|max:50',
        ]);

        $opportunity = $this->opportunityService->update($orgId, $id, $validated);
        return response()->json($opportunity);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $this->opportunityService->delete($orgId, $id);
        return response()->json(null, 204);
    }

    public function declareLost(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'lost_reason_ids' => 'required|array',
            'lost_reason_ids.*' => 'integer|exists:opportunity_lost_reasons,id',
            'competitor_ids' => 'nullable|array',
            'competitor_ids.*' => 'integer|exists:competitors,id',
            'detailed_reason' => 'nullable|string',
        ]);

        $opportunity = $this->opportunityService->declareLost(
            $orgId,
            $id,
            $validated['lost_reason_ids'],
            $validated['competitor_ids'] ?? [],
            $validated['detailed_reason'] ?? null
        );
        return response()->json($opportunity);
    }

    public function setMultipleStatus(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:opportunities,id',
            'status' => 'required|string|in:Open,Quotation,Converted,Lost,Replied,Closed',
        ]);

        $count = $this->opportunityService->setMultipleStatus($orgId, $validated['ids'], $validated['status']);
        return response()->json(['updated' => $count]);
    }
}
