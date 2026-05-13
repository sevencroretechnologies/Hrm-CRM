<?php

namespace App\Http\Controllers\Api\crm;

use App\Http\Controllers\Controller;
use App\Models\Source;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Source::query();

        // Search across name and source code.
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('source_code', 'like', "%{$search}%");
            });
        }

        // Optional ordering (defaults to newest first).
        $orderBy = $request->input('order_by', 'created_at');
        $order = $request->input('order', 'desc');
        $query->orderBy($orderBy, $order);

        // Allow callers to opt out of pagination.
        if ($request->boolean('paginate', true) === false || $request->input('paginate') === 'false') {
            return response()->json(['data' => $query->get()]);
        }

        $perPage = (int) $request->input('per_page', 15);
        $paginator = $query->paginate($perPage);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'source_code' => 'nullable|string|max:255',
        ]);

        $source = Source::create($validated);
        return response()->json($source, 201);
    }

    public function show(int $id): JsonResponse
    {
        $source = Source::findOrFail($id);
        return response()->json($source);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'source_code' => 'nullable|string|max:255',
        ]);

        $source = Source::findOrFail($id);
        $source->update($validated);
        return response()->json($source);
    }

    public function destroy(int $id): JsonResponse
    {
        $source = Source::findOrFail($id);
        $source->delete();
        return response()->json(null, 204);
    }
}
