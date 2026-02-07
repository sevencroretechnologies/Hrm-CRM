<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrmNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrmNoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notable_type' => 'required|string|in:lead,opportunity,prospect',
            'notable_id' => 'required|integer',
        ]);

        $typeMap = [
            'lead' => 'App\\Models\\Lead',
            'opportunity' => 'App\\Models\\Opportunity',
            'prospect' => 'App\\Models\\Prospect',
        ];

        $notes = CrmNote::where('notable_type', $typeMap[$validated['notable_type']])
            ->where('notable_id', $validated['notable_id'])
            ->with('addedByUser')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notable_type' => 'required|string|in:lead,opportunity,prospect',
            'notable_id' => 'required|integer',
            'note' => 'required|string',
            'added_by' => 'nullable|integer|exists:users,id',
        ]);

        $typeMap = [
            'lead' => 'App\\Models\\Lead',
            'opportunity' => 'App\\Models\\Opportunity',
            'prospect' => 'App\\Models\\Prospect',
        ];

        $note = CrmNote::create([
            'notable_type' => $typeMap[$validated['notable_type']],
            'notable_id' => $validated['notable_id'],
            'note' => $validated['note'],
            'added_by' => $validated['added_by'] ?? null,
            'added_on' => now(),
        ]);

        return response()->json($note->load('addedByUser'), 201);
    }

    public function destroy(int $id): JsonResponse
    {
        CrmNote::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
