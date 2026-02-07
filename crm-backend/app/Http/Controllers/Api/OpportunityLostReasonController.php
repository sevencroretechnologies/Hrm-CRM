<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OpportunityLostReason;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpportunityLostReasonController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(OpportunityLostReason::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255|unique:opportunity_lost_reasons',
        ]);

        $reason = OpportunityLostReason::create($validated);
        return response()->json($reason, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        OpportunityLostReason::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
