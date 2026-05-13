<?php

namespace App\Http\Controllers\Api\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Attendance\AttendanceSetting;
use App\Services\Attendance\AttendanceSettingService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AttendanceSettingController extends Controller
{
    use ApiResponse;

    protected AttendanceSettingService $service;

    public function __construct(AttendanceSettingService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request)
    {
        $query = AttendanceSetting::query();

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->has('org_id')) {
            $query->where('org_id', $request->org_id);
        }

        $settings = $query->latest()->get();

        return $this->success($settings);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'nullable|exists:companies,id',
            'org_id' => 'nullable|exists:organizations,id',
            'default_clock_in_time' => 'required|string',
            'default_clock_out_time' => 'required|string',
            'grace_minutes' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $setting = $this->service->updateOrCreate($request->all());

        return $this->success($setting, 'Attendance settings saved successfully', 201);
    }

    public function show(AttendanceSetting $attendanceSetting)
    {
        return $this->success($attendanceSetting);
    }

    public function update(Request $request, AttendanceSetting $attendanceSetting)
    {
        $validator = Validator::make($request->all(), [
            'default_clock_in_time' => 'string',
            'default_clock_out_time' => 'string',
            'grace_minutes' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $attendanceSetting->update($request->all());

        return $this->success($attendanceSetting, 'Attendance settings updated successfully');
    }

    public function destroy(AttendanceSetting $attendanceSetting)
    {
        $attendanceSetting->delete();
        return $this->success(null, 'Attendance settings deleted successfully');
    }

    /**
     * Get effective setting for current context.
     */
    public function getEffective(Request $request)
    {
        $setting = $this->service->getSetting($request->company_id, $request->org_id);
        return $this->success($setting);
    }
}
