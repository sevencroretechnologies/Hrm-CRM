<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Services\CRM\ContractService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function __construct(private ContractService $contractService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $contracts = $this->contractService->list($orgId, $request->all());
        return response()->json($contracts);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'party_type' => 'nullable|string|in:Customer,Supplier,Employee',
            'party_name' => 'required|string|max:255',
            'party_user_id' => 'nullable|integer|exists:users,id',
            'staff_id' => 'nullable|integer|exists:staff_members,id',
            'contract_terms' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'contract_template' => 'nullable|string|max:255',
            'requires_fulfilment' => 'nullable|boolean',
            'fulfilment_deadline' => 'nullable|date',
            'signee_company' => 'nullable|string|max:255',
            'signed_by_company' => 'nullable|string|max:255',
            'document_type' => 'nullable|string|max:255',
            'document_name' => 'nullable|string|max:255',
            'party_full_name' => 'nullable|string|max:255',
            'fulfilment_checklists' => 'nullable|array',
            'fulfilment_checklists.*.requirement' => 'required|string|max:255',
            'fulfilment_checklists.*.notes' => 'nullable|string',
        ]);

        $contract = $this->contractService->create($orgId, $validated);
        return response()->json($contract, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $contract = $this->contractService->find($orgId, $id);
        return response()->json($contract);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'party_type' => 'nullable|string|in:Customer,Supplier,Employee',
            'party_name' => 'nullable|string|max:255',
            'party_user_id' => 'nullable|integer|exists:users,id',
            'staff_id' => 'nullable|integer|exists:staff_members,id',
            'contract_terms' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'contract_template' => 'nullable|string|max:255',
            'requires_fulfilment' => 'nullable|boolean',
            'fulfilment_deadline' => 'nullable|date',
            'signee_company' => 'nullable|string|max:255',
            'signed_by_company' => 'nullable|string|max:255',
            'document_type' => 'nullable|string|max:255',
            'document_name' => 'nullable|string|max:255',
            'party_full_name' => 'nullable|string|max:255',
            'fulfilment_checklists' => 'nullable|array',
            'fulfilment_checklists.*.requirement' => 'required|string|max:255',
            'fulfilment_checklists.*.fulfilled' => 'nullable|boolean',
            'fulfilment_checklists.*.notes' => 'nullable|string',
        ]);

        $contract = $this->contractService->update($orgId, $id, $validated);
        return response()->json($contract);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $this->contractService->delete($orgId, $id);
        return response()->json(null, 204);
    }

    public function sign(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'signee' => 'nullable|string|max:255',
            'ip_address' => 'nullable|string|max:45',
        ]);

        $contract = $this->contractService->sign($orgId, $id, $validated);
        return response()->json($contract);
    }
}
