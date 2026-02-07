<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalesStageController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(SalesStage::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stage_name' => 'required|string|max:255|unique:sales_stages',
            'description' => 'nullable|string',
        ]);

        $stage = SalesStage::create($validated);
        return response()->json($stage, 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(SalesStage::findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $stage = SalesStage::findOrFail($id);
        $validated = $request->validate([
            'stage_name' => 'nullable|string|max:255|unique:sales_stages,stage_name,' . $id,
            'description' => 'nullable|string',
        ]);
        $stage->update($validated);
        return response()->json($stage);
    }

    public function destroy(int $id): JsonResponse
    {
        SalesStage::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
