<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Services\CRM\LeadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    public function __construct(private LeadService $leadService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $leads = $this->leadService->list($orgId, $request->all());
        return response()->json($leads);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'salutation' => 'nullable|string|max:50',
            'job_title' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:50',
            'lead_owner_id' => 'nullable|integer|exists:users,id',
            'staff_id' => 'nullable|integer|exists:staff_members,id',
            'status' => 'nullable|string|in:Lead,Open,Replied,Opportunity,Quotation,Lost Quotation,Interested,Converted,Do Not Contact',
            'type' => 'nullable|string|max:50',
            'request_type' => 'nullable|string|in:Product Enquiry,Request for Information,Suggestions,Other',
            'email_id' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'mobile_no' => 'nullable|string|max:50',
            'whatsapp_no' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'phone_ext' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'no_of_employees' => 'nullable|string|max:50',
            'annual_revenue' => 'nullable|numeric|min:0',
            'industry' => 'nullable|string|max:255',
            'market_segment' => 'nullable|string|max:255',
            'territory' => 'nullable|string|max:255',
            'fax' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
        ]);

        $validated['lead_owner_id'] = $validated['lead_owner_id'] ?? $request->user()->id;

        try {
            $lead = $this->leadService->create($orgId, $validated);
            return response()->json($lead, 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $lead = $this->leadService->find($orgId, $id);
        return response()->json($lead);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'salutation' => 'nullable|string|max:50',
            'job_title' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:50',
            'lead_owner_id' => 'nullable|integer|exists:users,id',
            'staff_id' => 'nullable|integer|exists:staff_members,id',
            'status' => 'nullable|string|in:Lead,Open,Replied,Opportunity,Quotation,Lost Quotation,Interested,Converted,Do Not Contact',
            'type' => 'nullable|string|max:50',
            'request_type' => 'nullable|string|in:Product Enquiry,Request for Information,Suggestions,Other',
            'email_id' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'mobile_no' => 'nullable|string|max:50',
            'whatsapp_no' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'phone_ext' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'no_of_employees' => 'nullable|string|max:50',
            'annual_revenue' => 'nullable|numeric|min:0',
            'industry' => 'nullable|string|max:255',
            'market_segment' => 'nullable|string|max:255',
            'territory' => 'nullable|string|max:255',
            'fax' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'qualification_status' => 'nullable|string|in:Unqualified,In Process,Qualified',
            'qualified_by' => 'nullable|integer|exists:users,id',
            'qualified_on' => 'nullable|date',
            'disabled' => 'nullable|boolean',
            'unsubscribed' => 'nullable|boolean',
        ]);

        try {
            $lead = $this->leadService->update($orgId, $id, $validated);
            return response()->json($lead);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $this->leadService->delete($orgId, $id);
        return response()->json(null, 204);
    }

    public function convertToOpportunity(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $data = $request->validate([
            'opportunity_type' => 'nullable|string|max:255',
            'sales_stage_id' => 'nullable|integer|exists:sales_stages,id',
            'opportunity_amount' => 'nullable|numeric|min:0',
            'expected_closing' => 'nullable|date',
        ]);

        $opportunity = $this->leadService->convertToOpportunity($orgId, $id, $data);
        return response()->json($opportunity, 201);
    }

    public function addToProspect(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $data = $request->validate([
            'prospect_id' => 'required|integer|exists:prospects,id',
        ]);

        $this->leadService->addToProspect($orgId, $id, $data['prospect_id']);
        return response()->json(['message' => 'Lead added to prospect']);
    }

    public function createProspect(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $data = $request->validate([
            'prospect_name' => 'nullable|string|max:255',
        ]);

        $prospect = $this->leadService->createProspect($orgId, $id, $data['prospect_name'] ?? null);
        return response()->json($prospect, 201);
    }
}
