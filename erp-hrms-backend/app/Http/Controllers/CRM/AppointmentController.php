<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Services\CRM\AppointmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function __construct(private AppointmentService $appointmentService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $appointments = $this->appointmentService->list($orgId, $request->all());
        return response()->json($appointments);
    }

    public function store(Request $request): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'scheduled_time' => 'required|date',
            'status' => 'nullable|string|in:Open,Unverified,Closed',
            'customer_name' => 'required|string|max:255',
            'customer_phone_number' => 'nullable|string|max:50',
            'customer_skype' => 'nullable|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_details' => 'nullable|string',
            'appointment_with' => 'nullable|string|max:255',
            'party' => 'nullable|string|max:255',
            'staff_id' => 'nullable|integer|exists:staff_members,id',
        ]);

        $appointment = $this->appointmentService->create($orgId, $validated);
        return response()->json($appointment, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $appointment = $this->appointmentService->find($orgId, $id);
        return response()->json($appointment);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;

        $validated = $request->validate([
            'scheduled_time' => 'nullable|date',
            'status' => 'nullable|string|in:Open,Unverified,Closed',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone_number' => 'nullable|string|max:50',
            'customer_skype' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_details' => 'nullable|string',
            'appointment_with' => 'nullable|string|max:255',
            'party' => 'nullable|string|max:255',
            'staff_id' => 'nullable|integer|exists:staff_members,id',
        ]);

        $appointment = $this->appointmentService->update($orgId, $id, $validated);
        return response()->json($appointment);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $orgId = $request->user()->org_id;
        $this->appointmentService->delete($orgId, $id);
        return response()->json(null, 204);
    }
}
