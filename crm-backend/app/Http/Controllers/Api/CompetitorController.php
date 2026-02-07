<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Competitor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompetitorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Competitor::all());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'competitor_name' => 'required|string|max:255|unique:competitors',
            'website' => 'nullable|string|max:255',
        ]);

        $competitor = Competitor::create($validated);
        return response()->json($competitor, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        Competitor::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
