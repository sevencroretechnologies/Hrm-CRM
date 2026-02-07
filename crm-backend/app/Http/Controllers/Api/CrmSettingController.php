<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrmSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrmSettingController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = CrmSetting::first();
        if (!$settings) {
            $settings = CrmSetting::create([]);
        }
        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'campaign_naming_by' => 'nullable|string|in:Campaign Name,Naming Series',
            'allow_lead_duplication_based_on_emails' => 'nullable|boolean',
            'auto_creation_of_contact' => 'nullable|boolean',
            'close_opportunity_after_days' => 'nullable|integer|min:1',
            'default_valid_till' => 'nullable|integer|min:1',
            'carry_forward_communication_and_comments' => 'nullable|boolean',
        ]);

        $settings = CrmSetting::first();
        if (!$settings) {
            $settings = CrmSetting::create($validated);
        } else {
            $settings->update($validated);
        }

        return response()->json($settings);
    }
}
