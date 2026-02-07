<?php

namespace App\Services\CRM;

use App\Models\CRM\Campaign;
use App\Models\CRM\EmailCampaign;
use Illuminate\Pagination\LengthAwarePaginator;

class CampaignService
{
    public function list(int $orgId, array $filters = []): LengthAwarePaginator
    {
        $query = Campaign::where('org_id', $orgId)->with(['emailSchedules', 'emailCampaigns']);

        if (!empty($filters['search'])) {
            $query->where('campaign_name', 'like', "%{$filters['search']}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $orgId, int $id): Campaign
    {
        return Campaign::where('org_id', $orgId)
            ->with(['emailSchedules', 'emailCampaigns'])
            ->findOrFail($id);
    }

    public function create(int $orgId, array $data): Campaign
    {
        $data['org_id'] = $orgId;
        $schedules = $data['email_schedules'] ?? [];
        unset($data['email_schedules']);

        $campaign = Campaign::create($data);

        foreach ($schedules as $schedule) {
            $campaign->emailSchedules()->create($schedule);
        }

        return $campaign->fresh(['emailSchedules']);
    }

    public function update(int $orgId, int $id, array $data): Campaign
    {
        $campaign = Campaign::where('org_id', $orgId)->findOrFail($id);
        $schedules = $data['email_schedules'] ?? null;
        unset($data['email_schedules']);

        $campaign->update($data);

        if ($schedules !== null) {
            $campaign->emailSchedules()->delete();
            foreach ($schedules as $schedule) {
                $campaign->emailSchedules()->create($schedule);
            }
        }

        return $campaign->fresh(['emailSchedules', 'emailCampaigns']);
    }

    public function delete(int $orgId, int $id): bool
    {
        $campaign = Campaign::where('org_id', $orgId)->findOrFail($id);
        return $campaign->delete();
    }

    public function listEmailCampaigns(int $orgId, array $filters = []): LengthAwarePaginator
    {
        $query = EmailCampaign::where('org_id', $orgId)->with(['campaign', 'sender']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['campaign_id'])) {
            $query->where('campaign_id', $filters['campaign_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function createEmailCampaign(int $orgId, array $data): EmailCampaign
    {
        $data['org_id'] = $orgId;
        return EmailCampaign::create($data);
    }

    public function updateEmailCampaign(int $orgId, int $id, array $data): EmailCampaign
    {
        $emailCampaign = EmailCampaign::where('org_id', $orgId)->findOrFail($id);
        $emailCampaign->update($data);
        return $emailCampaign->fresh(['campaign', 'sender']);
    }

    public function deleteEmailCampaign(int $orgId, int $id): bool
    {
        $emailCampaign = EmailCampaign::where('org_id', $orgId)->findOrFail($id);
        return $emailCampaign->delete();
    }
}
