<?php

namespace App\Services\CRM;

use App\Models\CRM\Prospect;
use Illuminate\Pagination\LengthAwarePaginator;

class ProspectService
{
    public function list(int $orgId, array $filters = []): LengthAwarePaginator
    {
        $query = Prospect::where('org_id', $orgId)
            ->with(['prospectOwner', 'leads', 'opportunities']);

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

    public function find(int $orgId, int $id): Prospect
    {
        return Prospect::where('org_id', $orgId)
            ->with(['prospectOwner', 'leads', 'opportunities', 'notes'])
            ->findOrFail($id);
    }

    public function create(int $orgId, array $data): Prospect
    {
        $data['org_id'] = $orgId;
        return Prospect::create($data);
    }

    public function update(int $orgId, int $id, array $data): Prospect
    {
        $prospect = Prospect::where('org_id', $orgId)->findOrFail($id);
        $prospect->update($data);
        return $prospect->fresh(['prospectOwner', 'leads', 'opportunities']);
    }

    public function delete(int $orgId, int $id): bool
    {
        $prospect = Prospect::where('org_id', $orgId)->findOrFail($id);
        $prospect->leads()->detach();
        $prospect->opportunities()->detach();
        return $prospect->delete();
    }
}
