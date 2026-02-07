<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\Prospect;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProspectController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Prospect::forCurrentOrganization()
            ->with(['assignee', 'creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('industry')) {
            $query->where('industry', $request->industry);
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('order_by')) {
            $query->orderBy($request->input('order_by'), $request->input('order', 'asc'));
        } else {
            $query->latest();
        }

        $prospects = $query->paginate($request->per_page ?? 15);

        return $this->success($prospects);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'industry' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:active,inactive,converted',
            'assigned_to' => 'nullable|exists:users,id',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $prospect = Prospect::create($request->all());

        return $this->created($prospect->load(['assignee', 'creator']), 'Prospect created successfully');
    }

    public function show(Prospect $prospect)
    {
        if ($prospect->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        return $this->success($prospect->load(['assignee', 'creator', 'leads', 'opportunities', 'contracts', 'appointments']));
    }

    public function update(Request $request, Prospect $prospect)
    {
        if ($prospect->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'company_name' => 'sometimes|required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'industry' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:active,inactive,converted',
            'assigned_to' => 'nullable|exists:users,id',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $prospect->update($request->all());

        return $this->success($prospect->load(['assignee', 'creator']), 'Prospect updated successfully');
    }

    public function destroy(Prospect $prospect)
    {
        if ($prospect->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $prospect->delete();

        return $this->noContent('Prospect deleted successfully');
    }

    public function attachLead(Request $request, Prospect $prospect)
    {
        if ($prospect->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'lead_id' => 'required|exists:crm_leads,id',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $prospect->leads()->syncWithoutDetaching([$request->lead_id]);

        return $this->success($prospect->load('leads'), 'Lead attached to prospect');
    }

    public function detachLead(Prospect $prospect, $leadId)
    {
        if ($prospect->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $prospect->leads()->detach($leadId);

        return $this->success($prospect->load('leads'), 'Lead detached from prospect');
    }
}
