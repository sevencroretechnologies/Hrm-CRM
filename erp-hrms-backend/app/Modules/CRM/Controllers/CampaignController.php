<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\Campaign;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CampaignController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Campaign::forCurrentOrganization()->with(['creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->filled('order_by')) {
            $query->orderBy($request->input('order_by'), $request->input('order', 'asc'));
        } else {
            $query->latest();
        }

        $campaigns = $query->paginate($request->per_page ?? 15);

        return $this->success($campaigns);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:planned,active,completed,cancelled',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'expected_revenue' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $campaign = Campaign::create($request->except(['org_id', 'created_by']));

        return $this->created($campaign->load('creator'), 'Campaign created successfully');
    }

    public function show(Campaign $campaign)
    {
        if ($campaign->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        return $this->success($campaign->load(['creator', 'leads', 'opportunities']));
    }

    public function update(Request $request, Campaign $campaign)
    {
        if ($campaign->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'type' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:planned,active,completed,cancelled',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
            'actual_cost' => 'nullable|numeric|min:0',
            'expected_revenue' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $campaign->update($request->except(['org_id', 'created_by']));

        return $this->success($campaign->load('creator'), 'Campaign updated successfully');
    }

    public function destroy(Campaign $campaign)
    {
        if ($campaign->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $campaign->delete();

        return $this->noContent('Campaign deleted successfully');
    }
}
