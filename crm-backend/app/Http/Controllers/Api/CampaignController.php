<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CampaignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function __construct(private CampaignService $campaignService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $campaigns = $this->campaignService->list($request->all());
        return response()->json($campaigns);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'campaign_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'email_schedules' => 'nullable|array',
            'email_schedules.*.email_template' => 'nullable|string|max:255',
            'email_schedules.*.send_after_days' => 'nullable|integer|min:0',
        ]);

        $campaign = $this->campaignService->create($validated);
        return response()->json($campaign, 201);
    }

    public function show(int $id): JsonResponse
    {
        $campaign = $this->campaignService->find($id);
        return response()->json($campaign);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'campaign_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'email_schedules' => 'nullable|array',
            'email_schedules.*.email_template' => 'nullable|string|max:255',
            'email_schedules.*.send_after_days' => 'nullable|integer|min:0',
        ]);

        $campaign = $this->campaignService->update($id, $validated);
        return response()->json($campaign);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->campaignService->delete($id);
        return response()->json(null, 204);
    }

    public function emailCampaigns(Request $request): JsonResponse
    {
        $emailCampaigns = $this->campaignService->listEmailCampaigns($request->all());
        return response()->json($emailCampaigns);
    }

    public function storeEmailCampaign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'campaign_id' => 'required|integer|exists:campaigns,id',
            'email_campaign_for' => 'required|string|in:Lead,Contact,Email Group',
            'recipient' => 'required|string|max:255',
            'sender_id' => 'nullable|integer|exists:users,id',
            'start_date' => 'required|date',
            'status' => 'nullable|string|in:Scheduled,In Progress,Completed,Unsubscribed',
        ]);

        $emailCampaign = $this->campaignService->createEmailCampaign($validated);
        return response()->json($emailCampaign, 201);
    }

    public function updateEmailCampaign(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'nullable|string|in:Scheduled,In Progress,Completed,Unsubscribed',
            'end_date' => 'nullable|date',
        ]);

        $emailCampaign = $this->campaignService->updateEmailCampaign($id, $validated);
        return response()->json($emailCampaign);
    }

    public function destroyEmailCampaign(int $id): JsonResponse
    {
        $this->campaignService->deleteEmailCampaign($id);
        return response()->json(null, 204);
    }
}
