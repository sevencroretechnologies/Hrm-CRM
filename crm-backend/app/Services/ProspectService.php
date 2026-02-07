<?php

namespace App\Services;

use App\Models\Prospect;
use Illuminate\Pagination\LengthAwarePaginator;

class ProspectService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Prospect::with(['prospectOwner', 'leads', 'opportunities']);

        if (!empty($filters['industry'])) {
            $query->where('industry', $filters['industry']);
        }
        if (!empty($filters['territory'])) {
            $query->where('territory', $filters['territory']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('company_name', 'like', "%{$search}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $id): Prospect
    {
        return Prospect::with(['prospectOwner', 'leads', 'opportunities', 'notes'])->findOrFail($id);
    }

    public function create(array $data): Prospect
    {
        return Prospect::create($data);
    }

    public function update(int $id, array $data): Prospect
    {
        $prospect = Prospect::findOrFail($id);
        $prospect->update($data);
        return $prospect->fresh(['prospectOwner', 'leads', 'opportunities']);
    }

    public function delete(int $id): bool
    {
        $prospect = Prospect::findOrFail($id);
        $prospect->leads()->detach();
        $prospect->opportunities()->detach();
        return $prospect->delete();
    }
}
