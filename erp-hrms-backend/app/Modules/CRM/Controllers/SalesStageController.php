<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\SalesStage;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SalesStageController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = SalesStage::forCurrentOrganization()->orderBy('position');

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->success($query->get());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'position' => 'nullable|integer|min:0',
            'probability' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $stage = SalesStage::create($request->except(['org_id', 'created_by']));

        return $this->created($stage, 'Sales stage created successfully');
    }

    public function show(SalesStage $salesStage)
    {
        if ($salesStage->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        return $this->success($salesStage);
    }

    public function update(Request $request, SalesStage $salesStage)
    {
        if ($salesStage->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'position' => 'nullable|integer|min:0',
            'probability' => 'nullable|numeric|min:0|max:100',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $salesStage->update($request->except(['org_id', 'created_by']));

        return $this->success($salesStage, 'Sales stage updated successfully');
    }

    public function destroy(SalesStage $salesStage)
    {
        if ($salesStage->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $salesStage->delete();

        return $this->noContent('Sales stage deleted successfully');
    }
}
