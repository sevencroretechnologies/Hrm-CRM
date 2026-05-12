<?php

namespace App\Http\Controllers\Api\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Attendance\HalfDayRuleConfig;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class HalfDayRuleConfigController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = HalfDayRuleConfig::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->has('org_id')) {
            $query->where('org_id', $request->org_id);
        }

        $configs = $query->latest()->get();

        return $this->success($configs);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'nullable|exists:companies,id',
            'org_id' => 'nullable|exists:organizations,id',
            'arriving_late_minutes' => 'required|integer|min:0',
            'leaving_early_minutes' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        // If activating, deactivate others for same company/org
        if ($request->is_active) {
            $this->deactivateOthers($request->company_id, $request->org_id);
        }

        $config = HalfDayRuleConfig::create($request->all());

        return $this->success($config, 'Half day rule created successfully', 201);
    }

    public function show(HalfDayRuleConfig $halfDayRule)
    {
        return $this->success($halfDayRule);
    }

    public function update(Request $request, HalfDayRuleConfig $halfDayRule)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'boolean',
            'company_id' => 'nullable|exists:companies,id',
            'org_id' => 'nullable|exists:organizations,id',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        // If activating, deactivate others for same company/org
        if ($request->is_active && !$halfDayRule->is_active) {
            $this->deactivateOthers($request->company_id ?? $halfDayRule->company_id, $request->org_id ?? $halfDayRule->org_id);
        }

        $halfDayRule->update($request->all());

        return $this->success($halfDayRule, 'Half day rule updated successfully');
    }

    public function destroy(HalfDayRuleConfig $halfDayRule)
    {
        $halfDayRule->delete();
        return $this->success(null, 'Half day rule deleted successfully');
    }

    private function deactivateOthers($companyId, $orgId)
    {
        HalfDayRuleConfig::where('is_active', true)
            ->where('company_id', $companyId)
            ->where('org_id', $orgId)
            ->update(['is_active' => false]);
    }
}
