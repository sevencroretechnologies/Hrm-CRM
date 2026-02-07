<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\CRM\OpportunityLostReason;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpportunityLostReasonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        return response()->json(OpportunityLostReason::where('org_id', $orgId)->get());
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $validated['org_id'] = $orgId;
        $reason = OpportunityLostReason::create($validated);
        return response()->json($reason, 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        OpportunityLostReason::where('org_id', $orgId)->findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
