<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\Opportunity;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OpportunityController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Opportunity::forCurrentOrganization()
            ->with(['assignee', 'lead', 'prospect', 'salesStage', 'campaign', 'creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('sales_stage_id')) {
            $query->where('sales_stage_id', $request->sales_stage_id);
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        if ($request->filled('lead_id')) {
            $query->where('lead_id', $request->lead_id);
        }
        if ($request->filled('prospect_id')) {
            $query->where('prospect_id', $request->prospect_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('order_by')) {
            $query->orderBy($request->input('order_by'), $request->input('order', 'asc'));
        } else {
            $query->latest();
        }

        $opportunities = $query->paginate($request->per_page ?? 15);

        return $this->success($opportunities);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'expected_close_date' => 'nullable|date',
            'probability' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|string|in:open,won,lost,abandoned',
            'assigned_to' => 'nullable|exists:users,id',
            'lead_id' => 'nullable|exists:crm_leads,id',
            'prospect_id' => 'nullable|exists:crm_prospects,id',
            'sales_stage_id' => 'nullable|exists:crm_sales_stages,id',
            'campaign_id' => 'nullable|exists:crm_campaigns,id',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $opportunity = Opportunity::create($request->all());

        return $this->created(
            $opportunity->load(['assignee', 'lead', 'prospect', 'salesStage', 'campaign', 'creator']),
            'Opportunity created successfully'
        );
    }

    public function show(Opportunity $opportunity)
    {
        if ($opportunity->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        return $this->success(
            $opportunity->load(['assignee', 'lead', 'prospect', 'salesStage', 'campaign', 'creator', 'items', 'contracts', 'appointments', 'notes'])
        );
    }

    public function update(Request $request, Opportunity $opportunity)
    {
        if ($opportunity->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'expected_close_date' => 'nullable|date',
            'probability' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|string|in:open,won,lost,abandoned',
            'assigned_to' => 'nullable|exists:users,id',
            'lead_id' => 'nullable|exists:crm_leads,id',
            'prospect_id' => 'nullable|exists:crm_prospects,id',
            'sales_stage_id' => 'nullable|exists:crm_sales_stages,id',
            'campaign_id' => 'nullable|exists:crm_campaigns,id',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $opportunity->update($request->all());

        return $this->success(
            $opportunity->load(['assignee', 'lead', 'prospect', 'salesStage', 'campaign', 'creator']),
            'Opportunity updated successfully'
        );
    }

    public function destroy(Opportunity $opportunity)
    {
        if ($opportunity->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $opportunity->delete();

        return $this->noContent('Opportunity deleted successfully');
    }
}
