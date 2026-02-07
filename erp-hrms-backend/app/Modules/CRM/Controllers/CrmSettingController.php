<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\CrmSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CrmSettingController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $settings = CrmSetting::forCurrentOrganization()->get();

        return $this->success($settings);
    }

    public function show(string $key)
    {
        $setting = CrmSetting::forCurrentOrganization()
            ->where('key', $key)
            ->first();

        if (!$setting) {
            return $this->notFound('Setting not found');
        }

        return $this->success($setting);
    }

    public function upsert(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'key' => 'required|string|max:255',
            'value' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $setting = CrmSetting::updateOrCreate(
            [
                'org_id' => auth()->user()->org_id,
                'key' => $request->key,
            ],
            [
                'value' => $request->value,
                'created_by' => auth()->id(),
            ]
        );

        return $this->success($setting, 'Setting saved successfully');
    }

    public function destroy(string $key)
    {
        $setting = CrmSetting::forCurrentOrganization()
            ->where('key', $key)
            ->first();

        if (!$setting) {
            return $this->notFound('Setting not found');
        }

        $setting->delete();

        return $this->noContent('Setting deleted successfully');
    }
}
