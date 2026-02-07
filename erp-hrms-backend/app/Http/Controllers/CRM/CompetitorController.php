<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\CRM\Competitor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompetitorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        return response()->json(Competitor::where('org_id', $orgId)->get());
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'competitor_name' => 'required|string|max:255',
            'website' => 'nullable|string|max:255',
        ]);

        $validated['org_id'] = $orgId;
        $competitor = Competitor::create($validated);
        return response()->json($competitor, 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        Competitor::where('org_id', $orgId)->findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
