<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AppointmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function __construct(private AppointmentService $appointmentService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $appointments = $this->appointmentService->list($request->all());
        return response()->json($appointments);
    }

    public function store(Request $request): JsonResponse
    {
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
        ]);

        $appointment = $this->appointmentService->create($validated);
        return response()->json($appointment, 201);
    }

    public function show(int $id): JsonResponse
    {
        $appointment = $this->appointmentService->find($id);
        return response()->json($appointment);
    }

    public function update(Request $request, int $id): JsonResponse
    {
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
        ]);

        $appointment = $this->appointmentService->update($id, $validated);
        return response()->json($appointment);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->appointmentService->delete($id);
        return response()->json(null, 204);
    }
}
