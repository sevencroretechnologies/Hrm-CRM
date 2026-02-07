<?php

namespace App\Modules\CRM\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\CRM\Models\Appointment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AppointmentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Appointment::forCurrentOrganization()
            ->with(['assignee', 'lead', 'prospect', 'opportunity', 'creator']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }
        if ($request->filled('lead_id')) {
            $query->where('lead_id', $request->lead_id);
        }
        if ($request->filled('prospect_id')) {
            $query->where('prospect_id', $request->prospect_id);
        }
        if ($request->filled('from_date')) {
            $query->where('start_time', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->where('start_time', '<=', $request->to_date);
        }
        if ($request->filled('search')) {
            $query->where('title', 'like', "%{$request->search}%");
        }

        if ($request->filled('order_by')) {
            $query->orderBy($request->input('order_by'), $request->input('order', 'asc'));
        } else {
            $query->orderBy('start_time', 'asc');
        }

        $appointments = $query->paginate($request->per_page ?? 15);

        return $this->success($appointments);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'status' => 'nullable|string|in:scheduled,completed,cancelled,rescheduled',
            'assigned_to' => 'nullable|exists:users,id',
            'lead_id' => 'nullable|exists:crm_leads,id',
            'prospect_id' => 'nullable|exists:crm_prospects,id',
            'opportunity_id' => 'nullable|exists:crm_opportunities,id',
            'outcome' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $appointment = Appointment::create($request->except(['org_id', 'created_by']));

        return $this->created(
            $appointment->load(['assignee', 'lead', 'prospect', 'opportunity', 'creator']),
            'Appointment created successfully'
        );
    }

    public function show(Appointment $appointment)
    {
        if ($appointment->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        return $this->success(
            $appointment->load(['assignee', 'lead', 'prospect', 'opportunity', 'creator'])
        );
    }

    public function update(Request $request, Appointment $appointment)
    {
        if ($appointment->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'start_time' => 'sometimes|required|date',
            'end_time' => 'sometimes|required|date|after:start_time',
            'status' => 'nullable|string|in:scheduled,completed,cancelled,rescheduled',
            'assigned_to' => 'nullable|exists:users,id',
            'lead_id' => 'nullable|exists:crm_leads,id',
            'prospect_id' => 'nullable|exists:crm_prospects,id',
            'opportunity_id' => 'nullable|exists:crm_opportunities,id',
            'outcome' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        $appointment->update($request->except(['org_id', 'created_by']));

        return $this->success(
            $appointment->load(['assignee', 'lead', 'prospect', 'opportunity', 'creator']),
            'Appointment updated successfully'
        );
    }

    public function destroy(Appointment $appointment)
    {
        if ($appointment->org_id !== auth()->user()->org_id) {
            return $this->forbidden();
        }

        $appointment->delete();

        return $this->noContent('Appointment deleted successfully');
    }
}
