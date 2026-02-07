<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\CRM\SalesStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesStageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        return response()->json(SalesStage::where('org_id', $orgId)->get());
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'stage_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validated['org_id'] = $orgId;
        $stage = SalesStage::create($validated);
        return response()->json($stage, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        return response()->json(SalesStage::where('org_id', $orgId)->findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $stage = SalesStage::where('org_id', $orgId)->findOrFail($id);

        $validated = $request->validate([
            'stage_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $stage->update($validated);
        return response()->json($stage);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        SalesStage::where('org_id', $orgId)->findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
