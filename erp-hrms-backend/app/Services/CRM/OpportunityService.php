<?php

namespace App\Services\CRM;

use App\Models\CRM\Opportunity;
use App\Models\CRM\OpportunityItem;
use Illuminate\Pagination\LengthAwarePaginator;

class OpportunityService
{
    public function list(int $orgId, array $filters = []): LengthAwarePaginator
    {
        $query = Opportunity::where('org_id', $orgId)
            ->with(['opportunityOwner', 'salesStage', 'items', 'lostReasons', 'competitors']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['sales_stage_id'])) {
            $query->where('sales_stage_id', $filters['sales_stage_id']);
        }
        if (!empty($filters['opportunity_owner_id'])) {
            $query->where('opportunity_owner_id', $filters['opportunity_owner_id']);
        }
        if (!empty($filters['opportunity_from'])) {
            $query->where('opportunity_from', $filters['opportunity_from']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $orgId, int $id): Opportunity
    {
        return Opportunity::where('org_id', $orgId)
            ->with(['opportunityOwner', 'salesStage', 'items', 'lostReasons', 'competitors', 'notes'])
            ->findOrFail($id);
    }

    public function create(int $orgId, array $data): Opportunity
    {
        $data['org_id'] = $orgId;
        $items = $data['items'] ?? [];
        unset($data['items']);

        if (empty($data['transaction_date'])) {
            $data['transaction_date'] = now()->toDateString();
        }

        $opportunity = Opportunity::create($data);

        foreach ($items as $item) {
            $item['opportunity_id'] = $opportunity->id;
            OpportunityItem::create($item);
        }

        $opportunity->calculateTotals();
        $opportunity->save();

        return $opportunity->fresh(['opportunityOwner', 'salesStage', 'items']);
    }

    public function update(int $orgId, int $id, array $data): Opportunity
    {
        $opportunity = Opportunity::where('org_id', $orgId)->findOrFail($id);

        $items = $data['items'] ?? null;
        unset($data['items']);

        $opportunity->update($data);

        if ($items !== null) {
            $opportunity->items()->delete();
            foreach ($items as $item) {
                $item['opportunity_id'] = $opportunity->id;
                OpportunityItem::create($item);
            }
            $opportunity->calculateTotals();
            $opportunity->save();
        }

        return $opportunity->fresh(['opportunityOwner', 'salesStage', 'items', 'lostReasons', 'competitors']);
    }

    public function delete(int $orgId, int $id): bool
    {
        $opportunity = Opportunity::where('org_id', $orgId)->findOrFail($id);
        $opportunity->items()->delete();
        $opportunity->lostReasons()->detach();
        $opportunity->competitors()->detach();
        return $opportunity->delete();
    }

    public function declareLost(int $orgId, int $id, array $lostReasonIds, array $competitorIds = [], ?string $detailedReason = null): Opportunity
    {
        $opportunity = Opportunity::where('org_id', $orgId)->findOrFail($id);

        $opportunity->status = 'Lost';
        if ($detailedReason) {
            $opportunity->order_lost_reason = $detailedReason;
        }
        $opportunity->save();

        $opportunity->lostReasons()->sync($lostReasonIds);
        $opportunity->competitors()->sync($competitorIds);

        return $opportunity->fresh(['lostReasons', 'competitors']);
    }

    public function setMultipleStatus(int $orgId, array $ids, string $status): int
    {
        return Opportunity::where('org_id', $orgId)->whereIn('id', $ids)->update(['status' => $status]);
    }
}
