<?php

namespace App\Http\Controllers\Api\crm;

use App\Http\Controllers\Controller;
use App\Services\crm\CampaignService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Exception;

class CampaignController extends Controller
{
    public function __construct(private CampaignService $campaignService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $data = $this->campaignService->list($request->all());

            return response()->json([
                'message' => 'All campaigns retrieved successfully.',
                'data' => $data,
                'pagination' => [
                    'current_page' => $data->currentPage(),
                    'total_pages' => $data->lastPage(),
                    'per_page' => $data->perPage(),
                    'total_items' => $data->total(),
                    'next_page_url' => $data->nextPageUrl(),
                    'prev_page_url' => $data->previousPageUrl(),
                ],
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Failed to retrieve campaigns',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'campaign_code' => 'nullable|string|max:255',
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
            'name' => 'nullable|string|max:255',
            'campaign_code' => 'nullable|string|max:255',
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
