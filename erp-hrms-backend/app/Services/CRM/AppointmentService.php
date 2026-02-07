<?php

namespace App\Services\CRM;

use App\Models\CRM\Appointment;
use Illuminate\Pagination\LengthAwarePaginator;

class AppointmentService
{
    public function list(int $orgId, array $filters = []): LengthAwarePaginator
    {
        $query = Appointment::where('org_id', $orgId);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('scheduled_time', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function find(int $orgId, int $id): Appointment
    {
        return Appointment::where('org_id', $orgId)->findOrFail($id);
    }

    public function create(int $orgId, array $data): Appointment
    {
        $data['org_id'] = $orgId;
        return Appointment::create($data);
    }

    public function update(int $orgId, int $id, array $data): Appointment
    {
        $appointment = Appointment::where('org_id', $orgId)->findOrFail($id);
        $appointment->update($data);
        return $appointment->fresh();
    }

    public function delete(int $orgId, int $id): bool
    {
        $appointment = Appointment::where('org_id', $orgId)->findOrFail($id);
        return $appointment->delete();
    }
}
