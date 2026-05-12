<?php

namespace App\Services\Attendance;

use App\Models\Attendance\AttendanceSetting;
use App\Services\Core\BaseService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AttendanceSettingService extends BaseService
{
    protected string $modelClass = AttendanceSetting::class;

    /**
     * Get setting for a specific company/org.
     */
    public function getSetting(?int $companyId = null, ?int $orgId = null): ?AttendanceSetting
    {
        return AttendanceSetting::withoutGlobalScopes()
            ->where('company_id', $companyId)
            ->where('org_id', $orgId)
            ->first() ?: AttendanceSetting::withoutGlobalScopes()
                ->whereNull('company_id')
                ->where('org_id', $orgId)
                ->first() ?: AttendanceSetting::withoutGlobalScopes()
                ->whereNull('company_id')
                ->whereNull('org_id')
                ->first();
    }

    /**
     * Create or update attendance settings.
     */
    public function updateOrCreate(array $data): AttendanceSetting
    {
        return DB::transaction(function () use ($data) {
            $companyId = $data['company_id'] ?? null;
            $orgId = $data['org_id'] ?? null;

            return AttendanceSetting::withoutGlobalScopes()->updateOrCreate(
                [
                    'company_id' => $companyId,
                    'org_id' => $orgId,
                ],
                [
                    'default_clock_in_time' => $data['default_clock_in_time'],
                    'default_clock_out_time' => $data['default_clock_out_time'],
                    'grace_minutes' => $data['grace_minutes'] ?? 0,
                ]
            );
        });
    }
}
