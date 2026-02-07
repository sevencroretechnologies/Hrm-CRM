<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\CRM\CrmNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrmNoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $query = CrmNote::where('org_id', $orgId)->with('addedByUser');

        if ($request->has('notable_type') && $request->has('notable_id')) {
            $query->where('notable_type', $request->notable_type)
                ->where('notable_id', $request->notable_id);
        }

        $notes = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);
        return response()->json($notes);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'notable_type' => 'required|string',
            'notable_id' => 'required|integer',
            'note' => 'required|string',
        ]);

        $note = CrmNote::create([
            'org_id' => $orgId,
            'notable_type' => $validated['notable_type'],
            'notable_id' => $validated['notable_id'],
            'note' => $validated['note'],
            'added_by' => $request->user()->id,
            'added_on' => now(),
        ]);

        return response()->json($note->load('addedByUser'), 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $note = CrmNote::where('org_id', $orgId)->findOrFail($id);
        $note->delete();
        return response()->json(null, 204);
    }
}
