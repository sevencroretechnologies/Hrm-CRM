<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\CampaignEmailSchedule;
use App\Models\EmailCampaign;
use Illuminate\Pagination\LengthAwarePaginator;

class CampaignService
{
    public function list(array $filters = []): LengthAwarePaginator
    {
        $query = Campaign::with(['emailSchedules', 'emailCampaigns']);

        if (!empty($filters['search'])) {
            $query->where('campaign_name', 'like', "%{$filters['search']}%");
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $id): Campaign
    {
        return Campaign::with(['emailSchedules', 'emailCampaigns'])->findOrFail($id);
    }

    public function create(array $data): Campaign
    {
        $schedules = $data['email_schedules'] ?? [];
        unset($data['email_schedules']);

        $campaign = Campaign::create($data);

        foreach ($schedules as $schedule) {
            $schedule['campaign_id'] = $campaign->id;
            CampaignEmailSchedule::create($schedule);
        }

        return $campaign->fresh(['emailSchedules']);
    }

    public function update(int $id, array $data): Campaign
    {
        $campaign = Campaign::findOrFail($id);
        $schedules = $data['email_schedules'] ?? null;
        unset($data['email_schedules']);

        $campaign->update($data);

        if ($schedules !== null) {
            $campaign->emailSchedules()->delete();
            foreach ($schedules as $schedule) {
                $schedule['campaign_id'] = $campaign->id;
                CampaignEmailSchedule::create($schedule);
            }
        }

        return $campaign->fresh(['emailSchedules', 'emailCampaigns']);
    }

    public function delete(int $id): bool
    {
        $campaign = Campaign::findOrFail($id);
        $campaign->emailSchedules()->delete();
        $campaign->emailCampaigns()->delete();
        return $campaign->delete();
    }

    public function listEmailCampaigns(array $filters = []): LengthAwarePaginator
    {
        $query = EmailCampaign::with(['campaign', 'sender']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['campaign_id'])) {
            $query->where('campaign_id', $filters['campaign_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function createEmailCampaign(array $data): EmailCampaign
    {
        return EmailCampaign::create($data);
    }

    public function updateEmailCampaign(int $id, array $data): EmailCampaign
    {
        $emailCampaign = EmailCampaign::findOrFail($id);
        $emailCampaign->update($data);
        return $emailCampaign->fresh(['campaign', 'sender']);
    }

    public function deleteEmailCampaign(int $id): bool
    {
        return EmailCampaign::findOrFail($id)->delete();
    }
}
