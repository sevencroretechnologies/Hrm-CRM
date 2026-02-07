<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\CRM\CrmSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrmSettingController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $settings = CrmSetting::firstOrCreate(
            ['org_id' => $orgId],
            [
                'campaign_naming_by' => 'Campaign Name',
                'allow_lead_duplication_based_on_emails' => false,
                'auto_creation_of_contact' => true,
                'close_opportunity_after_days' => 15,
                'carry_forward_communication_and_comments' => false,
            ]
        );
        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'campaign_naming_by' => 'nullable|string|max:255',
            'allow_lead_duplication_based_on_emails' => 'nullable|boolean',
            'auto_creation_of_contact' => 'nullable|boolean',
            'close_opportunity_after_days' => 'nullable|integer|min:1',
            'default_valid_till' => 'nullable|integer',
            'carry_forward_communication_and_comments' => 'nullable|boolean',
        ]);

        $settings = CrmSetting::firstOrCreate(
            ['org_id' => $orgId],
            [
                'campaign_naming_by' => 'Campaign Name',
                'allow_lead_duplication_based_on_emails' => false,
                'auto_creation_of_contact' => true,
                'close_opportunity_after_days' => 15,
                'carry_forward_communication_and_comments' => false,
            ]
        );

        $settings->update($validated);
        return response()->json($settings);
    }
}
