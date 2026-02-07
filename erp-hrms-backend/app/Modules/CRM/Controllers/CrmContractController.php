<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\CrmContract;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CrmContractController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = CrmContract::forCurrentOrganization()
            ->with(['opportunity', 'prospect', 'creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('prospect_id')) {
            $query->where('prospect_id', $request->prospect_id);
        }
        if ($request->filled('opportunity_id')) {
            $query->where('opportunity_id', $request->opportunity_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('order_by')) {
            $query->orderBy($request->input('order_by'), $request->input('order', 'asc'));
        } else {
            $query->latest();
        }

        $contracts = $query->paginate($request->per_page ?? 15);

        return $this->success($contracts);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'value' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string|in:draft,active,expired,terminated',
            'opportunity_id' => 'nullable|exists:crm_opportunities,id',
            'prospect_id' => 'nullable|exists:crm_prospects,id',
            'terms' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $data = $request->except(['org_id', 'created_by']);
        $data['reference_number'] = 'CRM-CTR-' . strtoupper(Str::random(8));

        $contract = CrmContract::create($data);

        return $this->created(
            $contract->load(['opportunity', 'prospect', 'creator']),
            'Contract created successfully'
        );
    }

    public function show(CrmContract $crmContract)
    {
        if ($crmContract->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        return $this->success($crmContract->load(['opportunity', 'prospect', 'creator']));
    }

    public function update(Request $request, CrmContract $crmContract)
    {
        if ($crmContract->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'value' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'status' => 'nullable|string|in:draft,active,expired,terminated',
            'opportunity_id' => 'nullable|exists:crm_opportunities,id',
            'prospect_id' => 'nullable|exists:crm_prospects,id',
            'terms' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $crmContract->update($request->except(['org_id', 'created_by']));

        return $this->success(
            $crmContract->load(['opportunity', 'prospect', 'creator']),
            'Contract updated successfully'
        );
    }

    public function destroy(CrmContract $crmContract)
    {
        if ($crmContract->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $crmContract->delete();

        return $this->noContent('Contract deleted successfully');
    }
}
