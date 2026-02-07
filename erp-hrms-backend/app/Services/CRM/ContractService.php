<?php

namespace App\Services\CRM;

use App\Models\CRM\Contract;
use Illuminate\Pagination\LengthAwarePaginator;

class ContractService
{
    public function list(int $orgId, array $filters = []): LengthAwarePaginator
    {
        $query = Contract::where('org_id', $orgId)->with(['partyUser', 'fulfilmentChecklists']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['party_type'])) {
            $query->where('party_type', $filters['party_type']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('party_name', 'like', "%{$search}%")
                    ->orWhere('signee', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $orgId, int $id): Contract
    {
        return Contract::where('org_id', $orgId)
            ->with(['partyUser', 'fulfilmentChecklists'])
            ->findOrFail($id);
    }

    public function create(int $orgId, array $data): Contract
    {
        $data['org_id'] = $orgId;
        $checklists = $data['fulfilment_checklists'] ?? [];
        unset($data['fulfilment_checklists']);

        $contract = Contract::create($data);

        foreach ($checklists as $checklist) {
            $contract->fulfilmentChecklists()->create($checklist);
        }

        return $contract->fresh(['partyUser', 'fulfilmentChecklists']);
    }

    public function update(int $orgId, int $id, array $data): Contract
    {
        $contract = Contract::where('org_id', $orgId)->findOrFail($id);
        $checklists = $data['fulfilment_checklists'] ?? null;
        unset($data['fulfilment_checklists']);

        $contract->update($data);

        if ($checklists !== null) {
            $contract->fulfilmentChecklists()->delete();
            foreach ($checklists as $checklist) {
                $contract->fulfilmentChecklists()->create($checklist);
            }
        }

        return $contract->fresh(['partyUser', 'fulfilmentChecklists']);
    }

    public function delete(int $orgId, int $id): bool
    {
        $contract = Contract::where('org_id', $orgId)->findOrFail($id);
        return $contract->delete();
    }

    public function sign(int $orgId, int $id, array $data): Contract
    {
        $contract = Contract::where('org_id', $orgId)->findOrFail($id);
        $contract->update([
            'is_signed' => true,
            'signee' => $data['signee'] ?? null,
            'signed_on' => now(),
            'ip_address' => $data['ip_address'] ?? null,
        ]);
        return $contract->fresh(['partyUser', 'fulfilmentChecklists']);
    }
}
