<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ContractService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function __construct(private ContractService $contractService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $contracts = $this->contractService->list($request->all());
        return response()->json($contracts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'party_type' => 'required|string|in:Customer,Supplier,Employee',
            'party_name' => 'required|string|max:255',
            'party_user_id' => 'nullable|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'contract_template' => 'nullable|string|max:255',
            'contract_terms' => 'required|string',
            'requires_fulfilment' => 'nullable|boolean',
            'fulfilment_deadline' => 'nullable|date',
            'document_type' => 'nullable|string|max:255',
            'document_name' => 'nullable|string|max:255',
            'fulfilment_checklists' => 'nullable|array',
            'fulfilment_checklists.*.requirement' => 'required|string|max:255',
            'fulfilment_checklists.*.fulfilled' => 'nullable|boolean',
            'fulfilment_checklists.*.notes' => 'nullable|string',
        ]);

        $contract = $this->contractService->create($validated);
        return response()->json($contract, 201);
    }

    public function show(int $id): JsonResponse
    {
        $contract = $this->contractService->find($id);
        return response()->json($contract);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'party_type' => 'nullable|string|in:Customer,Supplier,Employee',
            'party_name' => 'nullable|string|max:255',
            'party_user_id' => 'nullable|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'contract_template' => 'nullable|string|max:255',
            'contract_terms' => 'nullable|string',
            'requires_fulfilment' => 'nullable|boolean',
            'fulfilment_deadline' => 'nullable|date',
            'document_type' => 'nullable|string|max:255',
            'document_name' => 'nullable|string|max:255',
            'fulfilment_checklists' => 'nullable|array',
            'fulfilment_checklists.*.requirement' => 'required|string|max:255',
            'fulfilment_checklists.*.fulfilled' => 'nullable|boolean',
            'fulfilment_checklists.*.notes' => 'nullable|string',
        ]);

        $contract = $this->contractService->update($id, $validated);
        return response()->json($contract);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->contractService->delete($id);
        return response()->json(null, 204);
    }

    public function sign(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'signee' => 'nullable|string|max:255',
            'ip_address' => 'nullable|string|max:50',
        ]);

        $contract = $this->contractService->sign($id, $validated);
        return response()->json($contract);
    }
}
