<?php

namespace App\Http\Controllers\Api\crm;

use App\Http\Controllers\Controller;
use App\Models\CustomerBankDetail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class CustomerBankDetailController extends Controller
{
    /**
     * List all bank details for a specific customer.
     * GET /customers/{customerId}/bank-details
     */
    public function index(int $customerId): JsonResponse
    {
        try {
            $bankDetails = CustomerBankDetail::where('customer_id', $customerId)
                ->latest()
                ->get();

            return response()->json([
                'message' => 'Bank details retrieved successfully.',
                'data'    => $bankDetails,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error'   => 'Failed to retrieve bank details',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new bank detail record for a customer.
     * POST /customers/{customerId}/bank-details
     */
    public function store(Request $request, int $customerId): JsonResponse
    {
        $validated = $request->validate([
            'bank_name'  => 'required|string|max:255',
            'account_no' => 'required|string|max:100',
            'ifsc_code'  => 'required|string|max:20',
        ]);

        $validated['customer_id'] = $customerId;

        $bankDetail = CustomerBankDetail::create($validated);

        return response()->json([
            'message' => 'Bank detail created successfully.',
            'data'    => $bankDetail,
        ], 201);
    }

    /**
     * Show a specific bank detail record.
     * GET /customers/{customerId}/bank-details/{bankDetail}
     */
    public function show(int $customerId, CustomerBankDetail $bankDetail): JsonResponse
    {
        if ($bankDetail->customer_id !== $customerId) {
            return response()->json(['error' => 'Not found.'], 404);
        }

        return response()->json([
            'message' => 'Bank detail retrieved successfully.',
            'data'    => $bankDetail,
        ], 200);
    }

    /**
     * Update a bank detail record.
     * PUT /customers/{customerId}/bank-details/{bankDetail}
     */
    public function update(Request $request, int $customerId, CustomerBankDetail $bankDetail): JsonResponse
    {
        if ($bankDetail->customer_id !== $customerId) {
            return response()->json(['error' => 'Not found.'], 404);
        }

        $validated = $request->validate([
            'bank_name'  => 'sometimes|string|max:255',
            'account_no' => 'sometimes|string|max:100',
            'ifsc_code'  => 'sometimes|string|max:20',
        ]);

        $bankDetail->update($validated);

        return response()->json([
            'message' => 'Bank detail updated successfully.',
            'data'    => $bankDetail,
        ], 200);
    }

    /**
     * Soft-delete a bank detail record.
     * DELETE /customers/{customerId}/bank-details/{bankDetail}
     */
    public function destroy(int $customerId, CustomerBankDetail $bankDetail): JsonResponse
    {
        if ($bankDetail->customer_id !== $customerId) {
            return response()->json(['error' => 'Not found.'], 404);
        }

        $bankDetail->delete();

        return response()->json(null, 204);
    }
}
