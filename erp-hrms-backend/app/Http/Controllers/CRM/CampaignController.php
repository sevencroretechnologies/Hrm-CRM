<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Services\CRM\CampaignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function __construct(private CampaignService $campaignService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $campaigns = $this->campaignService->list($orgId, $request->all());
        return response()->json($campaigns);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'campaign_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'email_schedules' => 'nullable|array',
            'email_schedules.*.email_template' => 'nullable|string|max:255',
            'email_schedules.*.send_after_days' => 'nullable|integer|min:0',
        ]);

        $campaign = $this->campaignService->create($orgId, $validated);
        return response()->json($campaign, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $campaign = $this->campaignService->find($orgId, $id);
        return response()->json($campaign);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'campaign_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'email_schedules' => 'nullable|array',
            'email_schedules.*.email_template' => 'nullable|string|max:255',
            'email_schedules.*.send_after_days' => 'nullable|integer|min:0',
        ]);

        $campaign = $this->campaignService->update($orgId, $id, $validated);
        return response()->json($campaign);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $this->campaignService->delete($orgId, $id);
        return response()->json(null, 204);
    }

    public function emailCampaigns(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $emailCampaigns = $this->campaignService->listEmailCampaigns($orgId, $request->all());
        return response()->json($emailCampaigns);
    }

    public function storeEmailCampaign(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'campaign_id' => 'required|integer|exists:campaigns,id',
            'email_campaign_for' => 'nullable|string|in:Lead,Opportunity',
            'recipient' => 'nullable|string|max:255',
            'sender_id' => 'nullable|integer|exists:users,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string|in:Scheduled,In Progress,Completed,Unsubscribed',
        ]);

        $emailCampaign = $this->campaignService->createEmailCampaign($orgId, $validated);
        return response()->json($emailCampaign, 201);
    }

    public function updateEmailCampaign(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'campaign_id' => 'nullable|integer|exists:campaigns,id',
            'email_campaign_for' => 'nullable|string|in:Lead,Opportunity',
            'recipient' => 'nullable|string|max:255',
            'sender_id' => 'nullable|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|string|in:Scheduled,In Progress,Completed,Unsubscribed',
        ]);

        $emailCampaign = $this->campaignService->updateEmailCampaign($orgId, $id, $validated);
        return response()->json($emailCampaign);
    }

    public function destroyEmailCampaign(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $this->campaignService->deleteEmailCampaign($orgId, $id);
        return response()->json(null, 204);
    }
}
