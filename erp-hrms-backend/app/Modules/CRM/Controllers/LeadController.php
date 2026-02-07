<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\Lead;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LeadController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Lead::forCurrentOrganization()
            ->with(['assignee', 'campaign', 'creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        if ($request->filled('campaign_id')) {
            $query->where('campaign_id', $request->campaign_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('order_by')) {
            $query->orderBy($request->input('order_by'), $request->input('order', 'asc'));
        } else {
            $query->latest();
        }

        $leads = $query->paginate($request->per_page ?? 15);

        return $this->success($leads);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:new,contacted,qualified,unqualified,converted',
            'assigned_to' => 'nullable|exists:users,id',
            'campaign_id' => 'nullable|exists:crm_campaigns,id',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $lead = Lead::create($request->except(['org_id', 'created_by']));

        return $this->created($lead->load(['assignee', 'campaign', 'creator']), 'Lead created successfully');
    }

    public function show(Lead $lead)
    {
        if ($lead->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        return $this->success($lead->load(['assignee', 'campaign', 'creator', 'prospects', 'opportunities', 'appointments', 'notes']));
    }

    public function update(Request $request, Lead $lead)
    {
        if ($lead->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:new,contacted,qualified,unqualified,converted',
            'assigned_to' => 'nullable|exists:users,id',
            'campaign_id' => 'nullable|exists:crm_campaigns,id',
            'address' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $lead->update($request->except(['org_id', 'created_by']));

        return $this->success($lead->load(['assignee', 'campaign', 'creator']), 'Lead updated successfully');
    }

    public function destroy(Lead $lead)
    {
        if ($lead->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $lead->delete();

        return $this->noContent('Lead deleted successfully');
    }
}
